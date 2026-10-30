package com.workflowlab.trace.repository;

import com.workflowlab.trace.model.Trace;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TraceRepository extends JpaRepository<Trace, UUID> {
    Optional<Trace> findByWorkspaceIdAndTraceId(UUID workspaceId, String traceId);
    List<Trace> findByExecutionId(UUID executionId);
    Page<Trace> findByWorkspaceIdOrderByStartedAtDesc(UUID workspaceId, Pageable pageable);
    long countByWorkspaceId(UUID workspaceId);
}
