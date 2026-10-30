package com.workflowlab.audit.controller;

import com.workflowlab.audit.dto.AuditDtos.AuditEventDto;
import com.workflowlab.audit.service.AuditService;
import com.workflowlab.common.dto.ApiResponse;
import com.workflowlab.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/audit")
@Tag(name = "Audit History", description = "Immutable audit event log for workspace access, security changes, and scenario runs")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    @Operation(summary = "List audit event history for workspace")
    public ResponseEntity<ApiResponse<PageResponse<AuditEventDto>>> listAuditEvents(
        @PathVariable UUID workspaceId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, Math.min(size, 100));
        PageResponse<AuditEventDto> response = auditService.listAuditEvents(workspaceId, pageRequest);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
