package com.workflowlab.event.repository;

import com.workflowlab.event.model.Event;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {
    Optional<Event> findByExecutionIdAndIdempotencyKey(UUID executionId, String idempotencyKey);
    List<Event> findByExecutionIdOrderByOccurredAtAsc(UUID executionId);
    Page<Event> findByWorkspaceIdOrderByOccurredAtDesc(UUID workspaceId, Pageable pageable);
    long countByExecutionId(UUID executionId);
    long countByWorkspaceId(UUID workspaceId);
}
