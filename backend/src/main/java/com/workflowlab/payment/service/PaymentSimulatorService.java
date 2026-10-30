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
        // Idempotency check: return existing if idempotency key was previously processed
        Optional<PaymentTransaction> existing = transactionRepository.findByWorkspaceIdAndIdempotencyKey(
            workspaceId,
            request.idempotencyKey().trim()
        );
        if (existing.isPresent()) {
            log.info("Idempotent payment request recognized for key: {}", request.idempotencyKey());
            return PaymentTransactionDto.from(existing.get());
        }

        String ref = "TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        PaymentTransaction txn = new PaymentTransaction(
            workspaceId,
            request.executionId(),
            ref,
            request.idempotencyKey().trim(),
            request.amount(),
            request.currency()
        );

        String fault = request.faultSimulation() != null ? request.faultSimulation().toUpperCase() : "NONE";

        if ("TIMEOUT".equals(fault)) {
            txn.setStatus(PaymentStatus.TIMED_OUT);
            txn.setReconciliationStatus("RECONCILIATION_PENDING");
            txn.setErrorCode("ERR_PROVIDER_TIMEOUT");
            txn.setErrorMessage("Simulated payment provider gateway timeout on capture. Action required: Reconcile before retrying.");
        } else if ("DECLINE".equals(fault)) {
            txn.setStatus(PaymentStatus.FAILED);
            txn.setErrorCode("card_declined");
            txn.setErrorMessage("Your card has insufficient funds for this simulated transaction.");
        } else {
            // Success flow
            txn.setStatus(PaymentStatus.CAPTURED);
            txn.setCapturedAmount(request.amount());
            txn.setProviderChargeId("ch_sim_" + UUID.randomUUID().toString().substring(0, 16));
        }

        PaymentTransaction saved = transactionRepository.save(txn);

        // Journal payment event if executionId is attached
        if (request.executionId() != null) {
            String eventType = txn.getStatus() == PaymentStatus.CAPTURED ? "PaymentCaptured" : "PaymentFailed";
            EventStatus evStatus = txn.getStatus() == PaymentStatus.CAPTURED ? EventStatus.PROCESSED : EventStatus.FAILED;
            String meta = String.format("{\"amount\": %.2f, \"currency\": \"%s\", \"chargeId\": \"%s\"}",
                txn.getAmount(), txn.getCurrency(), txn.getProviderChargeId() != null ? txn.getProviderChargeId() : "");

            eventRepository.save(new Event(
                workspaceId,
                request.executionId(),
                eventType,
                "PaymentGateway",
                ref,
                "idemp-pay-" + ref,
                meta,
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
            .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (!txn.getStatus().canRefund()) {
            throw new BadRequestException("Transaction in status " + txn.getStatus() + " cannot be refunded");
        }

        BigDecimal newTotalRefunded = txn.getRefundedAmount().add(request.amount());
        if (newTotalRefunded.compareTo(txn.getCapturedAmount()) > 0) {
            throw new BadRequestException(String.format(
                "Invariant Violation: Refund amount (%.2f) + previous refunds (%.2f) exceeds captured amount (%.2f)",
                request.amount(), txn.getRefundedAmount(), txn.getCapturedAmount()
            ));
        }

        txn.setRefundedAmount(newTotalRefunded);
        if (newTotalRefunded.compareTo(txn.getCapturedAmount()) >= 0) {
            txn.setStatus(PaymentStatus.REFUNDED);
        } else {
            txn.setStatus(PaymentStatus.PARTIALLY_REFUNDED);
        }

        PaymentTransaction updated = transactionRepository.save(txn);

        if (txn.getExecutionId() != null) {
            String meta = String.format("{\"refundAmount\": %.2f, \"totalRefunded\": %.2f, \"reason\": \"%s\"}",
                request.amount(), newTotalRefunded, request.reason() != null ? request.reason() : "");

            eventRepository.save(new Event(
                workspaceId,
                txn.getExecutionId(),
                "PaymentRefunded",
                "PaymentGateway",
                txn.getTransactionReference(),
                "idemp-ref-" + UUID.randomUUID(),
                meta,
                EventStatus.PROCESSED,
                0,
                Instant.now()
            ));
        }

        return PaymentTransactionDto.from(updated);
    }

    @Transactional
    public PaymentWebhookDto processWebhook(UUID workspaceId, SimulateWebhookRequest request) {
        String eventId = request.providerEventId().trim();

        // Durable inbox deduplication check
        Optional<PaymentWebhook> existing = webhookRepository.findByWorkspaceIdAndProviderEventId(workspaceId, eventId);
        if (existing.isPresent()) {
            PaymentWebhook duplicate = new PaymentWebhook(
                workspaceId,
                request.transactionId(),
                eventId + "-dup-" + System.currentTimeMillis(),
                request.eventType(),
                request.payload() != null ? request.payload() : "{}"
            );
            duplicate.setDuplicate(true);
            duplicate.setProcessed(false);
            duplicate.setProcessingError("Duplicate webhook ignored: Provider event ID " + eventId + " already ingested");
            PaymentWebhook saved = webhookRepository.save(duplicate);
            return PaymentWebhookDto.from(saved);
        }

        PaymentWebhook webhook = new PaymentWebhook(
            workspaceId,
            request.transactionId(),
            eventId,
            request.eventType(),
            request.payload() != null ? request.payload() : "{}"
        );

        if (request.transactionId() != null) {
            transactionRepository.findByIdAndWorkspaceId(request.transactionId(), workspaceId).ifPresent(txn -> {
                if ("charge.succeeded".equalsIgnoreCase(request.eventType()) && txn.getStatus() == PaymentStatus.AUTHORIZED) {
                    txn.setStatus(PaymentStatus.CAPTURED);
                    txn.setCapturedAmount(txn.getAmount());
                    transactionRepository.save(txn);
                }
            });
        }

        webhook.setProcessed(true);
        webhook.setProcessedAt(Instant.now());
        PaymentWebhook saved = webhookRepository.save(webhook);
        return PaymentWebhookDto.from(saved);
    }

    @Transactional
    public PaymentTransactionDto reconcileTransaction(UUID workspaceId, UUID transactionId) {
        PaymentTransaction txn = transactionRepository.findByIdAndWorkspaceId(transactionId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        // Deterministic reconciliation: query simulated provider ledger
        log.info("Reconciling transaction {} with simulated provider", txn.getTransactionReference());
        txn.setReconciliationStatus("RECONCILED");
        txn.setReconciliationNotes("Reconciliation completed via provider lookup. Verified charge captured successfully on gateway.");
        if (txn.getStatus() == PaymentStatus.TIMED_OUT || txn.getStatus() == PaymentStatus.PENDING) {
            txn.setStatus(PaymentStatus.RECONCILED);
            txn.setCapturedAmount(txn.getAmount());
            txn.setProviderChargeId("ch_reconciled_" + UUID.randomUUID().toString().substring(0, 12));
        }

        PaymentTransaction updated = transactionRepository.save(txn);
        return PaymentTransactionDto.from(updated);
    }

    @Transactional(readOnly = true)
    public PageResponse<PaymentTransactionDto> listTransactions(UUID workspaceId, Pageable pageable) {
        Page<PaymentTransaction> page = transactionRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId, pageable);
        return PageResponse.from(page.map(PaymentTransactionDto::from));
    }

    @Transactional(readOnly = true)
    public PaymentTransactionDto getTransaction(UUID workspaceId, UUID transactionId) {
        PaymentTransaction txn = transactionRepository.findByIdAndWorkspaceId(transactionId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        return PaymentTransactionDto.from(txn);
    }

    @Transactional(readOnly = true)
    public List<PaymentWebhookDto> getTransactionWebhooks(UUID transactionId) {
        return webhookRepository.findByTransactionIdOrderByReceivedAtAsc(transactionId)
            .stream().map(PaymentWebhookDto::from).toList();
    }
}
