package com.workflowlab.scenario.dto;

import com.workflowlab.scenario.model.Scenario;
import com.workflowlab.scenario.model.ScenarioRun;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

public final class ScenarioDtos {
    private ScenarioDtos() {}

    public record RunScenarioRequest(
        @NotNull(message = "Environment ID is required")
        UUID environmentId,

        String customFaultConfig
    ) {}

    public record ScenarioDto(
        UUID id,
        String code,
        String name,
        String category,
        String description,
        String severity,
        String preconditions,
        String faultConfig,
        String expectedBehavior,
        String detectionRule,
        String recoveryGuidance,
        boolean isBuiltin,
        Instant createdAt
    ) {
        public static ScenarioDto from(Scenario s) {
            return new ScenarioDto(
                s.getId(),
                s.getCode(),
                s.getName(),
                s.getCategory(),
                s.getDescription(),
                s.getSeverity(),
                s.getPreconditions(),
                s.getFaultConfig(),
                s.getExpectedBehavior(),
                s.getDetectionRule(),
                s.getRecoveryGuidance(),
                s.isBuiltin(),
                s.getCreatedAt()
            );
        }
    }

    public record ScenarioRunDto(
        UUID id,
        UUID workspaceId,
        UUID scenarioId,
        UUID environmentId,
        UUID executionId,
        String status,
        String faultInjected,
        String observations,
        Boolean passedInvariants,
        int anomaliesDetected,
        Instant startedAt,
        Instant endedAt,
        UUID runBy
    ) {
        public static ScenarioRunDto from(ScenarioRun r) {
            return new ScenarioRunDto(
                r.getId(),
                r.getWorkspaceId(),
                r.getScenarioId(),
                r.getEnvironmentId(),
                r.getExecutionId(),
                r.getStatus(),
                r.getFaultInjected(),
                r.getObservations(),
                r.getPassedInvariants(),
                r.getAnomaliesDetected(),
                r.getStartedAt(),
                r.getEndedAt(),
                r.getRunBy()
            );
        }
    }
}
