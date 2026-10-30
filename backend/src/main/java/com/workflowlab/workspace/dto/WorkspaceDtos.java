package com.workflowlab.workspace.dto;

import com.workflowlab.workspace.model.Workspace;
import com.workflowlab.workspace.model.WorkspaceRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

public final class WorkspaceDtos {
    private WorkspaceDtos() {}

    public record CreateWorkspaceRequest(
        @NotBlank(message = "Workspace name is required")
        @Size(min = 2, max = 100, message = "Workspace name must be between 2 and 100 characters")
        String name
    ) {}

    public record WorkspaceDto(
        UUID id,
        String name,
        String slug,
        UUID ownerId,
        WorkspaceRole currentUserRole,
        Instant createdAt
    ) {
        public static WorkspaceDto from(Workspace w, WorkspaceRole role) {
            return new WorkspaceDto(
                w.getId(),
                w.getName(),
                w.getSlug(),
                w.getOwnerId(),
                role,
                w.getCreatedAt()
            );
        }
    }

    public record WorkspaceMemberDto(
        UUID id,
        UUID workspaceId,
        UUID userId,
        String email,
        String fullName,
        WorkspaceRole role,
        Instant joinedAt
    ) {}

    public record InviteMemberRequest(
        @NotBlank(message = "Email is required")
        String email,
        WorkspaceRole role
    ) {}

    public record UpdateMemberRoleRequest(
        WorkspaceRole role
    ) {}
}
