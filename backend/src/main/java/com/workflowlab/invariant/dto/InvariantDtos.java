package com.workflowlab.invariant.dto;

import com.workflowlab.invariant.model.InvariantDefinition;
import com.workflowlab.invariant.model.InvariantResult;
import java.time.Instant;
import java.util.UUID;

public final class InvariantDtos {
    private InvariantDtos() {}

    public record InvariantDefinitionDto(
        UUID id,
        String code,
        String name,
        String description,
        String severity,
        String ruleType,
        boolean enabled,
        boolean isBuiltin,
        Instant createdAt
    ) {
        public static InvariantDefinitionDto from(InvariantDefinition d) {
            return new InvariantDefinitionDto(
                d.getId(),
                d.getCode(),
                d.getName(),
                d.getDescription(),
                d.getSeverity(),
                d.getRuleType(),
                d.isEnabled(),
                d.isBuiltin(),
                d.getCreatedAt()
            );
        }
    }

    public record InvariantResultDto(
        UUID id,
        UUID workspaceId,
        UUID invariantId,
        String invariantName,
        String invariantCode,
        String severity,
        UUID executionId,
        boolean passed,
        String violationMessage,
        String evidence,
        Instant checkedAt
    ) {
        public static InvariantResultDto from(InvariantResult r, InvariantDefinition d) {
            return new InvariantResultDto(
                r.getId(),
                r.getWorkspaceId(),
                r.getInvariantId(),
                d != null ? d.getName() : "Unknown Invariant",
                d != null ? d.getCode() : "UNKNOWN",
                d != null ? d.getSeverity() : "HIGH",
                r.getExecutionId(),
                r.isPassed(),
                r.getViolationMessage(),
                r.getEvidence(),
                r.getCheckedAt()
            );
        }
    }

    public record InvariantCheckSummaryDto(
        int totalChecked,
        int passedCount,
        int violatedCount,
        boolean allPassed
    ) {}
}
