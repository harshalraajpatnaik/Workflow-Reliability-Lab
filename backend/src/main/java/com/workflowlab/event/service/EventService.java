package com.workflowlab.event.service;

import com.workflowlab.common.dto.PageResponse;
import com.workflowlab.common.exception.ResourceNotFoundException;
import com.workflowlab.event.dto.EventDtos.*;
import com.workflowlab.event.model.Event;
import com.workflowlab.event.model.EventStatus;
import com.workflowlab.event.repository.EventRepository;
import com.workflowlab.execution.repository.ExecutionRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final ExecutionRepository executionRepository;

    public EventService(EventRepository eventRepository, ExecutionRepository executionRepository) {
        this.eventRepository = eventRepository;
        this.executionRepository = executionRepository;
    }

    @Transactional
    public IngestEventResult ingestEvent(UUID workspaceId, IngestEventRequest request) {
        // Validate execution exists in workspace
        executionRepository.findByIdAndWorkspaceId(request.executionId(), workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Execution not found in this workspace"));

        // Check for idempotency duplicate
        Optional<Event> existing = eventRepository.findByExecutionIdAndIdempotencyKey(
            request.executionId(),
            request.idempotencyKey().trim()
        );

        if (existing.isPresent()) {
            return new IngestEventResult(
                EventDto.from(existing.get()),
                true,
                "Duplicate event detected by idempotency key. Existing event returned without reprocessing."
            );
        }

        String safePayload = redactSensitivePayload(request.payloadMetadata());

        Event event = new Event(
            workspaceId,
            request.executionId(),
            request.eventType().trim(),
            request.sourceService().trim(),
            request.correlationId().trim(),
            request.idempotencyKey().trim(),
            safePayload,
            request.status() != null ? request.status() : EventStatus.RECEIVED,
            request.retryCount() != null ? request.retryCount() : 0,
            request.occurredAt() != null ? request.occurredAt() : Instant.now()
        );

        event.setProcessedAt(Instant.now());
        if (request.errorClass() != null) event.setErrorClass(request.errorClass());
        if (request.errorMessage() != null) event.setErrorMessage(request.errorMessage());

        Event saved = eventRepository.save(event);
        return new IngestEventResult(EventDto.from(saved), false, "Event accepted and journaled successfully");
    }

    @Transactional(readOnly = true)
    public List<EventDto> getExecutionEvents(UUID workspaceId, UUID executionId) {
        executionRepository.findByIdAndWorkspaceId(executionId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Execution not found"));

        return eventRepository.findByExecutionIdOrderByOccurredAtAsc(executionId)
            .stream().map(EventDto::from).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<EventDto> listWorkspaceEvents(UUID workspaceId, Pageable pageable) {
        Page<Event> page = eventRepository.findByWorkspaceIdOrderByOccurredAtDesc(workspaceId, pageable);
        return PageResponse.from(page.map(EventDto::from));
    }

    private String redactSensitivePayload(String payload) {
        if (payload == null) return "{}";
        // Redact common sensitive fields
        return payload.replaceAll("(?i)(\"?(password|secret|card_number|cvv|token)\"?\\s*:\\s*\")[^\"]+(\")", "$1[REDACTED]$3");
    }
}
