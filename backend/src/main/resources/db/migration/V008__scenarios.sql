-- V008: Failure Simulation Scenarios and Runs
CREATE TABLE scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL DEFAULT 'HIGH',
    preconditions JSONB NOT NULL DEFAULT '[]'::jsonb,
    fault_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    expected_behavior TEXT NOT NULL,
    detection_rule VARCHAR(100) NOT NULL,
    recovery_guidance TEXT NOT NULL,
    is_builtin BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE scenario_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    environment_id UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
    execution_id UUID REFERENCES executions(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'RUNNING',
    fault_injected JSONB NOT NULL DEFAULT '{}'::jsonb,
    observations JSONB NOT NULL DEFAULT '{}'::jsonb,
    passed_invariants BOOLEAN,
    anomalies_detected INT NOT NULL DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    run_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_scenarios_code ON scenarios(code);
CREATE INDEX idx_scenarios_category ON scenarios(category);
CREATE INDEX idx_scenario_runs_scenario ON scenario_runs(scenario_id);
CREATE INDEX idx_scenario_runs_workspace ON scenario_runs(workspace_id);
