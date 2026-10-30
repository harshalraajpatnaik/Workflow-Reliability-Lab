package com.workflowlab.trace.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "traces", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"workspace_id", "trace_id"})
})
public class Trace {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "workspace_id", nullable = false)
    private UUID workspaceId;

    @Column(name = "execution_id")
    private UUID executionId;

    @Column(name = "trace_id", nullable = false, length = 64)
    private String traceId;

    @Column(name = "root_service", nullable = false, length = 100)
    private String rootService;

    @Column(name = "root_operation", nullable = false)
    private String rootOperation;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    @Column(name = "duration_ms")
    private Long durationMs;

    @Column(name = "has_errors", nullable = false)
    private boolean hasErrors = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Trace() {}

    public Trace(UUID workspaceId, UUID executionId, String traceId, String rootService, String rootOperation, Instant startedAt) {
        this.workspaceId = workspaceId;
        this.executionId = executionId;
        this.traceId = traceId;
        this.rootService = rootService;
        this.rootOperation = rootOperation;
        this.startedAt = startedAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getWorkspaceId() { return workspaceId; }
    public UUID getExecutionId() { return executionId; }
    public void setExecutionId(UUID executionId) { this.executionId = executionId; }
    public String getTraceId() { return traceId; }
    public String getRootService() { return rootService; }
    public void setRootService(String rootService) { this.rootService = rootService; }
    public String getRootOperation() { return rootOperation; }
    public void setRootOperation(String rootOperation) { this.rootOperation = rootOperation; }
    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
    public Instant getEndedAt() { return endedAt; }
    public void setEndedAt(Instant endedAt) {
        this.endedAt = endedAt;
        if (endedAt != null && startedAt != null) {
            this.durationMs = java.time.Duration.between(startedAt, endedAt).toMillis();
        }
    }
    public Long getDurationMs() { return durationMs; }
    public void setDurationMs(Long durationMs) { this.durationMs = durationMs; }
    public boolean isHasErrors() { return hasErrors; }
    public void setHasErrors(boolean hasErrors) { this.hasErrors = hasErrors; }
    public Instant getCreatedAt() { return createdAt; }
}
