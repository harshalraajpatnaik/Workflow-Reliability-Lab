package com.workflowlab.scenario.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "scenarios")
public class Scenario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "workspace_id")
    private UUID workspaceId;

    @Column(nullable = false, unique = true, length = 100)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false, length = 50)
    private String severity = "HIGH";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private String preconditions = "[]";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "fault_config", columnDefinition = "jsonb", nullable = false)
    private String faultConfig = "{}";

    @Column(name = "expected_behavior", columnDefinition = "TEXT", nullable = false)
    private String expectedBehavior;

    @Column(name = "detection_rule", nullable = false, length = 100)
    private String detectionRule;

    @Column(name = "recovery_guidance", columnDefinition = "TEXT", nullable = false)
    private String recoveryGuidance;

    @Column(name = "is_builtin", nullable = false)
    private boolean builtin = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Scenario() {}

    public UUID getId() { return id; }
    public UUID getWorkspaceId() { return workspaceId; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public String getDescription() { return description; }
    public String getSeverity() { return severity; }
    public String getPreconditions() { return preconditions; }
    public String getFaultConfig() { return faultConfig; }
    public String getExpectedBehavior() { return expectedBehavior; }
    public String getDetectionRule() { return detectionRule; }
    public String getRecoveryGuidance() { return recoveryGuidance; }
    public boolean isBuiltin() { return builtin; }
    public Instant getCreatedAt() { return createdAt; }
}
