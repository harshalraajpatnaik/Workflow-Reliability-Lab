import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { 
  Execution, WorkflowEvent, TraceDetail, 
  Anomaly, InvariantResult 
} from '../../../core/models/models';

@Component({
  selector: 'app-execution-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="exec-detail-page" *ngIf="execution(); else loading">
      <!-- Top Breadcrumb & Actions -->
      <div class="top-nav">
        <a routerLink="/workspace/executions" class="back-link">
          ← Back to Executions
        </a>
        <div class="actions">
          <button class="btn btn-secondary btn-sm" (click)="loadAllData()">
            Refresh
          </button>
          <button class="btn btn-primary btn-sm" (click)="createIncidentFromExecution()">
            🚨 Declare Incident
          </button>
        </div>
      </div>

      <!-- Execution Overview Banner -->
      <div class="overview-banner">
        <div class="banner-main">
          <div class="title-row">
            <span class="badge" [ngClass]="{
              'badge-success': execution()!.status === 'COMPLETED',
              'badge-danger': execution()!.status === 'FAILED',
              'badge-warning': execution()!.status === 'RUNNING',
              'badge-info': execution()!.status === 'PENDING'
            }">
              {{ execution()!.status }}
            </span>
            <h1>{{ execution()!.workflowName }}</h1>
          </div>
          <div class="meta-row">
            <span class="meta-item">
              <span class="meta-label">ID:</span> 
              <code class="font-mono">{{ execution()!.id }}</code>
            </span>
            <span class="meta-item" *ngIf="execution()!.correlationId">
              <span class="meta-label">CORRELATION:</span> 
              <code class="font-mono text-cyan">{{ execution()!.correlationId }}</code>
            </span>
            <span class="meta-item">
              <span class="meta-label">TRIGGER:</span> 
              <span>{{ execution()!.triggerSource }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-label">DURATION:</span> 
              <span class="font-mono">{{ formatDuration(execution()!.durationMs) }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-label">STARTED:</span> 
              <span>{{ execution()!.createdAt | date:'medium' }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Detail Tabs -->
      <div class="tabs-nav">
        <button class="tab-btn" [class.active]="activeTab() === 'events'" (click)="activeTab.set('events')">
          Event Journal ({{ events().length }})
        </button>
        <button class="tab-btn" [class.active]="activeTab() === 'traces'" (click)="activeTab.set('traces')">
          Trace Waterfall ({{ traces().length }})
        </button>
        <button class="tab-btn" [class.active]="activeTab() === 'anomalies'" (click)="activeTab.set('anomalies')">
          Anomalies ({{ anomalies().length }})
        </button>
        <button class="tab-btn" [class.active]="activeTab() === 'invariants'" (click)="activeTab.set('invariants')">
          Invariants ({{ invariants().length }})
        </button>
      </div>

      <!-- Tab 1: Event Journal -->
      <div *ngIf="activeTab() === 'events'" class="tab-content">
        <div class="timeline" *ngIf="events().length > 0; else noEvents">
          <div class="timeline-item" *ngFor="let ev of events()">
            <div class="timeline-marker">
              <span class="marker-dot"></span>
              <span class="seq-num font-mono">#{{ ev.sequenceNumber }}</span>
            </div>
            <div class="timeline-card">
              <div class="ev-header">
                <span class="ev-type font-mono font-bold">{{ ev.eventType }}</span>
                <span class="ev-services font-mono text-xs">
                  {{ ev.sourceService || 'client' }} ➔ {{ ev.targetService || 'workflow' }}
                </span>
                <span class="ev-time text-xs text-muted">{{ ev.createdAt | date:'mediumTime' }}</span>
              </div>
              <div class="ev-meta" *ngIf="ev.idempotencyKey">
                <span class="text-xs text-muted">Idempotency Key:</span>
                <code class="font-mono text-xs text-cyan">{{ ev.idempotencyKey }}</code>
              </div>
              <div class="ev-payload" *ngIf="ev.payload">
                <pre class="payload-box font-mono text-xs"><code>{{ ev.payload }}</code></pre>
              </div>
            </div>
          </div>
        </div>
        <ng-template #noEvents>
          <div class="empty-state">No events recorded for this execution.</div>
        </ng-template>
      </div>

      <!-- Tab 2: Trace Waterfall -->
      <div *ngIf="activeTab() === 'traces'" class="tab-content">
        <div class="waterfall-panel" *ngIf="traces().length > 0; else noTraces">
          <div class="trace-group" *ngFor="let trace of traces()">
            <div class="trace-group-header">
              <span class="font-mono text-xs text-muted">TRACE ID: {{ trace.traceId }}</span>
              <span class="font-mono text-xs">{{ formatDuration(trace.durationMs) }} total</span>
            </div>
            <div class="spans-list">
              <div class="span-row" *ngFor="let span of trace.spans">
                <div class="span-info">
                  <span class="span-service badge badge-info text-xs">{{ span.serviceName }}</span>
                  <span class="span-name font-mono">{{ span.name }}</span>
                </div>
                <div class="span-bar-container">
                  <div class="span-bar" [ngClass]="{'span-error': span.statusCode === 'ERROR'}">
                    <span class="span-duration font-mono text-xs">{{ formatDuration(span.durationMs) }}</span>
                  </div>
                </div>
                <span class="badge" [ngClass]="span.statusCode === 'ERROR' ? 'badge-danger' : 'badge-success'">
                  {{ span.statusCode }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <ng-template #noTraces>
          <div class="empty-state">No distributed traces ingested for this execution.</div>
        </ng-template>
      </div>

      <!-- Tab 3: Anomalies -->
      <div *ngIf="activeTab() === 'anomalies'" class="tab-content">
        <div class="anomalies-grid" *ngIf="anomalies().length > 0; else noAnomalies">
          <div class="anomaly-card" *ngFor="let anom of anomalies()">
            <div class="anom-card-header">
              <span class="badge" [ngClass]="{
                'badge-danger': anom.severity === 'CRITICAL' || anom.severity === 'HIGH',
                'badge-warning': anom.severity === 'MEDIUM',
                'badge-info': anom.severity === 'LOW'
              }">
                {{ anom.severity }}
              </span>
              <span class="font-mono font-bold">{{ anom.ruleType }}</span>
              <span class="text-xs text-muted">{{ anom.createdAt | date:'mediumTime' }}</span>
            </div>
            <p class="anom-desc">{{ anom.message }}</p>
            <div class="evidence-box" *ngIf="anom.evidence">
              <span class="text-xs text-muted">Deterministic Evidence:</span>
              <pre class="font-mono text-xs"><code>{{ anom.evidence }}</code></pre>
            </div>
          </div>
        </div>
        <ng-template #noAnomalies>
          <div class="empty-state">No anomalies detected for this execution.</div>
        </ng-template>
      </div>

      <!-- Tab 4: Invariants -->
      <div *ngIf="activeTab() === 'invariants'" class="tab-content">
        <div class="invariants-table-panel" *ngIf="invariants().length > 0; else noInvariants">
          <table class="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Invariant Rule</th>
                <th>Evaluation Message</th>
                <th>Checked At</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let inv of invariants()">
                <td>
                  <span class="badge" [ngClass]="inv.passed ? 'badge-success' : 'badge-danger'">
                    {{ inv.passed ? 'PASS' : 'FAIL' }}
                  </span>
                </td>
                <td class="font-mono font-bold">{{ inv.invariantCode }}</td>
                <td>{{ inv.message }}</td>
                <td class="text-xs text-muted">{{ inv.checkedAt | date:'mediumTime' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #noInvariants>
          <div class="empty-state">Invariants have not been evaluated yet.</div>
        </ng-template>
      </div>
    </div>

    <ng-template #loading>
      <div class="empty-state">Loading execution details...</div>
    </ng-template>
  `,
  styles: [`
    .exec-detail-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .top-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .back-link {
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
    }
    .back-link:hover {
      color: var(--text-primary);
    }
    .actions {
      display: flex;
      gap: 0.75rem;
    }
    .overview-banner {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
    }
    .title-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    .title-row h1 {
      font-size: 1.5rem;
      font-weight: 700;
    }
    .meta-row {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
      font-size: 0.85rem;
    }
    .meta-item {
      display: flex;
      gap: 0.35rem;
      align-items: center;
    }
    .meta-label {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-muted);
    }
    .text-cyan {
      color: var(--accent-cyan);
    }
    .tabs-nav {
      display: flex;
      gap: 0.5rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.25rem;
    }
    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .tab-btn:hover {
      color: var(--text-primary);
      background: var(--bg-card);
    }
    .tab-btn.active {
      color: var(--accent-blue);
      background: rgba(59, 130, 246, 0.12);
      border-bottom: 2px solid var(--accent-blue);
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
    .timeline {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      position: relative;
      padding-left: 2rem;
    }
    .timeline::before {
      content: '';
      position: absolute;
      left: 7px;
      top: 10px;
      bottom: 10px;
      width: 2px;
      background: var(--border);
    }
    .timeline-item {
      position: relative;
    }
    .timeline-marker {
      position: absolute;
      left: -2rem;
      top: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .marker-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--accent-blue);
      border: 3px solid var(--bg-primary);
    }
    .seq-num {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .timeline-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .ev-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .ev-type {
      font-size: 0.95rem;
      color: var(--text-primary);
    }
    .ev-services {
      color: var(--accent-cyan);
    }
    .payload-box {
      background: #060911;
      padding: 0.75rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      overflow-x: auto;
      color: #93c5fd;
    }
    .waterfall-panel {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .trace-group-header {
      display: flex;
      justify-content: space-between;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border);
    }
    .spans-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .span-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.4rem 0;
    }
    .span-info {
      width: 250px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      overflow: hidden;
    }
    .span-name {
      font-size: 0.8rem;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .span-bar-container {
      flex: 1;
      background: var(--bg-secondary);
      height: 24px;
      border-radius: var(--radius-sm);
      position: relative;
      overflow: hidden;
    }
    .span-bar {
      height: 100%;
      background: linear-gradient(90deg, var(--accent-blue), var(--accent-cyan));
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      padding-left: 0.5rem;
      width: 75%;
    }
    .span-error {
      background: linear-gradient(90deg, var(--accent-red), #b91c1c);
    }
    .anomalies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.25rem;
    }
    .anomaly-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .anom-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .anom-desc {
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }
    .evidence-box {
      background: #060911;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 0.75rem;
      overflow-x: auto;
    }
    .invariants-table-panel {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow-x: auto;
    }
    .empty-state {
      padding: 3rem;
      text-align: center;
      color: var(--text-muted);
    }
  `]
})
export class ExecutionDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  api = inject(ApiService);
  workspaceService = inject(WorkspaceService);

  executionId = '';
  execution = signal<Execution | null>(null);
  events = signal<WorkflowEvent[]>([]);
  traces = signal<TraceDetail[]>([]);
  anomalies = signal<Anomaly[]>([]);
  invariants = signal<InvariantResult[]>([]);
  activeTab = signal<'events' | 'traces' | 'anomalies' | 'invariants'>('events');

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.executionId = params['id'];
      if (this.executionId) {
        this.loadAllData();
      }
    });
  }

  loadAllData() {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws || !this.executionId) return;

    this.api.getExecution(ws.id, this.executionId).subscribe(res => {
      if (res.success && res.data) {
        this.execution.set(res.data);
      }
    });

    this.api.getExecutionEvents(ws.id, this.executionId).subscribe(res => {
      if (res.success && res.data) {
        this.events.set(res.data);
      }
    });

    this.api.getExecutionTraces(ws.id, this.executionId).subscribe(res => {
      if (res.success && res.data) {
        this.traces.set(res.data);
      }
    });

    this.api.getExecutionAnomalies(ws.id, this.executionId).subscribe(res => {
      if (res.success && res.data) {
        this.anomalies.set(res.data);
      }
    });

    this.api.getExecutionInvariants(ws.id, this.executionId).subscribe(res => {
      if (res.success && res.data) {
        this.invariants.set(res.data);
      }
    });
  }

  createIncidentFromExecution() {
    const ws = this.workspaceService.currentWorkspace();
    const exec = this.execution();
    if (!ws || !exec) return;

    const data = {
      title: `Incident: Workflow ${exec.workflowName} Failure`,
      description: `Automated incident declared from execution ${exec.id}. Trigger: ${exec.triggerSource}.`,
      severity: 'HIGH',
      executionId: exec.id
    };

    this.api.createIncident(ws.id, data).subscribe({
      next: (res) => {
        alert('Incident successfully created and linked to this execution!');
      }
    });
  }

  formatDuration(ms?: number): string {
    if (!ms) return '0ms';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }
}
