package com.workflowlab.event.dto;

import com.workflowlab.event.model.Event;
import com.workflowlab.event.model.EventStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

public final class EventDtos {
    private EventDtos() {}

    public record IngestEventRequest(
        @NotNull(message = "Execution ID is required")
        UUID executionId,

        @NotBlank(message = "Event type is required")
        String eventType,

        @NotBlank(message = "Source service is required")
        String sourceService,

        @NotBlank(message = "Correlation ID is required")
        String correlationId,

        @NotBlank(message = "Idempotency key is required")
        String idempotencyKey,

        String payloadMetadata,
        EventStatus status,
        Integer retryCount,
        String errorClass,
        String errorMessage,
        Instant occurredAt
    ) {}

    public record IngestEventResult(
        EventDto event,
        boolean duplicate,
        String message
    ) {}

    public record EventDto(
        UUID id,
        UUID workspaceId,
        UUID executionId,
        String eventType,
        String sourceService,
        String correlationId,
        String idempotencyKey,
        String payloadMetadata,
        EventStatus status,
        int retryCount,
        String errorClass,
        String errorMessage,
        Instant occurredAt,
        Instant processedAt,
        Instant createdAt
    ) {
        public static EventDto from(Event e) {
            return new EventDto(
                e.getId(),
                e.getWorkspaceId(),
                e.getExecutionId(),
                e.getEventType(),
                e.getSourceService(),
                e.getCorrelationId(),
                e.getIdempotencyKey(),
                e.getPayloadMetadata(),
                e.getStatus(),
                e.getRetryCount(),
                e.getErrorClass(),
                e.getErrorMessage(),
                e.getOccurredAt(),
                e.getProcessedAt(),
                e.getCreatedAt()
            );
        }
    }
}
