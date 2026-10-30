package com.workflowlab.event.controller;

import com.workflowlab.common.dto.ApiResponse;
import com.workflowlab.common.dto.PageResponse;
import com.workflowlab.common.tenant.TenantContext;
import com.workflowlab.event.dto.EventDtos.*;
import com.workflowlab.event.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Tag(name = "Event Journal", description = "Durable append-only event journal, idempotency enforcement, and timeline inspection")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping("/api/v1/workspaces/{workspaceId}/events")
    @Operation(summary = "Ingest a workflow event with strict idempotency key check")
    public ResponseEntity<ApiResponse<IngestEventResult>> ingestEvent(
        @PathVariable UUID workspaceId,
        @Valid @RequestBody IngestEventRequest request
    ) {
        IngestEventResult result = eventService.ingestEvent(workspaceId, request);
        HttpStatus status = result.duplicate() ? HttpStatus.OK : HttpStatus.CREATED;
        return ResponseEntity.status(status).body(ApiResponse.ok(result.message(), result));
    }

    @PostMapping("/api/v1/ingest/events")
    @Operation(summary = "Machine-to-machine event ingestion endpoint (requires API Key or Bearer Token)")
    public ResponseEntity<ApiResponse<IngestEventResult>> ingestEventM2M(
        @Valid @RequestBody IngestEventRequest request
    ) {
        UUID workspaceId = TenantContext.getWorkspaceId();
        if (workspaceId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Tenant workspace context not identified", "TENANT_REQUIRED"));
        }
        IngestEventResult result = eventService.ingestEvent(workspaceId, request);
        HttpStatus status = result.duplicate() ? HttpStatus.OK : HttpStatus.CREATED;
        return ResponseEntity.status(status).body(ApiResponse.ok(result.message(), result));
    }

    @GetMapping("/api/v1/workspaces/{workspaceId}/executions/{executionId}/events")
    @Operation(summary = "Get sequential event timeline for an execution")
    public ResponseEntity<ApiResponse<List<EventDto>>> getExecutionTimeline(
        @PathVariable UUID workspaceId,
        @PathVariable UUID executionId
    ) {
        List<EventDto> events = eventService.getExecutionEvents(workspaceId, executionId);
        return ResponseEntity.ok(ApiResponse.ok(events));
    }

    @GetMapping("/api/v1/workspaces/{workspaceId}/events")
    @Operation(summary = "List all recent events across workspace")
    public ResponseEntity<ApiResponse<PageResponse<EventDto>>> listEvents(
        @PathVariable UUID workspaceId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, Math.min(size, 100));
        PageResponse<EventDto> response = eventService.listWorkspaceEvents(workspaceId, pageRequest);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
