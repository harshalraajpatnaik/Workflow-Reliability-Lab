package com.workflowlab.apikey.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "api_keys")
public class ApiKey {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "workspace_id", nullable = false)
    private UUID workspaceId;

    @Column(nullable = false)
    private String name;

    @Column(name = "key_prefix", nullable = false, length = 16)
    private String keyPrefix;

    @Column(name = "key_hash", nullable = false, unique = true)
    private String keyHash;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private String scopes = "[\"events:write\", \"traces:write\", \"executions:read\"]";

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "last_used_at")
    private Instant lastUsedAt;

    @Column(nullable = false)
    private boolean revoked = false;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public ApiKey() {}

    public ApiKey(UUID workspaceId, String name, String keyPrefix, String keyHash, String scopes, UUID createdBy, Instant expiresAt) {
        this.workspaceId = workspaceId;
        this.name = name;
        this.keyPrefix = keyPrefix;
        this.keyHash = keyHash;
        this.scopes = scopes != null ? scopes : "[\"events:write\", \"traces:write\", \"executions:read\"]";
        this.createdBy = createdBy;
        this.expiresAt = expiresAt;
    }

    public UUID getId() { return id; }
    public UUID getWorkspaceId() { return workspaceId; }
    public String getName() { return name; }
    public String getKeyPrefix() { return keyPrefix; }
    public String getKeyHash() { return keyHash; }
    public String getScopes() { return scopes; }
    public UUID getCreatedBy() { return createdBy; }
    public Instant getExpiresAt() { return expiresAt; }
    public Instant getLastUsedAt() { return lastUsedAt; }
    public void setLastUsedAt(Instant lastUsedAt) { this.lastUsedAt = lastUsedAt; }
    public boolean isRevoked() { return revoked; }
    public void setRevoked(boolean revoked) {
        this.revoked = revoked;
        if (revoked) this.revokedAt = Instant.now();
    }
    public void revoke() {
        this.revoked = true;
        this.revokedAt = Instant.now();
    }
    public Instant getRevokedAt() { return revokedAt; }
    public Instant getCreatedAt() { return createdAt; }

    public boolean isValid() {
        if (revoked) return false;
        return expiresAt == null || expiresAt.isAfter(Instant.now());
    }
}
