import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { WorkspaceService } from '../../core/services/workspace.service';
import { Anomaly, AnomalyStats } from '../../core/models/models';

@Component({
  selector: 'app-anomalies',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="anomalies-page">
      <div class="page-header">
        <div>
          <h1>Anomaly Detection Lab</h1>
          <p class="subtitle">Deterministic rule-based pattern detection across asynchronous executions</p>
        </div>
        <button class="btn btn-secondary" (click)="loadAnomalies()">
          <span>Refresh</span>
        </button>
      </div>

      <!-- Anomaly Severity Breakdown Cards -->
      <div class="stats-grid" *ngIf="stats()">
        <div class="stat-card border-critical">
          <span class="stat-title text-danger">CRITICAL SEVERITY</span>
          <div class="stat-value text-danger">{{ stats()!.criticalCount }}</div>
        </div>
        <div class="stat-card border-high">
          <span class="stat-title text-warning">HIGH SEVERITY</span>
          <div class="stat-value text-warning">{{ stats()!.highCount }}</div>
        </div>
        <div class="stat-card border-medium">
          <span class="stat-title text-info">MEDIUM SEVERITY</span>
          <div class="stat-value text-info">{{ stats()!.mediumCount }}</div>
        </div>
        <div class="stat-card border-low">
          <span class="stat-title text-muted">LOW SEVERITY</span>
          <div class="stat-value">{{ stats()!.lowCount }}</div>
        </div>
      </div>

      <!-- Anomalies List -->
      <div class="anomalies-list" *ngIf="anomalies().length > 0; else noAnomalies">
        <div class="anomaly-card" *ngFor="let anom of anomalies()">
          <div class="card-header">
            <div class="header-left">
              <span class="badge" [ngClass]="{
                'badge-danger': anom.severity === 'CRITICAL' || anom.severity === 'HIGH',
                'badge-warning': anom.severity === 'MEDIUM',
                'badge-info': anom.severity === 'LOW'
              }">
                {{ anom.severity }}
              </span>
              <span class="rule-type font-mono font-bold">{{ anom.ruleType }}</span>
            </div>
            <div class="header-right">
              <span class="text-xs text-muted">{{ anom.createdAt | date:'medium' }}</span>
              <button 
                *ngIf="!anom.acknowledged" 
                class="btn btn-secondary btn-sm" 
                (click)="acknowledge(anom.id)">
                Acknowledge
              </button>
              <span *ngIf="anom.acknowledged" class="badge badge-success text-xs">Acknowledged</span>
            </div>
          </div>

          <p class="anom-message">{{ anom.message }}</p>

          <div class="evidence-section" *ngIf="anom.evidence">
            <div class="evidence-header">
              <span class="text-xs text-muted font-mono">DETERMINISTIC EVIDENCE</span>
            </div>
            <pre class="evidence-box font-mono text-xs"><code>{{ anom.evidence }}</code></pre>
          </div>

          <div class="card-footer" *ngIf="anom.executionId">
            <a [routerLink]="['/workspace/executions', anom.executionId]" class="exec-link">
              Inspect Linked Execution ({{ anom.executionId.substring(0, 8) }}...) ➔
            </a>
          </div>
        </div>
      </div>

      <ng-template #noAnomalies>
        <div class="empty-state-card">
          <p>No anomalies detected. Run a failure scenario from the lab to inject faulty behavior.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .anomalies-page {
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
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.25rem;
    }
    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .border-critical { border-left: 4px solid var(--accent-red); }
    .border-high { border-left: 4px solid var(--accent-yellow); }
    .border-medium { border-left: 4px solid var(--accent-cyan); }
    .border-low { border-left: 4px solid var(--text-muted); }
    .stat-title {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .stat-value {
      font-size: 1.85rem;
      font-weight: 700;
    }
    .anomalies-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .anomaly-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .header-left, .header-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .rule-type {
      font-size: 1.05rem;
    }
    .anom-message {
      font-size: 0.95rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    .evidence-section {
      background: #060911;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1rem;
    }
    .evidence-header {
      margin-bottom: 0.5rem;
    }
    .evidence-box {
      color: #93c5fd;
      overflow-x: auto;
      max-height: 250px;
    }
    .card-footer {
      border-top: 1px solid var(--border);
      padding-top: 0.75rem;
    }
    .exec-link {
      color: var(--accent-blue);
      font-size: 0.85rem;
      font-weight: 500;
    }
    .empty-state-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 3rem;
      text-align: center;
      color: var(--text-muted);
    }
  `]
})
export class AnomaliesComponent implements OnInit {
  api = inject(ApiService);
  workspaceService = inject(WorkspaceService);

  anomalies = signal<Anomaly[]>([]);
  stats = signal<AnomalyStats | null>(null);

  constructor() {
    effect(() => {
      const ws = this.workspaceService.currentWorkspace();
      if (ws) {
        this.loadAnomalies();
      }
    });
  }

  ngOnInit() {
    const ws = this.workspaceService.currentWorkspace();
    if (ws) {
      this.loadAnomalies();
    }
  }

  loadAnomalies() {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws) return;

    this.api.getAnomalies(ws.id, 0, 50).subscribe(res => {
      if (res.success && res.data) {
        this.anomalies.set(res.data.content);
      }
    });

    this.api.getAnomalyStats(ws.id).subscribe(res => {
      if (res.success && res.data) {
        this.stats.set(res.data);
      }
    });
  }

  acknowledge(id: string) {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws) return;

    this.api.acknowledgeAnomaly(ws.id, id).subscribe(res => {
      if (res.success) {
        this.loadAnomalies();
      }
    });
  }
}
