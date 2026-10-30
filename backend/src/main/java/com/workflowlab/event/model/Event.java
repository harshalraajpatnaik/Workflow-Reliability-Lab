package com.workflowlab.event.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "events", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"execution_id", "idempotency_key"})
})
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "workspace_id", nullable = false)
    private UUID workspaceId;

    @Column(name = "execution_id", nullable = false)
    private UUID executionId;

    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    @Column(name = "source_service", nullable = false, length = 100)
    private String sourceService;

    @Column(name = "correlation_id", nullable = false)
    private String correlationId;

    @Column(name = "idempotency_key", nullable = false)
    private String idempotencyKey;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload_metadata", columnDefinition = "jsonb")
    private String payloadMetadata = "{}";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private EventStatus status = EventStatus.RECEIVED;

    @Column(name = "retry_count", nullable = false)
    private int retryCount = 0;

    @Column(name = "error_class")
    private String errorClass;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt = Instant.now();

    @Column(name = "processed_at")
    private Instant processedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Event() {}

    public Event(
        UUID workspaceId,
        UUID executionId,
        String eventType,
        String sourceService,
        String correlationId,
        String idempotencyKey,
        String payloadMetadata,
        EventStatus status,
        int retryCount,
        Instant occurredAt
    ) {
        this.workspaceId = workspaceId;
        this.executionId = executionId;
        this.eventType = eventType;
        this.sourceService = sourceService;
        this.correlationId = correlationId;
        this.idempotencyKey = idempotencyKey;
        this.payloadMetadata = payloadMetadata != null ? payloadMetadata : "{}";
        this.status = status != null ? status : EventStatus.RECEIVED;
        this.retryCount = retryCount;
        this.occurredAt = occurredAt != null ? occurredAt : Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getWorkspaceId() { return workspaceId; }
    public UUID getExecutionId() { return executionId; }
    public String getEventType() { return eventType; }
    public String getSourceService() { return sourceService; }
    public String getCorrelationId() { return correlationId; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public String getPayloadMetadata() { return payloadMetadata; }
    public void setPayloadMetadata(String payloadMetadata) { this.payloadMetadata = payloadMetadata; }
    public EventStatus getStatus() { return status; }
    public void setStatus(EventStatus status) { this.status = status; }
    public int getRetryCount() { return retryCount; }
    public void setRetryCount(int retryCount) { this.retryCount = retryCount; }
    public String getErrorClass() { return errorClass; }
    public void setErrorClass(String errorClass) { this.errorClass = errorClass; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public Instant getOccurredAt() { return occurredAt; }
    public Instant getProcessedAt() { return processedAt; }
    public void setProcessedAt(Instant processedAt) { this.processedAt = processedAt; }
    public Instant getCreatedAt() { return createdAt; }
}
