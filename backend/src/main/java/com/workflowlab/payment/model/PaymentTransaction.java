package com.workflowlab.payment.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payment_transactions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"workspace_id", "idempotency_key"})
})
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "workspace_id", nullable = false)
    private UUID workspaceId;

    @Column(name = "execution_id")
    private UUID executionId;

    @Column(name = "transaction_reference", nullable = false, length = 100)
    private String transactionReference;

    @Column(name = "idempotency_key", nullable = false)
    private String idempotencyKey;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    private String currency = "USD";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PaymentStatus status = PaymentStatus.INITIATED;

    @Column(nullable = false, length = 50)
    private String provider = "SIMULATED_STRIPE";

    @Column(name = "captured_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal capturedAmount = BigDecimal.ZERO;

    @Column(name = "refunded_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal refundedAmount = BigDecimal.ZERO;

    @Column(name = "customer_id", length = 100)
    private String customerId;

    @Column(name = "provider_charge_id")
    private String providerChargeId;

    @Column(name = "error_code", length = 100)
    private String errorCode;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "reconciliation_status", nullable = false, length = 50)
    private String reconciliationStatus = "NOT_REQUIRED";

    @Column(name = "reconciliation_notes", columnDefinition = "TEXT")
    private String reconciliationNotes;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String metadata = "{}";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public PaymentTransaction() {}

    public PaymentTransaction(
        UUID workspaceId,
        UUID executionId,
        String transactionReference,
        String idempotencyKey,
        BigDecimal amount,
        String currency
    ) {
        this.workspaceId = workspaceId;
        this.executionId = executionId;
        this.transactionReference = transactionReference;
        this.idempotencyKey = idempotencyKey;
        this.amount = amount;
        this.currency = currency != null ? currency : "USD";
        this.status = PaymentStatus.INITIATED;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getWorkspaceId() { return workspaceId; }
    public UUID getExecutionId() { return executionId; }
    public void setExecutionId(UUID executionId) { this.executionId = executionId; }
    public String getTransactionReference() { return transactionReference; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }
    public String getProvider() { return provider; }
    public BigDecimal getCapturedAmount() { return capturedAmount; }
    public void setCapturedAmount(BigDecimal capturedAmount) { this.capturedAmount = capturedAmount; }
    public BigDecimal getRefundedAmount() { return refundedAmount; }
    public void setRefundedAmount(BigDecimal refundedAmount) { this.refundedAmount = refundedAmount; }
    public PaymentTransaction(
        UUID workspaceId,
        UUID executionId,
        String transactionReference,
        String idempotencyKey,
        BigDecimal amount,
        String currency,
        String provider
    ) {
        this.workspaceId = workspaceId;
        this.executionId = executionId;
        this.transactionReference = transactionReference;
        this.idempotencyKey = idempotencyKey;
        this.amount = amount;
        this.currency = currency != null ? currency : "USD";
        if (provider != null) this.provider = provider;
        this.status = PaymentStatus.INITIATED;
    }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
    public String getProviderChargeId() { return providerChargeId; }
    public void setProviderChargeId(String providerChargeId) { this.providerChargeId = providerChargeId; }
    public String getErrorCode() { return errorCode; }
    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public String getReconciliationStatus() { return reconciliationStatus; }
    public void setReconciliationStatus(String reconciliationStatus) { this.reconciliationStatus = reconciliationStatus; }
    public String getReconciliationNotes() { return reconciliationNotes; }
    public void setReconciliationNotes(String reconciliationNotes) { this.reconciliationNotes = reconciliationNotes; }
    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
