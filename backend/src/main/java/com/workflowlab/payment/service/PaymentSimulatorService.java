package com.workflowlab.payment.service;

import com.workflowlab.common.dto.PageResponse;
import com.workflowlab.common.exception.BadRequestException;
import com.workflowlab.common.exception.ConflictException;
import com.workflowlab.common.exception.ResourceNotFoundException;
import com.workflowlab.event.model.Event;
import com.workflowlab.event.model.EventStatus;
import com.workflowlab.event.repository.EventRepository;
import com.workflowlab.payment.dto.PaymentDtos.*;
import com.workflowlab.payment.model.PaymentStatus;
import com.workflowlab.payment.model.PaymentTransaction;
import com.workflowlab.payment.model.PaymentWebhook;
import com.workflowlab.payment.repository.PaymentTransactionRepository;
import com.workflowlab.payment.repository.PaymentWebhookRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentSimulatorService {

    private static final Logger log = LoggerFactory.getLogger(PaymentSimulatorService.class);

    private final PaymentTransactionRepository transactionRepository;
    private final PaymentWebhookRepository webhookRepository;
    private final EventRepository eventRepository;

    public PaymentSimulatorService(
        PaymentTransactionRepository transactionRepository,
        PaymentWebhookRepository webhookRepository,
        EventRepository eventRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.webhookRepository = webhookRepository;
        this.eventRepository = eventRepository;
    }

    @Transactional
    public PaymentTransactionDto initiatePayment(UUID workspaceId, InitiatePaymentRequest request) {
        String idempotencyKey = (request.idempotencyKey() != null && !request.idempotencyKey().isBlank())
            ? request.idempotencyKey().trim()
            : "idem_pay_" + UUID.randomUUID().toString().substring(0, 12);

        // Idempotency check: return existing if idempotency key was previously processed
        Optional<PaymentTransaction> existing = transactionRepository.findByWorkspaceIdAndIdempotencyKey(
            workspaceId,
            idempotencyKey
        );
        if (existing.isPresent()) {
            log.info("Idempotent payment request recognized for key: {}", idempotencyKey);
            return PaymentTransactionDto.from(existing.get());
        }

        String ref = "TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String currency = (request.currency() != null && !request.currency().isBlank()) ? request.currency().trim() : "USD";
        PaymentTransaction txn = new PaymentTransaction(
            workspaceId,
            request.executionId(),
            ref,
            idempotencyKey,
            request.amount(),
            currency,
            "SimulatedGateway"
        );
        if (request.customerId() != null) {
            txn.setCustomerId(request.customerId());
        }

        String fault = request.faultSimulation() != null ? request.faultSimulation() : request.faultMode();
        if (fault != null) {
            fault = fault.toUpperCase().trim();
        }

        if ("TIMEOUT".equals(fault) || "GATEWAY_TIMEOUT".equals(fault)) {
            txn.setStatus(PaymentStatus.TIMED_OUT);
            txn.setErrorCode("GATEWAY_TIMEOUT");
            txn.setErrorMessage("Simulated timeout: gateway did not respond within 8000ms SLA");
            txn.setReconciliationStatus("PENDING_RECONCILIATION");
            txn.setReconciliationNotes("Transaction requires asynchronous webhook or reconciliation batch to resolve final state");
        } else if ("DECLINE".equals(fault) || "GATEWAY_DECLINE".equals(fault)) {
            txn.setStatus(PaymentStatus.FAILED);
            txn.setErrorCode("CARD_DECLINED");
            txn.setErrorMessage("Simulated decline: insufficient funds or risk rejection");
            txn.setReconciliationStatus("NOT_REQUIRED");
        } else {
            // Clean path: Authorized -> Captured
            txn.setStatus(PaymentStatus.CAPTURED);
            txn.setCapturedAmount(request.amount());
            txn.setProviderChargeId("ch_" + UUID.randomUUID().toString().substring(0, 16));
            txn.setReconciliationStatus("RECONCILED");
        }

        PaymentTransaction saved = transactionRepository.save(txn);

        // Create journal event for observability
        if (request.executionId() != null) {
            String eventType = switch (saved.getStatus()) {
                case CAPTURED -> "PaymentCaptured";
                case TIMED_OUT -> "PaymentTimedOut";
                case FAILED -> "PaymentFailed";
                default -> "PaymentInitiated";
            };
            EventStatus evStatus = saved.getStatus() == PaymentStatus.CAPTURED ? EventStatus.PROCESSED : EventStatus.FAILED;
            eventRepository.save(new Event(
                workspaceId,
                request.executionId(),
                eventType,
                "PaymentSimulator",
                ref,
                idempotencyKey,
                "{\"amount\": " + request.amount() + ", \"currency\": \"" + currency + "\", \"status\": \"" + saved.getStatus() + "\"}",
                evStatus,
                0,
                Instant.now()
            ));
        }

        return PaymentTransactionDto.from(saved);
    }

    @Transactional
    public PaymentTransactionDto refundPayment(UUID workspaceId, UUID transactionId, RefundPaymentRequest request) {
        PaymentTransaction txn = transactionRepository.findByIdAndWorkspaceId(transactionId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment transaction not found in this workspace"));

        if (txn.getStatus() != PaymentStatus.CAPTURED && txn.getStatus() != PaymentStatus.PARTIALLY_REFUNDED) {
            throw new BadRequestException("Only CAPTURED or PARTIALLY_REFUNDED transactions can be refunded. Current status: " + txn.getStatus());
        }

        BigDecimal currentRefunded = txn.getRefundedAmount() != null ? txn.getRefundedAmount() : BigDecimal.ZERO;
        BigDecimal newTotalRefunded = currentRefunded.add(request.amount());

        // Invariant INV-005 check: Total refunds must never exceed captured amount
        if (newTotalRefunded.compareTo(txn.getCapturedAmount()) > 0) {
            throw new ConflictException(String.format(
                "Invariant violation: Requested refund of %s exceeds remaining refundable amount of %s (Captured: %s, Already refunded: %s)",
                request.amount(), txn.getCapturedAmount().subtract(currentRefunded), txn.getCapturedAmount(), currentRefunded
            ));
        }

        txn.setRefundedAmount(newTotalRefunded);
        if (newTotalRefunded.compareTo(txn.getCapturedAmount()) == 0) {
            txn.setStatus(PaymentStatus.REFUNDED);
        } else {
            txn.setStatus(PaymentStatus.PARTIALLY_REFUNDED);
        }

        PaymentTransaction saved = transactionRepository.save(txn);
        return PaymentTransactionDto.from(saved);
    }

    @Transactional
    public PaymentTransactionDto reconcileTransaction(UUID workspaceId, UUID transactionId) {
        PaymentTransaction txn = transactionRepository.findByIdAndWorkspaceId(transactionId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment transaction not found in this workspace"));

        if (txn.getStatus() == PaymentStatus.TIMED_OUT) {
            // Reconcile timed-out payment: Simulate discovering gateway settled the charge
            txn.setStatus(PaymentStatus.CAPTURED);
            txn.setCapturedAmount(txn.getAmount());
            txn.setProviderChargeId("ch_reconciled_" + UUID.randomUUID().toString().substring(0, 10));
            txn.setReconciliationStatus("RECONCILED");
            txn.setReconciliationNotes("Reconciliation job matched gateway settlement record at " + Instant.now());
        } else {
            txn.setReconciliationStatus("RECONCILED");
            txn.setReconciliationNotes("Reconciled against bank ledger at " + Instant.now());
        }

        PaymentTransaction saved = transactionRepository.save(txn);
        return PaymentTransactionDto.from(saved);
    }

    @Transactional
    public PaymentWebhookDto processWebhook(UUID workspaceId, SimulateWebhookRequest request) {
        Optional<PaymentWebhook> existing = webhookRepository.findByWorkspaceIdAndProviderEventId(workspaceId, request.providerEventId());
        if (existing.isPresent()) {
            PaymentWebhook duplicate = existing.get();
            log.warn("Duplicate webhook ignored: event ID {}", request.providerEventId());
            return PaymentWebhookDto.from(duplicate);
        }

        PaymentWebhook webhook = new PaymentWebhook(
            workspaceId,
            request.transactionId(),
            request.providerEventId(),
            request.eventType(),
            request.payload()
        );
        webhook.setProcessed(true);
        PaymentWebhook saved = webhookRepository.save(webhook);
        return PaymentWebhookDto.from(saved);
    }

    @Transactional(readOnly = true)
    public PaymentTransactionDto getTransaction(UUID workspaceId, UUID transactionId) {
        PaymentTransaction txn = transactionRepository.findByIdAndWorkspaceId(transactionId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment transaction not found in this workspace"));
        return PaymentTransactionDto.from(txn);
    }

    @Transactional(readOnly = true)
    public List<PaymentWebhookDto> getTransactionWebhooks(UUID transactionId) {
        return webhookRepository.findByTransactionIdOrderByReceivedAtAsc(transactionId)
            .stream().map(PaymentWebhookDto::from).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<PaymentTransactionDto> listTransactions(UUID workspaceId, Pageable pageable) {
        Page<PaymentTransaction> page = transactionRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId, pageable);
        return PageResponse.from(page.map(PaymentTransactionDto::from));
    }
}
