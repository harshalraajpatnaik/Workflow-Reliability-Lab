package com.workflowlab.project.repository;

import com.workflowlab.project.model.Project;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {
    List<Project> findByWorkspaceIdOrderByCreatedAtDesc(UUID workspaceId);
    Optional<Project> findByIdAndWorkspaceId(UUID id, UUID workspaceId);
    boolean existsByWorkspaceIdAndName(UUID workspaceId, String name);
}
