-- V006: OpenTelemetry Traces and Spans
CREATE TABLE traces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    execution_id UUID REFERENCES executions(id) ON DELETE SET NULL,
    trace_id VARCHAR(64) NOT NULL,
    root_service VARCHAR(100) NOT NULL,
    root_operation VARCHAR(255) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_ms BIGINT,
    has_errors BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_trace_workspace_trace_id UNIQUE (workspace_id, trace_id)
);

CREATE TABLE spans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trace_id UUID NOT NULL REFERENCES traces(id) ON DELETE CASCADE,
    span_id VARCHAR(64) NOT NULL,
    parent_span_id VARCHAR(64),
    service_name VARCHAR(100) NOT NULL,
    operation_name VARCHAR(255) NOT NULL,
    span_kind VARCHAR(50) NOT NULL DEFAULT 'INTERNAL',
    status_code VARCHAR(50) NOT NULL DEFAULT 'OK',
    status_message TEXT,
    attributes JSONB DEFAULT '{}'::jsonb,
    events JSONB DEFAULT '[]'::jsonb,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_ms BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_span_trace_span_id UNIQUE (trace_id, span_id)
);

CREATE INDEX idx_traces_workspace ON traces(workspace_id);
CREATE INDEX idx_traces_execution ON traces(execution_id);
CREATE INDEX idx_traces_trace_id ON traces(trace_id);
CREATE INDEX idx_spans_trace ON spans(trace_id);
CREATE INDEX idx_spans_parent ON spans(parent_span_id);
CREATE INDEX idx_spans_service ON spans(service_name);
