package com.workflowlab.report.controller;

import com.workflowlab.auth.security.UserPrincipal;
import com.workflowlab.common.dto.ApiResponse;
import com.workflowlab.common.dto.PageResponse;
import com.workflowlab.report.dto.IncidentDtos.*;
import com.workflowlab.report.service.IncidentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/incidents")
@Tag(name = "Incidents & Reports", description = "Root-cause investigation, evidence linking, postmortem generation, and AI assistance")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @PostMapping
    @Operation(summary = "Create an incident record from an execution or anomaly")
    public ResponseEntity<ApiResponse<IncidentDto>> createIncident(
        @PathVariable UUID workspaceId,
        @Valid @RequestBody CreateIncidentRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID userId = principal != null ? principal.getId() : null;
        IncidentDto incident = incidentService.createIncident(workspaceId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Incident created successfully", incident));
    }

    @GetMapping
    @Operation(summary = "List all incidents in the workspace with pagination")
    public ResponseEntity<ApiResponse<PageResponse<IncidentDto>>> listIncidents(
        @PathVariable UUID workspaceId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, Math.min(size, 100));
        PageResponse<IncidentDto> response = incidentService.listIncidents(workspaceId, pageRequest);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{incidentId}")
    @Operation(summary = "Get incident details by ID")
    public ResponseEntity<ApiResponse<IncidentDto>> getIncident(
        @PathVariable UUID workspaceId,
        @PathVariable UUID incidentId
    ) {
        IncidentDto incident = incidentService.getIncident(workspaceId, incidentId);
        return ResponseEntity.ok(ApiResponse.ok(incident));
    }

    @PutMapping("/{incidentId}")
    @Operation(summary = "Update incident status, hypothesis, or remediation notes")
    public ResponseEntity<ApiResponse<IncidentDto>> updateIncident(
        @PathVariable UUID workspaceId,
        @PathVariable UUID incidentId,
        @Valid @RequestBody UpdateIncidentRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID userId = principal != null ? principal.getId() : null;
        IncidentDto updated = incidentService.updateIncident(workspaceId, incidentId, request, userId);
        return ResponseEntity.ok(ApiResponse.ok("Incident updated", updated));
    }

    @PostMapping("/{incidentId}/ai-analysis")
    @Operation(summary = "Request AI or deterministic root-cause analysis citing actual evidence")
    public ResponseEntity<ApiResponse<IncidentDto>> requestAiAnalysis(
        @PathVariable UUID workspaceId,
        @PathVariable UUID incidentId
    ) {
        IncidentDto incident = incidentService.generateAiAnalysis(workspaceId, incidentId);
        return ResponseEntity.ok(ApiResponse.ok("Diagnostic analysis generated", incident));
    }

    @PostMapping("/{incidentId}/reports")
    @Operation(summary = "Generate a formatted Markdown postmortem report from incident and execution data")
    public ResponseEntity<ApiResponse<IncidentReportDto>> generatePostmortem(
        @PathVariable UUID workspaceId,
        @PathVariable UUID incidentId
    ) {
        IncidentReportDto report = incidentService.generatePostmortemReport(workspaceId, incidentId);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Postmortem report generated", report));
    }

    @GetMapping("/{incidentId}/reports")
    @Operation(summary = "List all generated postmortem reports for an incident")
    public ResponseEntity<ApiResponse<List<IncidentReportDto>>> getReports(
        @PathVariable UUID workspaceId,
        @PathVariable UUID incidentId
    ) {
        List<IncidentReportDto> reports = incidentService.getReports(workspaceId, incidentId);
        return ResponseEntity.ok(ApiResponse.ok(reports));
    }
}
