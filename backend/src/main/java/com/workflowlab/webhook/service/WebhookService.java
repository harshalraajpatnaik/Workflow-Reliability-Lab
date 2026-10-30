package com.workflowlab.webhook.service;

import com.workflowlab.common.exception.ResourceNotFoundException;
import com.workflowlab.webhook.dto.WebhookDtos.*;
import com.workflowlab.webhook.model.Webhook;
import com.workflowlab.webhook.model.WebhookDelivery;
import com.workflowlab.webhook.repository.WebhookDeliveryRepository;
import com.workflowlab.webhook.repository.WebhookRepository;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WebhookService {

    private final WebhookRepository webhookRepository;
    private final WebhookDeliveryRepository deliveryRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public WebhookService(WebhookRepository webhookRepository, WebhookDeliveryRepository deliveryRepository) {
        this.webhookRepository = webhookRepository;
        this.deliveryRepository = deliveryRepository;
    }

    @Transactional
    public WebhookDto registerWebhook(UUID workspaceId, RegisterWebhookRequest request) {
        byte[] secretBytes = new byte[32];
        secureRandom.nextBytes(secretBytes);
        String secret = "whsec_" + Base64.getUrlEncoder().withoutPadding().encodeToString(secretBytes);

        Webhook webhook = new Webhook(
            workspaceId,
            request.url().trim(),
            secret,
            request.description(),
            request.eventTypes()
        );
        webhook.setEnabled(request.enabled());

        Webhook saved = webhookRepository.save(webhook);
        return WebhookDto.from(saved);
    }

    @Transactional(readOnly = true)
    public List<WebhookDto> listWebhooks(UUID workspaceId) {
        return webhookRepository.findByWorkspaceId(workspaceId)
            .stream().map(WebhookDto::from).toList();
    }

    @Transactional
    public void deleteWebhook(UUID workspaceId, UUID webhookId) {
        Webhook webhook = webhookRepository.findByIdAndWorkspaceId(webhookId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Webhook not found"));
        webhookRepository.delete(webhook);
    }

    @Transactional(readOnly = true)
    public List<WebhookDeliveryDto> listDeliveries(UUID webhookId) {
        return deliveryRepository.findByWebhookIdOrderByCreatedAtDesc(webhookId)
            .stream().map(WebhookDeliveryDto::from).toList();
    }
}
