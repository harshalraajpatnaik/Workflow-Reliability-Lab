package com.workflowlab.webhook.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workflowlab.audit.service.AuditService;
import com.workflowlab.common.exception.ResourceNotFoundException;
import com.workflowlab.webhook.dto.WebhookDtos.*;
import com.workflowlab.webhook.model.Webhook;
import com.workflowlab.webhook.model.WebhookDelivery;
import com.workflowlab.webhook.repository.WebhookDeliveryRepository;
import com.workflowlab.webhook.repository.WebhookRepository;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WebhookService {

    private final WebhookRepository webhookRepository;
    private final WebhookDeliveryRepository deliveryRepository;
    private final AuditService auditService;
    private final SecureRandom secureRandom = new SecureRandom();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public WebhookService(WebhookRepository webhookRepository, WebhookDeliveryRepository deliveryRepository, AuditService auditService) {
        this.webhookRepository = webhookRepository;
        this.deliveryRepository = deliveryRepository;
        this.auditService = auditService;
    }

    @Transactional
    public WebhookDto registerWebhook(UUID workspaceId, RegisterWebhookRequest request) {
        String secret;
        if (request.secret() != null && !request.secret().isBlank()) {
            secret = request.secret().trim();
        } else {
            byte[] secretBytes = new byte[32];
            secureRandom.nextBytes(secretBytes);
            secret = "whsec_" + Base64.getUrlEncoder().withoutPadding().encodeToString(secretBytes);
        }

        String eventTypesJson = formatEventTypesJson(request.eventTypes());

        Webhook webhook = new Webhook(
            workspaceId,
            request.url().trim(),
            secret,
            request.description(),
            eventTypesJson
        );
        webhook.setEnabled(request.enabled());

        Webhook saved = webhookRepository.save(webhook);

        auditService.record(
            workspaceId,
            null,
            "WEBHOOK_REGISTERED",
            "WEBHOOK",
            saved.getId().toString(),
            "{\"url\":\"" + saved.getUrl() + "\",\"events\":\"" + eventTypesJson + "\"}",
            "127.0.0.1",
            "Web Client"
        );

        return WebhookDto.from(saved);
    }

    @Transactional(readOnly = true)
    public List<WebhookDto> listWebhooks(UUID workspaceId) {
        return webhookRepository.findByWorkspaceId(workspaceId)
            .stream().map(WebhookDto::from).toList();
    }

    @Transactional
    public void deleteWebhook(UUID workspaceId, UUID webhookId) {
        Webhook wh = webhookRepository.findByIdAndWorkspaceId(webhookId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Webhook not found in this workspace"));
        webhookRepository.delete(wh);

        auditService.record(
            workspaceId,
            null,
            "WEBHOOK_DELETED",
            "WEBHOOK",
            webhookId.toString(),
            "{\"url\":\"" + wh.getUrl() + "\"}",
            "127.0.0.1",
            "Web Client"
        );
    }

    @Transactional(readOnly = true)
    public List<WebhookDeliveryDto> listDeliveries(UUID webhookId) {
        return deliveryRepository.findByWebhookIdOrderByCreatedAtDesc(webhookId)
            .stream().map(WebhookDeliveryDto::from).toList();
    }

    private String formatEventTypesJson(String rawEventTypes) {
        if (rawEventTypes == null || rawEventTypes.isBlank()) {
            return "[\"*\"]";
        }
        String trimmed = rawEventTypes.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            return trimmed;
        }
        String[] parts = trimmed.split(",");
        List<String> list = Arrays.stream(parts).map(String::trim).filter(s -> !s.isEmpty()).toList();
        try {
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            return "[\"*\"]";
        }
    }
}
