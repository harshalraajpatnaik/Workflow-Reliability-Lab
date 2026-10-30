package com.workflowlab.audit.repository;

import com.workflowlab.audit.model.AuditEvent;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditEventRepository extends JpaRepository<AuditEvent, UUID> {
    Page<AuditEvent> findByWorkspaceIdOrderByCreatedAtDesc(UUID workspaceId, Pageable pageable);
}
