package com.workflowlab.apikey.dto;

import com.workflowlab.apikey.model.ApiKey;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.UUID;

public final class ApiKeyDtos {
    private ApiKeyDtos() {}

    public record CreateApiKeyRequest(
        @NotBlank(message = "API key name is required")
        String name,

        String scopes,
        Instant expiresAt
    ) {}

    public record ApiKeyDto(
        UUID id,
        UUID workspaceId,
        String name,
        String keyPrefix,
        String scopes,
        Instant expiresAt,
        Instant lastUsedAt,
        boolean revoked,
        Instant createdAt
    ) {
        public static ApiKeyDto from(ApiKey k) {
            return new ApiKeyDto(
                k.getId(),
                k.getWorkspaceId(),
                k.getName(),
                k.getKeyPrefix(),
                k.getScopes(),
                k.getExpiresAt(),
                k.getLastUsedAt(),
                k.isRevoked(),
                k.getCreatedAt()
            );
        }
    }

    public record ApiKeyCreatedResponse(
        ApiKeyDto apiKey,
        String rawKey,
        String warning
    ) {}
}
