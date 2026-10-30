-- V005: Event Journal and Timeline
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    execution_id UUID NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    source_service VARCHAR(100) NOT NULL,
    correlation_id VARCHAR(255) NOT NULL,
    idempotency_key VARCHAR(255) NOT NULL,
    payload_metadata JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'RECEIVED',
    retry_count INT NOT NULL DEFAULT 0,
    error_class VARCHAR(255),
    error_message TEXT,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_event_idempotency UNIQUE (execution_id, idempotency_key)
);

CREATE INDEX idx_events_workspace ON events(workspace_id);
CREATE INDEX idx_events_execution ON events(execution_id);
CREATE INDEX idx_events_correlation ON events(correlation_id);
CREATE INDEX idx_events_idempotency ON events(idempotency_key);
CREATE INDEX idx_events_occurred_at ON events(occurred_at);
CREATE INDEX idx_events_status ON events(status);
