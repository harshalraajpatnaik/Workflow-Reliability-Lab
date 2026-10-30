package com.workflowlab.apikey.controller;

import com.workflowlab.apikey.dto.ApiKeyDtos.*;
import com.workflowlab.apikey.service.ApiKeyService;
import com.workflowlab.auth.security.UserPrincipal;
import com.workflowlab.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/api-keys")
@Tag(name = "API Keys", description = "Workspace-scoped API key creation, scopes, rotation, and revocation")
public class ApiKeyController {

    private final ApiKeyService apiKeyService;

    public ApiKeyController(ApiKeyService apiKeyService) {
        this.apiKeyService = apiKeyService;
    }

    @PostMapping
    @Operation(summary = "Generate a new workspace API key (returned once)")
    public ResponseEntity<ApiResponse<ApiKeyCreatedResponse>> createApiKey(
        @PathVariable UUID workspaceId,
        @Valid @RequestBody CreateApiKeyRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID userId = principal != null ? principal.getId() : null;
        ApiKeyCreatedResponse response = apiKeyService.createApiKey(workspaceId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("API key generated successfully", response));
    }

    @GetMapping
    @Operation(summary = "List all API keys for workspace")
    public ResponseEntity<ApiResponse<List<ApiKeyDto>>> listApiKeys(@PathVariable UUID workspaceId) {
        List<ApiKeyDto> keys = apiKeyService.listApiKeys(workspaceId);
        return ResponseEntity.ok(ApiResponse.ok(keys));
    }

    @DeleteMapping("/{apiKeyId}")
    @Operation(summary = "Revoke an API key immediately")
    public ResponseEntity<ApiResponse<Void>> revokeApiKey(
        @PathVariable UUID workspaceId,
        @PathVariable UUID apiKeyId
    ) {
        apiKeyService.revokeApiKey(workspaceId, apiKeyId);
        return ResponseEntity.ok(ApiResponse.ok("API key revoked", null));
    }
}
