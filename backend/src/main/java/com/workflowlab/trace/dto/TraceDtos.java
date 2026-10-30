package com.workflowlab.trace.dto;

import com.workflowlab.trace.model.Span;
import com.workflowlab.trace.model.Trace;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class TraceDtos {
    private TraceDtos() {}

    public record IngestSpanRequest(
        @NotBlank(message = "Span ID is required")
        String spanId,

        String parentSpanId,

        @NotBlank(message = "Service name is required")
        String serviceName,

        @NotBlank(message = "Operation name is required")
        String operationName,

        String spanKind,
        String statusCode,
        String statusMessage,
        String attributes,

        @NotNull(message = "Start time is required")
        Instant startedAt,

        @NotNull(message = "End time is required")
        Instant endedAt
    ) {}

    public record IngestTraceRequest(
        @NotBlank(message = "Trace ID is required")
        String traceId,

        UUID executionId,

        @NotBlank(message = "Root service is required")
        String rootService,

        @NotBlank(message = "Root operation is required")
        String rootOperation,

        @NotEmpty(message = "At least one span is required")
        List<IngestSpanRequest> spans
    ) {}

    public record SpanDto(
        UUID id,
        String spanId,
        String parentSpanId,
        String serviceName,
        String operationName,
        String spanKind,
        String statusCode,
        String statusMessage,
        String attributes,
        Instant startedAt,
        Instant endedAt,
        Long durationMs
    ) {
        public static SpanDto from(Span s) {
            return new SpanDto(
                s.getId(),
                s.getSpanId(),
                s.getParentSpanId(),
                s.getServiceName(),
                s.getOperationName(),
                s.getSpanKind(),
                s.getStatusCode(),
                s.getStatusMessage(),
                s.getAttributes(),
                s.getStartedAt(),
                s.getEndedAt(),
                s.getDurationMs()
            );
        }
    }

    public record TraceDetailDto(
        UUID id,
        UUID workspaceId,
        UUID executionId,
        String traceId,
        String rootService,
        String rootOperation,
        Instant startedAt,
        Instant endedAt,
        Long durationMs,
        boolean hasErrors,
        List<SpanDto> spans
    ) {
        public static TraceDetailDto from(Trace t, List<SpanDto> spans) {
            return new TraceDetailDto(
                t.getId(),
                t.getWorkspaceId(),
                t.getExecutionId(),
                t.getTraceId(),
                t.getRootService(),
                t.getRootOperation(),
                t.getStartedAt(),
                t.getEndedAt(),
                t.getDurationMs(),
                t.isHasErrors(),
                spans
            );
        }
    }

    public record ServiceDependencyNode(
        String service,
        int callCount,
        int errorCount
    ) {}

    public record ServiceDependencyEdge(
        String fromService,
        String toService,
        int callCount
    ) {}

    public record ServiceGraphDto(
        List<ServiceDependencyNode> nodes,
        List<ServiceDependencyEdge> edges
    ) {}
}
