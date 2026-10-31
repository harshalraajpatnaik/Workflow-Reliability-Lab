package com.workflowlab.webhook.dto;

import com.workflowlab.webhook.model.Webhook;
import com.workflowlab.webhook.model.WebhookDelivery;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.UUID;

public final class WebhookDtos {
    private WebhookDtos() {}

    public record RegisterWebhookRequest(
        @NotBlank(message = "URL is required")
        String url,

        String description,
        String eventTypes,
        boolean enabled,
        String secret
    ) {
        public RegisterWebhookRequest(String url, String description, String eventTypes, boolean enabled) {
            this(url, description, eventTypes, enabled, null);
        }
    }

    public record WebhookDto(
        UUID id,
        UUID workspaceId,
        String url,
        String description,
        String eventTypes,
        boolean enabled,
        Instant createdAt,
        Instant updatedAt
    ) {
        public static WebhookDto from(Webhook w) {
            return new WebhookDto(
                w.getId(),
                w.getWorkspaceId(),
                w.getUrl(),
                w.getDescription(),
                w.getEventTypes(),
                w.isEnabled(),
                w.getCreatedAt(),
                w.getUpdatedAt()
            );
        }
    }

    public record WebhookDeliveryDto(
        UUID id,
        UUID webhookId,
        String eventType,
        String payload,
        String status,
        int attemptCount,
        Integer httpStatus,
        String responseBody,
        String errorMessage,
        Instant deliveredAt,
        Instant createdAt
    ) {
        public static WebhookDeliveryDto from(WebhookDelivery d) {
            return new WebhookDeliveryDto(
                d.getId(),
                d.getWebhookId(),
                d.getEventType(),
                d.getPayload(),
                d.getStatus(),
                d.getAttemptCount(),
                d.getHttpStatus(),
                d.getResponseBody(),
                d.getErrorMessage(),
                d.getDeliveredAt(),
                d.getCreatedAt()
            );
        }
    }
}
