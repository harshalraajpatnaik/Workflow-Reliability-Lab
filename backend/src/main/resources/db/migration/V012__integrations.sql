-- V012: External Integrations (RabbitMQ, OTLP, Webhooks)
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    integration_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    encrypted_config TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DISCONNECTED',
    status_message TEXT,
    last_connected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_integration_workspace_type UNIQUE (workspace_id, integration_type)
);

CREATE INDEX idx_integrations_workspace ON integrations(workspace_id);
