package com.workflowlab.integration.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "integrations", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"workspace_id", "integration_type"})
})
public class Integration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "workspace_id", nullable = false)
    private UUID workspaceId;

    @Column(name = "integration_type", nullable = false, length = 50)
    private String integrationType;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private boolean enabled = false;

    @Column(name = "encrypted_config", columnDefinition = "TEXT", nullable = false)
    private String encryptedConfig;

    @Column(nullable = false, length = 50)
    private String status = "DISCONNECTED";

    @Column(name = "status_message", columnDefinition = "TEXT")
    private String statusMessage;

    @Column(name = "last_connected_at")
    private Instant lastConnectedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Integration() {}

    public Integration(UUID workspaceId, String integrationType, String name, String encryptedConfig) {
        this.workspaceId = workspaceId;
        this.integrationType = integrationType;
        this.name = name;
        this.encryptedConfig = encryptedConfig;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getWorkspaceId() { return workspaceId; }
    public String getIntegrationType() { return integrationType; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public String getEncryptedConfig() { return encryptedConfig; }
    public void setEncryptedConfig(String encryptedConfig) { this.encryptedConfig = encryptedConfig; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getStatusMessage() { return statusMessage; }
    public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }
    public Instant getLastConnectedAt() { return lastConnectedAt; }
    public void setLastConnectedAt(Instant lastConnectedAt) { this.lastConnectedAt = lastConnectedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
