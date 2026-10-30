-- V017: Performance and Composite Indexes
CREATE INDEX IF NOT EXISTS idx_executions_ws_env_status ON executions(workspace_id, environment_id, status);
CREATE INDEX IF NOT EXISTS idx_executions_ws_created ON executions(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_exec_occurred ON events(execution_id, occurred_at ASC);
CREATE INDEX IF NOT EXISTS idx_anomalies_ws_detected ON anomalies(workspace_id, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_invariant_results_exec_passed ON invariant_results(execution_id, passed);
CREATE INDEX IF NOT EXISTS idx_scenario_runs_ws_started ON scenario_runs(workspace_id, started_at DESC);
