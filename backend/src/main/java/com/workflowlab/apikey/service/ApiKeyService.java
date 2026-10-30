package com.workflowlab.apikey.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workflowlab.apikey.dto.ApiKeyDtos.*;
import com.workflowlab.apikey.model.ApiKey;
import com.workflowlab.apikey.repository.ApiKeyRepository;
import com.workflowlab.audit.service.AuditService;
import com.workflowlab.auth.service.TokenService;
import com.workflowlab.common.exception.ResourceNotFoundException;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;
    private final TokenService tokenService;
    private final AuditService auditService;
    private final SecureRandom secureRandom = new SecureRandom();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ApiKeyService(ApiKeyRepository apiKeyRepository, TokenService tokenService, AuditService auditService) {
        this.apiKeyRepository = apiKeyRepository;
        this.tokenService = tokenService;
        this.auditService = auditService;
    }

    @Transactional
    public ApiKeyCreatedResponse createApiKey(UUID workspaceId, CreateApiKeyRequest request, UUID userId) {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String rawKey = "wrl_" + Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        String prefix = rawKey.substring(0, 12);
        String hash = tokenService.hashToken(rawKey);

        String scopesJson = formatScopesJson(request.scopes());

        ApiKey apiKey = new ApiKey(
            workspaceId,
            request.name().trim(),
            prefix,
            hash,
            scopesJson,
            userId,
            request.expiresAt()
        );

        ApiKey saved = apiKeyRepository.save(apiKey);

        auditService.record(
            workspaceId,
            userId,
            "API_KEY_CREATED",
            "API_KEY",
            saved.getId().toString(),
            "{\"name\":\"" + saved.getName() + "\",\"prefix\":\"" + saved.getKeyPrefix() + "\"}",
            "127.0.0.1",
            "Web Client"
        );

        return new ApiKeyCreatedResponse(
            ApiKeyDto.from(saved),
            rawKey,
            "Save this API key immediately. You will not be able to see it again."
        );
    }

    @Transactional(readOnly = true)
    public List<ApiKeyDto> listApiKeys(UUID workspaceId) {
        return apiKeyRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId)
            .stream().map(ApiKeyDto::from).toList();
    }

    @Transactional
    public void revokeApiKey(UUID workspaceId, UUID apiKeyId) {
        ApiKey apiKey = apiKeyRepository.findByIdAndWorkspaceId(apiKeyId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("API Key not found in this workspace"));

        apiKey.revoke();
        apiKeyRepository.save(apiKey);

        auditService.record(
            workspaceId,
            apiKey.getCreatedBy(),
            "API_KEY_REVOKED",
            "API_KEY",
            apiKeyId.toString(),
            "{\"name\":\"" + apiKey.getName() + "\",\"prefix\":\"" + apiKey.getKeyPrefix() + "\"}",
            "127.0.0.1",
            "Web Client"
        );
    }

    private String formatScopesJson(String rawScopes) {
        if (rawScopes == null || rawScopes.isBlank()) {
            return "[\"events:write\", \"traces:write\", \"executions:read\"]";
        }
        String trimmed = rawScopes.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            return trimmed;
        }
        String[] parts = trimmed.split(",");
        List<String> list = Arrays.stream(parts).map(String::trim).filter(s -> !s.isEmpty()).toList();
        try {
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            return "[\"events:write\", \"traces:write\", \"executions:read\"]";
        }
    }
}
