package com.workflowlab.project.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "environments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"project_id", "name"})
})
public class Environment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "environment_type", nullable = false)
    private EnvironmentType environmentType = EnvironmentType.DEVELOPMENT;

    @Column(columnDefinition = "TEXT")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String settings = "{}";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Environment() {}

    public Environment(UUID projectId, String name, EnvironmentType environmentType, String description) {
        this.projectId = projectId;
        this.name = name;
        this.environmentType = environmentType;
        this.description = description;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getProjectId() { return projectId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public EnvironmentType getEnvironmentType() { return environmentType; }
    public void setEnvironmentType(EnvironmentType environmentType) { this.environmentType = environmentType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSettings() { return settings; }
    public void setSettings(String settings) { this.settings = settings; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
