package com.workflowlab.auth.security;

import com.workflowlab.apikey.model.ApiKey;
import com.workflowlab.apikey.repository.ApiKeyRepository;
import com.workflowlab.auth.service.TokenService;
import com.workflowlab.common.tenant.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import java.util.Optional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private final ApiKeyRepository apiKeyRepository;
    private final TokenService tokenService;

    public ApiKeyAuthFilter(ApiKeyRepository apiKeyRepository, TokenService tokenService) {
        this.apiKeyRepository = apiKeyRepository;
        this.tokenService = tokenService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {

        String apiKeyHeader = request.getHeader("X-API-Key");
        if ((apiKeyHeader == null || apiKeyHeader.isBlank())) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.regionMatches(true, 0, "Bearer wrl_", 0, 11)) {
                apiKeyHeader = authHeader.substring(7).trim();
            }
        }
        if (apiKeyHeader != null && !apiKeyHeader.isBlank() && SecurityContextHolder.getContext().getAuthentication() == null) {
            String keyHash = tokenService.hashToken(apiKeyHeader.trim());
            Optional<ApiKey> apiKeyOpt = apiKeyRepository.findByKeyHash(keyHash);

            if (apiKeyOpt.isPresent()) {
                ApiKey apiKey = apiKeyOpt.get();
                if (apiKey.isValid()) {
                    apiKey.setLastUsedAt(Instant.now());
                    apiKeyRepository.save(apiKey);

                    ApiKeyAuthenticationToken auth = new ApiKeyAuthenticationToken(
                        apiKey.getId(),
                        apiKey.getWorkspaceId(),
                        apiKey.getKeyPrefix(),
                        null
                    );
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    TenantContext.setWorkspaceId(apiKey.getWorkspaceId());
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
