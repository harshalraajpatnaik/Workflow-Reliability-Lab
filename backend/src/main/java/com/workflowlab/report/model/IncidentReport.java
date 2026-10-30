package com.workflowlab.report.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "incident_reports")
public class IncidentReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "incident_id", nullable = false)
    private UUID incidentId;

    @Column(name = "workspace_id", nullable = false)
    private UUID workspaceId;

    @Column(name = "report_title", nullable = false)
    private String reportTitle;

    @Column(name = "markdown_content", columnDefinition = "TEXT", nullable = false)
    private String markdownContent;

    @Column(name = "generated_by", nullable = false, length = 50)
    private String generatedBy = "SYSTEM";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public IncidentReport() {}

    public IncidentReport(UUID incidentId, UUID workspaceId, String reportTitle, String markdownContent, String generatedBy) {
        this.incidentId = incidentId;
        this.workspaceId = workspaceId;
        this.reportTitle = reportTitle;
        this.markdownContent = markdownContent;
        this.generatedBy = generatedBy != null ? generatedBy : "SYSTEM";
    }

    public UUID getId() { return id; }
    public UUID getIncidentId() { return incidentId; }
    public UUID getWorkspaceId() { return workspaceId; }
    public String getReportTitle() { return reportTitle; }
    public String getMarkdownContent() { return markdownContent; }
    public String getGeneratedBy() { return generatedBy; }
    public Instant getCreatedAt() { return createdAt; }
}
