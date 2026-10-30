-- V007: Deterministic Anomaly Detection
CREATE TABLE anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    execution_id UUID NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
    rule_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_anomalies_workspace ON anomalies(workspace_id);
CREATE INDEX idx_anomalies_execution ON anomalies(execution_id);
CREATE INDEX idx_anomalies_severity ON anomalies(severity);
CREATE INDEX idx_anomalies_rule ON anomalies(rule_type);
CREATE INDEX idx_anomalies_detected_at ON anomalies(detected_at DESC);
