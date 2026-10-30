-- V015: Incident Investigation and Postmortem Reports
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    execution_id UUID REFERENCES executions(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    severity VARCHAR(50) NOT NULL DEFAULT 'HIGH',
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    root_cause_hypothesis TEXT,
    evidence_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
    ai_analysis TEXT,
    ai_model_used VARCHAR(100),
    remediation_steps TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE incident_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    report_title VARCHAR(255) NOT NULL,
    markdown_content TEXT NOT NULL,
    generated_by VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_incidents_workspace ON incidents(workspace_id);
CREATE INDEX idx_incidents_execution ON incidents(execution_id);
CREATE INDEX idx_incidents_status ON incidents(status);
