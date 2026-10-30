package com.workflowlab.anomaly.controller;

import com.workflowlab.anomaly.dto.AnomalyDtos.*;
import com.workflowlab.anomaly.service.AnomalyDetectionService;
import com.workflowlab.auth.security.UserPrincipal;
import com.workflowlab.common.dto.ApiResponse;
import com.workflowlab.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}")
@Tag(name = "Anomaly Detection", description = "Deterministic anomaly detection engine, statistical checks, and evidence analysis")
public class AnomalyController {

    private final AnomalyDetectionService anomalyService;

    public AnomalyController(AnomalyDetectionService anomalyService) {
        this.anomalyService = anomalyService;
    }

    @GetMapping("/anomalies")
    @Operation(summary = "List all detected anomalies across the workspace")
    public ResponseEntity<ApiResponse<PageResponse<AnomalyDto>>> listAnomalies(
        @PathVariable UUID workspaceId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, Math.min(size, 100));
        PageResponse<AnomalyDto> response = anomalyService.listWorkspaceAnomalies(workspaceId, pageRequest);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/anomalies/stats")
    @Operation(summary = "Get workspace anomaly counts by severity")
    public ResponseEntity<ApiResponse<AnomalyStatsDto>> getStats(@PathVariable UUID workspaceId) {
        AnomalyStatsDto stats = anomalyService.getStats(workspaceId);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @PostMapping("/executions/{executionId}/evaluate-anomalies")
    @Operation(summary = "Trigger deterministic rule evaluation on a specific execution")
    public ResponseEntity<ApiResponse<List<AnomalyDto>>> evaluateExecution(
        @PathVariable UUID workspaceId,
        @PathVariable UUID executionId
    ) {
        List<AnomalyDto> detected = anomalyService.evaluateExecution(executionId);
        return ResponseEntity.ok(ApiResponse.ok("Evaluation complete: " + detected.size() + " anomalies detected", detected));
    }

    @GetMapping("/executions/{executionId}/anomalies")
    @Operation(summary = "Get detected anomalies for a single execution")
    public ResponseEntity<ApiResponse<List<AnomalyDto>>> getExecutionAnomalies(
        @PathVariable UUID workspaceId,
        @PathVariable UUID executionId
    ) {
        List<AnomalyDto> anomalies = anomalyService.getExecutionAnomalies(executionId);
        return ResponseEntity.ok(ApiResponse.ok(anomalies));
    }

    @PostMapping("/anomalies/{anomalyId}/acknowledge")
    @Operation(summary = "Mark an anomaly as acknowledged")
    public ResponseEntity<ApiResponse<AnomalyDto>> acknowledgeAnomaly(
        @PathVariable UUID workspaceId,
        @PathVariable UUID anomalyId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        AnomalyDto anomaly = anomalyService.acknowledgeAnomaly(workspaceId, anomalyId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Anomaly acknowledged", anomaly));
    }
}
