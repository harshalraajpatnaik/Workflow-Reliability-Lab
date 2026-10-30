package com.workflowlab.apikey.service;

import com.workflowlab.apikey.dto.ApiKeyDtos.*;
import com.workflowlab.apikey.model.ApiKey;
import com.workflowlab.apikey.repository.ApiKeyRepository;
import com.workflowlab.auth.service.TokenService;
import com.workflowlab.common.exception.ResourceNotFoundException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;
    private final TokenService tokenService;
    private final SecureRandom secureRandom = new SecureRandom();

    public ApiKeyService(ApiKeyRepository apiKeyRepository, TokenService tokenService) {
        this.apiKeyRepository = apiKeyRepository;
        this.tokenService = tokenService;
    }

    @Transactional
    public ApiKeyCreatedResponse createApiKey(UUID workspaceId, CreateApiKeyRequest request, UUID userId) {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String rawKey = "wrl_" + Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        String prefix = rawKey.substring(0, 12);
        String hash = tokenService.hashToken(rawKey);

        ApiKey apiKey = new ApiKey(
            workspaceId,
            request.name().trim(),
            prefix,
            hash,
            request.scopes(),
            userId,
            request.expiresAt()
        );

        ApiKey saved = apiKeyRepository.save(apiKey);
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
            .orElseThrow(() -> new ResourceNotFoundException("API key not found"));
        apiKey.setRevoked(true);
        apiKeyRepository.save(apiKey);
    }
}
