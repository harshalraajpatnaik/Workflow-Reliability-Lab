package com.workflowlab.workspace.repository;

import com.workflowlab.workspace.model.WorkspaceMember;
import com.workflowlab.workspace.model.WorkspaceRole;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, UUID> {
    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);
    List<WorkspaceMember> findByWorkspaceId(UUID workspaceId);
    boolean existsByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);
    void deleteByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);
}
