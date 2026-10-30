package com.workflowlab.apikey.repository;

import com.workflowlab.apikey.model.ApiKey;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, UUID> {
    Optional<ApiKey> findByKeyHash(String keyHash);
    List<ApiKey> findByWorkspaceIdOrderByCreatedAtDesc(UUID workspaceId);
    Optional<ApiKey> findByIdAndWorkspaceId(UUID id, UUID workspaceId);
}
