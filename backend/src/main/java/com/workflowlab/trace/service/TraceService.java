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

        boolean anyError = false;
        Instant latestEnd = trace.getEndedAt();

        for (IngestSpanRequest sr : request.spans()) {
            boolean isError = "ERROR".equalsIgnoreCase(sr.statusCode());
            if (isError) anyError = true;

            if (latestEnd == null || sr.endedAt().isAfter(latestEnd)) {
                latestEnd = sr.endedAt();
            }

            Span span = new Span(
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
        List<Trace> traces = traceRepository.findByWorkspaceIdOrderByStartedAtDesc(
            workspaceId,
            org.springframework.data.domain.PageRequest.of(0, 50)
        ).getContent();

        Map<String, int[]> serviceStats = new HashMap<>(); // [calls, errors]
        Map<String, Integer> edgeCounts = new HashMap<>(); // "from->to" -> count

        for (Trace trace : traces) {
            List<Span> spans = spanRepository.findByTraceIdOrderByStartedAtAsc(trace.getId());
            Map<String, String> spanToService = new HashMap<>();

            for (Span s : spans) {
                spanToService.put(s.getSpanId(), s.getServiceName());
                int[] stats = serviceStats.computeIfAbsent(s.getServiceName(), k -> new int[2]);
                stats[0]++;
                if ("ERROR".equalsIgnoreCase(s.getStatusCode())) {
                    stats[1]++;
                }
            }

            for (Span s : spans) {
                if (s.getParentSpanId() != null && spanToService.containsKey(s.getParentSpanId())) {
                    String parentService = spanToService.get(s.getParentSpanId());
                    if (!parentService.equals(s.getServiceName())) {
                        String edgeKey = parentService + "->" + s.getServiceName();
                        edgeCounts.put(edgeKey, edgeCounts.getOrDefault(edgeKey, 0) + 1);
                    }
                }
            }
        }

        List<ServiceDependencyNode> nodes = new ArrayList<>();
        for (Map.Entry<String, int[]> entry : serviceStats.entrySet()) {
            nodes.add(new ServiceDependencyNode(entry.getKey(), entry.getValue()[0], entry.getValue()[1]));
        }

        List<ServiceDependencyEdge> edges = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : edgeCounts.entrySet()) {
            String[] parts = entry.getKey().split("->");
            edges.add(new ServiceDependencyEdge(parts[0], parts[1], entry.getValue()));
        }

        return new ServiceGraphDto(nodes, edges);
    }
}
