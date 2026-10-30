-- V004: Workflow Executions
CREATE TABLE executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    environment_id UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
    workflow_name VARCHAR(255) NOT NULL,
    correlation_id VARCHAR(255) NOT NULL,
    parent_execution_id UUID REFERENCES executions(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    trigger_source VARCHAR(100) NOT NULL DEFAULT 'API',
    input_payload_meta JSONB,
    output_payload_meta JSONB,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_ms BIGINT,
    error_message TEXT,
    error_stack TEXT,
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_executions_workspace ON executions(workspace_id);
CREATE INDEX idx_executions_environment ON executions(environment_id);
CREATE INDEX idx_executions_correlation ON executions(correlation_id);
CREATE INDEX idx_executions_status ON executions(status);
CREATE INDEX idx_executions_started_at ON executions(started_at DESC);
CREATE INDEX idx_executions_is_demo ON executions(is_demo);
