package com.workflowlab.payment.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payment_webhooks", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"workspace_id", "provider_event_id"})
})
public class PaymentWebhook {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "workspace_id", nullable = false)
    private UUID workspaceId;

    @Column(name = "transaction_id")
    private UUID transactionId;

    @Column(name = "provider_event_id", nullable = false)
    private String providerEventId;

    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private String payload;

    @Column(nullable = false)
    private boolean processed = false;

    @Column(nullable = false)
    private boolean duplicate = false;

    @Column(name = "processing_error", columnDefinition = "TEXT")
    private String processingError;

    @Column(name = "received_at", nullable = false)
    private Instant receivedAt = Instant.now();

    @Column(name = "processed_at")
    private Instant processedAt;

    public PaymentWebhook() {}

    public PaymentWebhook(UUID workspaceId, UUID transactionId, String providerEventId, String eventType, String payload) {
        this.workspaceId = workspaceId;
        this.transactionId = transactionId;
        this.providerEventId = providerEventId;
        this.eventType = eventType;
        this.payload = payload;
        this.receivedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getWorkspaceId() { return workspaceId; }
    public UUID getTransactionId() { return transactionId; }
    public String getProviderEventId() { return providerEventId; }
    public String getEventType() { return eventType; }
    public String getPayload() { return payload; }
    public boolean isProcessed() { return processed; }
    public void setProcessed(boolean processed) { this.processed = processed; }
    public boolean isDuplicate() { return duplicate; }
    public void setDuplicate(boolean duplicate) { this.duplicate = duplicate; }
    public String getProcessingError() { return processingError; }
    public void setProcessingError(String processingError) { this.processingError = processingError; }
    public Instant getReceivedAt() { return receivedAt; }
    public Instant getProcessedAt() { return processedAt; }
    public void setProcessedAt(Instant processedAt) { this.processedAt = processedAt; }
}
