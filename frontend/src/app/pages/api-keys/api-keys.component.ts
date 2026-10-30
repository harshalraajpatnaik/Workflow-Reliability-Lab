import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { WorkspaceService } from '../../core/services/workspace.service';
import { ApiKey, ApiKeyCreatedResponse } from '../../core/models/models';

@Component({
  selector: 'app-api-keys',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="api-keys-page">
      <div class="page-header">
        <div>
          <h1>API Keys & Machine Tokens</h1>
          <p class="subtitle">Secure workspace-scoped credentials for SDKs, CI pipelines, and service daemons</p>
        </div>
        <button class="btn btn-primary" (click)="showGenerateModal.set(true)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Generate New Key</span>
        </button>
      </div>

      <!-- Generated Key Notification (Shown Once) -->
      <div class="generated-key-banner" *ngIf="createdKey()">
        <div class="key-banner-header">
          <span class="badge badge-warning">RECORD THIS KEY NOW</span>
          <span class="text-xs text-muted">This secret key will never be displayed again.</span>
        </div>
        <div class="key-box">
          <code class="font-mono text-cyan">{{ createdKey()!.rawKey }}</code>
          <button class="btn btn-secondary btn-sm" (click)="copyKey(createdKey()!.rawKey)">
            {{ copied() ? '✓ Copied' : 'Copy Key' }}
          </button>
        </div>
        <button class="btn btn-secondary btn-sm dismiss-btn" (click)="createdKey.set(null)">
          I have safely saved this key
        </button>
      </div>

      <!-- API Keys Table -->
      <div class="panel">
        <div class="panel-header">
          <h3>Active Workspace Keys</h3>
        </div>
        <div class="table-container" *ngIf="apiKeys().length > 0; else noKeys">
          <table class="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Key Name</th>
                <th>Key Prefix</th>
                <th>Scopes</th>
                <th>Created At</th>
                <th>Last Used</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let k of apiKeys()">
                <td>
                  <span class="badge" [ngClass]="k.revoked ? 'badge-danger' : 'badge-success'">
                    {{ k.revoked ? 'REVOKED' : 'ACTIVE' }}
                  </span>
                </td>
                <td class="font-medium">{{ k.name }}</td>
                <td class="font-mono text-xs text-cyan">{{ k.keyPrefix }}••••••••</td>
                <td><span class="badge badge-info text-xs">{{ k.scopes || 'all' }}</span></td>
                <td class="text-xs text-muted">{{ k.createdAt | date:'medium' }}</td>
                <td class="text-xs text-muted">{{ k.lastUsedAt ? (k.lastUsedAt | date:'medium') : 'Never' }}</td>
                <td>
                  <button 
                    *ngIf="!k.revoked" 
                    class="btn btn-secondary btn-sm text-danger" 
                    (click)="revokeKey(k.id)">
                    Revoke
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #noKeys>
          <div class="empty-state">
            <p>No API keys generated for this workspace. Generate one to authenticate SDKs.</p>
          </div>
        </ng-template>
      </div>

      <!-- Generate Modal -->
      <div class="modal-backdrop" *ngIf="showGenerateModal()">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Generate API Key</h3>
            <button class="close-btn" (click)="showGenerateModal.set(false)">✕</button>
          </div>
          <form (ngSubmit)="onGenerateSubmit()" class="modal-form">
            <div class="form-group">
              <label for="keyName">Key Description / Purpose</label>
              <input 
                id="keyName" 
                type="text" 
                class="form-control" 
                [(ngModel)]="newKeyName" 
                name="keyName" 
                required 
                placeholder="e.g. Production Ingestion Gateway" 
              />
            </div>
            <div class="form-group">
              <label for="keyScopes">Scopes (comma-separated)</label>
              <input 
                id="keyScopes" 
                type="text" 
                class="form-control font-mono" 
                [(ngModel)]="newKeyScopes" 
                name="keyScopes" 
                placeholder="events:write,traces:write,scenarios:run" 
              />
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="showGenerateModal.set(false)">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="loading() || !newKeyName">
                {{ loading() ? 'Generating...' : 'Create API Key' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .api-keys-page {
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
    .generated-key-banner {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.4);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .key-banner-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .key-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #060911;
      border: 1px solid var(--border);
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.95rem;
    }
    .dismiss-btn {
      align-self: flex-start;
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
export class ApiKeysComponent implements OnInit {
  api = inject(ApiService);
  workspaceService = inject(WorkspaceService);

  apiKeys = signal<ApiKey[]>([]);
  createdKey = signal<ApiKeyCreatedResponse | null>(null);
  showGenerateModal = signal(false);
  newKeyName = '';
  newKeyScopes = 'events:write,traces:write,scenarios:run';
  loading = signal(false);
  copied = signal(false);

  constructor() {
    effect(() => {
      const ws = this.workspaceService.currentWorkspace();
      if (ws) {
        this.loadKeys(ws.id);
      }
    });
  }

  ngOnInit() {
    const ws = this.workspaceService.currentWorkspace();
    if (ws) {
      this.loadKeys(ws.id);
    }
  }

  loadKeys(wsId: string) {
    this.api.getApiKeys(wsId).subscribe(res => {
      if (res.success && res.data) {
        this.apiKeys.set(res.data);
      }
    });
  }

  onGenerateSubmit() {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws || !this.newKeyName) return;

    this.loading.set(true);
    this.api.createApiKey(ws.id, this.newKeyName, this.newKeyScopes).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.showGenerateModal.set(false);
        this.newKeyName = '';
        if (res.success && res.data) {
          this.createdKey.set(res.data);
          this.loadKeys(ws.id);
        }
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  revokeKey(keyId: string) {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws) return;

    if (confirm('Are you sure you want to revoke this API key immediately? Any applications using this key will be unauthorized.')) {
      this.api.revokeApiKey(ws.id, keyId).subscribe({
        next: () => {
          this.loadKeys(ws.id);
        }
      });
    }
  }

  copyKey(key: string) {
    navigator.clipboard.writeText(key);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}
