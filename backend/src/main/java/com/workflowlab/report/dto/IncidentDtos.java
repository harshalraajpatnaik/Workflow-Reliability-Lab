package com.workflowlab.report.dto;

import com.workflowlab.report.model.Incident;
import com.workflowlab.report.model.IncidentReport;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.UUID;

public final class IncidentDtos {
    private IncidentDtos() {}

    public record CreateIncidentRequest(
        @NotBlank(message = "Title is required")
        String title,

        String summary,
        String severity,
        UUID executionId,
        String rootCauseHypothesis,
        String evidenceRefs,
        String remediationSteps
    ) {}

    public record UpdateIncidentRequest(
        String title,
        String summary,
        String severity,
        String status,
        String rootCauseHypothesis,
        String remediationSteps
    ) {}

    public record IncidentDto(
        UUID id,
        UUID workspaceId,
        UUID executionId,
        String title,
        String summary,
        String severity,
        String status,
        String rootCauseHypothesis,
        String evidenceRefs,
        String aiAnalysis,
        String aiModelUsed,
        String remediationSteps,
        UUID createdBy,
        UUID resolvedBy,
        Instant createdAt,
        Instant resolvedAt,
        Instant updatedAt
    ) {
        public static IncidentDto from(Incident inc) {
            return new IncidentDto(
                inc.getId(),
                inc.getWorkspaceId(),
                inc.getExecutionId(),
                inc.getTitle(),
                inc.getSummary(),
                inc.getSeverity(),
                inc.getStatus(),
                inc.getRootCauseHypothesis(),
                inc.getEvidenceRefs(),
                inc.getAiAnalysis(),
                inc.getAiModelUsed(),
                inc.getRemediationSteps(),
                inc.getCreatedBy(),
                inc.getResolvedBy(),
                inc.getCreatedAt(),
                inc.getResolvedAt(),
                inc.getUpdatedAt()
            );
        }
    }

    public record IncidentReportDto(
        UUID id,
        UUID incidentId,
        UUID workspaceId,
        String reportTitle,
        String markdownContent,
        String generatedBy,
        Instant createdAt
    ) {
        public static IncidentReportDto from(IncidentReport r) {
            return new IncidentReportDto(
                r.getId(),
                r.getIncidentId(),
                r.getWorkspaceId(),
                r.getReportTitle(),
                r.getMarkdownContent(),
                r.getGeneratedBy(),
                r.getCreatedAt()
            );
        }
    }
}
