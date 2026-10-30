import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { WorkspaceService } from '../../core/services/workspace.service';
import { WorkflowEvent } from '../../core/models/models';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="events-page">
      <div class="page-header">
        <div>
          <h1>Durable Event Journal</h1>
          <p class="subtitle">Immutable distributed event log with cryptographic idempotency keys</p>
        </div>
        <button class="btn btn-secondary" (click)="loadEvents()">
          <span>Refresh</span>
        </button>
      </div>

      <div class="panel">
        <div class="table-container" *ngIf="events().length > 0; else noEvents">
          <table class="data-table">
            <thead>
              <tr>
                <th>Seq</th>
                <th>Event Type</th>
                <th>Services</th>
                <th>Idempotency Key</th>
                <th>Execution ID</th>
                <th>Timestamp</th>
                <th>Payload</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ev of events()">
                <td class="font-mono text-xs text-muted">#{{ ev.sequenceNumber }}</td>
                <td class="font-mono font-bold">{{ ev.eventType }}</td>
                <td class="font-mono text-xs">
                  <span class="text-cyan">{{ ev.sourceService || 'client' }}</span> ➔ {{ ev.targetService || 'workflow' }}
                </td>
                <td class="font-mono text-xs">
                  <code *ngIf="ev.idempotencyKey" class="key-pill">{{ ev.idempotencyKey }}</code>
                  <span *ngIf="!ev.idempotencyKey" class="text-muted">-</span>
                </td>
                <td class="font-mono text-xs">
                  <a [routerLink]="['/workspace/executions', ev.executionId]" class="link">
                    {{ ev.executionId.substring(0, 8) }}...
                  </a>
                </td>
                <td class="text-xs text-muted">{{ ev.createdAt | date:'mediumTime' }}</td>
                <td>
                  <button class="btn btn-secondary btn-sm" (click)="viewPayload(ev)" *ngIf="ev.payload">
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #noEvents>
          <div class="empty-state">
            <p>No events recorded in this workspace journal yet.</p>
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

      <!-- Payload Modal -->
      <div class="modal-backdrop" *ngIf="selectedPayload()">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Event Payload</h3>
            <button class="close-btn" (click)="selectedPayload.set(null)">✕</button>
          </div>
          <pre class="payload-box font-mono text-xs"><code>{{ selectedPayload() }}</code></pre>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="selectedPayload.set(null)">Close</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .events-page {
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
    .key-pill {
      background: rgba(6, 182, 212, 0.1);
      color: var(--accent-cyan);
      padding: 0.2rem 0.4rem;
      border-radius: var(--radius-sm);
    }
    .text-cyan {
      color: var(--accent-cyan);
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
      max-width: 580px;
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
    .payload-box {
      background: #060911;
      padding: 1rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      overflow-x: auto;
      max-height: 400px;
      color: #93c5fd;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 1rem;
    }
  `]
})
export class EventsComponent implements OnInit {
  api = inject(ApiService);
  workspaceService = inject(WorkspaceService);

  events = signal<WorkflowEvent[]>([]);
  page = signal(0);
  totalPages = signal(0);
  selectedPayload = signal<string | null>(null);

  constructor() {
    effect(() => {
      const ws = this.workspaceService.currentWorkspace();
      if (ws) {
        this.loadEvents();
      }
    });
  }

  ngOnInit() {
    const ws = this.workspaceService.currentWorkspace();
    if (ws) {
      this.loadEvents();
    }
  }

  loadEvents() {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws) return;

    this.api.listWorkspaceEvents(ws.id, this.page(), 20).subscribe(res => {
      if (res.success && res.data) {
        this.events.set(res.data.content);
        this.totalPages.set(res.data.totalPages);
      }
    });
  }

  changePage(newPage: number) {
    this.page.set(newPage);
    this.loadEvents();
  }

  viewPayload(ev: WorkflowEvent) {
    if (!ev.payload) return;
    try {
      const parsed = JSON.parse(ev.payload);
      this.selectedPayload.set(JSON.stringify(parsed, null, 2));
    } catch (e) {
      this.selectedPayload.set(ev.payload);
    }
  }
}
