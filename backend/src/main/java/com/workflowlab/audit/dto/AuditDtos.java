package com.workflowlab.audit.dto;

import com.workflowlab.audit.model.AuditEvent;
import java.time.Instant;
import java.util.UUID;

public final class AuditDtos {
    private AuditDtos() {}

    public record AuditEventDto(
        UUID id,
        UUID workspaceId,
        UUID userId,
        String action,
        String resourceType,
        String resourceId,
        String details,
        String ipAddress,
        Instant createdAt
    ) {
        public static AuditEventDto from(AuditEvent a) {
            return new AuditEventDto(
                a.getId(),
                a.getWorkspaceId(),
                a.getUserId(),
                a.getAction(),
                a.getResourceType(),
                a.getResourceId(),
                a.getDetails(),
                a.getIpAddress(),
                a.getCreatedAt()
            );
        }
    }
}
