-- V009: Deterministic Business Invariants
CREATE TABLE invariant_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL DEFAULT 'CRITICAL',
    rule_type VARCHAR(100) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    is_builtin BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invariant_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    invariant_id UUID NOT NULL REFERENCES invariant_definitions(id) ON DELETE CASCADE,
    execution_id UUID NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
    passed BOOLEAN NOT NULL,
    violation_message TEXT,
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invariant_results_workspace ON invariant_results(workspace_id);
CREATE INDEX idx_invariant_results_execution ON invariant_results(execution_id);
CREATE INDEX idx_invariant_results_passed ON invariant_results(passed);
