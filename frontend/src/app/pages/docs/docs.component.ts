import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-docs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="docs-page">
      <!-- Docs Header -->
      <header class="docs-header">
        <div class="container docs-header-inner">
          <div class="brand">
            <a routerLink="/" class="brand-link">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" stroke="var(--accent-blue)" />
                <polyline points="2 17 12 22 22 17" stroke="var(--accent-cyan)" />
                <polyline points="2 12 12 17 22 12" stroke="var(--accent-purple)" />
              </svg>
              <span>Workflow Reliability Lab Docs</span>
            </a>
          </div>
          <div class="header-nav">
            <a href="http://localhost:8085/swagger-ui/index.html" target="_blank" class="btn btn-secondary btn-sm">
              OpenAPI Swagger UI ↗
            </a>
            <a routerLink="/login" class="btn btn-primary btn-sm">Launch Lab</a>
          </div>
        </div>
      </header>

      <div class="docs-container container">
        <!-- Docs Nav Sidebar -->
        <aside class="docs-sidebar">
          <div class="docs-nav-group">
            <span class="group-title">GETTING STARTED</span>
            <button class="nav-btn" [class.active]="activeTab() === 'overview'" (click)="activeTab.set('overview')">System Architecture</button>
            <button class="nav-btn" [class.active]="activeTab() === 'auth'" (click)="activeTab.set('auth')">Authentication & API Keys</button>
          </div>
          <div class="docs-nav-group">
            <span class="group-title">CORE CONCEPTS</span>
            <button class="nav-btn" [class.active]="activeTab() === 'ingestion'" (click)="activeTab.set('ingestion')">Event & Trace Ingestion</button>
            <button class="nav-btn" [class.active]="activeTab() === 'scenarios'" (click)="activeTab.set('scenarios')">15 Failure Scenarios</button>
            <button class="nav-btn" [class.active]="activeTab() === 'invariants'" (click)="activeTab.set('invariants')">8 Business Invariants</button>
          </div>
          <div class="docs-nav-group">
            <span class="group-title">SDKs & INTEGRATION</span>
            <button class="nav-btn" [class.active]="activeTab() === 'java-sdk'" (click)="activeTab.set('java-sdk')">Java SDK Client</button>
            <button class="nav-btn" [class.active]="activeTab() === 'python-sdk'" (click)="activeTab.set('python-sdk')">Python SDK Client</button>
            <button class="nav-btn" [class.active]="activeTab() === 'rabbitmq'" (click)="activeTab.set('rabbitmq')">RabbitMQ Bridge</button>
          </div>
        </aside>

        <!-- Docs Content -->
        <main class="docs-content">
          <!-- Overview Tab -->
          <section *ngIf="activeTab() === 'overview'" class="doc-section">
            <h1>Architecture & Product Vision</h1>
            <p class="lead">
              Workflow Reliability Lab is an integrated developer platform designed to understand, test, diagnose, and mathematically verify the resilience of distributed workflows and asynchronous architectures.
            </p>

            <div class="arch-box">
              <h3>The 4 Foundational Pillars</h3>
              <div class="pillars-preview-grid">
                <div class="p-card">
                  <h4>1. Observability</h4>
                  <p>Durable event journal, OpenTelemetry microsecond spans, W3C trace propagation, and dynamic service dependency topology.</p>
                </div>
                <div class="p-card">
                  <h4>2. Failure Simulation</h4>
                  <p>15 deterministic chaos patterns including network timeouts, idempotency replay, out-of-order queues, and saga compensation failures.</p>
                </div>
                <div class="p-card">
                  <h4>3. Invariants Engine</h4>
                  <p>8 mathematical correctness checks verified against execution journals, preventing ledger imbalances and state corruption.</p>
                </div>
                <div class="p-card">
                  <h4>4. Incident Postmortems</h4>
                  <p>Automated root-cause isolation, anomaly correlation, AI hypothesis generation, and downloadable Markdown incident reports.</p>
                </div>
              </div>
            </div>

            <h2>How It Complements Existing Technology</h2>
            <p>
              Workflow Reliability Lab does not replace Temporal, Apache Kafka, RabbitMQ, Sentry, or Grafana. Instead, it acts as the <strong>reliability verification harness</strong>:
            </p>
            <ul>
              <li><strong>Temporal / Restate:</strong> Ingest execution steps and verify business invariant compliance after orchestrator retries.</li>
              <li><strong>Kafka / RabbitMQ:</strong> Test consumer group idempotency and diagnose poison-pill dead-letter events.</li>
              <li><strong>OpenTelemetry:</strong> Ingest OTel spans to generate unified execution waterfall charts and pinpoint bottlenecks.</li>
            </ul>
          </section>

          <!-- Auth Tab -->
          <section *ngIf="activeTab() === 'auth'" class="doc-section">
            <h1>Authentication & API Keys</h1>
            <p class="lead">
              Every API call is securely scoped to a workspace and protected using cryptographically secure tokens.
            </p>

            <h3>1. Machine-to-Machine Integration with API Keys</h3>
            <p>
              Generate high-entropy workspace API keys with prefix <code>wrl_</code>. Keys are hashed with SHA-256 before storage in the database.
            </p>
            <pre class="code-block font-mono"><code>curl -X POST http://localhost:8085/api/v1/workspaces/ws-id/events &#92;
  -H "X-API-Key: wrl_live_8f7b249a0c1e84d6b..." &#92;
  -H "Content-Type: application/json" &#92;
  -d '&#123; "executionId": "exec_01", "eventType": "ORDER_SUBMITTED" &#125;'</code></pre>

            <h3>2. User Session Authentication</h3>
            <p>
              Interactive browser sessions use short-lived JWT access tokens accompanied by rotating HTTP-only, SameSite refresh cookies. Passwords are encrypted with Argon2id or BCrypt.
            </p>
          </section>

          <!-- Ingestion Tab -->
          <section *ngIf="activeTab() === 'ingestion'" class="doc-section">
            <h1>Event & Trace Ingestion</h1>
            <p class="lead">
              Stream workflow lifecycle events and OpenTelemetry spans into the durable journal.
            </p>

            <h3>Event Ingestion Endpoint</h3>
            <pre class="code-block font-mono"><code>POST /api/v1/workspaces/ws-id/events
Content-Type: application/json

&#123;
  "executionId": "exec_pay_01",
  "eventType": "PAYMENT_ATTEMPTED",
  "sourceService": "payment-service",
  "idempotencyKey": "idem_pay_89124_att1"
&#125;</code></pre>

            <h3>Trace Context & Span Schema</h3>
            <pre class="code-block font-mono"><code>POST /api/v1/workspaces/ws-id/traces/spans
Content-Type: application/json

&#123;
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "00f067aa0ba902b7",
  "serviceName": "payment-service",
  "statusCode": "OK"
&#125;</code></pre>
          </section>

          <!-- Scenarios Tab -->
          <section *ngIf="activeTab() === 'scenarios'" class="doc-section">
            <h1>15 Failure Simulation Scenarios</h1>
            <p class="lead">
              Pre-built chaos simulations that test every critical failure mode in asynchronous systems.
            </p>

            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Scenario ID</th>
                    <th>Category</th>
                    <th>Fault Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>SCEN_NET_TIMEOUT</code></td>
                    <td><span class="badge badge-warning">Network</span></td>
                    <td>Simulates 5000ms upstream latency triggering client retry storm</td>
                  </tr>
                  <tr>
                    <td><code>SCEN_DUP_EVENT</code></td>
                    <td><span class="badge badge-primary">Messaging</span></td>
                    <td>Replays identical webhook event to test at-least-once deduplication</td>
                  </tr>
                  <tr>
                    <td><code>SCEN_OUT_OF_ORDER</code></td>
                    <td><span class="badge badge-primary">Messaging</span></td>
                    <td>Delivers shipment completed before order created event</td>
                  </tr>
                  <tr>
                    <td><code>SCEN_SAGA_COMP_FAIL</code></td>
                    <td><span class="badge badge-danger">Distributed</span></td>
                    <td>Payment succeeds, inventory reservation fails, refund throws 500</td>
                  </tr>
                  <tr>
                    <td><code>SCEN_OVER_REFUND</code></td>
                    <td><span class="badge badge-danger">Financial</span></td>
                    <td>Simulates parallel refund requests attempting to refund more than charge</td>
                  </tr>
                  <tr>
                    <td><code>SCEN_DLQ_POISON</code></td>
                    <td><span class="badge badge-warning">Queue</span></td>
                    <td>Malformed JSON payload routed to Dead-Letter Queue after max retries</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Invariants Tab -->
          <section *ngIf="activeTab() === 'invariants'" class="doc-section">
            <h1>8 Deterministic Business Invariants</h1>
            <p class="lead">
              Formal correctness rules evaluated deterministically on each workflow execution journal.
            </p>

            <div class="invariants-list">
              <div class="inv-card">
                <span class="inv-badge">INV-001: Terminal State Singularity</span>
                <p>An execution must not receive further state transitions once reaching COMPLETED, FAILED, or CANCELLED.</p>
              </div>
              <div class="inv-card">
                <span class="inv-badge">INV-002: Strict Idempotency Key Uniqueness</span>
                <p>Duplicate events with identical idempotency keys must produce zero duplicate side-effects.</p>
              </div>
              <div class="inv-card">
                <span class="inv-badge">INV-003: Monotonic Event Sequence Ordering</span>
                <p>Sequence numbers within an execution partition must be monotonically strictly increasing without gaps.</p>
              </div>
              <div class="inv-card">
                <span class="inv-badge">INV-004: Payment Ledger Balance Zero-Sum</span>
                <p>The sum of all debits must equal credits plus pending authorizations at the conclusion of a financial saga.</p>
              </div>
              <div class="inv-card">
                <span class="inv-badge">INV-005: Refund Cumulative Amount Ceiling</span>
                <p>Total refunded amount on a transaction must never exceed the captured charge amount.</p>
              </div>
              <div class="inv-card">
                <span class="inv-badge">INV-006: Saga Compensation Completeness</span>
                <p>If any step in an orchestration fails, all previously completed forward steps must have compensating events.</p>
              </div>
              <div class="inv-card">
                <span class="inv-badge">INV-007: Maximum Retry Boundedness</span>
                <p>No individual operation or activity may exceed the configured maximum retry threshold (default: 5).</p>
              </div>
              <div class="inv-card">
                <span class="inv-badge">INV-008: Valid State Transition Matrix</span>
                <p>Transitions must satisfy the formal state graph (e.g. REFUNDED cannot transition directly to CAPTURED).</p>
              </div>
            </div>
          </section>

          <!-- Java SDK Tab -->
          <section *ngIf="activeTab() === 'java-sdk'" class="doc-section">
            <h1>Java SDK Client</h1>
            <p class="lead">Sample integration using the official Workflow Reliability Lab Java SDK.</p>

            <pre class="code-block font-mono"><code>import dev.workflowlab.sdk.WorkflowReliabilityClient;
import dev.workflowlab.sdk.model.EventSubmission;

// 1. Initialize client
WorkflowReliabilityClient client = WorkflowReliabilityClient.builder()
    .endpoint("http://localhost:8085")
    .apiKey("wrl_live_8f7b249a0c1e84d6b...")
    .workspaceId("4c2dd3fa-5db1-4b8c-949f-ce2f6d169702")
    .build();

// 2. Publish workflow event with idempotency guarantee
client.publishEvent(EventSubmission.builder()
    .executionId("exec_order_9912")
    .eventType("PAYMENT_CAPTURED")
    .sourceService("checkout-service")
    .targetService("payment-service")
    .idempotencyKey("idem_order_9912_capture")
    .build());</code></pre>
          </section>

          <!-- Python SDK Tab -->
          <section *ngIf="activeTab() === 'python-sdk'" class="doc-section">
            <h1>Python SDK Client</h1>
            <p class="lead">Sample integration using the official Workflow Reliability Lab Python SDK.</p>

            <pre class="code-block font-mono"><code>from workflow_reliability_lab import WorkflowLabClient

# Initialize client
client = WorkflowLabClient(
    endpoint="http://localhost:8085",
    api_key="wrl_live_8f7b249a0c1e84d6b...",
    workspace_id="4c2dd3fa-5db1-4b8c-949f-ce2f6d169702"
)

# Ingest workflow event
client.publish_event(
    execution_id="exec_order_9912",
    event_type="SHIPMENT_DISPATCHED",
    source_service="shipping-service",
    idempotency_key="idem_ship_9912"
)</code></pre>
          </section>

          <!-- RabbitMQ Tab -->
          <section *ngIf="activeTab() === 'rabbitmq'" class="doc-section">
            <h1>RabbitMQ Asynchronous Bridge</h1>
            <p class="lead">Optional asynchronous integration for event capture from RabbitMQ message queues.</p>
            <p>
              Configure your RabbitMQ broker credentials in the <strong>Integrations</strong> console. All broker credentials are encrypted with AES-256 before storage and never returned in plaintext.
            </p>
          </section>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .docs-page {
      background-color: var(--bg-primary);
      min-height: 100vh;
      color: var(--text-primary);
    }
    .docs-header {
      height: 60px;
      border-bottom: 1px solid var(--border);
      background-color: var(--bg-secondary);
      position: sticky;
      top: 0;
      z-index: 40;
    }
    .docs-header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
    }
    .brand-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .header-nav {
      display: flex;
      gap: 0.75rem;
    }
    .docs-container {
      display: flex;
      gap: 2.5rem;
      padding: 2.5rem 1.5rem;
    }
    .docs-sidebar {
      width: 250px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
      position: sticky;
      top: 85px;
      height: fit-content;
    }
    .docs-nav-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .group-title {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.08em;
      margin-bottom: 0.25rem;
    }
    .nav-btn {
      text-align: left;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 0.875rem;
      padding: 0.45rem 0.65rem;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .nav-btn:hover {
      background-color: var(--bg-card);
      color: var(--text-primary);
    }
    .nav-btn.active {
      background-color: rgba(59, 130, 246, 0.15);
      color: var(--accent-blue);
      font-weight: 600;
    }
    .docs-content {
      flex: 1;
      max-width: 900px;
    }
    .doc-section h1 {
      font-size: 2.2rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
    }
    .doc-section .lead {
      font-size: 1.1rem;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .doc-section h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-top: 2rem;
      margin-bottom: 1rem;
    }
    .doc-section h3 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
    }
    .doc-section p, .doc-section ul {
      color: var(--text-secondary);
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 1rem;
    }
    .doc-section ul {
      padding-left: 1.5rem;
    }
    .arch-box {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.75rem;
      margin: 1.5rem 0;
    }
    .arch-box h3 {
      margin-top: 0;
      margin-bottom: 1rem;
    }
    .pillars-preview-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }
    .p-card {
      background: var(--bg-secondary);
      padding: 1rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
    }
    .p-card h4 {
      font-size: 0.95rem;
      color: var(--accent-blue);
      margin-bottom: 0.35rem;
    }
    .p-card p {
      font-size: 0.85rem;
      margin-bottom: 0;
    }
    .code-block {
      background: #060911;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      font-size: 0.85rem;
      line-height: 1.6;
      overflow-x: auto;
      margin: 1rem 0 1.5rem;
      color: #93c5fd;
    }
    .invariants-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .inv-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1.25rem;
    }
    .inv-badge {
      display: inline-block;
      font-weight: 600;
      color: var(--accent-cyan);
      font-size: 0.95rem;
      margin-bottom: 0.35rem;
    }
    .inv-card p {
      margin-bottom: 0;
      font-size: 0.9rem;
    }
    .table-container {
      margin: 1.5rem 0;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow-x: auto;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }
    .data-table th, .data-table td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    .data-table th {
      background: var(--bg-card);
      color: var(--text-muted);
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
    }
  `]
})
export class DocsComponent {
  activeTab = signal<'overview' | 'auth' | 'ingestion' | 'scenarios' | 'invariants' | 'java-sdk' | 'python-sdk' | 'rabbitmq'>('overview');
}
