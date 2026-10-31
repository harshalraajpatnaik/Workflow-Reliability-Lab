import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { WorkspaceService } from '../../core/services/workspace.service';
import { Execution, ExecutionStats, Anomaly, Scenario } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-page">
      <div class="page-header">
        <div>
          <h1>Reliability Operations Dashboard</h1>
          <p class="subtitle">Workspace: <span class="highlight">{{ workspaceService.currentWorkspace()?.name }}</span></p>
        </div>
        <div class="header-actions">
          <a routerLink="/workspace/scenarios" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span>Run Failure Scenario</span>
          </a>
          <button class="btn btn-secondary" (click)="refresh()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- KPI Stat Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-title">TOTAL EXECUTIONS</span>
            <span class="stat-icon bg-blue">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </span>
          </div>
          <div class="stat-value">{{ stats()?.totalExecutions || 0 }}</div>
          <div class="stat-footer">
            <span class="text-success font-mono">{{ stats()?.completedExecutions || 0 }} completed</span> · 
            <span class="text-danger font-mono">{{ stats()?.failedExecutions || 0 }} failed</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-title">RELIABILITY RATE</span>
            <span class="stat-icon bg-green">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </span>
          </div>
          <div class="stat-value">{{ getReliabilityRate() }}%</div>
          <div class="stat-footer">
            <span>Deterministic workflow completion</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-title">ACTIVE ANOMALIES</span>
            <span class="stat-icon bg-yellow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </span>
          </div>
          <div class="stat-value text-warning">{{ anomalies().length }}</div>
          <div class="stat-footer">
            <span>Detected across executions</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-title">AVG DURATION</span>
            <span class="stat-icon bg-purple">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </span>
          </div>
          <div class="stat-value font-mono">{{ formatDuration(stats()?.avgDurationMs || 0) }}</div>
          <div class="stat-footer">
            <span>End-to-end saga latency</span>
          </div>
        </div>
      </div>

      <!-- Quick Run Scenarios Bar -->
      <div class="quick-scenarios-card">
        <div class="quick-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <span>QUICK SIMULATIONS</span>
        </div>
        <div class="scenarios-pills">
          <button class="pill-btn" (click)="triggerQuickScenario('SCEN_NET_TIMEOUT')">
            ⚡ Gateway Timeout
          </button>
          <button class="pill-btn" (click)="triggerQuickScenario('SCEN_DUP_EVENT')">
            ⚡ Duplicate Webhook
          </button>
          <button class="pill-btn" (click)="triggerQuickScenario('SCEN_OUT_OF_ORDER')">
            ⚡ Out-of-Order Queue
          </button>
          <button class="pill-btn" (click)="triggerQuickScenario('SCEN_SAGA_COMP_FAIL')">
            ⚡ Saga Compensation Failure
          </button>
          <button class="pill-btn" (click)="triggerQuickScenario('SCEN_OVER_REFUND')">
            ⚡ Over-Refund Race Condition
          </button>
        </div>
      </div>

      <!-- Execution & Anomaly Split Table -->
      <div class="dashboard-columns">
        <!-- Executions Table -->
        <div class="panel">
          <div class="panel-header">
            <h3>Recent Executions</h3>
            <a routerLink="/workspace/executions" class="view-all-link">View all executions ↗</a>
          </div>

          <div class="table-container" *ngIf="executions().length > 0; else noExec">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Workflow</th>
                  <th>Correlation ID</th>
                  <th>Duration</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let exec of executions()" [routerLink]="['/workspace/executions', exec.id]" class="clickable-row">
                  <td>
                    <span class="badge" [ngClass]="{
                      'badge-success': exec.status === 'COMPLETED',
                      'badge-danger': exec.status === 'FAILED',
                      'badge-warning': exec.status === 'RUNNING',
                      'badge-info': exec.status === 'PENDING'
                    }">
                      {{ exec.status }}
                    </span>
                  </td>
                  <td class="font-medium">{{ exec.workflowName }}</td>
                  <td class="font-mono text-muted text-xs">{{ exec.correlationId || exec.id.substring(0, 8) }}</td>
                  <td class="font-mono text-xs">{{ formatDuration(exec.durationMs) }}</td>
                  <td class="text-xs text-muted">{{ exec.createdAt | date:'shortTime' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ng-template #noExec>
            <div class="empty-state">
              <p>No executions recorded yet. Run a failure scenario above to generate data!</p>
            </div>
          </ng-template>
        </div>

        <!-- Anomalies List -->
        <div class="panel">
          <div class="panel-header">
            <h3>Active Anomalies</h3>
            <a routerLink="/workspace/anomalies" class="view-all-link">View all anomalies ↗</a>
          </div>

          <div class="anomalies-list" *ngIf="anomalies().length > 0; else noAnom">
            <div class="anomaly-card-item" *ngFor="let anom of anomalies()">
              <div class="anom-top">
                <span class="badge" [ngClass]="{
                  'badge-danger': anom.severity === 'CRITICAL' || anom.severity === 'HIGH',
                  'badge-warning': anom.severity === 'MEDIUM',
                  'badge-info': anom.severity === 'LOW'
                }">
                  {{ anom.severity }}
                </span>
                <span class="anom-type font-mono text-xs">{{ anom.ruleType }}</span>
                <span class="anom-time text-xs text-muted">{{ anom.createdAt | date:'shortTime' }}</span>
              </div>
              <p class="anom-msg">{{ anom.message }}</p>
              <div class="anom-footer" *ngIf="anom.executionId">
                <a [routerLink]="['/workspace/executions', anom.executionId]" class="text-xs link">
                  Inspect Execution ↗
                </a>
              </div>
            </div>
          </div>
          <ng-template #noAnom>
            <div class="empty-state">
              <p>No anomalies detected. Systems are operating within expected reliability parameters.</p>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .page-header h1 {
      font-size: 1.6rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .subtitle {
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    .highlight {
      color: var(--accent-cyan);
      font-weight: 600;
    }
    .header-actions {
      display: flex;
      gap: 0.75rem;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
    }
    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .stat-title {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }
    .stat-icon {
      width: 28px;
      height: 28px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .bg-blue { background: rgba(59, 130, 246, 0.15); color: var(--accent-blue); }
    .bg-green { background: rgba(16, 185, 129, 0.15); color: var(--accent-green); }
    .bg-yellow { background: rgba(245, 158, 11, 0.15); color: var(--accent-yellow); }
    .bg-purple { background: rgba(139, 92, 246, 0.15); color: var(--accent-purple); }
    .stat-value {
      font-size: 1.85rem;
      font-weight: 700;
      line-height: 1.1;
    }
    .stat-footer {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .quick-scenarios-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 0.85rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      flex-wrap: wrap;
    }
    .quick-title {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--accent-yellow);
      letter-spacing: 0.05em;
    }
    .scenarios-pills {
      display: flex;
      gap: 0.65rem;
      flex-wrap: wrap;
    }
    .pill-btn {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .pill-btn:hover {
      border-color: var(--accent-blue);
      color: var(--text-primary);
      background: rgba(59, 130, 246, 0.1);
    }
    .dashboard-columns {
      display: grid;
      grid-template-columns: 3fr 2fr;
      gap: 1.5rem;
    }
    .panel {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .panel-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .panel-header h3 {
      font-size: 1rem;
      font-weight: 600;
    }
    .view-all-link {
      font-size: 0.8rem;
      color: var(--accent-blue);
    }
    .table-container {
      overflow-x: auto;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.825rem;
    }
    .data-table th, .data-table td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    .data-table th {
      background: var(--bg-secondary);
      color: var(--text-muted);
      font-weight: 600;
      font-size: 0.7rem;
      text-transform: uppercase;
    }
    .clickable-row {
      cursor: pointer;
      transition: background-color 0.15s ease;
    }
    .clickable-row:hover {
      background-color: var(--bg-card-hover);
    }
    .anomalies-list {
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      max-height: 400px;
      overflow-y: auto;
    }
    .anomaly-card-item {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 0.85rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .anom-top {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .anom-msg {
      font-size: 0.825rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }
    .empty-state {
      padding: 2.5rem 1.5rem;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  api = inject(ApiService);
  workspaceService = inject(WorkspaceService);

  stats = signal<ExecutionStats | null>(null);
  executions = signal<Execution[]>([]);
  anomalies = signal<Anomaly[]>([]);

  constructor() {
    effect(() => {
      const ws = this.workspaceService.currentWorkspace();
      if (ws) {
        this.loadDashboardData(ws.id);
      }
    });
  }

  ngOnInit() {
    const ws = this.workspaceService.currentWorkspace();
    if (ws) {
      this.loadDashboardData(ws.id);
    }
  }

  refresh() {
    const ws = this.workspaceService.currentWorkspace();
    if (ws) {
      this.loadDashboardData(ws.id);
    }
  }

  loadDashboardData(wsId: string) {
    this.api.getExecutionStats(wsId).subscribe(res => {
      if (res.success && res.data) {
        this.stats.set(res.data);
      }
    });

    this.api.getExecutions(wsId, { size: 8 }).subscribe(res => {
      if (res.success && res.data) {
        this.executions.set(res.data.content);
      }
    });

    this.api.getAnomalies(wsId, 0, 5).subscribe(res => {
      if (res.success && res.data) {
        this.anomalies.set(res.data.content);
      }
    });
  }

  getReliabilityRate(): string {
    const s = this.stats();
    if (!s) return '100.0';
    const total = s.totalExecutions ?? s.total ?? 0;
    const completed = s.completedExecutions ?? s.completed ?? 0;
    if (total === 0) return '100.0';
    const rate = (completed / total) * 100;
    return rate.toFixed(1);
  }

  formatDuration(ms?: number): string {
    if (!ms) return '0ms';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  triggerQuickScenario(scenarioId: string) {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws) return;

    const projects = this.workspaceService.projects();
    let envId: string | null = null;
    if (projects.length > 0 && projects[0].environments && projects[0].environments.length > 0) {
      const envs = projects[0].environments;
      const simEnv = envs.find(e => (e.environmentType || e.type) === 'SIMULATION') || envs[0];
      if (simEnv) envId = simEnv.id;
    }

    const execute = (targetEnvId: string) => {
      this.api.runScenario(ws.id, scenarioId, targetEnvId).subscribe({
        next: () => {
          this.refresh();
        }
      });
    };

    if (envId) {
      execute(envId);
    } else {
      this.api.getProjects(ws.id).subscribe(res => {
        const envs = res.data?.[0]?.environments;
        const simEnv = envs?.find((e: any) => (e.environmentType || e.type) === 'SIMULATION') || envs?.[0];
        execute(simEnv ? simEnv.id : '00000000-0000-0000-0000-000000000000');
      });
    }
  }
}
