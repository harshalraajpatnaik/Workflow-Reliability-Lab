package com.workflowlab.integration.dto;

import com.workflowlab.integration.model.Integration;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.UUID;

public final class IntegrationDtos {
    private IntegrationDtos() {}

    public record ConfigureRabbitMqRequest(
        @NotBlank(message = "Host is required")
        String host,

        int port,
        String virtualHost,

        @NotBlank(message = "Username is required")
        String username,

        String password,
        boolean useTls,
        String exchange,
        String queue,
        String routingKey,
        boolean enabled
    ) {}

    public record TestConnectionResult(
        boolean success,
        String message,
        long latencyMs
    ) {}

    public record IntegrationDto(
        UUID id,
        UUID workspaceId,
        String integrationType,
        String name,
        boolean enabled,
        String status,
        String statusMessage,
        Instant lastConnectedAt,
        Instant createdAt
    ) {
        public static IntegrationDto from(Integration i) {
            return new IntegrationDto(
                i.getId(),
                i.getWorkspaceId(),
                i.getIntegrationType(),
                i.getName(),
                i.isEnabled(),
                i.getStatus(),
                i.getStatusMessage(),
                i.getLastConnectedAt(),
                i.getCreatedAt()
            );
        }
    }
}
