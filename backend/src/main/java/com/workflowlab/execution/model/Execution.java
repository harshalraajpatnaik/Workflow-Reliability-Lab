package com.workflowlab.execution.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "executions")
public class Execution {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "workspace_id", nullable = false)
    private UUID workspaceId;

    @Column(name = "environment_id", nullable = false)
    private UUID environmentId;

    @Column(name = "workflow_name", nullable = false)
    private String workflowName;

    @Column(name = "correlation_id", nullable = false)
    private String correlationId;

    @Column(name = "parent_execution_id")
    private UUID parentExecutionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ExecutionStatus status = ExecutionStatus.PENDING;

    @Column(name = "trigger_source", nullable = false, length = 100)
    private String triggerSource = "API";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "input_payload_meta", columnDefinition = "jsonb")
    private String inputPayloadMeta;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "output_payload_meta", columnDefinition = "jsonb")
    private String outputPayloadMeta;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt = Instant.now();

    @Column(name = "ended_at")
    private Instant endedAt;

    @Column(name = "duration_ms")
    private Long durationMs;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "error_stack", columnDefinition = "TEXT")
    private String errorStack;

    @Column(name = "is_demo", nullable = false)
    private boolean demo = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Execution() {}

    public Execution(UUID workspaceId, UUID environmentId, String workflowName, String correlationId, String triggerSource, boolean demo) {
        this.workspaceId = workspaceId;
        this.environmentId = environmentId;
        this.workflowName = workflowName;
        this.correlationId = correlationId;
        this.triggerSource = triggerSource != null ? triggerSource : "API";
        this.demo = demo;
        this.status = ExecutionStatus.RUNNING;
        this.startedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
        if (endedAt != null && startedAt != null) {
            this.durationMs = java.time.Duration.between(startedAt, endedAt).toMillis();
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getWorkspaceId() { return workspaceId; }
    public UUID getEnvironmentId() { return environmentId; }
    public String getWorkflowName() { return workflowName; }
    public String getCorrelationId() { return correlationId; }
    public UUID getParentExecutionId() { return parentExecutionId; }
    public void setParentExecutionId(UUID parentExecutionId) { this.parentExecutionId = parentExecutionId; }
    public ExecutionStatus getStatus() { return status; }
    public void setStatus(ExecutionStatus status) { this.status = status; }
    public String getTriggerSource() { return triggerSource; }
    public String getInputPayloadMeta() { return inputPayloadMeta; }
    public void setInputPayloadMeta(String inputPayloadMeta) { this.inputPayloadMeta = inputPayloadMeta; }
    public String getOutputPayloadMeta() { return outputPayloadMeta; }
    public void setOutputPayloadMeta(String outputPayloadMeta) { this.outputPayloadMeta = outputPayloadMeta; }
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
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public String getErrorStack() { return errorStack; }
    public void setErrorStack(String errorStack) { this.errorStack = errorStack; }
    public boolean isDemo() { return demo; }
    public void setDemo(boolean demo) { this.demo = demo; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
