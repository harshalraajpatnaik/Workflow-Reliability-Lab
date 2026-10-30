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
        @NotBlank(message = "Idempotency key is required")
        String idempotencyKey,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
        BigDecimal amount,

        String currency,
        UUID executionId,
        String faultSimulation  // "TIMEOUT", "DECLINE", "NONE"
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
        String errorCode,
        String errorMessage,
        String reconciliationStatus,
        String reconciliationNotes,
        Instant createdAt,
        Instant updatedAt
    ) {
        public static PaymentTransactionDto from(PaymentTransaction pt) {
            return new PaymentTransactionDto(
                pt.getId(),
                pt.getWorkspaceId(),
                pt.getExecutionId(),
                pt.getTransactionReference(),
                pt.getIdempotencyKey(),
                pt.getAmount(),
                pt.getCurrency(),
                pt.getStatus(),
                pt.getProvider(),
                pt.getCapturedAmount(),
                pt.getRefundedAmount(),
                pt.getProviderChargeId(),
                pt.getErrorCode(),
                pt.getErrorMessage(),
                pt.getReconciliationStatus(),
                pt.getReconciliationNotes(),
                pt.getCreatedAt(),
                pt.getUpdatedAt()
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
        public static PaymentWebhookDto from(PaymentWebhook w) {
            return new PaymentWebhookDto(
                w.getId(),
                w.getWorkspaceId(),
                w.getTransactionId(),
                w.getProviderEventId(),
                w.getEventType(),
                w.getPayload(),
                w.isProcessed(),
                w.isDuplicate(),
                w.getProcessingError(),
                w.getReceivedAt(),
                w.getProcessedAt()
            );
        }
    }
}
