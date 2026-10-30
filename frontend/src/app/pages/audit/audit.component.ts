import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { WorkspaceService } from '../../core/services/workspace.service';
import { AuditEvent } from '../../core/models/models';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="audit-page">
      <div class="page-header">
        <div>
          <h1>Security Audit History</h1>
          <p class="subtitle">Immutable compliance journal recording administrative actions, key lifecycle, and simulations</p>
        </div>
        <button class="btn btn-secondary" (click)="loadAuditLogs()">
          <span>Refresh</span>
        </button>
      </div>

      <!-- Audit Table -->
      <div class="panel">
        <div class="table-container" *ngIf="auditEvents().length > 0; else noAudit">
          <table class="data-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>User / Actor</th>
                <th>Resource</th>
                <th>IP Address</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ev of auditEvents()">
                <td class="font-mono font-bold">
                  <span class="action-tag">{{ ev.action }}</span>
                </td>
                <td class="text-xs">{{ ev.userEmail || ev.userId || 'system' }}</td>
                <td class="font-mono text-xs text-muted">{{ ev.resourceType }}: {{ ev.resourceId || '-' }}</td>
                <td class="font-mono text-xs">{{ ev.ipAddress || '127.0.0.1' }}</td>
                <td class="text-xs text-muted">{{ ev.createdAt | date:'medium' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #noAudit>
          <div class="empty-state">
            <p>No audit events recorded for this workspace yet.</p>
          </div>
        </ng-template>

        <!-- Pagination -->
        <div class="pagination-bar" *ngIf="totalPages() > 1">
          <button class="btn btn-secondary btn-sm" [disabled]="page() === 0" (click)="changePage(page() - 1)">
            Previous
          </button>
          <span class="page-info">Page {{ page() + 1 }} of {{ totalPages() }}</span>
          <button class="btn btn-secondary btn-sm" [disabled]="page() >= totalPages() - 1" (click)="changePage(page() + 1)">
            Next
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .audit-page {
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
    .action-tag {
      background: rgba(59, 130, 246, 0.1);
      color: var(--accent-blue);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
    }
    .empty-state {
      padding: 3rem;
      text-align: center;
      color: var(--text-muted);
    }
    .pagination-bar {
      padding: 0.85rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--border);
    }
    .page-info {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
  `]
})
export class AuditComponent implements OnInit {
  api = inject(ApiService);
  workspaceService = inject(WorkspaceService);

  auditEvents = signal<AuditEvent[]>([]);
  page = signal(0);
  totalPages = signal(0);

  constructor() {
    effect(() => {
      const ws = this.workspaceService.currentWorkspace();
      if (ws) {
        this.loadAuditLogs();
      }
    });
  }

  ngOnInit() {
    const ws = this.workspaceService.currentWorkspace();
    if (ws) {
      this.loadAuditLogs();
    }
  }

  loadAuditLogs() {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws) return;

    this.api.getAuditEvents(ws.id, this.page(), 20).subscribe(res => {
      if (res.success && res.data) {
        this.auditEvents.set(res.data.content);
        this.totalPages.set(res.data.totalPages);
      }
    });
  }

  changePage(newPage: number) {
    this.page.set(newPage);
    this.loadAuditLogs();
  }
}
