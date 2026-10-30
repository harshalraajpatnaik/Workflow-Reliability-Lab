package com.workflowlab.anomaly.dto;

import com.workflowlab.anomaly.model.Anomaly;
import com.workflowlab.anomaly.model.AnomalyRuleType;
import com.workflowlab.anomaly.model.AnomalySeverity;
import java.time.Instant;
import java.util.UUID;

public final class AnomalyDtos {
    private AnomalyDtos() {}

    public record AnomalyDto(
        UUID id,
        UUID workspaceId,
        UUID executionId,
        AnomalyRuleType ruleType,
        AnomalySeverity severity,
        String title,
        String description,
        String evidence,
        boolean acknowledged,
        UUID acknowledgedBy,
        Instant acknowledgedAt,
        Instant detectedAt
    ) {
        public static AnomalyDto from(Anomaly a) {
            return new AnomalyDto(
                a.getId(),
                a.getWorkspaceId(),
                a.getExecutionId(),
                a.getRuleType(),
                a.getSeverity(),
                a.getTitle(),
                a.getDescription(),
                a.getEvidence(),
                a.isAcknowledged(),
                a.getAcknowledgedBy(),
                a.getAcknowledgedAt(),
                a.getDetectedAt()
            );
        }
    }

    public record AnomalyStatsDto(
        long totalUnacknowledged,
        long criticalCount,
        long highCount,
        long mediumCount,
        long lowCount
    ) {}
}
