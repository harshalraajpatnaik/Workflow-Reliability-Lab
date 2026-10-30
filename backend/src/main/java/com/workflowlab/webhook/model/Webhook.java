package com.workflowlab.webhook.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "webhooks")
public class Webhook {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "workspace_id", nullable = false)
    private UUID workspaceId;

    @Column(nullable = false, length = 1000)
    private String url;

    @Column(name = "secret_hash", nullable = false)
    private String secretHash;

    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "event_types", columnDefinition = "jsonb", nullable = false)
    private String eventTypes = "[\"execution.failed\", \"anomaly.detected\", \"invariant.violated\"]";

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Webhook() {}

    public Webhook(UUID workspaceId, String url, String secretHash, String description, String eventTypes) {
        this.workspaceId = workspaceId;
        this.url = url;
        this.secretHash = secretHash;
        this.description = description;
        if (eventTypes != null) this.eventTypes = eventTypes;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getWorkspaceId() { return workspaceId; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getSecretHash() { return secretHash; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getEventTypes() { return eventTypes; }
    public void setEventTypes(String eventTypes) { this.eventTypes = eventTypes; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
