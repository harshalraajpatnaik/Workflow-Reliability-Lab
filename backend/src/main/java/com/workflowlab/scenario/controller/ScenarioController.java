package com.workflowlab.scenario.controller;

import com.workflowlab.auth.security.UserPrincipal;
import com.workflowlab.common.dto.ApiResponse;
import com.workflowlab.common.dto.PageResponse;
import com.workflowlab.scenario.dto.ScenarioDtos.*;
import com.workflowlab.scenario.service.ScenarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/scenarios")
@Tag(name = "Failure Scenarios & Chaos Lab", description = "Controlled fault injection catalogue, isolated simulation engine, and failure reproduction")
public class ScenarioController {

    private final ScenarioService scenarioService;

    public ScenarioController(ScenarioService scenarioService) {
        this.scenarioService = scenarioService;
    }

    @GetMapping
    @Operation(summary = "List all failure scenarios in the catalogue")
    public ResponseEntity<ApiResponse<List<ScenarioDto>>> listScenarios(@PathVariable UUID workspaceId) {
        List<ScenarioDto> scenarios = scenarioService.listScenarios(workspaceId);
        return ResponseEntity.ok(ApiResponse.ok(scenarios));
    }

    @GetMapping("/{scenarioId}")
    @Operation(summary = "Get failure scenario details by ID")
    public ResponseEntity<ApiResponse<ScenarioDto>> getScenario(
        @PathVariable UUID workspaceId,
        @PathVariable UUID scenarioId
    ) {
        ScenarioDto scenario = scenarioService.getScenario(scenarioId);
        return ResponseEntity.ok(ApiResponse.ok(scenario));
    }

    @PostMapping("/{scenarioId}/run")
    @Operation(summary = "Execute an isolated failure simulation run")
    public ResponseEntity<ApiResponse<ScenarioRunDto>> runScenario(
        @PathVariable UUID workspaceId,
        @PathVariable UUID scenarioId,
        @Valid @RequestBody RunScenarioRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID userId = principal != null ? principal.getId() : null;
        ScenarioRunDto run = scenarioService.runScenario(workspaceId, scenarioId, request, userId);
        return ResponseEntity.ok(ApiResponse.ok("Simulation scenario executed", run));
    }

    @GetMapping("/runs")
    @Operation(summary = "List history of scenario simulation runs")
    public ResponseEntity<ApiResponse<PageResponse<ScenarioRunDto>>> listRuns(
        @PathVariable UUID workspaceId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, Math.min(size, 100));
        PageResponse<ScenarioRunDto> runs = scenarioService.listScenarioRuns(workspaceId, pageRequest);
        return ResponseEntity.ok(ApiResponse.ok(runs));
    }

    @GetMapping("/runs/{runId}")
    @Operation(summary = "Get details of a specific scenario run")
    public ResponseEntity<ApiResponse<ScenarioRunDto>> getRun(
        @PathVariable UUID workspaceId,
        @PathVariable UUID runId
    ) {
        ScenarioRunDto run = scenarioService.getScenarioRun(workspaceId, runId);
        return ResponseEntity.ok(ApiResponse.ok(run));
    }
}
