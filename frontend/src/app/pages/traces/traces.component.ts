import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { WorkspaceService } from '../../core/services/workspace.service';
import { TraceDetail, ServiceGraph } from '../../core/models/models';

@Component({
  selector: 'app-traces',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="traces-page">
      <div class="page-header">
        <div>
          <h1>Distributed Traces & Service Graph</h1>
          <p class="subtitle">W3C OpenTelemetry span propagation and microservice call graph</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="loadTracesAndGraph()">
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- Service Graph Panel -->
      <div class="graph-card" *ngIf="serviceGraph(); else noGraph">
        <div class="graph-header">
          <h3>Service Dependency Graph</h3>
          <span class="text-xs text-muted">Topology inferred from OpenTelemetry span trees</span>
        </div>
        <div class="nodes-container">
          <div class="service-node" *ngFor="let node of serviceGraph()!.nodes">
            <div class="node-icon">⚡</div>
            <div class="node-info">
              <span class="node-name">{{ node.name }}</span>
              <span class="node-stats text-xs font-mono">
                calls: {{ node.callCount }} | errors: {{ node.errorCount }}
              </span>
            </div>
            <span class="badge" [ngClass]="node.errorCount > 0 ? 'badge-danger' : 'badge-success'">
              {{ node.errorCount > 0 ? 'DEGRADED' : 'HEALTHY' }}
            </span>
          </div>
        </div>
      </div>
      <ng-template #noGraph>
        <div class="empty-state-card">
          <p>No service graph data available yet. Ingest traces or execute a failure scenario.</p>
        </div>
      </ng-template>

      <!-- Traces Table -->
      <div class="panel">
        <div class="panel-header">
          <h3>Ingested Distributed Traces</h3>
        </div>
        <div class="table-container" *ngIf="traces().length > 0; else noTraces">
          <table class="data-table">
            <thead>
              <tr>
                <th>Trace ID</th>
                <th>Spans</th>
                <th>Root Service</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Execution ID</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of traces()">
                <td class="font-mono text-cyan font-bold">{{ t.traceId.substring(0, 16) }}...</td>
                <td class="font-mono">{{ t.spans ? t.spans.length : 0 }}</td>
                <td><span class="badge badge-info">{{ t.rootService || 'gateway' }}</span></td>
                <td class="font-mono text-xs">{{ formatDuration(t.durationMs) }}</td>
                <td>
                  <span class="badge" [ngClass]="t.hasErrors ? 'badge-danger' : 'badge-success'">
                    {{ t.hasErrors ? 'ERROR' : 'OK' }}
                  </span>
                </td>
                <td class="font-mono text-xs">
                  <a *ngIf="t.executionId" [routerLink]="['/workspace/executions', t.executionId]" class="link">
                    {{ t.executionId.substring(0, 8) }}...
                  </a>
                  <span *ngIf="!t.executionId" class="text-muted">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #noTraces>
          <div class="empty-state">
            <p>No distributed traces ingested yet.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .traces-page {
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
    .graph-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .graph-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .graph-header h3 {
      font-size: 1.1rem;
      font-weight: 600;
    }
    .nodes-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1rem;
    }
    .service-node {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .node-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      background: rgba(59, 130, 246, 0.15);
      color: var(--accent-blue);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }
    .node-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .node-name {
      font-weight: 600;
      font-size: 0.9rem;
    }
    .node-stats {
      color: var(--text-muted);
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
    .empty-state-card, .empty-state {
      padding: 3rem;
      text-align: center;
      color: var(--text-muted);
    }
  `]
})
export class TracesComponent implements OnInit {
  api = inject(ApiService);
  workspaceService = inject(WorkspaceService);

  traces = signal<TraceDetail[]>([]);
  serviceGraph = signal<ServiceGraph | null>(null);

  constructor() {
    effect(() => {
      const ws = this.workspaceService.currentWorkspace();
      if (ws) {
        this.loadTracesAndGraph();
      }
    });
  }

  ngOnInit() {
    const ws = this.workspaceService.currentWorkspace();
    if (ws) {
      this.loadTracesAndGraph();
    }
  }

  loadTracesAndGraph() {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws) return;

    this.api.listTraces(ws.id, 0, 20).subscribe(res => {
      if (res.success && res.data) {
        this.traces.set(res.data.content);
      }
    });

    this.api.getServiceGraph(ws.id).subscribe(res => {
      if (res.success && res.data) {
        this.serviceGraph.set(res.data);
      }
    });
  }

  formatDuration(ms?: number): string {
    if (!ms) return '0ms';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }
}
