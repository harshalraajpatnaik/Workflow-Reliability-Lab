package com.workflowlab.trace.repository;

import com.workflowlab.trace.model.Span;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpanRepository extends JpaRepository<Span, UUID> {
    List<Span> findByTraceIdOrderByStartedAtAsc(UUID traceId);
    Optional<Span> findByTraceIdAndSpanId(UUID traceId, String spanId);
    long countByTraceId(UUID traceId);
}
