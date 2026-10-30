package com.workflowlab.webhook.repository;

import com.workflowlab.webhook.model.Webhook;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WebhookRepository extends JpaRepository<Webhook, UUID> {
    List<Webhook> findByWorkspaceId(UUID workspaceId);
    Optional<Webhook> findByIdAndWorkspaceId(UUID id, UUID workspaceId);
    List<Webhook> findByWorkspaceIdAndEnabledTrue(UUID workspaceId);
}
