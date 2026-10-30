package com.workflowlab.auth.security;

import java.util.Collection;
import java.util.Collections;
import java.util.UUID;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

public class ApiKeyAuthenticationToken extends AbstractAuthenticationToken {

    private final UUID apiKeyId;
    private final UUID workspaceId;
    private final String keyPrefix;

    public ApiKeyAuthenticationToken(UUID apiKeyId, UUID workspaceId, String keyPrefix, Collection<? extends GrantedAuthority> authorities) {
        super(authorities != null ? authorities : Collections.singletonList(new SimpleGrantedAuthority("ROLE_API_CLIENT")));
        this.apiKeyId = apiKeyId;
        this.workspaceId = workspaceId;
        this.keyPrefix = keyPrefix;
        setAuthenticated(true);
    }

    public UUID getApiKeyId() { return apiKeyId; }
    public UUID getWorkspaceId() { return workspaceId; }
    public String getKeyPrefix() { return keyPrefix; }

    @Override
    public Object getCredentials() {
        return null;
    }

    @Override
    public Object getPrincipal() {
        return "api-key:" + keyPrefix;
    }
}
