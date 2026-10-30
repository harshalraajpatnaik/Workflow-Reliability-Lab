package com.workflowlab.audit.service;

import com.workflowlab.audit.dto.AuditDtos.AuditEventDto;
import com.workflowlab.audit.model.AuditEvent;
import com.workflowlab.audit.repository.AuditEventRepository;
import com.workflowlab.common.dto.PageResponse;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {

    private final AuditEventRepository auditRepository;

    public AuditService(AuditEventRepository auditRepository) {
        this.auditRepository = auditRepository;
    }

    @Async
    @Transactional
    public void record(UUID workspaceId, UUID userId, String action, String resourceType, String resourceId, String details, String ipAddress, String userAgent) {
        AuditEvent event = new AuditEvent(workspaceId, userId, action, resourceType, resourceId, details, ipAddress, userAgent);
        auditRepository.save(event);
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditEventDto> listAuditEvents(UUID workspaceId, Pageable pageable) {
        Page<AuditEvent> page = auditRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId, pageable);
        return PageResponse.from(page.map(AuditEventDto::from));
    }
}
