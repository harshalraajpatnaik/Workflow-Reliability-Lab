package com.workflowlab.trace.service;

import com.workflowlab.common.dto.PageResponse;
import com.workflowlab.common.exception.ResourceNotFoundException;
import com.workflowlab.trace.dto.TraceDtos.*;
import com.workflowlab.trace.model.Span;
import com.workflowlab.trace.model.Trace;
import com.workflowlab.trace.repository.SpanRepository;
import com.workflowlab.trace.repository.TraceRepository;
import java.time.Instant;
import java.util.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TraceService {

    private final TraceRepository traceRepository;
    private final SpanRepository spanRepository;

    public TraceService(TraceRepository traceRepository, SpanRepository spanRepository) {
        this.traceRepository = traceRepository;
        this.spanRepository = spanRepository;
    }

    @Transactional
    public TraceDetailDto ingestSingleSpan(UUID workspaceId, SingleSpanIngestRequest req) {
        String operation = req.operationName() != null ? req.operationName() : (req.name() != null ? req.name() : "operation");
        Instant start = req.startedAt() != null ? req.startedAt() : (req.startTimeUs() != null ? Instant.ofEpochMilli(req.startTimeUs() / 1000) : Instant.now());
        Instant end = req.endedAt() != null ? req.endedAt() : (req.endTimeUs() != null ? Instant.ofEpochMilli(req.endTimeUs() / 1000) : start.plusMillis(50));

        IngestSpanRequest spanReq = new IngestSpanRequest(
            req.spanId(),
            req.parentSpanId(),
            req.serviceName(),
            operation,
            req.spanKind() != null ? req.spanKind() : "INTERNAL",
            req.statusCode() != null ? req.statusCode() : "OK",
            req.statusMessage(),
            req.attributes(),
            start,
            end
        );

        IngestTraceRequest traceReq = new IngestTraceRequest(
            req.traceId(),
            req.executionId(),
            req.serviceName(),
            operation,
            List.of(spanReq)
        );

        return ingestTrace(workspaceId, traceReq);
    }

    @Transactional
    public TraceDetailDto ingestTrace(UUID workspaceId, IngestTraceRequest request) {
        Optional<Trace> existingTrace = traceRepository.findByWorkspaceIdAndTraceId(workspaceId, request.traceId());

        Trace trace;
        if (existingTrace.isPresent()) {
            trace = existingTrace.get();
        } else {
            Instant earliestStart = request.spans().stream()
                .map(IngestSpanRequest::startedAt)
                .min(Instant::compareTo)
                .orElse(Instant.now());

            trace = new Trace(
                workspaceId,
                request.executionId(),
                request.traceId(),
                request.rootService(),
                request.rootOperation(),
                earliestStart
            );
            trace = traceRepository.save(trace);
        }

        boolean anyError = trace.isHasErrors();
        Instant latestEnd = trace.getEndedAt();

        for (IngestSpanRequest sr : request.spans()) {
            boolean isError = "ERROR".equalsIgnoreCase(sr.statusCode());
            if (isError) anyError = true;

            if (latestEnd == null || (sr.endedAt() != null && sr.endedAt().isAfter(latestEnd))) {
                latestEnd = sr.endedAt();
            }

            Optional<Span> existingSpan = spanRepository.findByTraceIdAndSpanId(trace.getId(), sr.spanId());
            Span span;
            if (existingSpan.isPresent()) {
                span = existingSpan.get();
                span.setStatusCode(sr.statusCode());
                span.setStatusMessage(sr.statusMessage());
                if (sr.attributes() != null) span.setAttributes(sr.attributes());
                if (sr.startedAt() != null) span.setStartedAt(sr.startedAt());
                if (sr.endedAt() != null) span.setEndedAt(sr.endedAt());
                if (span.getStartedAt() != null && span.getEndedAt() != null) {
                    span.setDurationMs(java.time.Duration.between(span.getStartedAt(), span.getEndedAt()).toMillis());
                }
            } else {
                span = new Span(
                    trace.getId(),
                    sr.spanId(),
                    sr.parentSpanId(),
                    sr.serviceName(),
                    sr.operationName(),
                    sr.spanKind(),
                    sr.statusCode(),
                    sr.statusMessage(),
                    sr.attributes(),
                    sr.startedAt(),
                    sr.endedAt()
                );
            }
            spanRepository.save(span);
        }

        trace.setEndedAt(latestEnd);
        if (anyError) trace.setHasErrors(true);
        Trace updated = traceRepository.save(trace);

        List<SpanDto> spanDtos = spanRepository.findByTraceIdOrderByStartedAtAsc(updated.getId())
            .stream().map(SpanDto::from).toList();

        return TraceDetailDto.from(updated, spanDtos);
    }

    @Transactional(readOnly = true)
    public TraceDetailDto getTrace(UUID workspaceId, String traceId) {
        Trace trace = traceRepository.findByWorkspaceIdAndTraceId(workspaceId, traceId)
            .orElseThrow(() -> new ResourceNotFoundException("Trace not found"));

        List<SpanDto> spans = spanRepository.findByTraceIdOrderByStartedAtAsc(trace.getId())
            .stream().map(SpanDto::from).toList();

        return TraceDetailDto.from(trace, spans);
    }

    @Transactional(readOnly = true)
    public List<TraceDetailDto> getExecutionTraces(UUID workspaceId, UUID executionId) {
        List<Trace> traces = traceRepository.findByExecutionId(executionId);
        List<TraceDetailDto> dtos = new ArrayList<>();
        for (Trace t : traces) {
            if (t.getWorkspaceId().equals(workspaceId)) {
                List<SpanDto> spans = spanRepository.findByTraceIdOrderByStartedAtAsc(t.getId())
                    .stream().map(SpanDto::from).toList();
                dtos.add(TraceDetailDto.from(t, spans));
            }
        }
        return dtos;
    }

    @Transactional(readOnly = true)
    public PageResponse<TraceDetailDto> listTraces(UUID workspaceId, Pageable pageable) {
        Page<Trace> page = traceRepository.findByWorkspaceIdOrderByStartedAtDesc(workspaceId, pageable);
        return PageResponse.from(page.map(t -> {
            List<SpanDto> spans = spanRepository.findByTraceIdOrderByStartedAtAsc(t.getId())
                .stream().map(SpanDto::from).toList();
            return TraceDetailDto.from(t, spans);
        }));
    }

    @Transactional(readOnly = true)
    public ServiceGraphDto getServiceGraph(UUID workspaceId) {
        List<Trace> traces = traceRepository.findByWorkspaceIdOrderByStartedAtDesc(workspaceId, Pageable.ofSize(100)).getContent();
        Map<String, long[]> serviceStats = new HashMap<>(); // [callCount, errorCount]
        Map<String, Long> edgeCounts = new HashMap<>();

        for (Trace t : traces) {
            List<Span> spans = spanRepository.findByTraceIdOrderByStartedAtAsc(t.getId());
            Map<String, String> spanToService = new HashMap<>();
            for (Span s : spans) {
                spanToService.put(s.getSpanId(), s.getServiceName());
                long[] stats = serviceStats.computeIfAbsent(s.getServiceName(), k -> new long[2]);
                stats[0]++;
                if ("ERROR".equalsIgnoreCase(s.getStatusCode())) {
                    stats[1]++;
                }
            }

            for (Span s : spans) {
                if (s.getParentSpanId() != null && spanToService.containsKey(s.getParentSpanId())) {
                    String parentService = spanToService.get(s.getParentSpanId());
                    String childService = s.getServiceName();
                    if (!parentService.equalsIgnoreCase(childService)) {
                        String edgeKey = parentService + "->" + childService;
                        edgeCounts.put(edgeKey, edgeCounts.getOrDefault(edgeKey, 0L) + 1);
                    }
                }
            }
        }

        List<ServiceNodeDto> nodes = serviceStats.entrySet().stream()
            .map(e -> new ServiceNodeDto(e.getKey(), e.getValue()[0], e.getValue()[1]))
            .toList();

        List<ServiceEdgeDto> edges = edgeCounts.entrySet().stream()
            .map(e -> {
                String[] parts = e.getKey().split("->");
                return new ServiceEdgeDto(parts[0], parts[1], e.getValue());
            })
            .toList();

        return new ServiceGraphDto(nodes, edges);
    }
}
