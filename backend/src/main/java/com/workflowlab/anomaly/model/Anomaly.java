package com.workflowlab.anomaly.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "anomalies")
public class Anomaly {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "workspace_id", nullable = false)
    private UUID workspaceId;

    @Column(name = "execution_id", nullable = false)
    private UUID executionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "rule_type", nullable = false, length = 100)
    private AnomalyRuleType ruleType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private AnomalySeverity severity = AnomalySeverity.MEDIUM;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private String evidence = "{}";

    @Column(nullable = false)
    private boolean acknowledged = false;

    @Column(name = "acknowledged_by")
    private UUID acknowledgedBy;

    @Column(name = "acknowledged_at")
    private Instant acknowledgedAt;

    @Column(name = "detected_at", nullable = false)
    private Instant detectedAt = Instant.now();

    public Anomaly() {}

    public Anomaly(
        UUID workspaceId,
        UUID executionId,
        AnomalyRuleType ruleType,
        AnomalySeverity severity,
        String title,
        String description,
        String evidence
    ) {
        this.workspaceId = workspaceId;
        this.executionId = executionId;
        this.ruleType = ruleType;
        this.severity = severity;
        this.title = title;
        this.description = description;
        this.evidence = evidence != null ? evidence : "{}";
        this.detectedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getWorkspaceId() { return workspaceId; }
    public UUID getExecutionId() { return executionId; }
    public AnomalyRuleType getRuleType() { return ruleType; }
    public AnomalySeverity getSeverity() { return severity; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getEvidence() { return evidence; }
    public boolean isAcknowledged() { return acknowledged; }
    public void setAcknowledged(boolean acknowledged) { this.acknowledged = acknowledged; }
    public UUID getAcknowledgedBy() { return acknowledgedBy; }
    public void setAcknowledgedBy(UUID acknowledgedBy) { this.acknowledgedBy = acknowledgedBy; }
    public Instant getAcknowledgedAt() { return acknowledgedAt; }
    public void setAcknowledgedAt(Instant acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; }
    public Instant getDetectedAt() { return detectedAt; }
}
