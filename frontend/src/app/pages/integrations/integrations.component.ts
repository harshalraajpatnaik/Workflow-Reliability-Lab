import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { WorkspaceService } from '../../core/services/workspace.service';
import { Integration } from '../../core/models/models';

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="integrations-page">
      <div class="page-header">
        <div>
          <h1>Integration Architecture</h1>
          <p class="subtitle">Connect message brokers, telemetry agents, and asynchronous event sources</p>
        </div>
      </div>

      <!-- RabbitMQ Panel -->
      <div class="integration-card">
        <div class="card-header">
          <div class="header-left">
            <span class="broker-icon">🐰</span>
            <div>
              <h3>RabbitMQ Message Broker</h3>
              <p class="card-subtitle">Asynchronous message capture and dead-letter queue testing</p>
            </div>
          </div>
          <span class="badge" [ngClass]="rabbitStatus() === 'CONNECTED' ? 'badge-success' : 'badge-warning'">
            {{ rabbitStatus() }}
          </span>
        </div>

        <div *ngIf="testResult()" class="alert-box" [ngClass]="testSuccess() ? 'alert-success' : 'alert-error'">
          {{ testResult() }}
        </div>

        <form (ngSubmit)="saveRabbitConfig()" class="integration-form">
          <div class="form-row">
            <div class="form-group flex-2">
              <label for="rabbitHost">Broker Host / Hostname</label>
              <input 
                id="rabbitHost" 
                type="text" 
                class="form-control font-mono" 
                [(ngModel)]="rabbitHost" 
                name="rabbitHost" 
                required 
                placeholder="rabbitmq.internal or localhost" 
              />
            </div>
            <div class="form-group flex-1">
              <label for="rabbitPort">AMQP Port</label>
              <input 
                id="rabbitPort" 
                type="number" 
                class="form-control font-mono" 
                [(ngModel)]="rabbitPort" 
                name="rabbitPort" 
                required 
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label for="rabbitUser">Username</label>
              <input 
                id="rabbitUser" 
                type="text" 
                class="form-control" 
                [(ngModel)]="rabbitUser" 
                name="rabbitUser" 
                required 
                placeholder="guest" 
              />
            </div>
            <div class="form-group flex-1">
              <label for="rabbitPass">Password (encrypted at rest with AES-256)</label>
              <input 
                id="rabbitPass" 
                type="password" 
                class="form-control" 
                [(ngModel)]="rabbitPass" 
                name="rabbitPass" 
                placeholder="••••••••••••" 
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label for="rabbitVhost">Virtual Host</label>
              <input 
                id="rabbitVhost" 
                type="text" 
                class="form-control font-mono" 
                [(ngModel)]="rabbitVhost" 
                name="rabbitVhost" 
                placeholder="/" 
              />
            </div>
            <div class="form-group flex-1">
              <label for="rabbitQueue">Queue / Routing Key</label>
              <input 
                id="rabbitQueue" 
                type="text" 
                class="form-control font-mono" 
                [(ngModel)]="rabbitQueue" 
                name="rabbitQueue" 
                placeholder="wrl.workflow.events" 
              />
            </div>
          </div>

          <div class="form-actions">
            <button 
              type="button" 
              class="btn btn-secondary" 
              [disabled]="testingConnection()" 
              (click)="testConnection()">
              {{ testingConnection() ? 'Testing Socket...' : '🔌 Test Connection' }}
            </button>
            <button 
              type="submit" 
              class="btn btn-primary" 
              [disabled]="savingConfig()">
              {{ savingConfig() ? 'Encrypting & Saving...' : 'Save Configuration' }}
            </button>
          </div>
        </form>
      </div>

      <!-- OpenTelemetry Collector Guide -->
      <div class="integration-card">
        <div class="card-header">
          <div class="header-left">
            <span class="broker-icon">📡</span>
            <div>
              <h3>OpenTelemetry Collector OTLP Endpoint</h3>
              <p class="card-subtitle">Export traces and spans from any OpenTelemetry SDK</p>
            </div>
          </div>
          <span class="badge badge-success">ACTIVE</span>
        </div>

        <div class="otel-guide">
          <p class="text-xs text-secondary">
            Configure your OpenTelemetry SDK or OpenTelemetry Collector exporter to forward spans via HTTP to Workflow Reliability Lab:
          </p>
          <pre class="code-box font-mono text-xs"><code>exporters:
  otlphttp:
    endpoint: "http://localhost:8085/api/v1/workspaces/{{ workspaceService.currentWorkspace()?.id }}/traces"
    headers:
      X-API-Key: "wrl_live_your_api_key_here"</code></pre>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .integrations-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .page-header h1 {
      font-size: 1.6rem;
      font-weight: 700;
    }
    .subtitle {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }
    .integration-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .broker-icon {
      font-size: 1.75rem;
    }
    .card-header h3 {
      font-size: 1.15rem;
      font-weight: 600;
    }
    .card-subtitle {
      color: var(--text-secondary);
      font-size: 0.85rem;
    }
    .integration-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .form-row {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .flex-1 { flex: 1; min-width: 200px; }
    .flex-2 { flex: 2; min-width: 280px; }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }
    .alert-box {
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
    }
    .alert-success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #6ee7b7;
    }
    .alert-error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }
    .code-box {
      background: #060911;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1rem;
      color: #93c5fd;
      overflow-x: auto;
      margin-top: 0.5rem;
    }
  `]
})
export class IntegrationsComponent implements OnInit {
  api = inject(ApiService);
  workspaceService = inject(WorkspaceService);

  rabbitStatus = signal('CONFIGURED');
  rabbitHost = 'localhost';
  rabbitPort = 5672;
  rabbitUser = 'guest';
  rabbitPass = 'guest';
  rabbitVhost = '/';
  rabbitQueue = 'wrl.workflow.events';

  testingConnection = signal(false);
  savingConfig = signal(false);
  testResult = signal<string | null>(null);
  testSuccess = signal(false);

  constructor() {
    effect(() => {
      const ws = this.workspaceService.currentWorkspace();
      if (ws) {
        this.loadIntegrations(ws.id);
      }
    });
  }

  ngOnInit() {
    const ws = this.workspaceService.currentWorkspace();
    if (ws) {
      this.loadIntegrations(ws.id);
    }
  }

  loadIntegrations(wsId: string) {
    this.api.getIntegrations(wsId).subscribe(res => {
      if (res.success && res.data) {
        const rmq = res.data.find(i => (i.integrationType || i.type) === 'RABBITMQ');
        if (rmq) {
          this.rabbitStatus.set(rmq.status);
        }
      }
    });
  }

  testConnection() {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws) return;

    this.testingConnection.set(true);
    this.testResult.set(null);

    const testPayload = {
      host: this.rabbitHost,
      port: this.rabbitPort,
      virtualHost: this.rabbitVhost,
      username: this.rabbitUser,
      password: this.rabbitPass
    };

    this.api.testRabbitMqConnection(ws.id, testPayload).subscribe({
      next: (res) => {
        this.testingConnection.set(false);
        const isConnected = res.data ? res.data.success : res.success;
        this.testSuccess.set(isConnected);
        const latency = res.data?.latencyMs != null ? ` (${res.data.latencyMs}ms)` : '';
        this.testResult.set((res.data?.message || res.message || 'RabbitMQ TCP socket handshake succeeded!') + latency);
      },
      error: (err) => {
        this.testingConnection.set(false);
        this.testSuccess.set(false);
        this.testResult.set(err.error?.message || 'Failed to establish TCP socket to RabbitMQ broker.');
      }
    });
  }

  saveRabbitConfig() {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws) return;

    this.savingConfig.set(true);
    const data = {
      host: this.rabbitHost,
      port: this.rabbitPort,
      virtualHost: this.rabbitVhost,
      username: this.rabbitUser,
      password: this.rabbitPass,
      queue: this.rabbitQueue
    };

    this.api.configureRabbitMq(ws.id, data).subscribe({
      next: () => {
        this.savingConfig.set(false);
        alert('RabbitMQ credentials securely encrypted and stored.');
        this.loadIntegrations(ws.id);
      },
      error: () => {
        this.savingConfig.set(false);
      }
    });
  }
}
