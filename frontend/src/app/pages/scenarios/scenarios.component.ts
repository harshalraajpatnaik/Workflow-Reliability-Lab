import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { WorkspaceService } from '../../core/services/workspace.service';
import { Scenario, ScenarioRun } from '../../core/models/models';

@Component({
  selector: 'app-scenarios',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="scenarios-page">
      <div class="page-header">
        <div>
          <h1>Failure Simulation Lab</h1>
          <p class="subtitle">15 pre-engineered distributed failure scenarios with real-time fault injection</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="loadScenariosAndRuns()">
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- Live Execution Banner -->
      <div class="live-run-banner" *ngIf="lastRun()">
        <div class="banner-left">
          <span class="badge badge-success">SIMULATION EXECUTED</span>
          <span class="font-bold">Scenario: {{ lastRun()!.scenarioId }}</span>
          <span class="font-mono text-xs text-muted">Run ID: {{ lastRun()!.id }}</span>
        </div>
        <div class="banner-right">
          <a *ngIf="lastRun()!.executionId" [routerLink]="['/workspace/executions', lastRun()!.executionId]" class="btn btn-primary btn-sm">
            Inspect Resulting Execution ➔
          </a>
        </div>
      </div>

      <!-- Scenarios Grid -->
      <div class="scenarios-grid">
        <div class="scenario-card" *ngFor="let scen of scenarios()">
          <div class="scen-top">
            <span class="badge" [ngClass]="{
              'badge-warning': scen.category === 'NETWORK' || scen.category === 'QUEUE',
              'badge-primary': scen.category === 'MESSAGING',
              'badge-danger': scen.category === 'DISTRIBUTED_TXN' || scen.category === 'FINANCIAL'
            }">
              {{ scen.category }}
            </span>
            <span class="scen-code font-mono">{{ scen.code }}</span>
          </div>

          <h3 class="scen-name">{{ scen.name }}</h3>
          <p class="scen-desc">{{ scen.description }}</p>

          <div class="fault-specs">
            <span class="spec-label">FAULT INJECTION SPECS:</span>
            <div class="spec-tags">
              <span class="tag font-mono text-xs">{{ scen.targetService }}</span>
              <span class="tag font-mono text-xs">Simulated Latency: {{ scen.latencyMs }}ms</span>
              <span class="tag font-mono text-xs">Fault Rate: {{ (scen.faultRate || 1) * 100 }}%</span>
            </div>
          </div>

          <div class="scen-action">
            <button 
              class="btn btn-primary btn-block" 
              [disabled]="runningId() === scen.code"
              (click)="runSimulation(scen.code)">
              <span *ngIf="runningId() === scen.code">Injecting Faults...</span>
              <span *ngIf="runningId() !== scen.code">⚡ Run Simulation</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Simulation Runs -->
      <div class="panel">
        <div class="panel-header">
          <h3>Recent Simulation Run History</h3>
        </div>
        <div class="table-container" *ngIf="recentRuns().length > 0; else noRuns">
          <table class="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Scenario</th>
                <th>Execution ID</th>
                <th>Triggered By</th>
                <th>Run Time</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let run of recentRuns()">
                <td>
                  <span class="badge" [ngClass]="run.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'">
                    {{ run.status }}
                  </span>
                </td>
                <td class="font-mono font-bold">{{ run.scenarioId }}</td>
                <td class="font-mono text-xs">
                  <a *ngIf="run.executionId" [routerLink]="['/workspace/executions', run.executionId]" class="link">
                    {{ run.executionId.substring(0, 8) }}... ↗
                  </a>
                  <span *ngIf="!run.executionId" class="text-muted">-</span>
                </td>
                <td class="text-xs">{{ run.triggeredBy || 'console' }}</td>
                <td class="text-xs text-muted">{{ run.createdAt | date:'medium' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #noRuns>
          <div class="empty-state">
            <p>No simulation runs recorded yet. Click 'Run Simulation' on any scenario above!</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .scenarios-page {
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
    }
    .subtitle {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }
    .live-run-banner {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: var(--radius-md);
      padding: 1rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .banner-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .scenarios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
    }
    .scenario-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .scenario-card:hover {
      border-color: var(--accent-blue);
      transform: translateY(-2px);
    }
    .scen-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .scen-code {
      font-size: 0.8rem;
      color: var(--accent-cyan);
      font-weight: 600;
    }
    .scen-name {
      font-size: 1.1rem;
      font-weight: 600;
      line-height: 1.3;
    }
    .scen-desc {
      color: var(--text-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
      flex: 1;
    }
    .fault-specs {
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .spec-label {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.05em;
    }
    .spec-tags {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
    }
    .tag {
      background: rgba(59, 130, 246, 0.1);
      color: var(--accent-blue);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
    }
    .btn-block {
      width: 100%;
    }
    .panel {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .panel-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border);
    }
    .panel-header h3 {
      font-size: 1rem;
      font-weight: 600;
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
      padding: 0.85rem 1rem;
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
    .empty-state {
      padding: 3rem;
      text-align: center;
      color: var(--text-muted);
    }
  `]
})
export class ScenariosComponent implements OnInit {
  api = inject(ApiService);
  workspaceService = inject(WorkspaceService);
  router = inject(Router);

  scenarios = signal<Scenario[]>([]);
  recentRuns = signal<ScenarioRun[]>([]);
  lastRun = signal<ScenarioRun | null>(null);
  runningId = signal<string | null>(null);

  constructor() {
    effect(() => {
      const ws = this.workspaceService.currentWorkspace();
      if (ws) {
        this.loadScenariosAndRuns();
      }
    });
  }

  ngOnInit() {
    const ws = this.workspaceService.currentWorkspace();
    if (ws) {
      this.loadScenariosAndRuns();
    }
  }

  loadScenariosAndRuns() {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws) return;

    this.api.getScenarios(ws.id).subscribe(res => {
      if (res.success && res.data) {
        this.scenarios.set(res.data);
      }
    });

    this.api.getScenarioRuns(ws.id, 0, 10).subscribe(res => {
      if (res.success && res.data) {
        this.recentRuns.set(res.data.content);
      }
    });
  }

  runSimulation(scenarioCode: string) {
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
      this.runningId.set(scenarioCode);
      this.api.runScenario(ws.id, scenarioCode, targetEnvId).subscribe({
        next: (res) => {
          this.runningId.set(null);
          if (res.success && res.data) {
            this.lastRun.set(res.data);
            this.loadScenariosAndRuns();
          }
        },
        error: () => {
          this.runningId.set(null);
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
