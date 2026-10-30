import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { WorkspaceService } from '../../core/services/workspace.service';
import { InvariantDefinition, InvariantResult } from '../../core/models/models';

@Component({
  selector: 'app-invariants',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="invariants-page">
      <div class="page-header">
        <div>
          <h1>Deterministic Invariant Engine</h1>
          <p class="subtitle">Mathematical business invariants verified across workflow execution journals</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="loadInvariantsData()">
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- Invariant Rule Catalog -->
      <div class="rules-grid">
        <div class="rule-card" *ngFor="let def of definitions()">
          <div class="rule-header">
            <span class="rule-code font-mono">{{ def.code }}</span>
            <span class="badge" [ngClass]="def.severity === 'CRITICAL' ? 'badge-danger' : 'badge-warning'">
              {{ def.severity }}
            </span>
          </div>
          <h3 class="rule-name">{{ def.name }}</h3>
          <p class="rule-desc">{{ def.description }}</p>
          <div class="rule-footer font-mono text-xs text-muted">
            Evaluation Type: {{ def.ruleType }}
          </div>
        </div>
      </div>

      <!-- Recent Evaluations Table -->
      <div class="panel">
        <div class="panel-header">
          <h3>Recent Invariant Verification Results</h3>
        </div>
        <div class="table-container" *ngIf="results().length > 0; else noResults">
          <table class="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Invariant Code</th>
                <th>Evaluation Details</th>
                <th>Execution ID</th>
                <th>Evaluated At</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let res of results()">
                <td>
                  <span class="badge" [ngClass]="res.passed ? 'badge-success' : 'badge-danger'">
                    {{ res.passed ? 'PASS' : 'FAIL' }}
                  </span>
                </td>
                <td class="font-mono font-bold">{{ res.invariantCode }}</td>
                <td>{{ res.violationMessage || (res.passed ? 'Satisfied — No invariant violations detected' : 'Rule Violation Detected') }}</td>
                <td class="font-mono text-xs">
                  <a [routerLink]="['/workspace/executions', res.executionId]" class="link">
                    {{ res.executionId.substring(0, 8) }}... ↗
                  </a>
                </td>
                <td class="text-xs text-muted">{{ res.checkedAt | date:'medium' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #noResults>
          <div class="empty-state">
            <p>No invariant results recorded yet. Run workflow executions or failure scenarios to evaluate.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .invariants-page {
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
    .rules-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
    }
    .rule-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .rule-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .rule-code {
      font-size: 0.85rem;
      color: var(--accent-cyan);
      font-weight: 700;
    }
    .rule-name {
      font-size: 1.05rem;
      font-weight: 600;
      line-height: 1.3;
    }
    .rule-desc {
      color: var(--text-secondary);
      font-size: 0.85rem;
      line-height: 1.5;
      flex: 1;
    }
    .rule-footer {
      border-top: 1px solid var(--border);
      padding-top: 0.5rem;
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
export class InvariantsComponent implements OnInit {
  api = inject(ApiService);
  workspaceService = inject(WorkspaceService);

  definitions = signal<InvariantDefinition[]>([]);
  results = signal<InvariantResult[]>([]);

  constructor() {
    effect(() => {
      const ws = this.workspaceService.currentWorkspace();
      if (ws) {
        this.loadInvariantsData();
      }
    });
  }

  ngOnInit() {
    const ws = this.workspaceService.currentWorkspace();
    if (ws) {
      this.loadInvariantsData();
    }
  }

  loadInvariantsData() {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws) return;

    this.api.getInvariantDefinitions(ws.id).subscribe(res => {
      if (res.success && res.data) {
        this.definitions.set(res.data);
      }
    });

    this.api.getInvariantResults(ws.id, 0, 20).subscribe(res => {
      if (res.success && res.data) {
        this.results.set(res.data.content);
      }
    });
  }
}
