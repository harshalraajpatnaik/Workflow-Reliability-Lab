import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { WorkspaceService } from '../../core/services/workspace.service';
import { Webhook } from '../../core/models/models';

@Component({
  selector: 'app-webhooks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="webhooks-page">
      <div class="page-header">
        <div>
          <h1>Outgoing Webhooks</h1>
          <p class="subtitle">Broadcast reliability alerts, invariant violations, and incident declarations to external systems</p>
        </div>
        <button class="btn btn-primary" (click)="showRegisterModal.set(true)">
          <span>+ Register Webhook</span>
        </button>
      </div>

      <!-- Webhooks Table -->
      <div class="panel">
        <div class="table-container" *ngIf="webhooks().length > 0; else noWebhooks">
          <table class="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Target URL</th>
                <th>Event Types</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let wh of webhooks()">
                <td>
                  <span class="badge" [ngClass]="(wh.enabled ?? wh.active) ? 'badge-success' : 'badge-warning'">
                    {{ (wh.enabled ?? wh.active) ? 'ACTIVE' : 'DISABLED' }}
                  </span>
                </td>
                <td class="font-mono text-cyan">{{ wh.url }}</td>
                <td><span class="badge badge-info text-xs">{{ wh.eventTypes || '*' }}</span></td>
                <td class="text-xs text-muted">{{ wh.createdAt | date:'medium' }}</td>
                <td>
                  <button class="btn btn-secondary btn-sm text-danger" (click)="onDeleteWebhook(wh.id)">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #noWebhooks>
          <div class="empty-state">
            <p>No outgoing webhooks registered yet. Connect Slack, PagerDuty, or custom endpoints.</p>
          </div>
        </ng-template>
      </div>

      <!-- Register Modal -->
      <div class="modal-backdrop" *ngIf="showRegisterModal()">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Register Webhook Endpoint</h3>
            <button class="close-btn" (click)="showRegisterModal.set(false)">✕</button>
          </div>
          <form (ngSubmit)="onRegisterSubmit()" class="modal-form">
            <div class="form-group">
              <label for="whUrl">Target URL</label>
              <input 
                id="whUrl" 
                type="url" 
                class="form-control font-mono" 
                [(ngModel)]="newUrl" 
                name="whUrl" 
                required 
                placeholder="https://api.company.com/webhooks/reliability" 
              />
            </div>
            <div class="form-group">
              <label for="whSecret">Signing Secret (optional)</label>
              <input 
                id="whSecret" 
                type="password" 
                class="form-control font-mono" 
                [(ngModel)]="newSecret" 
                name="whSecret" 
                placeholder="whsec_••••••••••••" 
              />
            </div>
            <div class="form-group">
              <label for="whEvents">Subscribed Events</label>
              <input 
                id="whEvents" 
                type="text" 
                class="form-control" 
                [(ngModel)]="newEvents" 
                name="whEvents" 
                placeholder="ANOMALY_DETECTED,INVARIANT_VIOLATION,INCIDENT_CREATED" 
              />
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="showRegisterModal.set(false)">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="loading() || !newUrl">
                {{ loading() ? 'Saving...' : 'Register Webhook' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .webhooks-page {
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
      max-width: 480px;
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
export class WebhooksComponent implements OnInit {
  api = inject(ApiService);
  workspaceService = inject(WorkspaceService);

  webhooks = signal<Webhook[]>([]);
  showRegisterModal = signal(false);
  newUrl = '';
  newSecret = '';
  newEvents = 'ANOMALY_DETECTED,INVARIANT_VIOLATION,INCIDENT_CREATED';
  loading = signal(false);

  constructor() {
    effect(() => {
      const ws = this.workspaceService.currentWorkspace();
      if (ws) {
        this.loadWebhooks(ws.id);
      }
    });
  }

  ngOnInit() {
    const ws = this.workspaceService.currentWorkspace();
    if (ws) {
      this.loadWebhooks(ws.id);
    }
  }

  loadWebhooks(wsId: string) {
    this.api.getWebhooks(wsId).subscribe(res => {
      if (res.success && res.data) {
        this.webhooks.set(res.data);
      }
    });
  }

  onRegisterSubmit() {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws || !this.newUrl) return;

    this.loading.set(true);
    const data = {
      url: this.newUrl,
      description: 'Workspace Notifications & Alerts',
      eventTypes: this.newEvents,
      enabled: true
    };

    this.api.registerWebhook(ws.id, data).subscribe({
      next: () => {
        this.loading.set(false);
        this.showRegisterModal.set(false);
        this.newUrl = '';
        this.newSecret = '';
        this.loadWebhooks(ws.id);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onDeleteWebhook(webhookId: string) {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws) return;

    if (confirm('Are you sure you want to delete this webhook endpoint? Alerts will no longer be dispatched to it.')) {
      this.api.deleteWebhook(ws.id, webhookId).subscribe({
        next: () => {
          this.loadWebhooks(ws.id);
        }
      });
    }
  }
}
