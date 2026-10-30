package com.workflowlab.workspace.repository;

import com.workflowlab.workspace.model.Workspace;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, UUID> {
    Optional<Workspace> findBySlug(String slug);
    boolean existsBySlug(String slug);

    @Query("SELECT w FROM Workspace w JOIN WorkspaceMember m ON w.id = m.workspaceId WHERE m.userId = :userId ORDER BY w.createdAt DESC")
    List<Workspace> findAllByUserId(UUID userId);
}
