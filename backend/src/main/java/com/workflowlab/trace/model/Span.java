package com.workflowlab.trace.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "spans", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"trace_id", "span_id"})
})
public class Span {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "trace_id", nullable = false)
    private UUID traceId;

    @Column(name = "span_id", nullable = false, length = 64)
    private String spanId;

    @Column(name = "parent_span_id", length = 64)
    private String parentSpanId;

    @Column(name = "service_name", nullable = false, length = 100)
    private String serviceName;

    @Column(name = "operation_name", nullable = false)
    private String operationName;

    @Column(name = "span_kind", nullable = false, length = 50)
    private String spanKind = "INTERNAL";

    @Column(name = "status_code", nullable = false, length = 50)
    private String statusCode = "OK";

    @Column(name = "status_message", columnDefinition = "TEXT")
    private String statusMessage;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String attributes = "{}";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String events = "[]";

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "ended_at", nullable = false)
    private Instant endedAt;

    @Column(name = "duration_ms", nullable = false)
    private Long durationMs;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Span() {}

    public Span(
        UUID traceId,
        String spanId,
        String parentSpanId,
        String serviceName,
        String operationName,
        String spanKind,
        String statusCode,
        String statusMessage,
        String attributes,
        Instant startedAt,
        Instant endedAt
    ) {
        this.traceId = traceId;
        this.spanId = spanId;
        this.parentSpanId = parentSpanId;
        this.serviceName = serviceName;
        this.operationName = operationName;
        this.spanKind = spanKind != null ? spanKind : "INTERNAL";
        this.statusCode = statusCode != null ? statusCode : "OK";
        this.statusMessage = statusMessage;
        this.attributes = attributes != null ? attributes : "{}";
        this.startedAt = startedAt;
        this.endedAt = endedAt;
        this.durationMs = java.time.Duration.between(startedAt, endedAt).toMillis();
    }

    public UUID getId() { return id; }
    public UUID getTraceId() { return traceId; }
    public String getSpanId() { return spanId; }
    public String getParentSpanId() { return parentSpanId; }
    public String getServiceName() { return serviceName; }
    public String getOperationName() { return operationName; }
    public String getSpanKind() { return spanKind; }
    public String getStatusCode() { return statusCode; }
    public String getStatusMessage() { return statusMessage; }
    public String getAttributes() { return attributes; }
    public String getEvents() { return events; }
    public Instant getStartedAt() { return startedAt; }
    public Instant getEndedAt() { return endedAt; }
    public Long getDurationMs() { return durationMs; }
    public Instant getCreatedAt() { return createdAt; }
}
