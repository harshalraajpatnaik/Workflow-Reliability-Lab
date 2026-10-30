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
        String userEmail,
        String action,
        String resourceType,
        String resourceId,
        String details,
        String ipAddress,
        Instant createdAt
    ) {
        public static AuditEventDto from(AuditEvent a, String userEmail) {
            return new AuditEventDto(
                a.getId(),
                a.getWorkspaceId(),
                a.getUserId(),
                userEmail,
                a.getAction(),
                a.getResourceType(),
                a.getResourceId(),
                a.getDetails(),
                a.getIpAddress(),
                a.getCreatedAt()
            );
        }

        public static AuditEventDto from(AuditEvent a) {
            return from(a, null);
        }
    }
}
