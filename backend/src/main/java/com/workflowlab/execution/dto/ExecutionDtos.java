package com.workflowlab.execution.dto;

import com.workflowlab.execution.model.Execution;
import com.workflowlab.execution.model.ExecutionStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

public final class ExecutionDtos {
    private ExecutionDtos() {}

    public record CreateExecutionRequest(
        @NotNull(message = "Environment ID is required")
        UUID environmentId,

        @NotBlank(message = "Workflow name is required")
        String workflowName,

        @NotBlank(message = "Correlation ID is required")
        String correlationId,

        UUID parentExecutionId,
        String triggerSource,
        String inputPayloadMeta,
        Boolean isDemo
    ) {}

    public record UpdateExecutionStatusRequest(
        @NotNull(message = "Status is required")
        ExecutionStatus status,

        String outputPayloadMeta,
        String errorMessage,
        String errorStack
    ) {}

    public record ExecutionDto(
        UUID id,
        UUID workspaceId,
        UUID environmentId,
        String workflowName,
        String correlationId,
        UUID parentExecutionId,
        ExecutionStatus status,
        String triggerSource,
        String inputPayloadMeta,
        String outputPayloadMeta,
        Instant startedAt,
        Instant endedAt,
        Long durationMs,
        String errorMessage,
        boolean isDemo,
        Instant createdAt
    ) {
        public static ExecutionDto from(Execution e) {
            return new ExecutionDto(
                e.getId(),
                e.getWorkspaceId(),
                e.getEnvironmentId(),
                e.getWorkflowName(),
                e.getCorrelationId(),
                e.getParentExecutionId(),
                e.getStatus(),
                e.getTriggerSource(),
                e.getInputPayloadMeta(),
                e.getOutputPayloadMeta(),
                e.getStartedAt(),
                e.getEndedAt(),
                e.getDurationMs(),
                e.getErrorMessage(),
                e.isDemo(),
                e.getCreatedAt()
            );
        }
    }

    public record ExecutionStatsDto(
        long total,
        long completed,
        long failed,
        long running,
        long timedOut,
        double successRate
    ) {}
}
