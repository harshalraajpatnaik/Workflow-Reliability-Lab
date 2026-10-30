package com.workflowlab.trace.controller;

import com.workflowlab.common.dto.ApiResponse;
import com.workflowlab.common.dto.PageResponse;
import com.workflowlab.common.tenant.TenantContext;
import com.workflowlab.trace.dto.TraceDtos.*;
import com.workflowlab.trace.service.TraceService;
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
@Tag(name = "Traces & Dependencies", description = "OpenTelemetry-compatible distributed trace ingestion, waterfall timelines, and service maps")
public class TraceController {

    private final TraceService traceService;

    public TraceController(TraceService traceService) {
        this.traceService = traceService;
    }

    @PostMapping("/api/v1/workspaces/{workspaceId}/traces")
    @Operation(summary = "Ingest an OpenTelemetry trace with its spans")
    public ResponseEntity<ApiResponse<TraceDetailDto>> ingestTrace(
        @PathVariable UUID workspaceId,
        @Valid @RequestBody IngestTraceRequest request
    ) {
        TraceDetailDto trace = traceService.ingestTrace(workspaceId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Trace ingested successfully", trace));
    }

    @PostMapping("/api/v1/workspaces/{workspaceId}/traces/spans")
    @Operation(summary = "Ingest a single OpenTelemetry span into a trace")
    public ResponseEntity<ApiResponse<TraceDetailDto>> ingestSingleSpan(
        @PathVariable UUID workspaceId,
        @Valid @RequestBody SingleSpanIngestRequest request
    ) {
        TraceDetailDto trace = traceService.ingestSingleSpan(workspaceId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Span ingested successfully", trace));
    }

    @PostMapping("/api/v1/ingest/traces")
    @Operation(summary = "Machine-to-machine trace ingestion endpoint (requires API Key or Bearer Token)")
    public ResponseEntity<ApiResponse<TraceDetailDto>> ingestTraceM2M(
        @Valid @RequestBody IngestTraceRequest request
    ) {
        UUID workspaceId = TenantContext.getWorkspaceId();
        if (workspaceId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Tenant workspace context not identified", "TENANT_REQUIRED"));
        }
        TraceDetailDto trace = traceService.ingestTrace(workspaceId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Trace ingested successfully", trace));
    }

    @PostMapping("/api/v1/ingest/spans")
    @Operation(summary = "Machine-to-machine span ingestion endpoint (requires API Key or Bearer Token)")
    public ResponseEntity<ApiResponse<TraceDetailDto>> ingestSpanM2M(
        @Valid @RequestBody SingleSpanIngestRequest request
    ) {
        UUID workspaceId = TenantContext.getWorkspaceId();
        if (workspaceId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Tenant workspace context not identified", "TENANT_REQUIRED"));
        }
        TraceDetailDto trace = traceService.ingestSingleSpan(workspaceId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Span ingested successfully", trace));
    }

    @GetMapping("/api/v1/workspaces/{workspaceId}/traces")
    @Operation(summary = "List recent distributed traces with pagination")
    public ResponseEntity<ApiResponse<PageResponse<TraceDetailDto>>> listTraces(
        @PathVariable UUID workspaceId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, Math.min(size, 100));
        PageResponse<TraceDetailDto> response = traceService.listTraces(workspaceId, pageRequest);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/api/v1/workspaces/{workspaceId}/traces/{traceId}")
    @Operation(summary = "Get full trace detail and span waterfall")
    public ResponseEntity<ApiResponse<TraceDetailDto>> getTrace(
        @PathVariable UUID workspaceId,
        @PathVariable String traceId
    ) {
        TraceDetailDto trace = traceService.getTrace(workspaceId, traceId);
        return ResponseEntity.ok(ApiResponse.ok(trace));
    }

    @GetMapping("/api/v1/workspaces/{workspaceId}/executions/{executionId}/traces")
    @Operation(summary = "Get correlated traces for an execution")
    public ResponseEntity<ApiResponse<List<TraceDetailDto>>> getExecutionTraces(
        @PathVariable UUID workspaceId,
        @PathVariable UUID executionId
    ) {
        List<TraceDetailDto> traces = traceService.getExecutionTraces(workspaceId, executionId);
        return ResponseEntity.ok(ApiResponse.ok(traces));
    }

    @GetMapping("/api/v1/workspaces/{workspaceId}/traces/service-graph")
    @Operation(summary = "Get aggregated service dependency graph")
    public ResponseEntity<ApiResponse<ServiceGraphDto>> getServiceGraph(@PathVariable UUID workspaceId) {
        ServiceGraphDto graph = traceService.getServiceGraph(workspaceId);
        return ResponseEntity.ok(ApiResponse.ok(graph));
    }
}
