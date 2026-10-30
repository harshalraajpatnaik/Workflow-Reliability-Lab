package com.workflowlab.payment.dto;

import com.workflowlab.payment.model.PaymentStatus;
import com.workflowlab.payment.model.PaymentTransaction;
import com.workflowlab.payment.model.PaymentWebhook;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public final class PaymentDtos {
    private PaymentDtos() {}

    public record InitiatePaymentRequest(
        String idempotencyKey,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
        BigDecimal amount,

        String currency,
        UUID executionId,
        String customerId,
        String faultSimulation,  // "TIMEOUT", "DECLINE", "NONE"
        String faultMode
    ) {}

    public record RefundPaymentRequest(
        @NotNull(message = "Refund amount is required")
        @DecimalMin(value = "0.01", message = "Refund must be greater than zero")
        BigDecimal amount,
        String reason
    ) {}

    public record SimulateWebhookRequest(
        @NotBlank(message = "Provider event ID is required")
        String providerEventId,

        @NotBlank(message = "Event type is required")
        String eventType,

        UUID transactionId,
        String payload
    ) {}

    public record PaymentTransactionDto(
        UUID id,
        UUID workspaceId,
        UUID executionId,
        String transactionReference,
        String idempotencyKey,
        BigDecimal amount,
        String currency,
        PaymentStatus status,
        String provider,
        BigDecimal capturedAmount,
        BigDecimal refundedAmount,
        String providerChargeId,
        String customerId,
        String errorCode,
        String errorMessage,
        String reconciliationStatus,
        String reconciliationNotes,
        Instant createdAt,
        Instant updatedAt
    ) {
        public static PaymentTransactionDto from(PaymentTransaction txn) {
            return new PaymentTransactionDto(
                txn.getId(),
                txn.getWorkspaceId(),
                txn.getExecutionId(),
                txn.getTransactionReference(),
                txn.getIdempotencyKey(),
                txn.getAmount(),
                txn.getCurrency(),
                txn.getStatus(),
                txn.getProvider(),
                txn.getCapturedAmount(),
                txn.getRefundedAmount(),
                txn.getProviderChargeId(),
                txn.getCustomerId(),
                txn.getErrorCode(),
                txn.getErrorMessage(),
                txn.getReconciliationStatus(),
                txn.getReconciliationNotes(),
                txn.getCreatedAt(),
                txn.getUpdatedAt()
            );
        }
    }

    public record PaymentWebhookDto(
        UUID id,
        UUID workspaceId,
        UUID transactionId,
        String providerEventId,
        String eventType,
        String payload,
        boolean processed,
        boolean duplicate,
        String processingError,
        Instant receivedAt,
        Instant processedAt
    ) {
        public static PaymentWebhookDto from(PaymentWebhook wh) {
            return new PaymentWebhookDto(
                wh.getId(),
                wh.getWorkspaceId(),
                wh.getTransactionId(),
                wh.getProviderEventId(),
                wh.getEventType(),
                wh.getPayload(),
                wh.isProcessed(),
                wh.isDuplicate(),
                wh.getProcessingError(),
                wh.getReceivedAt(),
                wh.getProcessedAt()
            );
        }
    }
}
