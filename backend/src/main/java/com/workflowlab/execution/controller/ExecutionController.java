package com.workflowlab.execution.controller;

import com.workflowlab.common.dto.ApiResponse;
import com.workflowlab.common.dto.PageResponse;
import com.workflowlab.execution.dto.ExecutionDtos.*;
import com.workflowlab.execution.model.ExecutionStatus;
import com.workflowlab.execution.service.ExecutionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/executions")
@Tag(name = "Workflow Executions", description = "Query, track, and inspect distributed workflow execution lifecycles")
public class ExecutionController {

    private final ExecutionService executionService;

    public ExecutionController(ExecutionService executionService) {
        this.executionService = executionService;
    }

    @GetMapping
    @Operation(summary = "List workflow executions with search, filtering, and pagination")
    public ResponseEntity<ApiResponse<PageResponse<ExecutionDto>>> listExecutions(
        @PathVariable UUID workspaceId,
        @RequestParam(required = false) UUID environmentId,
        @RequestParam(required = false) ExecutionStatus status,
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, Math.min(size, 100), Sort.by("startedAt").descending());
        PageResponse<ExecutionDto> response = executionService.listExecutions(workspaceId, environmentId, status, search, pageRequest);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get execution aggregate stats and reliability rate")
    public ResponseEntity<ApiResponse<ExecutionStatsDto>> getStats(@PathVariable UUID workspaceId) {
        ExecutionStatsDto stats = executionService.getStats(workspaceId);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @PostMapping
    @Operation(summary = "Register a new workflow execution")
    public ResponseEntity<ApiResponse<ExecutionDto>> createExecution(
        @PathVariable UUID workspaceId,
        @Valid @RequestBody CreateExecutionRequest request
    ) {
        ExecutionDto execution = executionService.createExecution(workspaceId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Execution registered", execution));
    }

    @GetMapping("/{executionId}")
    @Operation(summary = "Get execution details by ID")
    public ResponseEntity<ApiResponse<ExecutionDto>> getExecution(
        @PathVariable UUID workspaceId,
        @PathVariable UUID executionId
    ) {
        ExecutionDto execution = executionService.getExecution(workspaceId, executionId);
        return ResponseEntity.ok(ApiResponse.ok(execution));
    }

    @PatchMapping("/{executionId}/status")
    @Operation(summary = "Transition execution status")
    public ResponseEntity<ApiResponse<ExecutionDto>> updateStatus(
        @PathVariable UUID workspaceId,
        @PathVariable UUID executionId,
        @Valid @RequestBody UpdateExecutionStatusRequest request
    ) {
        ExecutionDto execution = executionService.updateExecutionStatus(workspaceId, executionId, request);
        return ResponseEntity.ok(ApiResponse.ok("Status updated", execution));
    }
}
