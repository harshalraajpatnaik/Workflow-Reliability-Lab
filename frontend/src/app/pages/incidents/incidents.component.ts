import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { WorkspaceService } from '../../core/services/workspace.service';
import { Incident } from '../../core/models/models';

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="incidents-page">
      <div class="page-header">
        <div>
          <h1>Incident Investigation & Reports</h1>
          <p class="subtitle">Evidence-backed root cause diagnosis and automated postmortem report generation</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="showCreateModal.set(true)">
            <span>+ Declare Incident</span>
          </button>
          <button class="btn btn-secondary" (click)="loadIncidents()">
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- Incidents Table -->
      <div class="panel">
        <div class="table-container" *ngIf="incidents().length > 0; else noIncidents">
          <table class="data-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Status</th>
                <th>Title</th>
                <th>Linked Execution</th>
                <th>Declared At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let inc of incidents()">
                <td>
                  <span class="badge" [ngClass]="{
                    'badge-danger': inc.severity === 'CRITICAL' || inc.severity === 'HIGH',
                    'badge-warning': inc.severity === 'MEDIUM',
                    'badge-info': inc.severity === 'LOW'
                  }">
                    {{ inc.severity }}
                  </span>
                </td>
                <td>
                  <span class="badge" [ngClass]="{
                    'badge-danger': inc.status === 'OPEN',
                    'badge-warning': inc.status === 'INVESTIGATING',
                    'badge-success': inc.status === 'RESOLVED'
                  }">
                    {{ inc.status }}
                  </span>
                </td>
                <td class="font-medium">
                  <a [routerLink]="['/workspace/incidents', inc.id]" class="inc-link">
                    {{ inc.title }}
                  </a>
                </td>
                <td class="font-mono text-xs">
                  <a *ngIf="inc.executionId" [routerLink]="['/workspace/executions', inc.executionId]" class="link">
                    {{ inc.executionId.substring(0, 8) }}... ↗
                  </a>
                  <span *ngIf="!inc.executionId" class="text-muted">-</span>
                </td>
                <td class="text-xs text-muted">{{ inc.createdAt | date:'medium' }}</td>
                <td>
                  <a [routerLink]="['/workspace/incidents', inc.id]" class="btn btn-secondary btn-sm">
                    Investigate ➔
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #noIncidents>
          <div class="empty-state">
            <p>No active incidents recorded. Declaring an incident enables AI diagnosis & postmortem generation.</p>
          </div>
        </ng-template>
      </div>

      <!-- Create Incident Modal -->
      <div class="modal-backdrop" *ngIf="showCreateModal()">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Declare New Incident</h3>
            <button class="close-btn" (click)="showCreateModal.set(false)">✕</button>
          </div>
          <form (ngSubmit)="onCreateIncident()" class="modal-form">
            <div class="form-group">
              <label for="incTitle">Incident Title</label>
              <input 
                id="incTitle" 
                type="text" 
                class="form-control" 
                [(ngModel)]="newTitle" 
                name="incTitle" 
                required 
                placeholder="e.g. Upstream Gateway Timeout in Payment Pipeline" 
              />
            </div>
            <div class="form-group">
              <label for="incSev">Severity Level</label>
              <select id="incSev" class="form-control" [(ngModel)]="newSeverity" name="incSev">
                <option value="CRITICAL">CRITICAL (Total outage or data corruption)</option>
                <option value="HIGH">HIGH (Degraded core business flow)</option>
                <option value="MEDIUM">MEDIUM (Intermittent retry exhaustion)</option>
                <option value="LOW">LOW (Informational anomaly)</option>
              </select>
            </div>
            <div class="form-group">
              <label for="incDesc">Initial Observations</label>
              <textarea 
                id="incDesc" 
                class="form-control" 
                [(ngModel)]="newDescription" 
                name="incDesc" 
                rows="3" 
                placeholder="Describe the failure symptoms, impacted services, and error logs..."
              ></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="showCreateModal.set(false)">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="loading() || !newTitle">
                {{ loading() ? 'Creating...' : 'Declare Incident' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .incidents-page {
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
    .header-actions {
      display: flex;
      gap: 0.75rem;
    }
    .panel {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
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
    .inc-link {
      color: var(--text-primary);
      font-weight: 600;
    }
    .inc-link:hover {
      color: var(--accent-blue);
    }
    .empty-state {
      padding: 3rem;
      text-align: center;
      color: var(--text-muted);
    }
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }
    .modal-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 500px;
      padding: 1.5rem;
      box-shadow: var(--shadow-lg);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .close-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.2rem;
      cursor: pointer;
    }
    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1rem;
    }
  `]
})
export class IncidentsComponent implements OnInit {
  api = inject(ApiService);
  workspaceService = inject(WorkspaceService);

  incidents = signal<Incident[]>([]);
  showCreateModal = signal(false);
  newTitle = '';
  newSeverity = 'HIGH';
  newDescription = '';
  loading = signal(false);

  constructor() {
    effect(() => {
      const ws = this.workspaceService.currentWorkspace();
      if (ws) {
        this.loadIncidents();
      }
    });
  }

  ngOnInit() {
    const ws = this.workspaceService.currentWorkspace();
    if (ws) {
      this.loadIncidents();
    }
  }

  loadIncidents() {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws) return;

    this.api.getIncidents(ws.id, 0, 20).subscribe(res => {
      if (res.success && res.data) {
        this.incidents.set(res.data.content);
      }
    });
  }

  onCreateIncident() {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws || !this.newTitle) return;

    this.loading.set(true);
    const data = {
      title: this.newTitle,
      severity: this.newSeverity,
      description: this.newDescription
    };

    this.api.createIncident(ws.id, data).subscribe({
      next: () => {
        this.loading.set(false);
        this.showCreateModal.set(false);
        this.newTitle = '';
        this.newDescription = '';
        this.loadIncidents();
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
