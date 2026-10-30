import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

type DocTab = 
  | 'portal-guide'
  | 'walkthrough'
  | 'overview'
  | 'scenarios'
  | 'invariants'
  | 'anomalies'
  | 'payments'
  | 'faq'
  | 'auth'
  | 'ingestion'
  | 'java-sdk'
  | 'python-sdk'
  | 'rabbitmq';

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
              <span>Workflow Reliability Lab</span>
            </a>
            <span class="header-divider">/</span>
            <span class="header-sub">Platform Guide &amp; Docs</span>
          </div>
          <div class="header-nav">
            <a href="http://localhost:8085/swagger-ui/index.html" target="_blank" class="btn btn-secondary btn-sm">
              OpenAPI Swagger UI ↗
            </a>
            <a routerLink="/workspace/dashboard" class="btn btn-primary btn-sm">Launch Console</a>
          </div>
        </div>
      </header>

      <div class="docs-container container">
        <!-- Docs Nav Sidebar -->
        <aside class="docs-sidebar">
          <div class="docs-nav-group">
            <span class="group-title">NOVICE PLATFORM GUIDE</span>
            <button class="nav-btn" [class.active]="activeTab() === 'portal-guide'" (click)="setTab('portal-guide')">
              <span class="tab-icon">🧭</span> The "Why, What, How"
            </button>
            <button class="nav-btn" [class.active]="activeTab() === 'walkthrough'" (click)="setTab('walkthrough')">
              <span class="tab-icon">📖</span> Step-by-Step Portal Tour
            </button>
            <button class="nav-btn" [class.active]="activeTab() === 'faq'" (click)="setTab('faq')">
              <span class="tab-icon">❓</span> Novice &amp; Arch FAQs
            </button>
          </div>

          <div class="docs-nav-group">
            <span class="group-title">CORE RELIABILITY ENGINES</span>
            <button class="nav-btn" [class.active]="activeTab() === 'invariants'" (click)="setTab('invariants')">
              <span class="tab-icon">🛡️</span> 8 Business Invariants
            </button>
            <button class="nav-btn" [class.active]="activeTab() === 'scenarios'" (click)="setTab('scenarios')">
              <span class="tab-icon">⚡</span> 15 Chaos Scenarios
            </button>
            <button class="nav-btn" [class.active]="activeTab() === 'anomalies'" (click)="setTab('anomalies')">
              <span class="tab-icon">⚠️</span> Anomaly Detection Lab
            </button>
            <button class="nav-btn" [class.active]="activeTab() === 'payments'" (click)="setTab('payments')">
              <span class="tab-icon">💳</span> Payment Reliability Sandbox
            </button>
          </div>

          <div class="docs-nav-group">
            <span class="group-title">ARCHITECTURE &amp; API</span>
            <button class="nav-btn" [class.active]="activeTab() === 'overview'" (click)="setTab('overview')">
              <span class="tab-icon">🏛️</span> System Architecture
            </button>
            <button class="nav-btn" [class.active]="activeTab() === 'auth'" (click)="setTab('auth')">
              <span class="tab-icon">🔒</span> Auth &amp; Multi-Tenancy
            </button>
            <button class="nav-btn" [class.active]="activeTab() === 'ingestion'" (click)="setTab('ingestion')">
              <span class="tab-icon">📡</span> Event &amp; Trace Ingest
            </button>
          </div>

          <div class="docs-nav-group">
            <span class="group-title">SDKS &amp; CLIENTS</span>
            <button class="nav-btn" [class.active]="activeTab() === 'java-sdk'" (click)="setTab('java-sdk')">
              <span class="tab-icon">☕</span> Java SDK Client
            </button>
            <button class="nav-btn" [class.active]="activeTab() === 'python-sdk'" (click)="setTab('python-sdk')">
              <span class="tab-icon">🐍</span> Python SDK Client
            </button>
            <button class="nav-btn" [class.active]="activeTab() === 'rabbitmq'" (click)="setTab('rabbitmq')">
              <span class="tab-icon">🐇</span> RabbitMQ Bridge
            </button>
          </div>
        </aside>

        <!-- Docs Content -->
        <main class="docs-content">

          <!-- 1. PORTAL GUIDE TAB (THE WHY, WHAT, HOW) -->
          <section *ngIf="activeTab() === 'portal-guide'" class="doc-section">
            <div class="section-badge-top">NOVICE PLATFORM GUIDE</div>
            <h1>The "Why, What, and How" of Workflow Reliability</h1>
            <p class="lead">
              Everything you need to know about distributed system reliability, why modern asynchronous systems fail silently, and how this platform guarantees correctness.
            </p>

            <!-- The Problem Card -->
            <div class="guide-card trap-card">
              <div class="card-icon red-glow">💥</div>
              <div class="card-body">
                <h3>The "Why": The Hidden Trap of Modern Software</h3>
                <p>
                  In a simple single-server app, placing an order happens sequentially in one database transaction. If anything fails, the entire transaction rolls back.
                </p>
                <p>
                  In modern <strong>distributed cloud architectures</strong>, an application is split into dozens of microservices communicating over networks and message brokers (Kafka, RabbitMQ, SQS):
                </p>
                <div class="workflow-flow-diagram font-mono">
                  [Web Client] &rarr; [API Gateway] &rarr; [Order Service] &rarr; [Message Broker] &rarr; [Payment Service] &rarr; [Warehouse Service]
                </div>
                <p>
                  Because networks are inherently unpredictable, four catastrophic failure modes occur:
                </p>
                <ul class="danger-list">
                  <li><strong>At-Least-Once Delivery:</strong> Message brokers promise never to lose an event, but often deliver it twice. <em>Did your system double-charge the customer?</em></li>
                  <li><strong>Out-of-Order Execution:</strong> Due to network routing latency, a "Package Shipped" event arrives <em>before</em> the "Payment Captured" event. <em>Did you fulfill an unpaid order?</em></li>
                  <li><strong>Ghost Retries &amp; Missing Idempotency:</strong> A mobile app times out and retries with a new correlation ID, bypassing deduplication tables.</li>
                  <li><strong>Partial Saga Failures:</strong> Step 1 and 2 succeed, but Step 3 fails. If the compensating rollback transaction fails, customer money is lost in a limbo state.</li>
                </ul>
              </div>
            </div>

            <!-- The Solution Card -->
            <div class="guide-card solution-card">
              <div class="card-icon cyan-glow">🛡️</div>
              <div class="card-body">
                <h3>The "What": What is Workflow Reliability Lab?</h3>
                <p>
                  Workflow Reliability Lab is a dedicated developer platform designed specifically to <strong>test, simulate, diagnose, and mathematically verify</strong> the resilience of asynchronous systems.
                </p>
                <p>It combines four integrated capabilities:</p>
                <div class="capabilities-quad">
                  <div class="cap-box">
                    <strong>1. Observability</strong>
                    <p>Chronological event timelines, OpenTelemetry trace waterfalls, and microservice call graphs.</p>
                  </div>
                  <div class="cap-box">
                    <strong>2. Failure Simulation</strong>
                    <p>15 pre-configured chaos injection scenarios (timeouts, crashes, poison pills, retry storms).</p>
                  </div>
                  <div class="cap-box">
                    <strong>3. Invariant Verification</strong>
                    <p>8 mathematical correctness checks continuously evaluated against execution journals.</p>
                  </div>
                  <div class="cap-box">
                    <strong>4. AI Postmortems</strong>
                    <p>Automated root-cause analysis correlating spans and anomalies into actionable fix reports.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Comparison Table -->
            <h2>How It Complements Existing Tools</h2>
            <p>Workflow Reliability Lab does not replace Temporal, Kafka, Datadog, or Sentry. It fills the testing and correctness gap:</p>

            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Capability</th>
                    <th>APMs (Datadog / Sentry)</th>
                    <th>Orchestrators (Temporal / Kafka)</th>
                    <th>Workflow Reliability Lab</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>CPU / Exception Alerting</strong></td>
                    <td><span class="status-yes">✅ Native Focus</span></td>
                    <td><span class="status-no">❌ No</span></td>
                    <td><span class="status-neutral">⚠️ Delegated to APMs</span></td>
                  </tr>
                  <tr>
                    <td><strong>Step Orchestration</strong></td>
                    <td><span class="status-no">❌ No</span></td>
                    <td><span class="status-yes">✅ Native Focus</span></td>
                    <td><span class="status-neutral">⚠️ Framework-agnostic</span></td>
                  </tr>
                  <tr>
                    <td><strong>Controlled Chaos Fault Injection</strong></td>
                    <td><span class="status-no">❌ No</span></td>
                    <td><span class="status-neutral">⚠️ Limited custom code</span></td>
                    <td><span class="status-yes">✅ 15 Built-in Scenarios</span></td>
                  </tr>
                  <tr>
                    <td><strong>Deterministic Invariant Checking</strong></td>
                    <td><span class="status-no">❌ No</span></td>
                    <td><span class="status-no">❌ No</span></td>
                    <td><span class="status-yes">✅ 8 Mathematical Rules</span></td>
                  </tr>
                  <tr>
                    <td><strong>Idempotency Deduplication Journal</strong></td>
                    <td><span class="status-no">❌ No</span></td>
                    <td><span class="status-neutral">⚠️ Partial</span></td>
                    <td><span class="status-yes">✅ Built-in Verification</span></td>
                  </tr>
                  <tr>
                    <td><strong>Evidence-Backed AI Postmortems</strong></td>
                    <td><span class="status-neutral">⚠️ Generic text</span></td>
                    <td><span class="status-no">❌ No</span></td>
                    <td><span class="status-yes">✅ Trace &amp; Anomaly Correlated</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- 2. WALKTHROUGH TAB (STEP-BY-STEP PORTAL TOUR) -->
          <section *ngIf="activeTab() === 'walkthrough'" class="doc-section">
            <div class="section-badge-top">STEP-BY-STEP TOUR</div>
            <h1>Portal Walkthrough with Concrete Examples</h1>
            <p class="lead">
              A beginner-friendly guide explaining what every screen does and how to test failure modes step by step.
            </p>

            <div class="walkthrough-steps">
              <!-- Step 1 -->
              <div class="step-card">
                <div class="step-number">01</div>
                <div class="step-content">
                  <h3>Sign In to the Demo Workspace</h3>
                  <p>
                    Open <code>http://localhost:4200/login</code>. The console comes pre-seeded with enterprise credentials for instant testing:
                  </p>
                  <div class="cred-pill font-mono">
                    <span>Email: lead.architect&#64;workflowlab.dev</span>
                    <span>Password: Password123!&#64;#</span>
                  </div>
                  <p class="step-tip">💡 Click <strong>⚡ Fill Demo Credentials</strong> to sign in with one click.</p>
                </div>
              </div>

              <!-- Step 2 -->
              <div class="step-card">
                <div class="step-number">02</div>
                <div class="step-content">
                  <h3>The Executive Dashboard (<code>/workspace/dashboard</code>)</h3>
                  <p>
                    The dashboard gives you a live pulse of your distributed system across 4 top KPI cards:
                  </p>
                  <ul>
                    <li><strong>Reliability Rate (%):</strong> The percentage of workflow executions that completed without unhandled exceptions or invariant breaches (target: &gt;99.5%).</li>
                    <li><strong>Total Executions:</strong> Total workflows tracked across development, staging, and production environments.</li>
                    <li><strong>Active Anomalies:</strong> Live rule violations requiring engineer review.</li>
                    <li><strong>Invariants Health:</strong> The pass/fail ratio of your non-negotiable business rules.</li>
                  </ul>
                </div>
              </div>

              <!-- Step 3 -->
              <div class="step-card">
                <div class="step-number">03</div>
                <div class="step-content">
                  <h3>Workflow Execution Explorer (<code>/workspace/executions</code>)</h3>
                  <p>
                    Click any execution (e.g. <code>Order Fulfillment Saga</code>) to inspect its anatomy:
                  </p>
                  <ul>
                    <li><strong>Chronological Event Timeline:</strong> See every state mutation in microsecond order (<code>OrderCreated</code> &rarr; <code>PaymentCaptured</code> &rarr; <code>StockReserved</code>).</li>
                    <li><strong>OpenTelemetry Trace Waterfall:</strong> Color-coded spans showing which microservice took the longest and where timeouts occurred.</li>
                    <li><strong>Invariants Audit:</strong> Instant green/red badges indicating whether business rules were satisfied.</li>
                  </ul>
                </div>
              </div>

              <!-- Step 4 -->
              <div class="step-card">
                <div class="step-number">04</div>
                <div class="step-content">
                  <h3>Failure Simulation Lab (<code>/workspace/scenarios</code>)</h3>
                  <p>
                    This is the heart of the platform. You don't have to wait for an outage in production.
                  </p>
                  <div class="example-box">
                    <strong>Try this hands-on test:</strong>
                    <ol>
                      <li>Go to <strong>Failure Scenarios</strong> in the sidebar.</li>
                      <li>Locate <code>SCEN_DUP_MESSAGE</code> (Duplicate Message Ingestion).</li>
                      <li>Click <strong>Run Scenario</strong>.</li>
                      <li>The engine injects duplicate event payloads into the pipeline.</li>
                      <li>Navigate to the <strong>Scenario Runs</strong> tab to see the engine detect the anomaly and verify whether your deduplication layer held up.</li>
                    </ol>
                  </div>
                </div>
              </div>

              <!-- Step 5 -->
              <div class="step-card">
                <div class="step-number">05</div>
                <div class="step-content">
                  <h3>Payment Reliability Sandbox (<code>/workspace/payments</code>)</h3>
                  <p>
                    Test the most dangerous part of any distributed system: money movement and ledger reconciliation.
                  </p>
                  <div class="example-box">
                    <strong>Try this ledger ceiling test:</strong>
                    <ol>
                      <li>Click <strong>Initiate Payment</strong> ($100.00). Submit with fault mode <code>NONE</code>.</li>
                      <li>Transaction succeeds. Status becomes <code>SUCCEEDED</code>.</li>
                      <li>Click <strong>Refund</strong> and refund $40.00. The refund succeeds.</li>
                      <li>Now click <strong>Refund</strong> again and attempt to refund $80.00 ($40 + $80 = $120 &gt; $100).</li>
                      <li>The platform <strong>blocks the refund</strong> and flags an <code>INV_REFUND_CEILING</code> violation!</li>
                    </ol>
                  </div>
                </div>
              </div>

              <!-- Step 6 -->
              <div class="step-card">
                <div class="step-number">06</div>
                <div class="step-content">
                  <h3>Incident Postmortems &amp; AI Diagnosis (<code>/workspace/incidents</code>)</h3>
                  <p>
                    When multiple failures occur, declare an incident:
                  </p>
                  <ul>
                    <li>Click <strong>Request AI Diagnosis</strong>: The system aggregates span errors, failed event payloads, and timestamps into an LLM analysis producing a root-cause hypothesis.</li>
                    <li>Click <strong>Generate Postmortem Report</strong>: Export a ready-to-share postmortem document for your engineering team.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <!-- 3. INVARIANTS TAB -->
          <section *ngIf="activeTab() === 'invariants'" class="doc-section">
            <div class="section-badge-top">DETERMINISTIC VERIFICATION</div>
            <h1>8 Business Invariant Rules Explained</h1>
            <p class="lead">
              Invariants are non-negotiable mathematical assertions. Unlike heuristics or statistical alerts, an invariant is either <strong>satisfied</strong> or <strong>violated</strong>.
            </p>

            <div class="invariants-detail-grid">
              <div class="inv-detail-card">
                <div class="inv-card-top">
                  <span class="inv-id">INV_NO_DOUBLE_CHARGE</span>
                  <span class="inv-tag red">FINANCIAL</span>
                </div>
                <h3>Zero Double Charge</h3>
                <div class="inv-formula font-mono">&sum; ChargeEvents(e) &le; 1</div>
                <p><strong>The Disaster Prevented:</strong> A message broker delivers the "Charge" command twice due to an unacknowledged TCP socket. Without deduplication, the customer is billed twice.</p>
                <p><strong>Violation Evidence:</strong> Flagged when multiple non-retry payment capture events share the same checkout correlation ID.</p>
              </div>

              <div class="inv-detail-card">
                <div class="inv-card-top">
                  <span class="inv-id">INV_REFUND_CEILING</span>
                  <span class="inv-tag red">FINANCIAL</span>
                </div>
                <h3>Refund Ceiling Enforcement</h3>
                <div class="inv-formula font-mono">&sum; Refunds &le; &sum; Captured</div>
                <p><strong>The Disaster Prevented:</strong> A customer opens two browser tabs and submits refund requests simultaneously. Without atomic balance checks, $100 is captured but $160 is refunded.</p>
                <p><strong>Violation Evidence:</strong> Flagged when cumulative refunded capital exceeds captured gross amount.</p>
              </div>

              <div class="inv-detail-card">
                <div class="inv-card-top">
                  <span class="inv-id">INV_NO_DUP_TRANSITION</span>
                  <span class="inv-tag purple">WORKFLOW</span>
                </div>
                <h3>State Transition Uniqueness</h3>
                <div class="inv-formula font-mono">Count(Transition(s₁ &rarr; s₂)) &le; 1</div>
                <p><strong>The Disaster Prevented:</strong> Order transitions from <code>CREATED</code> to <code>PROCESSING</code> multiple times, triggering duplicated downstream inventory packing orders.</p>
                <p><strong>Violation Evidence:</strong> Identical transition tuples observed on non-retry operations.</p>
              </div>

              <div class="inv-detail-card">
                <div class="inv-card-top">
                  <span class="inv-id">INV_TERMINAL_IMMUTABILITY</span>
                  <span class="inv-tag blue">LIFECYCLE</span>
                </div>
                <h3>Terminal State Immutability</h3>
                <div class="inv-formula font-mono">&forall; t &gt; t_term, &Delta;State = &empty;</div>
                <p><strong>The Disaster Prevented:</strong> A delayed message arrives minutes after an order was cancelled or completed, erroneously re-activating the order.</p>
                <p><strong>Violation Evidence:</strong> Any event ingested after the execution timestamp of <code>COMPLETED</code>, <code>FAILED</code>, or <code>CANCELLED</code>.</p>
              </div>

              <div class="inv-detail-card">
                <div class="inv-card-top">
                  <span class="inv-id">INV_COMPENSATION_LOGGED</span>
                  <span class="inv-tag yellow">SAGA</span>
                </div>
                <h3>Saga Rollback Audit Completeness</h3>
                <div class="inv-formula font-mono">Failed &rArr; Logged(Compensate)</div>
                <p><strong>The Disaster Prevented:</strong> A distributed saga fails halfway through, but compensating transactions (e.g. unlocking inventory, refunding deposit) are never executed or recorded.</p>
                <p><strong>Violation Evidence:</strong> Aborted execution without corresponding compensation domain events.</p>
              </div>

              <div class="inv-detail-card">
                <div class="inv-card-top">
                  <span class="inv-id">INV_JOURNAL_MATCH</span>
                  <span class="inv-tag cyan">CONSISTENCY</span>
                </div>
                <h3>State Journal Consistency</h3>
                <div class="inv-formula font-mono">Terminal(Exec) &equiv; LastEvent</div>
                <p><strong>The Disaster Prevented:</strong> The execution record in the database says <code>COMPLETED</code>, but the event stream ends with <code>PaymentFailed</code> due to a partial write bug.</p>
                <p><strong>Violation Evidence:</strong> Discrepancy between workflow header status and terminal event status.</p>
              </div>

              <div class="inv-detail-card">
                <div class="inv-card-top">
                  <span class="inv-id">INV_RECONCILIATION_BAL</span>
                  <span class="inv-tag red">LEDGER</span>
                </div>
                <h3>Ledger Parity &amp; Reconciliation</h3>
                <div class="inv-formula font-mono">Ledger(Net) == Provider(Net)</div>
                <p><strong>The Disaster Prevented:</strong> Provider charge fees, refunds, and adjustments drift from the internal accounting ledger without notice.</p>
                <p><strong>Violation Evidence:</strong> Discrepancy between internal ledger math and gateway settlement payload.</p>
              </div>

              <div class="inv-detail-card">
                <div class="inv-card-top">
                  <span class="inv-id">INV_REQUIRED_STEPS</span>
                  <span class="inv-tag blue">LIFECYCLE</span>
                </div>
                <h3>Mandatory Lifecycle Sequence</h3>
                <div class="inv-formula font-mono">Steps(e) &supe; &#123;Created, Paid, Final&#125;</div>
                <p><strong>The Disaster Prevented:</strong> An execution jumps directly from <code>Created</code> to <code>Shipped</code> without the <code>Paid</code> step due to a misconfigured message routing key.</p>
                <p><strong>Violation Evidence:</strong> Execution marked <code>COMPLETED</code> without required mandatory intermediate steps.</p>
              </div>
            </div>
          </section>

          <!-- 4. SCENARIOS TAB -->
          <section *ngIf="activeTab() === 'scenarios'" class="doc-section">
            <div class="section-badge-top">CHAOS CATALOG</div>
            <h1>15 Built-in Failure Scenarios</h1>
            <p class="lead">
              Test every critical asynchronous edge case in an isolated, safe environment before production deployment.
            </p>

            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Scenario Code</th>
                    <th>Category</th>
                    <th>Fault Description</th>
                    <th>Detection &amp; Recovery Rule</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>SCEN_NET_TIMEOUT</code></td>
                    <td><span class="badge badge-warning">Network</span></td>
                    <td>Downstream HTTP latency exceeds 5000ms socket timeout</td>
                    <td>Circuit breaker trips; fails fast with fallback response</td>
                  </tr>
                  <tr>
                    <td><code>SCEN_SERVICE_503</code></td>
                    <td><span class="badge badge-warning">Service</span></td>
                    <td>Upstream dependency returns HTTP 503 Unavailable</td>
                    <td>Jittered exponential backoff retry pattern</td>
                  </tr>
                  <tr>
                    <td><code>SCEN_DB_TIMEOUT</code></td>
                    <td><span class="badge badge-danger">Database</span></td>
                    <td>HikariCP connection pool exhaustion under lock contention</td>
                    <td>Fast-fail backpressure &amp; connection leak detection</td>
                  </tr>
                  <tr>
                    <td><code>SCEN_WORKER_CRASH</code></td>
                    <td><span class="badge badge-danger">Compute</span></td>
                    <td>SIGKILL on worker node mid-saga before event ack</td>
                    <td>Broker redelivers un-acked message to standby node</td>
                  </tr>
                  <tr>
                    <td><code>SCEN_DUP_MESSAGE</code></td>
                    <td><span class="badge badge-primary">Messaging</span></td>
                    <td>At-least-once broker redelivery of duplicate payload</td>
                    <td>Idempotency table suppresses duplicate side effects</td>
                  </tr>
                  <tr>
                    <td><code>SCEN_DELAYED_MESSAGE</code></td>
                    <td><span class="badge badge-primary">Messaging</span></td>
                    <td>45-minute broker queue delay due to consumer backpressure</td>
                    <td>Out-of-order state reconciliation &amp; TTL expiration</td>
                  </tr>
                  <tr>
                    <td><code>SCEN_OUT_OF_ORDER</code></td>
                    <td><span class="badge badge-primary">Messaging</span></td>
                    <td>Step 3 (Shipped) arrives before Step 2 (Paid)</td>
                    <td>Workflow engine buffers or rejects out-of-sequence event</td>
                  </tr>
                  <tr>
                    <td><code>SCEN_RETRY_STORM</code></td>
                    <td><span class="badge badge-warning">Resilience</span></td>
                    <td>50 workers simultaneously retry failing service without jitter</td>
                    <td>Decorrelated jitter backoff flattens load spikes</td>
                  </tr>
                  <tr>
                    <td><code>SCEN_POISON_MESSAGE</code></td>
                    <td><span class="badge badge-danger">Messaging</span></td>
                    <td>Malformed JSON payload causing Jackson deserialization error</td>
                    <td>Isolate malformed payload directly to DLQ without crashing</td>
                  </tr>
                  <tr>
                    <td><code>SCEN_DEAD_LETTER</code></td>
                    <td><span class="badge badge-danger">Queue</span></td>
                    <td>Message exhausts 5 retry attempts</td>
                    <td>Dead-letter queue alerting with diagnostic error metadata</td>
                  </tr>
                  <tr>
                    <td><code>SCEN_PARTIAL_SAGA_FAIL</code></td>
                    <td><span class="badge badge-danger">Workflow</span></td>
                    <td>Step 1 &amp; 2 succeed, Step 3 fails mid-orchestration</td>
                    <td>Compensating transactions cleanly rollback preceding steps</td>
                  </tr>
                  <tr>
                    <td><code>SCEN_PAYMENT_TIMEOUT</code></td>
                    <td><span class="badge badge-danger">Payment</span></td>
                    <td>Stripe charge times out with uncertain outcome</td>
                    <td>Pending reconciliation status checked against gateway ledger</td>
                  </tr>
                  <tr>
                    <td><code>SCEN_WEBHOOK_DUP</code></td>
                    <td><span class="badge badge-primary">Payment</span></td>
                    <td>Payment provider delivers webhook 3 times</td>
                    <td>Deduplicate on provider_event_id before processing</td>
                  </tr>
                  <tr>
                    <td><code>SCEN_WEBHOOK_DELAY</code></td>
                    <td><span class="badge badge-primary">Payment</span></td>
                    <td>Webhook arrives before browser return redirect</td>
                    <td>State journal handles concurrent race conditions gracefully</td>
                  </tr>
                  <tr>
                    <td><code>SCEN_DB_CONFLICT</code></td>
                    <td><span class="badge badge-warning">Database</span></td>
                    <td>Optimistic locking conflict on concurrent execution update</td>
                    <td>Automatic retry on OptimisticLockException with fresh read</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- 5. ANOMALY LAB TAB -->
          <section *ngIf="activeTab() === 'anomalies'" class="doc-section">
            <div class="section-badge-top">INTELLIGENT DETECTION</div>
            <h1>Anomaly Detection Rules</h1>
            <p class="lead">
              The platform inspects execution journals in real-time against 8 deterministic anti-pattern rules.
            </p>

            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Rule Code</th>
                    <th>Severity</th>
                    <th>Detection Logic</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>DUPLICATE_EVENT</code></td>
                    <td><span class="badge badge-warning">MEDIUM</span></td>
                    <td>Identical non-retry event type ingested multiple times for the same execution.</td>
                  </tr>
                  <tr>
                    <td><code>OUT_OF_ORDER_EVENT</code></td>
                    <td><span class="badge badge-danger">HIGH</span></td>
                    <td>Fulfillment/shipping events appearing before payment capture in the timeline.</td>
                  </tr>
                  <tr>
                    <td><code>EXCESSIVE_RETRIES</code></td>
                    <td><span class="badge badge-danger">HIGH</span></td>
                    <td>Individual step retry count exceeds threshold (&ge; 3 attempts).</td>
                  </tr>
                  <tr>
                    <td><code>DURATION_THRESHOLD</code></td>
                    <td><span class="badge badge-warning">MEDIUM</span></td>
                    <td>Execution elapsed duration exceeds configured SLO (e.g. &gt; 5000ms).</td>
                  </tr>
                  <tr>
                    <td><code>REPEATED_FAILURES</code></td>
                    <td><span class="badge badge-danger">CRITICAL</span></td>
                    <td>Execution ends with status FAILED or has &ge; 2 failed/dead-lettered events.</td>
                  </tr>
                  <tr>
                    <td><code>LONG_RUNNING_EXECUTION</code></td>
                    <td><span class="badge badge-warning">MEDIUM</span></td>
                    <td>Workflow has remained in RUNNING state for longer than max allowed duration.</td>
                  </tr>
                  <tr>
                    <td><code>MISSING_EVENT</code></td>
                    <td><span class="badge badge-danger">HIGH</span></td>
                    <td>Execution marked COMPLETED or FAILED without emitting any step events.</td>
                  </tr>
                  <tr>
                    <td><code>PAYMENT_INCONSISTENCY</code></td>
                    <td><span class="badge badge-danger">CRITICAL</span></td>
                    <td>Payment transactions debited after execution reached a failed terminal state.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- 6. FAQS TAB -->
          <section *ngIf="activeTab() === 'faq'" class="doc-section">
            <div class="section-badge-top">QUESTIONS &amp; ANSWERS</div>
            <h1>Frequently Asked Questions</h1>
            <p class="lead">Answers to common questions from novice developers and software architects.</p>

            <div class="faq-list">
              <div class="faq-item">
                <h4>Q: What is an "Invariant" in plain English?</h4>
                <p>
                  An invariant is a rule that must <strong>never be broken under any circumstances</strong>. For example: <em>"A customer should never be charged twice for one purchase"</em>, or <em>"Total refunded money can never exceed what was paid"</em>. In distributed systems, bugs often don't crash servers; instead, they silently break invariants (e.g. money disappearing or duplicate orders). This platform catches those exact violations.
                </p>
              </div>

              <div class="faq-item">
                <h4>Q: What is "Idempotency" and why does it matter?</h4>
                <p>
                  An operation is idempotent if doing it once has the same effect as doing it ten times. If your payment service receives the same "Charge $50" command twice (because the network flickered), an idempotent service charges $50 once and ignores the second attempt. This platform verifies that your services use idempotency keys correctly.
                </p>
              </div>

              <div class="faq-item">
                <h4>Q: Does this platform replace Temporal, Kafka, or RabbitMQ?</h4>
                <p>
                  No. It <strong>complements</strong> them. Temporal orchestrates steps; Kafka and RabbitMQ deliver messages. Workflow Reliability Lab acts as the <strong>verification and chaos testing lab</strong> that proves your sagas and message consumers behave correctly when bad things happen.
                </p>
              </div>

              <div class="faq-item">
                <h4>Q: How do I connect my existing Spring Boot or Python application?</h4>
                <p>
                  You can use our lightweight Java or Python SDK, or simply make standard HTTP POST calls to our REST API (<code>/api/v1/workspaces/&#123;id&#125;/events</code>) whenever a workflow step starts or finishes. You can also send standard OpenTelemetry spans directly.
                </p>
              </div>

              <div class="faq-item">
                <h4>Q: Can I use this without connecting any external systems?</h4>
                <p>
                  Yes! The platform includes a fully functional <strong>Failure Simulation Lab</strong> and <strong>Payment Simulator</strong> that generates realistic distributed workflows, chaos faults, and telemetry with zero setup.
                </p>
              </div>
            </div>
          </section>

          <!-- 7. PAYMENTS TAB -->
          <section *ngIf="activeTab() === 'payments'" class="doc-section">
            <div class="section-badge-top">FINANCIAL INTEGRITY</div>
            <h1>Payment Reliability Sandbox &amp; Ledger</h1>
            <p class="lead">Simulate payment gateways, 3D-Secure redirects, webhooks, and ledger reconciliation.</p>
            <p>
              Distributed financial flows are notoriously prone to double-charges and refund race conditions. The Payment Simulator module provides:
            </p>
            <ul>
              <li><strong>Idempotency Validation:</strong> Guarantees that repeating an initiation with the same <code>idempotency_key</code> returns the existing charge instead of creating a second debit.</li>
              <li><strong>Ceiling Safeguard:</strong> Automatically enforces <code>INV_REFUND_CEILING</code>. Any attempt to refund more than the captured charge amount is rejected with HTTP 422.</li>
              <li><strong>Ledger Reconciliation:</strong> Compares internal database transactions against provider settlement records to isolate currency drifts and uncaptured authorizations.</li>
            </ul>
          </section>

          <!-- 8. OVERVIEW TAB -->
          <section *ngIf="activeTab() === 'overview'" class="doc-section">
            <div class="section-badge-top">TECHNICAL BLUEPRINT</div>
            <h1>System Architecture</h1>
            <p class="lead">
              A high-concurrency architecture built with Java 21 Virtual Threads, Spring Boot 3.4.3, PostgreSQL 16, and Angular 22.
            </p>
            <div class="arch-box">
              <h3>Core Architectural Components</h3>
              <div class="pillars-preview-grid">
                <div class="p-card">
                  <h4>Virtual Threads (Project Loom)</h4>
                  <p>Handles thousands of concurrent telemetry ingest connections with near-zero memory footprint on Spring Boot 3.4.3.</p>
                </div>
                <div class="p-card">
                  <h4>PostgreSQL 16 JSONB</h4>
                  <p>Hybrid relational and document storage for flexible OpenTelemetry span attributes and violation evidence journaling.</p>
                </div>
                <div class="p-card">
                  <h4>Flyway Schema Migrations</h4>
                  <p>19 versioned SQL migrations defining tenant workspaces, scenarios, invariants, and audit trails.</p>
                </div>
                <div class="p-card">
                  <h4>Angular 22 Signals</h4>
                  <p>Reactive state management with zero external store dependencies for sub-millisecond UI rendering.</p>
                </div>
              </div>
            </div>
          </section>

          <!-- 9. AUTH TAB -->
          <section *ngIf="activeTab() === 'auth'" class="doc-section">
            <div class="section-badge-top">SECURITY &amp; COMPLIANCE</div>
            <h1>Authentication &amp; API Keys</h1>
            <p class="lead">Every API call is securely scoped to a workspace and protected using cryptographically secure tokens.</p>
            <h3>1. Machine-to-Machine Integration with API Keys</h3>
            <p>Generate high-entropy workspace API keys with prefix <code>wrl_</code>. Keys are hashed with SHA-256 before storage in the database.</p>
            <pre class="code-block font-mono"><code>curl -X POST http://localhost:8085/api/v1/workspaces/&#123;id&#125;/events &#92;
  -H "X-API-Key: wrl_live_8f7b249a0c1e84d6b..." &#92;
  -H "Content-Type: application/json" &#92;
  -d '&#123; "executionId": "exec_01", "eventType": "ORDER_SUBMITTED" &#125;'</code></pre>
            <h3>2. User Session Authentication</h3>
            <p>Interactive browser sessions use short-lived JWT access tokens accompanied by rotating HTTP-only, SameSite refresh cookies. Passwords are encrypted with BCrypt.</p>
          </section>

          <!-- 10. INGESTION TAB -->
          <section *ngIf="activeTab() === 'ingestion'" class="doc-section">
            <div class="section-badge-top">TELEMETRY INGEST</div>
            <h1>Event &amp; Trace Ingestion</h1>
            <p class="lead">Stream workflow lifecycle events and OpenTelemetry spans into the durable journal.</p>
            <h3>Event Ingestion Endpoint</h3>
            <pre class="code-block font-mono"><code>POST /api/v1/workspaces/&#123;id&#125;/events
Content-Type: application/json

&#123;
  "executionId": "exec_pay_01",
  "eventType": "PAYMENT_ATTEMPTED",
  "sourceService": "payment-service",
  "idempotencyKey": "idem_pay_89124_att1"
&#125;</code></pre>
            <h3>OpenTelemetry Single Span Ingest</h3>
            <pre class="code-block font-mono"><code>POST /api/v1/workspaces/&#123;id&#125;/traces/spans
Content-Type: application/json

&#123;
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "00f067aa0ba902b7",
  "serviceName": "payment-service",
  "name": "POST /charge",
  "statusCode": "OK",
  "startTimeUs": 1730300000000000,
  "endTimeUs": 1730300000045000
&#125;</code></pre>
          </section>

          <!-- 11. JAVA SDK TAB -->
          <section *ngIf="activeTab() === 'java-sdk'" class="doc-section">
            <div class="section-badge-top">OFFICIAL SDK</div>
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

          <!-- 12. PYTHON SDK TAB -->
          <section *ngIf="activeTab() === 'python-sdk'" class="doc-section">
            <div class="section-badge-top">OFFICIAL SDK</div>
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

          <!-- 13. RABBITMQ TAB -->
          <section *ngIf="activeTab() === 'rabbitmq'" class="doc-section">
            <div class="section-badge-top">MESSAGE BROKER</div>
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
      height: 65px;
      border-bottom: 1px solid var(--border);
      background-color: rgba(17, 24, 39, 0.95);
      backdrop-filter: blur(8px);
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
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .brand-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 700;
      color: var(--text-primary);
      text-decoration: none;
      font-size: 1.05rem;
    }
    .header-divider {
      color: var(--text-muted);
    }
    .header-sub {
      color: var(--accent-cyan);
      font-size: 0.9rem;
      font-weight: 500;
    }
    .header-nav {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .docs-container {
      display: flex;
      gap: 2.5rem;
      padding-top: 2rem;
      padding-bottom: 4rem;
    }
    .docs-sidebar {
      width: 260px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      position: sticky;
      top: 85px;
      height: calc(100vh - 105px);
      overflow-y: auto;
      padding-right: 0.5rem;
    }
    .docs-nav-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .group-title {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 0.35rem;
      padding-left: 0.5rem;
    }
    .nav-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      text-align: left;
      padding: 0.5rem 0.75rem;
      background: transparent;
      border: 1px solid transparent;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    .nav-btn:hover {
      background: var(--bg-card);
      color: var(--text-primary);
    }
    .nav-btn.active {
      background: rgba(59, 130, 246, 0.12);
      border-color: rgba(59, 130, 246, 0.3);
      color: var(--accent-blue);
      font-weight: 600;
    }
    .tab-icon {
      font-size: 0.95rem;
    }
    .docs-content {
      flex: 1;
      min-width: 0;
      max-width: 900px;
    }
    .section-badge-top {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--accent-blue);
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }
    .doc-section h1 {
      font-size: 2.15rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 0.75rem;
    }
    .doc-section .lead {
      font-size: 1.1rem;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .guide-card {
      display: flex;
      gap: 1.5rem;
      padding: 1.75rem;
      border-radius: var(--radius-lg);
      margin-bottom: 1.5rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
    }
    .trap-card {
      border-color: rgba(239, 68, 68, 0.3);
      background: radial-gradient(circle at top left, rgba(239, 68, 68, 0.05) 0%, var(--bg-card) 70%);
    }
    .solution-card {
      border-color: rgba(6, 182, 212, 0.3);
      background: radial-gradient(circle at top left, rgba(6, 182, 212, 0.05) 0%, var(--bg-card) 70%);
    }
    .card-icon {
      font-size: 2rem;
      line-height: 1;
    }
    .danger-list {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      margin-top: 0.75rem;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    .danger-list strong {
      color: #fca5a5;
    }
    .workflow-flow-diagram {
      background: var(--bg-secondary);
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.8rem;
      color: var(--accent-cyan);
      margin: 0.75rem 0;
      overflow-x: auto;
    }
    .capabilities-quad {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-top: 1rem;
    }
    .cap-box {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1rem;
    }
    .cap-box strong {
      display: block;
      color: var(--accent-cyan);
      margin-bottom: 0.25rem;
    }
    .cap-box p {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin: 0;
    }
    .walkthrough-steps {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .step-card {
      display: flex;
      gap: 1.5rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.75rem;
    }
    .step-number {
      font-size: 2rem;
      font-weight: 800;
      color: var(--accent-blue);
      line-height: 1;
      opacity: 0.8;
    }
    .step-content h3 {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .step-content p, .step-content ul {
      color: var(--text-secondary);
      font-size: 0.9rem;
      line-height: 1.6;
    }
    .cred-pill {
      display: flex;
      gap: 1.5rem;
      background: var(--bg-secondary);
      padding: 0.6rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.8rem;
      color: var(--accent-green);
      margin: 0.75rem 0;
      flex-wrap: wrap;
    }
    .step-tip {
      font-size: 0.85rem !important;
      color: var(--accent-cyan) !important;
      margin-top: 0.5rem;
    }
    .example-box {
      background: var(--bg-secondary);
      border-left: 3px solid var(--accent-cyan);
      padding: 1rem;
      border-radius: 0 var(--radius-md) var(--radius-md) 0;
      margin-top: 0.75rem;
      font-size: 0.85rem;
    }
    .example-box ol {
      margin-top: 0.5rem;
      padding-left: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .invariants-detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 1.5rem;
    }
    .inv-detail-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .inv-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .inv-id {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--accent-purple);
      font-family: monospace;
    }
    .inv-tag {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-full);
      text-transform: uppercase;
    }
    .inv-tag.red { background: rgba(239, 68, 68, 0.15); color: #f87171; }
    .inv-tag.purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
    .inv-tag.blue { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
    .inv-tag.yellow { background: rgba(234, 179, 8, 0.15); color: #facc15; }
    .inv-tag.cyan { background: rgba(6, 182, 212, 0.15); color: #22d3ee; }
    .inv-detail-card h3 {
      font-size: 1.15rem;
      font-weight: 700;
      margin: 0;
    }
    .inv-detail-card p {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.5;
      margin: 0;
    }
    .inv-formula {
      font-size: 0.8rem;
      padding: 0.4rem 0.65rem;
      background: var(--bg-secondary);
      border-radius: var(--radius-sm);
      border-left: 3px solid var(--accent-purple);
      color: var(--accent-cyan);
    }
    .faq-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .faq-item {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1.5rem;
    }
    .faq-item h4 {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }
    .faq-item p {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0;
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
    .status-yes { color: #4ade80; font-weight: 600; }
    .status-no { color: #f87171; }
    .status-neutral { color: #94a3b8; }
    .arch-box {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      margin: 1.5rem 0;
    }
    .pillars-preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .p-card {
      background: var(--bg-secondary);
      padding: 1rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
    }
    .p-card h4 {
      font-size: 0.95rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
      color: var(--accent-blue);
    }
    .p-card p {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.5;
    }
    @media (max-width: 900px) {
      .docs-container {
        flex-direction: column;
      }
      .docs-sidebar {
        width: 100%;
        position: static;
        height: auto;
      }
      .capabilities-quad, .invariants-detail-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DocsComponent implements OnInit {
  route = inject(ActivatedRoute);
  activeTab = signal<DocTab>('portal-guide');

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const tab = params.get('tab') as DocTab;
      if (tab) {
        this.activeTab.set(tab);
      }
    });
  }

  setTab(tab: DocTab) {
    this.activeTab.set(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
