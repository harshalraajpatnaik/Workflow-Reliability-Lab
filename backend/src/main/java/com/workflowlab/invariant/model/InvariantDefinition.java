package com.workflowlab.invariant.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "invariant_definitions")
public class InvariantDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "workspace_id")
    private UUID workspaceId;

    @Column(nullable = false, unique = true, length = 100)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false, length = 50)
    private String severity = "CRITICAL";

    @Column(name = "rule_type", nullable = false, length = 100)
    private String ruleType;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "is_builtin", nullable = false)
    private boolean builtin = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public InvariantDefinition() {}

    public UUID getId() { return id; }
    public UUID getWorkspaceId() { return workspaceId; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getSeverity() { return severity; }
    public String getRuleType() { return ruleType; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public boolean isBuiltin() { return builtin; }
    public Instant getCreatedAt() { return createdAt; }
}
