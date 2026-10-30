package com.workflowlab.invariant.controller;

import com.workflowlab.common.dto.ApiResponse;
import com.workflowlab.common.dto.PageResponse;
import com.workflowlab.invariant.dto.InvariantDtos.*;
import com.workflowlab.invariant.service.InvariantEngine;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}")
@Tag(name = "Business Invariants", description = "Deterministic correctness validation, state-transition rules, and idempotency invariants")
public class InvariantController {

    private final InvariantEngine invariantEngine;

    public InvariantController(InvariantEngine invariantEngine) {
        this.invariantEngine = invariantEngine;
    }

    @GetMapping("/invariants/definitions")
    @Operation(summary = "List all available deterministic invariant definitions")
    public ResponseEntity<ApiResponse<List<InvariantDefinitionDto>>> listDefinitions(@PathVariable UUID workspaceId) {
        List<InvariantDefinitionDto> defs = invariantEngine.listDefinitions(workspaceId);
        return ResponseEntity.ok(ApiResponse.ok(defs));
    }

    @GetMapping("/invariants/results")
    @Operation(summary = "List recent invariant check outcomes across the workspace")
    public ResponseEntity<ApiResponse<PageResponse<InvariantResultDto>>> listResults(
        @PathVariable UUID workspaceId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, Math.min(size, 100));
        PageResponse<InvariantResultDto> response = invariantEngine.listWorkspaceResults(workspaceId, pageRequest);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/executions/{executionId}/verify-invariants")
    @Operation(summary = "Evaluate all business invariants on an execution")
    public ResponseEntity<ApiResponse<List<InvariantResultDto>>> verifyInvariants(
        @PathVariable UUID workspaceId,
        @PathVariable UUID executionId
    ) {
        List<InvariantResultDto> results = invariantEngine.evaluateExecution(executionId);
        long violations = results.stream().filter(r -> !r.passed()).count();
        String message = violations == 0 ? "All invariants passed successfully" : "Violations detected: " + violations;
        return ResponseEntity.ok(ApiResponse.ok(message, results));
    }

    @GetMapping("/executions/{executionId}/invariants")
    @Operation(summary = "Get evaluated invariant results for an execution")
    public ResponseEntity<ApiResponse<List<InvariantResultDto>>> getExecutionResults(
        @PathVariable UUID workspaceId,
        @PathVariable UUID executionId
    ) {
        List<InvariantResultDto> results = invariantEngine.getExecutionResults(executionId);
        return ResponseEntity.ok(ApiResponse.ok(results));
    }

    @GetMapping("/executions/{executionId}/invariants/summary")
    @Operation(summary = "Get invariant check pass/fail summary")
    public ResponseEntity<ApiResponse<InvariantCheckSummaryDto>> getSummary(
        @PathVariable UUID workspaceId,
        @PathVariable UUID executionId
    ) {
        InvariantCheckSummaryDto summary = invariantEngine.getSummary(executionId);
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }
}
