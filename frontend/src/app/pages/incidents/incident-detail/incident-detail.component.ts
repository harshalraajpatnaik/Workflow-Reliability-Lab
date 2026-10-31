import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { Incident, IncidentReport } from '../../../core/models/models';

@Component({
  selector: 'app-incident-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="inc-detail-page" *ngIf="incident(); else loadingState">
      <!-- Breadcrumb & Top Bar -->
      <div class="top-nav">
        <a routerLink="/workspace/incidents" class="back-link">
          ← Back to Incidents
        </a>
        <div class="actions">
          <button 
            class="btn btn-secondary btn-sm" 
            [disabled]="diagnosing()"
            (click)="triggerAiDiagnosis()">
            {{ diagnosing() ? 'Analyzing Evidence...' : '🤖 Request Root Cause Diagnosis' }}
          </button>
          <button 
            class="btn btn-primary btn-sm" 
            [disabled]="generatingReport()"
            (click)="triggerGenerateReport()">
            {{ generatingReport() ? 'Generating...' : '📄 Generate Postmortem' }}
          </button>
        </div>
      </div>

      <!-- Incident Header Banner -->
      <div class="incident-banner">
        <div class="banner-top">
          <span class="badge" [ngClass]="{
            'badge-danger': incident()!.severity === 'CRITICAL' || incident()!.severity === 'HIGH',
            'badge-warning': incident()!.severity === 'MEDIUM',
            'badge-info': incident()!.severity === 'LOW'
          }">
            {{ incident()!.severity }}
          </span>
          <span class="badge" [ngClass]="{
            'badge-danger': incident()!.status === 'OPEN',
            'badge-warning': incident()!.status === 'INVESTIGATING',
            'badge-success': incident()!.status === 'RESOLVED'
          }">
            {{ incident()!.status }}
          </span>
          <h1>{{ incident()!.title }}</h1>
        </div>
        <p class="inc-desc">{{ incident()!.description }}</p>
        <div class="banner-meta">
          <span class="meta-item">
            <span class="meta-label">INCIDENT ID:</span> 
            <code class="font-mono text-cyan">{{ incident()!.id }}</code>
          </span>
          <span class="meta-item" *ngIf="incident()!.executionId">
            <span class="meta-label">LINKED EXECUTION:</span> 
            <a [routerLink]="['/workspace/executions', incident()!.executionId]" class="link font-mono">
              {{ incident()!.executionId }} ↗
            </a>
          </span>
          <span class="meta-item">
            <span class="meta-label">DECLARED AT:</span> 
            <span>{{ incident()!.createdAt | date:'medium' }}</span>
          </span>
        </div>
      </div>

      <!-- AI Diagnosis Result Card -->
      <div class="diagnosis-card" *ngIf="incident()!.aiDiagnosis">
        <div class="diag-header">
          <div class="diag-title">
            <span class="diag-icon">🤖</span>
            <h3>Root-Cause Diagnosis & Hypothesis</h3>
          </div>
          <span class="badge badge-info">Confidence: 94%</span>
        </div>
        <div class="diag-body font-mono text-xs">
          <pre><code>{{ incident()!.aiDiagnosis }}</code></pre>
        </div>
      </div>

      <!-- Generated Postmortem Report Card -->
      <div class="report-card" *ngIf="report()">
        <div class="report-header">
          <h3>Generated Postmortem Report (Markdown)</h3>
          <span class="text-xs text-muted">Ready for export to GitHub / Notion</span>
        </div>
        <div class="report-body">
          <pre class="report-markdown font-mono text-xs"><code>{{ report()!.content }}</code></pre>
        </div>
      </div>
    </div>

    <ng-template #loadingState>
      <div class="empty-state">Loading incident details...</div>
    </ng-template>
  `,
  styles: [`
    .inc-detail-page {
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
    .incident-banner {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .banner-top {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .banner-top h1 {
      font-size: 1.5rem;
      font-weight: 700;
    }
    .inc-desc {
      color: var(--text-secondary);
      font-size: 0.95rem;
      line-height: 1.5;
    }
    .banner-meta {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
      font-size: 0.825rem;
      border-top: 1px solid var(--border);
      padding-top: 0.75rem;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .meta-label {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--text-muted);
    }
    .text-cyan {
      color: var(--accent-cyan);
    }
    .diagnosis-card {
      background: var(--bg-card);
      border: 1px solid var(--accent-blue);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .diag-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .diag-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .diag-title h3 {
      font-size: 1.1rem;
      font-weight: 600;
    }
    .diag-body pre {
      background: #060911;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1rem;
      color: #93c5fd;
      line-height: 1.5;
      overflow-x: auto;
    }
    .report-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .report-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .report-header h3 {
      font-size: 1rem;
      font-weight: 600;
    }
    .report-body {
      padding: 1.25rem;
    }
    .report-markdown {
      background: #060911;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      color: var(--text-primary);
      line-height: 1.6;
      overflow-x: auto;
      max-height: 500px;
    }
    .empty-state {
      padding: 3rem;
      text-align: center;
      color: var(--text-muted);
    }
  `]
})
export class IncidentDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  api = inject(ApiService);
  workspaceService = inject(WorkspaceService);

  incidentId = '';
  incident = signal<Incident | null>(null);
  report = signal<IncidentReport | null>(null);
  diagnosing = signal(false);
  generatingReport = signal(false);

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.incidentId = params['id'];
      if (this.incidentId) {
        this.loadIncident();
      }
    });
  }

  loadIncident() {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws || !this.incidentId) return;

    this.api.getIncident(ws.id, this.incidentId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.incident.set(res.data);
        }
      },
      error: () => {
        this.api.getIncidents(ws.id, 0, 50).subscribe(res => {
          if (res.success && res.data) {
            const found = res.data.content.find(i => i.id === this.incidentId);
            if (found) {
              this.incident.set(found);
            }
          }
        });
      }
    });
  }

  triggerAiDiagnosis() {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws || !this.incidentId) return;

    this.diagnosing.set(true);
    this.api.requestAiAnalysis(ws.id, this.incidentId).subscribe({
      next: (res) => {
        this.diagnosing.set(false);
        if (res.success && res.data) {
          this.incident.set(res.data);
        }
      },
      error: () => {
        this.diagnosing.set(false);
      }
    });
  }

  triggerGenerateReport() {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws || !this.incidentId) return;

    this.generatingReport.set(true);
    this.api.generatePostmortemReport(ws.id, this.incidentId).subscribe({
      next: (res) => {
        this.generatingReport.set(false);
        if (res.success && res.data) {
          this.report.set(res.data);
        }
      },
      error: () => {
        this.generatingReport.set(false);
      }
    });
  }
}
