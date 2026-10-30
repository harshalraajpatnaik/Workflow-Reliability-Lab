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

    public record SingleSpanIngestRequest(
        @NotBlank(message = "Trace ID is required")
        String traceId,

        UUID executionId,

        @NotBlank(message = "Span ID is required")
        String spanId,

        String parentSpanId,

        @NotBlank(message = "Service name is required")
        String serviceName,

        String name,
        String operationName,
        String spanKind,
        String statusCode,
        String statusMessage,
        String attributes,
        Long startTimeUs,
        Long endTimeUs,
        Instant startedAt,
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

        @NotEmpty(message = "At least one span must be provided")
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
        long durationMs
    ) {
        public static SpanDto from(Span span) {
            return new SpanDto(
                span.getId(),
                span.getSpanId(),
                span.getParentSpanId(),
                span.getServiceName(),
                span.getOperationName(),
                span.getSpanKind(),
                span.getStatusCode(),
                span.getStatusMessage(),
                span.getAttributes(),
                span.getStartedAt(),
                span.getEndedAt(),
                span.getDurationMs()
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
        public static TraceDetailDto from(Trace trace, List<SpanDto> spans) {
            return new TraceDetailDto(
                trace.getId(),
                trace.getWorkspaceId(),
                trace.getExecutionId(),
                trace.getTraceId(),
                trace.getRootService(),
                trace.getRootOperation(),
                trace.getStartedAt(),
                trace.getEndedAt(),
                trace.getDurationMs(),
                trace.isHasErrors(),
                spans
            );
        }
    }

    public record ServiceNodeDto(String service, long callCount, long errorCount) {}
    public record ServiceEdgeDto(String fromService, String toService, long callCount) {}
    public record ServiceGraphDto(List<ServiceNodeDto> nodes, List<ServiceEdgeDto> edges) {}
}
