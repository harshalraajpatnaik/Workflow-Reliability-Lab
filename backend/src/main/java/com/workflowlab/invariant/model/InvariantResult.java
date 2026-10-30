package com.workflowlab.invariant.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "invariant_results")
public class InvariantResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "workspace_id", nullable = false)
    private UUID workspaceId;

    @Column(name = "invariant_id", nullable = false)
    private UUID invariantId;

    @Column(name = "execution_id", nullable = false)
    private UUID executionId;

    @Column(nullable = false)
    private boolean passed;

    @Column(name = "violation_message", columnDefinition = "TEXT")
    private String violationMessage;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private String evidence = "{}";

    @Column(name = "checked_at", nullable = false)
    private Instant checkedAt = Instant.now();

    public InvariantResult() {}

    public InvariantResult(
        UUID workspaceId,
        UUID invariantId,
        UUID executionId,
        boolean passed,
        String violationMessage,
        String evidence
    ) {
        this.workspaceId = workspaceId;
        this.invariantId = invariantId;
        this.executionId = executionId;
        this.passed = passed;
        this.violationMessage = violationMessage;
        this.evidence = evidence != null ? evidence : "{}";
        this.checkedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getWorkspaceId() { return workspaceId; }
    public UUID getInvariantId() { return invariantId; }
    public UUID getExecutionId() { return executionId; }
    public boolean isPassed() { return passed; }
    public String getViolationMessage() { return violationMessage; }
    public String getEvidence() { return evidence; }
    public Instant getCheckedAt() { return checkedAt; }
}
