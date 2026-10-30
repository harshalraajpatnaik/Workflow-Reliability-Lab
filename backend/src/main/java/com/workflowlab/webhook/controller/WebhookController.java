package com.workflowlab.webhook.controller;

import com.workflowlab.common.dto.ApiResponse;
import com.workflowlab.webhook.dto.WebhookDtos.*;
import com.workflowlab.webhook.service.WebhookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/webhooks")
@Tag(name = "Outgoing Webhooks", description = "Register webhooks for alert dispatch on execution failure, anomaly, or invariant violation")
public class WebhookController {

    private final WebhookService webhookService;

    public WebhookController(WebhookService webhookService) {
        this.webhookService = webhookService;
    }

    @PostMapping
    @Operation(summary = "Register an outgoing webhook endpoint")
    public ResponseEntity<ApiResponse<WebhookDto>> registerWebhook(
        @PathVariable UUID workspaceId,
        @Valid @RequestBody RegisterWebhookRequest request
    ) {
        WebhookDto webhook = webhookService.registerWebhook(workspaceId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Webhook registered", webhook));
    }

    @GetMapping
    @Operation(summary = "List outgoing webhooks in workspace")
    public ResponseEntity<ApiResponse<List<WebhookDto>>> listWebhooks(@PathVariable UUID workspaceId) {
        List<WebhookDto> webhooks = webhookService.listWebhooks(workspaceId);
        return ResponseEntity.ok(ApiResponse.ok(webhooks));
    }

    @DeleteMapping("/{webhookId}")
    @Operation(summary = "Delete a webhook")
    public ResponseEntity<ApiResponse<Void>> deleteWebhook(
        @PathVariable UUID workspaceId,
        @PathVariable UUID webhookId
    ) {
        webhookService.deleteWebhook(workspaceId, webhookId);
        return ResponseEntity.ok(ApiResponse.ok("Webhook deleted", null));
    }

    @GetMapping("/{webhookId}/deliveries")
    @Operation(summary = "List delivery attempts for a webhook")
    public ResponseEntity<ApiResponse<List<WebhookDeliveryDto>>> listDeliveries(
        @PathVariable UUID workspaceId,
        @PathVariable UUID webhookId
    ) {
        List<WebhookDeliveryDto> deliveries = webhookService.listDeliveries(webhookId);
        return ResponseEntity.ok(ApiResponse.ok(deliveries));
    }
}
