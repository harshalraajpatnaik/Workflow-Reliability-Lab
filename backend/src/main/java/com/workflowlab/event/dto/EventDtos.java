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

        String sourceService,
        String targetService,
        String correlationId,
        String idempotencyKey,
        String payload,
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
        public static EventDto from(Event event) {
            return new EventDto(
                event.getId(),
                event.getWorkspaceId(),
                event.getExecutionId(),
                event.getEventType(),
                event.getSourceService(),
                event.getCorrelationId(),
                event.getIdempotencyKey(),
                event.getPayloadMetadata(),
                event.getStatus(),
                event.getRetryCount(),
                event.getErrorClass(),
                event.getErrorMessage(),
                event.getOccurredAt(),
                event.getProcessedAt(),
                event.getCreatedAt()
            );
        }
    }
}
