package com.workflowlab.webhook.repository;

import com.workflowlab.webhook.model.WebhookDelivery;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WebhookDeliveryRepository extends JpaRepository<WebhookDelivery, UUID> {
    List<WebhookDelivery> findByWebhookIdOrderByCreatedAtDesc(UUID webhookId);
    Page<WebhookDelivery> findByWebhookIdOrderByCreatedAtDesc(UUID webhookId, Pageable pageable);
}
