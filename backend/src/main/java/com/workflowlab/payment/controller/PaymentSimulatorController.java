package com.workflowlab.payment.controller;

import com.workflowlab.common.dto.ApiResponse;
import com.workflowlab.common.dto.PageResponse;
import com.workflowlab.payment.dto.PaymentDtos.*;
import com.workflowlab.payment.service.PaymentSimulatorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/payments")
@Tag(name = "Payment Simulator", description = "Simulated payment state machine, timeout recovery, webhook deduplication, and reconciliation")
public class PaymentSimulatorController {

    private final PaymentSimulatorService paymentService;

    public PaymentSimulatorController(PaymentSimulatorService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/initiate")
    @Operation(summary = "Initiate a simulated payment with idempotency key and optional fault injection")
    public ResponseEntity<ApiResponse<PaymentTransactionDto>> initiatePayment(
        @PathVariable UUID workspaceId,
        @Valid @RequestBody InitiatePaymentRequest request
    ) {
        PaymentTransactionDto txn = paymentService.initiatePayment(workspaceId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Payment processed: status is " + txn.status(), txn));
    }

    @GetMapping
    @Operation(summary = "List simulated payment transactions")
    public ResponseEntity<ApiResponse<PageResponse<PaymentTransactionDto>>> listPayments(
        @PathVariable UUID workspaceId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, Math.min(size, 100));
        PageResponse<PaymentTransactionDto> response = paymentService.listTransactions(workspaceId, pageRequest);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{transactionId}")
    @Operation(summary = "Get payment transaction details")
    public ResponseEntity<ApiResponse<PaymentTransactionDto>> getPayment(
        @PathVariable UUID workspaceId,
        @PathVariable UUID transactionId
    ) {
        PaymentTransactionDto txn = paymentService.getTransaction(workspaceId, transactionId);
        return ResponseEntity.ok(ApiResponse.ok(txn));
    }

    @PostMapping("/{transactionId}/refund")
    @Operation(summary = "Refund payment with strict amount ceiling validation")
    public ResponseEntity<ApiResponse<PaymentTransactionDto>> refundPayment(
        @PathVariable UUID workspaceId,
        @PathVariable UUID transactionId,
        @Valid @RequestBody RefundPaymentRequest request
    ) {
        PaymentTransactionDto txn = paymentService.refundPayment(workspaceId, transactionId, request);
        return ResponseEntity.ok(ApiResponse.ok("Refund processed", txn));
    }

    @PostMapping("/{transactionId}/reconcile")
    @Operation(summary = "Reconcile uncertain or timed-out payment with simulated provider")
    public ResponseEntity<ApiResponse<PaymentTransactionDto>> reconcilePayment(
        @PathVariable UUID workspaceId,
        @PathVariable UUID transactionId
    ) {
        PaymentTransactionDto txn = paymentService.reconcileTransaction(workspaceId, transactionId);
        return ResponseEntity.ok(ApiResponse.ok("Reconciliation complete", txn));
    }

    @PostMapping("/webhooks")
    @Operation(summary = "Simulate incoming payment provider webhook with deduplication")
    public ResponseEntity<ApiResponse<PaymentWebhookDto>> simulateWebhook(
        @PathVariable UUID workspaceId,
        @Valid @RequestBody SimulateWebhookRequest request
    ) {
        PaymentWebhookDto webhook = paymentService.processWebhook(workspaceId, request);
        String msg = webhook.duplicate() ? "Duplicate webhook safely ignored" : "Webhook processed";
        return ResponseEntity.ok(ApiResponse.ok(msg, webhook));
    }

    @GetMapping("/{transactionId}/webhooks")
    @Operation(summary = "Get all webhooks received for a transaction")
    public ResponseEntity<ApiResponse<List<PaymentWebhookDto>>> getTransactionWebhooks(
        @PathVariable UUID workspaceId,
        @PathVariable UUID transactionId
    ) {
        List<PaymentWebhookDto> webhooks = paymentService.getTransactionWebhooks(transactionId);
        return ResponseEntity.ok(ApiResponse.ok(webhooks));
    }
}
