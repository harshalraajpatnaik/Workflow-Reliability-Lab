package com.workflowlab.common.tenant;

import com.workflowlab.auth.security.ApiKeyAuthenticationToken;
import com.workflowlab.auth.security.UserPrincipal;
import com.workflowlab.common.exception.ForbiddenException;
import com.workflowlab.workspace.service.WorkspaceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;

import java.util.Map;

@Component
public class TenantInterceptor implements HandlerInterceptor {

    private final WorkspaceService workspaceService;

    public TenantInterceptor(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @Override
    @SuppressWarnings("unchecked")
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        Map<String, String> pathVariables = (Map<String, String>) request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);

        if (pathVariables != null && pathVariables.containsKey("workspaceId")) {
            try {
                UUID workspaceId = UUID.fromString(pathVariables.get("workspaceId"));
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();

                if (auth instanceof ApiKeyAuthenticationToken apiKeyAuth) {
                    if (!workspaceId.equals(apiKeyAuth.getWorkspaceId())) {
                        throw new ForbiddenException("API key does not have access to this workspace");
                    }
                } else if (auth != null && auth.getPrincipal() instanceof UserPrincipal userPrincipal) {
                    workspaceService.assertMember(workspaceId, userPrincipal.getId());
                }

                TenantContext.setWorkspaceId(workspaceId);
            } catch (IllegalArgumentException e) {
                // If not a valid UUID, let controller handle validation error
            }
        }

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        TenantContext.clear();
    }
}
