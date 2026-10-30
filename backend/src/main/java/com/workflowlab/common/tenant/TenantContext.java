package com.workflowlab.common.tenant;

import java.util.UUID;

public final class TenantContext {
    private static final ThreadLocal<UUID> CURRENT_WORKSPACE_ID = new ThreadLocal<>();

    private TenantContext() {}

    public static void setWorkspaceId(UUID workspaceId) {
        CURRENT_WORKSPACE_ID.set(workspaceId);
    }

    public static UUID getWorkspaceId() {
        return CURRENT_WORKSPACE_ID.get();
    }

    public static void clear() {
        CURRENT_WORKSPACE_ID.remove();
    }
}
