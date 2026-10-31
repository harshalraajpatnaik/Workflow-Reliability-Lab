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
            <div>
              <h3>Generate API Key</h3>
              <p class="modal-subtitle">Create a scoped programmatic token for ingestion agents, OTLP exporters, or CI/CD pipelines</p>
            </div>
            <button class="close-btn" (click)="showGenerateModal.set(false)">✕</button>
          </div>
          <form (ngSubmit)="onGenerateSubmit()" class="modal-form">
            <div class="form-group">
              <label for="keyName">Key Description / Purpose <span class="required">*</span></label>
              <input 
                id="keyName" 
                type="text" 
                class="form-control" 
                [(ngModel)]="newKeyName" 
                name="keyName" 
                required 
                placeholder="e.g. Production Ingestion Gateway" 
              />
              <span class="field-hint">A descriptive label identifying the service, agent, or CI/CD workflow using this key.</span>
            </div>

            <div class="form-group">
              <div class="label-row">
                <div class="label-left">
                  <label>Scopes & Permissions <span class="required">*</span></label>
                  <span class="count-badge">{{ selectedScopes().length }} of {{ availableScopes.length }} selected</span>
                </div>
                <button type="button" class="info-toggle-btn" (click)="showScopesInfo.set(!showScopesInfo())" [class.active]="showScopesInfo()">
                  <span class="info-icon">ℹ</span>
                  <span>{{ showScopesInfo() ? 'Hide explanation' : 'What are scopes?' }}</span>
                </button>
              </div>

              <!-- Interactive Guidance Callout -->
              <div class="info-callout" *ngIf="showScopesInfo()">
                <div class="callout-header">
                  <strong>API Key Scopes & Least Privilege Principle</strong>
                  <button type="button" class="callout-close" (click)="showScopesInfo.set(false)">✕</button>
                </div>
                <p class="callout-p">
                  Scopes define the programmatic capabilities granted to this API key. To maximize security, follow the principle of least privilege by granting only what the caller needs:
                </p>
                <div class="callout-bullets">
                  <div class="bullet-item">
                    <span class="bullet-dot">✦</span>
                    <div><strong>Microservice / Agent:</strong> Select <code>events:write</code> and <code>traces:write</code> to stream saga steps and OTLP spans without read access.</div>
                  </div>
                  <div class="bullet-item">
                    <span class="bullet-dot">✦</span>
                    <div><strong>Dashboards & Status Queries:</strong> Select <code>executions:read</code> for read-only polling of workflow states and invariant violations.</div>
                  </div>
                  <div class="bullet-item">
                    <span class="bullet-dot">✦</span>
                    <div><strong>CI/CD Chaos Runner:</strong> Select <code>scenarios:run</code> to enable automated fault injection and chaos simulations during pipeline tests.</div>
                  </div>
                </div>
              </div>

              <div class="quick-actions-bar">
                <span class="quick-actions-label">Quick presets:</span>
                <button type="button" class="preset-btn" (click)="selectAllScopes()">All Scopes</button>
                <button type="button" class="preset-btn" (click)="selectTelemetryOnly()">Telemetry Default</button>
                <button type="button" class="preset-btn" (click)="selectIngestionOnly()">Ingestion Only</button>
                <button type="button" class="preset-btn text-muted" (click)="clearScopes()">Clear</button>
              </div>

              <!-- Multi-select Scope Checkbox Cards -->
              <div class="scope-cards-grid">
                <div 
                  *ngFor="let sc of availableScopes"
                  class="scope-card"
                  [class.selected]="isScopeSelected(sc.code)"
                  (click)="toggleScope(sc.code)"
                >
                  <div class="card-checkbox" [class.checked]="isScopeSelected(sc.code)">
                    <span *ngIf="isScopeSelected(sc.code)">✓</span>
                  </div>
                  <div class="card-info">
                    <div class="card-header-line">
                      <span class="card-name">{{ sc.name }}</span>
                      <code class="card-code">{{ sc.code }}</code>
                    </div>
                    <p class="card-desc">{{ sc.desc }}</p>
                  </div>
                </div>
              </div>
              <span class="field-hint" *ngIf="selectedScopes().length === 0">
                ⚠️ Warning: An API key without scopes will be rejected with <code>403 Forbidden</code> on all authenticated endpoints.
              </span>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="showGenerateModal.set(false)">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="loading() || !newKeyName || selectedScopes().length === 0">
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
      max-width: 580px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 1.5rem;
      box-shadow: var(--shadow-lg);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border);
    }
    .modal-header h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 0.25rem 0;
    }
    .modal-subtitle {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin: 0;
    }
    .close-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.2rem;
      cursor: pointer;
      line-height: 1;
      padding: 0.25rem;
    }
    .close-btn:hover {
      color: var(--text-primary);
    }
    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }
    .form-group label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .required {
      color: var(--danger, #f43f5e);
    }
    .field-hint {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .field-hint code {
      color: var(--cyan, #06b6d4);
      background: rgba(6, 182, 212, 0.1);
      padding: 0.1rem 0.3rem;
      border-radius: 3px;
    }

    /* Label with Info button row */
    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .label-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .count-badge {
      font-size: 0.72rem;
      color: var(--text-muted);
      background: rgba(255, 255, 255, 0.06);
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
    }

    /* Info button */
    .info-toggle-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(59, 130, 246, 0.08);
      border: 1px solid rgba(59, 130, 246, 0.2);
      color: #60a5fa;
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .info-toggle-btn:hover, .info-toggle-btn.active {
      background: rgba(59, 130, 246, 0.18);
      border-color: rgba(59, 130, 246, 0.4);
      color: #93c5fd;
    }
    .info-icon {
      font-style: normal;
      font-size: 0.75rem;
      font-weight: 700;
    }

    /* Guidance callout box */
    .info-callout {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-left: 3px solid #3b82f6;
      border-radius: var(--radius-md);
      padding: 0.85rem;
      margin-bottom: 0.35rem;
      animation: fadeIn 0.18s ease-in-out;
    }
    .callout-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #93c5fd;
      font-size: 0.8rem;
      margin-bottom: 0.4rem;
    }
    .callout-close {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 0.85rem;
    }
    .callout-close:hover {
      color: var(--text-primary);
    }
    .callout-p {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin: 0 0 0.5rem 0;
      line-height: 1.4;
    }
    .callout-p code, .bullet-item code {
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.1);
      padding: 0.1rem 0.3rem;
      border-radius: 3px;
      font-family: var(--font-mono);
      font-size: 0.72rem;
    }
    .callout-bullets {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .bullet-item {
      display: flex;
      gap: 0.4rem;
      font-size: 0.74rem;
      color: var(--text-secondary);
      line-height: 1.35;
    }
    .bullet-dot {
      color: #60a5fa;
      font-size: 0.7rem;
      flex-shrink: 0;
      margin-top: 0.1rem;
    }

    /* Preset buttons bar */
    .quick-actions-bar {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
      margin-bottom: 0.2rem;
    }
    .quick-actions-label {
      font-size: 0.72rem;
      color: var(--text-muted);
      margin-right: 0.2rem;
    }
    .preset-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      font-size: 0.72rem;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .preset-btn:hover {
      background: rgba(99, 102, 241, 0.12);
      border-color: rgba(99, 102, 241, 0.35);
      color: #a5b4fc;
    }

    /* Scope Cards Grid */
    .scope-cards-grid {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-height: 240px;
      overflow-y: auto;
      padding-right: 0.25rem;
    }
    .scope-card {
      display: flex;
      gap: 0.75rem;
      padding: 0.65rem 0.75rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.15s ease;
      align-items: flex-start;
      user-select: none;
    }
    .scope-card:hover {
      border-color: rgba(99, 102, 241, 0.4);
      background: rgba(99, 102, 241, 0.03);
    }
    .scope-card.selected {
      border-color: #6366f1;
      background: rgba(99, 102, 241, 0.08);
    }
    .card-checkbox {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      border: 1.5px solid var(--border);
      background: var(--bg-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 0.7rem;
      color: #fff;
      font-weight: bold;
      margin-top: 0.15rem;
      transition: all 0.15s ease;
    }
    .scope-card.selected .card-checkbox, .card-checkbox.checked {
      background: #6366f1;
      border-color: #6366f1;
    }
    .card-info {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      flex: 1;
      min-width: 0;
    }
    .card-header-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .card-name {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .card-code {
      font-family: var(--font-mono);
      font-size: 0.68rem;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.1);
      padding: 0.08rem 0.35rem;
      border-radius: 3px;
    }
    .card-desc {
      font-size: 0.72rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.3;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 0.5rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ApiKeysComponent implements OnInit {
  api = inject(ApiService);
  workspaceService = inject(WorkspaceService);

  apiKeys = signal<ApiKey[]>([]);
  createdKey = signal<ApiKeyCreatedResponse | null>(null);
  showGenerateModal = signal(false);
  showScopesInfo = signal(false);

  newKeyName = '';

  readonly availableScopes = [
    {
      code: 'events:write',
      name: 'Events & Saga Ingestion',
      desc: 'Ingest workflow step lifecycle events, compensation logs, and idempotency keys'
    },
    {
      code: 'traces:write',
      name: 'Distributed Tracing (OTLP)',
      desc: 'Publish OpenTelemetry spans, trace contexts, and downstream RPC dependency graphs'
    },
    {
      code: 'executions:read',
      name: 'Executions & Audit Read',
      desc: 'Query workflow execution states, latency metrics, timeline events, and incident logs'
    },
    {
      code: 'scenarios:run',
      name: 'Chaos Simulation Trigger',
      desc: 'Trigger fault-injection simulations and automated failure recovery runs from CI/CD'
    }
  ];

  selectedScopes = signal<string[]>(['events:write', 'traces:write', 'executions:read']);
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

  toggleScope(code: string) {
    const current = this.selectedScopes();
    if (current.includes(code)) {
      this.selectedScopes.set(current.filter(c => c !== code));
    } else {
      this.selectedScopes.set([...current, code]);
    }
  }

  isScopeSelected(code: string): boolean {
    return this.selectedScopes().includes(code);
  }

  selectAllScopes() {
    this.selectedScopes.set(this.availableScopes.map(s => s.code));
  }

  selectTelemetryOnly() {
    this.selectedScopes.set(['events:write', 'traces:write', 'executions:read']);
  }

  selectIngestionOnly() {
    this.selectedScopes.set(['events:write', 'traces:write']);
  }

  clearScopes() {
    this.selectedScopes.set([]);
  }

  onGenerateSubmit() {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws || !this.newKeyName || this.selectedScopes().length === 0) return;

    this.loading.set(true);
    const scopesString = this.selectedScopes().join(',');

    this.api.createApiKey(ws.id, this.newKeyName, scopesString).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.showGenerateModal.set(false);
        this.newKeyName = '';
        this.selectedScopes.set(['events:write', 'traces:write', 'executions:read']);
        this.showScopesInfo.set(false);
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
