package com.workflowlab.workspace.controller;

import com.workflowlab.auth.security.UserPrincipal;
import com.workflowlab.common.dto.ApiResponse;
import com.workflowlab.workspace.dto.WorkspaceDtos.*;
import com.workflowlab.workspace.service.WorkspaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/workspaces")
@Tag(name = "Workspaces", description = "Multi-tenant workspace and team member management")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @GetMapping
    @Operation(summary = "List all workspaces the authenticated user belongs to")
    public ResponseEntity<ApiResponse<List<WorkspaceDto>>> listWorkspaces(@AuthenticationPrincipal UserPrincipal principal) {
        List<WorkspaceDto> workspaces = workspaceService.getUserWorkspaces(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(workspaces));
    }

    @PostMapping
    @Operation(summary = "Create a new workspace")
    public ResponseEntity<ApiResponse<WorkspaceDto>> createWorkspace(
        @Valid @RequestBody CreateWorkspaceRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        WorkspaceDto workspace = workspaceService.createWorkspace(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Workspace created successfully", workspace));
    }

    @GetMapping("/{workspaceId}")
    @Operation(summary = "Get workspace details by ID")
    public ResponseEntity<ApiResponse<WorkspaceDto>> getWorkspace(
        @PathVariable UUID workspaceId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        WorkspaceDto workspace = workspaceService.getWorkspace(workspaceId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(workspace));
    }

    @PutMapping("/{workspaceId}")
    @Operation(summary = "Update workspace details")
    public ResponseEntity<ApiResponse<WorkspaceDto>> updateWorkspace(
        @PathVariable UUID workspaceId,
        @Valid @RequestBody CreateWorkspaceRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        WorkspaceDto workspace = workspaceService.updateWorkspace(workspaceId, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Workspace updated", workspace));
    }

    @GetMapping("/{workspaceId}/members")
    @Operation(summary = "List all members of a workspace")
    public ResponseEntity<ApiResponse<List<WorkspaceMemberDto>>> listMembers(
        @PathVariable UUID workspaceId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<WorkspaceMemberDto> members = workspaceService.getMembers(workspaceId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(members));
    }

    @PostMapping("/{workspaceId}/members")
    @Operation(summary = "Invite a new member to the workspace")
    public ResponseEntity<ApiResponse<WorkspaceMemberDto>> inviteMember(
        @PathVariable UUID workspaceId,
        @Valid @RequestBody InviteMemberRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        WorkspaceMemberDto member = workspaceService.inviteMember(workspaceId, request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Member invited successfully", member));
    }

    @PatchMapping("/{workspaceId}/members/{targetUserId}")
    @Operation(summary = "Update a workspace member's role")
    public ResponseEntity<ApiResponse<Void>> updateMemberRole(
        @PathVariable UUID workspaceId,
        @PathVariable UUID targetUserId,
        @Valid @RequestBody UpdateMemberRoleRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        workspaceService.updateMemberRole(workspaceId, targetUserId, request.role(), principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Member role updated", null));
    }

    @DeleteMapping("/{workspaceId}/members/{targetUserId}")
    @Operation(summary = "Remove a member from the workspace")
    public ResponseEntity<ApiResponse<Void>> removeMember(
        @PathVariable UUID workspaceId,
        @PathVariable UUID targetUserId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        workspaceService.removeMember(workspaceId, targetUserId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Member removed from workspace", null));
    }
}
