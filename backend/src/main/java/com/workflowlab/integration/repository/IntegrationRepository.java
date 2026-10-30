package com.workflowlab.integration.repository;

import com.workflowlab.integration.model.Integration;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IntegrationRepository extends JpaRepository<Integration, UUID> {
    List<Integration> findByWorkspaceId(UUID workspaceId);
    Optional<Integration> findByWorkspaceIdAndIntegrationType(UUID workspaceId, String integrationType);
    Optional<Integration> findByIdAndWorkspaceId(UUID id, UUID workspaceId);
}
