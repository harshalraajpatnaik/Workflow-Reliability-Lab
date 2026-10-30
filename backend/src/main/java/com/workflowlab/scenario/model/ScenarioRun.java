package com.workflowlab.scenario.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "scenario_runs")
public class ScenarioRun {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "workspace_id", nullable = false)
    private UUID workspaceId;

    @Column(name = "scenario_id", nullable = false)
    private UUID scenarioId;

    @Column(name = "environment_id", nullable = false)
    private UUID environmentId;

    @Column(name = "execution_id")
    private UUID executionId;

    @Column(nullable = false, length = 50)
    private String status = "RUNNING";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "fault_injected", columnDefinition = "jsonb", nullable = false)
    private String faultInjected = "{}";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private String observations = "{}";

    @Column(name = "passed_invariants")
    private Boolean passedInvariants;

    @Column(name = "anomalies_detected", nullable = false)
    private int anomaliesDetected = 0;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt = Instant.now();

    @Column(name = "ended_at")
    private Instant endedAt;

    @Column(name = "run_by")
    private UUID runBy;

    public ScenarioRun() {}

    public ScenarioRun(UUID workspaceId, UUID scenarioId, UUID environmentId, UUID runBy, String faultInjected) {
        this.workspaceId = workspaceId;
        this.scenarioId = scenarioId;
        this.environmentId = environmentId;
        this.runBy = runBy;
        this.faultInjected = faultInjected != null ? faultInjected : "{}";
        this.status = "RUNNING";
        this.startedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getWorkspaceId() { return workspaceId; }
    public UUID getScenarioId() { return scenarioId; }
    public UUID getEnvironmentId() { return environmentId; }
    public UUID getExecutionId() { return executionId; }
    public void setExecutionId(UUID executionId) { this.executionId = executionId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getFaultInjected() { return faultInjected; }
    public String getObservations() { return observations; }
    public void setObservations(String observations) { this.observations = observations; }
    public Boolean getPassedInvariants() { return passedInvariants; }
    public void setPassedInvariants(Boolean passedInvariants) { this.passedInvariants = passedInvariants; }
    public int getAnomaliesDetected() { return anomaliesDetected; }
    public void setAnomaliesDetected(int anomaliesDetected) { this.anomaliesDetected = anomaliesDetected; }
    public Instant getStartedAt() { return startedAt; }
    public Instant getEndedAt() { return endedAt; }
    public void setEndedAt(Instant endedAt) { this.endedAt = endedAt; }
    public UUID getRunBy() { return runBy; }
}
