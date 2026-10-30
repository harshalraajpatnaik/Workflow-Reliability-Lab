package com.workflowlab.report.repository;

import com.workflowlab.report.model.Incident;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, UUID> {
    Page<Incident> findByWorkspaceIdOrderByCreatedAtDesc(UUID workspaceId, Pageable pageable);
    Optional<Incident> findByIdAndWorkspaceId(UUID id, UUID workspaceId);
    long countByWorkspaceIdAndStatus(UUID workspaceId, String status);
    long countByWorkspaceId(UUID workspaceId);
}
