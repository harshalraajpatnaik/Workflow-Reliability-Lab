package com.workflowlab.report.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "incidents")
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "workspace_id", nullable = false)
    private UUID workspaceId;

    @Column(name = "execution_id")
    private UUID executionId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(nullable = false, length = 50)
    private String severity = "HIGH";

    @Column(nullable = false, length = 50)
    private String status = "OPEN";

    @Column(name = "root_cause_hypothesis", columnDefinition = "TEXT")
    private String rootCauseHypothesis;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "evidence_refs", columnDefinition = "jsonb", nullable = false)
    private String evidenceRefs = "[]";

    @Column(name = "ai_analysis", columnDefinition = "TEXT")
    private String aiAnalysis;

    @Column(name = "ai_model_used", length = 100)
    private String aiModelUsed;

    @Column(name = "remediation_steps", columnDefinition = "TEXT")
    private String remediationSteps;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "resolved_by")
    private UUID resolvedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Incident() {}

    public Incident(UUID workspaceId, UUID executionId, String title, String summary, String severity, UUID createdBy) {
        this.workspaceId = workspaceId;
        this.executionId = executionId;
        this.title = title;
        this.summary = summary;
        this.severity = severity != null ? severity : "HIGH";
        this.createdBy = createdBy;
        this.status = "OPEN";
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getWorkspaceId() { return workspaceId; }
    public UUID getExecutionId() { return executionId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRootCauseHypothesis() { return rootCauseHypothesis; }
    public void setRootCauseHypothesis(String rootCauseHypothesis) { this.rootCauseHypothesis = rootCauseHypothesis; }
    public String getEvidenceRefs() { return evidenceRefs; }
    public void setEvidenceRefs(String evidenceRefs) { this.evidenceRefs = evidenceRefs; }
    public String getAiAnalysis() { return aiAnalysis; }
    public void setAiAnalysis(String aiAnalysis) { this.aiAnalysis = aiAnalysis; }
    public String getAiModelUsed() { return aiModelUsed; }
    public void setAiModelUsed(String aiModelUsed) { this.aiModelUsed = aiModelUsed; }
    public String getRemediationSteps() { return remediationSteps; }
    public void setRemediationSteps(String remediationSteps) { this.remediationSteps = remediationSteps; }
    public UUID getCreatedBy() { return createdBy; }
    public UUID getResolvedBy() { return resolvedBy; }
    public void setResolvedBy(UUID resolvedBy) { this.resolvedBy = resolvedBy; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
