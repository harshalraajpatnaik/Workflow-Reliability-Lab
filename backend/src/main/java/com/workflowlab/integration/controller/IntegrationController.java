package com.workflowlab.integration.controller;

import com.workflowlab.common.dto.ApiResponse;
import com.workflowlab.integration.dto.IntegrationDtos.*;
import com.workflowlab.integration.service.IntegrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/integrations")
@Tag(name = "Integrations", description = "External integration connections including RabbitMQ broker, OpenTelemetry, and Webhooks")
public class IntegrationController {

    private final IntegrationService integrationService;

    public IntegrationController(IntegrationService integrationService) {
        this.integrationService = integrationService;
    }

    @GetMapping
    @Operation(summary = "List all integration configurations for the workspace")
    public ResponseEntity<ApiResponse<List<IntegrationDto>>> getIntegrations(@PathVariable UUID workspaceId) {
        List<IntegrationDto> list = integrationService.getIntegrations(workspaceId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/rabbitmq")
    @Operation(summary = "Save and encrypt RabbitMQ broker credentials")
    public ResponseEntity<ApiResponse<IntegrationDto>> configureRabbitMq(
        @PathVariable UUID workspaceId,
        @Valid @RequestBody ConfigureRabbitMqRequest request
    ) {
        IntegrationDto result = integrationService.configureRabbitMq(workspaceId, request);
        return ResponseEntity.ok(ApiResponse.ok("RabbitMQ integration configured", result));
    }

    @PostMapping("/rabbitmq/test")
    @Operation(summary = "Test connectivity to RabbitMQ broker without saving")
    public ResponseEntity<ApiResponse<TestConnectionResult>> testRabbitMqConnection(
        @PathVariable UUID workspaceId,
        @Valid @RequestBody ConfigureRabbitMqRequest request
    ) {
        TestConnectionResult result = integrationService.testRabbitMqConnection(request);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
