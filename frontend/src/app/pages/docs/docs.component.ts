import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

type DocTab = 
  | 'portal-guide'
  | 'walkthrough'
  | 'real-life'
  | 'publishing'
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
            <button class="nav-btn" [class.active]="activeTab() === 'real-life'" (click)="setTab('real-life')">
              <span class="tab-icon">🏢</span> Real-Life Customer Playbook
            </button>
            <button class="nav-btn" [class.active]="activeTab() === 'publishing'" (click)="setTab('publishing')">
              <span class="tab-icon">🚀</span> Go-to-Market &amp; Deploy Now
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

          <!-- REAL-LIFE CUSTOMER PLAYBOOK TAB -->
          <section *ngIf="activeTab() === 'real-life'" class="doc-section">
            <div class="section-badge-top">REAL-WORLD PRODUCTION USE CASES</div>
            <h1>Real-Life Scenarios, Customer Questions &amp; Adoption Playbook</h1>
            <p class="lead">
              How engineering teams use Workflow Reliability Lab to eliminate silent double-charges, out-of-order race conditions, and catastrophic saga failures before they impact customers.
            </p>

            <div class="real-life-grid">
              <!-- Real Scenario 1 -->
              <div class="case-study-card">
                <div class="case-study-header">
                  <span class="case-badge ecom">E-COMMERCE SURGE</span>
                  <h3>Scenario 1: Black Friday Flash Sale — Preventing Double Charges &amp; Ghost Retries</h3>
                </div>
                <div class="case-study-body">
                  <div class="case-part">
                    <strong>The Failure:</strong>
                    <p>
                      High database load causes Payment Gateway responses to slow down to 5,200 ms. The browser HTTP client times out at 5,000 ms and prompts the user to "Retry". The customer clicks Pay again. Meanwhile, the first charge actually succeeded in Stripe 200 ms after the client gave up. Simultaneously, a Kafka broker rebalance duplicates the <code>OrderCreated</code> event to the inventory service.
                    </p>
                  </div>
                  <div class="case-part">
                    <strong>The Customer Impact:</strong>
                    <p>
                      Customer is charged $150.00 twice ($300.00 total). Inventory is decremented twice for 1 order, creating an artificial stockout and cancelled orders for other customers. Company incurs credit card dispute fees and customer churn.
                    </p>
                  </div>
                  <div class="case-part highlight">
                    <strong>How WRL Detects &amp; Solves It:</strong>
                    <p>
                      In pre-production staging, the team runs <code>SCEN_PAYMENT_TIMEOUT</code> and <code>SCEN_DUP_MESSAGE</code>. WRL immediately raises an <code>INV_NO_DOUBLE_CHARGE</code> violation and flags <code>DUPLICATE_EVENT</code> on inventory. Engineers adopt cart-hash idempotency keys and transactional inboxes before launching the sale!
                    </p>
                  </div>
                </div>
              </div>

              <!-- Real Scenario 2 -->
              <div class="case-study-card">
                <div class="case-study-header">
                  <span class="case-badge fintech">FINTECH &amp; PAYMENTS</span>
                  <h3>Scenario 2: Excess Refunds &amp; Silent Ledger Drift</h3>
                </div>
                <div class="case-study-body">
                  <div class="case-part">
                    <strong>The Failure:</strong>
                    <p>
                      A customer returns an expensive $1,200.00 item. A support agent approves a $300.00 goodwill concession while the automated return warehouse worker approves a $1,200.00 refund simultaneously. Due to lack of distributed locking, both workers read the captured amount ($1,200.00) and approve their respective refunds concurrently.
                    </p>
                  </div>
                  <div class="case-part">
                    <strong>The Customer Impact:</strong>
                    <p>
                      $300.00 + $1,200.00 = <strong>$1,500.00 refunded on a $1,200.00 charge</strong>! The business loses $300.00 of hard capital directly from their merchant bank balance. Internal ledger balances drift out of compliance with financial regulators.
                    </p>
                  </div>
                  <div class="case-part highlight">
                    <strong>How WRL Detects &amp; Solves It:</strong>
                    <p>
                      WRL's <code>INV_REFUND_CEILING</code> evaluates every payment event against the mathematical assertion: <code>Sum(Refunds) &lt;= CapturedAmount</code>. The excess refund is blocked with cryptographic audit logging, and automated alerts are fired to Slack/PagerDuty via outgoing webhooks.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Real Scenario 3 -->
              <div class="case-study-card">
                <div class="case-study-header">
                  <span class="case-badge logistics">LOGISTICS &amp; IOT</span>
                  <h3>Scenario 3: Out-of-Order Webhooks &amp; State Inversion</h3>
                </div>
                <div class="case-study-body">
                  <div class="case-part">
                    <strong>The Failure:</strong>
                    <p>
                      A courier delivers a package inside an underground garage with no cell reception. The mobile app buffers the <code>PACKAGE_PICKED_UP</code> event. When emerging into 5G coverage, the subsequent <code>PACKAGE_DELIVERED</code> event transmits first, and the buffered pickup event arrives 5 seconds later.
                    </p>
                  </div>
                  <div class="case-part">
                    <strong>The Customer Impact:</strong>
                    <p>
                      The order state machine receives <code>DELIVERED</code> while in the initial state, throwing an unhandled <code>IllegalStateException</code>. The courier cannot accept future assignments, and the customer receives an SMS saying "Your order is picked up" after already receiving the goods.
                    </p>
                  </div>
                  <div class="case-part highlight">
                    <strong>How WRL Detects &amp; Solves It:</strong>
                    <p>
                      WRL's Anomaly Engine detects <code>OUT_OF_ORDER_EVENT</code> and flags <code>INV_NO_DUP_TRANSITION</code>. The execution timeline visualizes the inverted sequence, recommending sequence versioning or Lamport clocks.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Real Scenario 4 -->
              <div class="case-study-card">
                <div class="case-study-header">
                  <span class="case-badge arch">ARCHITECTURE MIGRATION</span>
                  <h3>Scenario 4: Monolith Decomposition &amp; Saga Compensation Failure</h3>
                </div>
                <div class="case-study-body">
                  <div class="case-part">
                    <strong>The Failure:</strong>
                    <p>
                      A company migrates an ACID monolith transaction to a distributed Saga across Order, Payment, and Shipping microservices. During execution, Step 3 (Shipping) encounters an out-of-memory error. The compensating transaction to refund the customer fails silently due to a dead-letter queue misconfiguration.
                    </p>
                  </div>
                  <div class="case-part">
                    <strong>The Customer Impact:</strong>
                    <p>
                      Customer was charged, no order was fulfilled, and no refund was issued. The customer must contact support to discover why their money disappeared.
                    </p>
                  </div>
                  <div class="case-part highlight">
                    <strong>How WRL Detects &amp; Solves It:</strong>
                    <p>
                      WRL monitors distributed trace spans and flags <code>INV_SAGA_COMPENSATION</code> when a failed step is not followed by expected compensating transactions within the configured SLA window. An Incident is automatically declared with AI root-cause diagnosis.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Customer Questions Answered -->
            <div class="faq-accordion-box mt-4">
              <h2 class="sub-h2">Frequently Asked Customer &amp; Executive Questions</h2>
              
              <div class="faq-item-card">
                <h4>Q: "We already have Datadog, Grafana, and Sentry. Why do we need Workflow Reliability Lab?"</h4>
                <p>
                  <strong>APMs monitor infrastructure health; WRL verifies business correctness.</strong><br>
                  Datadog tells you CPU is at 80% or that an HTTP endpoint is slow. Sentry tells you an unhandled exception occurred. Neither system understands business invariants: they cannot tell you that a customer was charged twice, that a refund exceeded the captured amount, or that an event was dropped. WRL bridges this gap with deterministic invariant verification and chaos simulation.
                </p>
              </div>

              <div class="faq-item-card">
                <h4>Q: "Do we need to rewrite our services or databases to use this?"</h4>
                <p>
                  <strong>No. WRL is 100% non-invasive.</strong><br>
                  You can use WRL purely as a pre-production chaos testbed without modifying any production code. When ready for telemetry, you can simply point your existing OpenTelemetry exporter (1 line of configuration) to WRL or emit lightweight events using our Java or Python SDKs.
                </p>
              </div>

              <div class="faq-item-card">
                <h4>Q: "What is the concrete business ROI?"</h4>
                <p>
                  Preventing a single Black Friday double-charge or excess refund glitch saves tens of thousands in capital loss, dispute fees, and customer support costs. Furthermore, mean time to diagnosis (MTTD) for complex distributed systems incidents drops from days to minutes.
                </p>
              </div>

              <div class="faq-item-card">
                <h4>Q: "What is our team's adoption path from Day 1 to Production?"</h4>
                <div class="steps-mini-grid">
                  <div class="mini-step">
                    <span class="badge badge-info">STAGE 1: DAY 1</span>
                    <strong>Zero-Code Chaos Sandbox</strong>
                    <p>Run 15 chaos scenarios in WRL to train engineers on distributed systems failure modes.</p>
                  </div>
                  <div class="mini-step">
                    <span class="badge badge-warning">STAGE 2: WEEK 1</span>
                    <strong>Shadow Telemetry Ingest</strong>
                    <p>Route OpenTelemetry trace spans and webhook events to WRL API keys from staging.</p>
                  </div>
                  <div class="mini-step">
                    <span class="badge badge-success">STAGE 3: WEEK 2</span>
                    <strong>Automated CI/CD Quality Gate</strong>
                    <p>Add WRL invariant assertions to GitHub Actions. Block PR merges if invariant violations occur!</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- PUBLISHING & GO-TO-MARKET RUNBOOK TAB -->
          <section *ngIf="activeTab() === 'publishing'" class="doc-section">
            <div class="section-badge-top">PRODUCTION DEPLOYMENT RUNBOOK</div>
            <h1>How to Publish &amp; Deploy Workflow Reliability Lab Right Now</h1>
            <p class="lead">
              A comprehensive blueprint for publishing this platform to a live production environment with high availability, SSL encryption, and enterprise security.
            </p>

            <!-- Production Architecture -->
            <div class="guide-card trap-card">
              <div class="card-icon cyan-glow">🏛️</div>
              <div class="card-body">
                <h3>Production Architecture Blueprint</h3>
                <p>Workflow Reliability Lab is engineered as a cloud-native, 12-factor distributed system:</p>
                <ul>
                  <li><strong>Frontend:</strong> Angular 22 Single Page App compiled to static assets, served via high-performance Nginx with HTTP/2 and Brotli/gzip compression.</li>
                  <li><strong>Backend:</strong> Spring Boot 3.4.3 container running on Java 21 with Virtual Threads (Project Loom) for high-throughput asynchronous execution.</li>
                  <li><strong>Database:</strong> Managed PostgreSQL 16 (AWS RDS, GCP Cloud SQL, or Supabase) with HikariCP connection pooling and JSONB indexing.</li>
                  <li><strong>Security &amp; Edge:</strong> Nginx / Cloudflare reverse proxy with automated Let's Encrypt TLS 1.3 encryption and HSTS headers.</li>
                </ul>
              </div>
            </div>

            <!-- Option 1: Docker Compose -->
            <div class="deploy-code-box mt-3">
              <h3>Option A: Instant Production Deployment via Docker Compose</h3>
              <p>Save this configuration as <code>docker-compose.prod.yml</code> on your production host:</p>
              <pre class="code-block font-mono"><code>version: '3.8'

services:
  wrl-postgres:
    image: postgres:16-alpine
    container_name: wrl-postgres-prod
    restart: always
    environment:
      POSTGRES_DB: workflow_reliability_lab
      POSTGRES_USER: wrl_user
      POSTGRES_PASSWORD: $&#123;DB_PASSWORD:-StrongSecurePassword2026!&#125;
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U wrl_user -d workflow_reliability_lab"]
      interval: 5s
      timeout: 5s
      retries: 5

  wrl-backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: wrl-backend-prod
    restart: always
    depends_on:
      wrl-postgres:
        condition: service_healthy
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:postgresql://wrl-postgres:5432/workflow_reliability_lab
      SPRING_DATASOURCE_USERNAME: wrl_user
      SPRING_DATASOURCE_PASSWORD: $&#123;DB_PASSWORD:-StrongSecurePassword2026!&#125;
      JWT_SECRET: $&#123;JWT_SECRET:-9vA4bC8...secureProductionSecretKey64CharsMin&#125;
      CORS_ALLOWED_ORIGINS: "https://wrl.yourcompany.com"
      SERVER_PORT: 8085

  wrl-frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: wrl-frontend-prod
    restart: always
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - wrl-backend
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro

volumes:
  postgres_prod_data:</code></pre>
            </div>

            <!-- Production Nginx Conf -->
            <div class="deploy-code-box mt-3">
              <h3>Production Nginx Reverse Proxy Configuration (<code>nginx.conf</code>)</h3>
              <pre class="code-block font-mono"><code>server &#123;
    listen 80;
    server_name wrl.yourcompany.com;
    return 301 https://$host$request_uri;
&#125;

server &#123;
    listen 443 ssl http2;
    server_name wrl.yourcompany.com;

    ssl_certificate /etc/letsencrypt/live/wrl.yourcompany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wrl.yourcompany.com/privkey.pem;

    root /usr/share/nginx/html;
    index index.html;

    # Angular SPA Route Fallback
    location / &#123;
        try_files $uri $uri/ /index.html;
    &#125;

    # Backend REST API Proxy
    location /api/ &#123;
        proxy_pass http://wrl-backend:8085;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    &#125;
&#125;</code></pre>
            </div>

            <!-- Option 2: Cloud Run -->
            <div class="deploy-code-box mt-3">
              <h3>Option B: Cloud-Native Serverless (Google Cloud Run &amp; Cloud SQL)</h3>
              <p>Deploy in 2 commands with automatic horizontal autoscaling:</p>
              <pre class="code-block font-mono"><code># 1. Build &amp; Deploy Backend Container
gcloud run deploy wrl-backend \
  --image gcr.io/my-project/wrl-backend \
  --platform managed \
  --region us-central1 \
  --add-cloudsql-instances my-project:us-central1:wrl-db \
  --set-env-vars "SPRING_DATASOURCE_URL=jdbc:postgresql:///workflow_reliability_lab?cloudSqlInstance=my-project:us-central1:wrl-db&amp;socketFactory=com.google.cloud.sql.postgres.SocketFactory,SPRING_DATASOURCE_USERNAME=postgres,SPRING_DATASOURCE_PASSWORD=secret"

# 2. Deploy Frontend Static Container
gcloud run deploy wrl-frontend \
  --image gcr.io/my-project/wrl-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated</code></pre>
            </div>

            <!-- Production Checklist -->
            <div class="checklist-card mt-3">
              <h3>Production Pre-Flight Security Checklist</h3>
              <div class="check-grid">
                <div class="check-item">
                  <span class="check-icon">✓</span>
                  <div>
                    <strong>Cryptographic JWT Secret:</strong> Set a 512-bit random secret in <code>JWT_SECRET</code>.
                  </div>
                </div>
                <div class="check-item">
                  <span class="check-icon">✓</span>
                  <div>
                    <strong>CORS Lockdown:</strong> Set <code>CORS_ALLOWED_ORIGINS</code> strictly to your production domain.
                  </div>
                </div>
                <div class="check-item">
                  <span class="check-icon">✓</span>
                  <div>
                    <strong>Database Credentials:</strong> Use managed Cloud SQL / RDS with SSL connection strings.
                  </div>
                </div>
                <div class="check-item">
                  <span class="check-icon">✓</span>
                  <div>
                    <strong>API Key Security:</strong> Only SHA-256 hashes are stored in the database; raw keys are displayed once.
                  </div>
                </div>
                <div class="check-item">
                  <span class="check-icon">✓</span>
                  <div>
                    <strong>Audit Logging:</strong> All administrative and simulation actions are logged to immutable journals.
                  </div>
                </div>
                <div class="check-item">
                  <span class="check-icon">✓</span>
                  <div>
                    <strong>TLS 1.3 &amp; HSTS:</strong> All HTTP traffic is redirected to HTTPS with security headers enabled.
                  </div>
                </div>
              </div>
            </div>
          </section>
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
    .real-life-grid {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-top: 1.5rem;
    }
    .case-study-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .case-study-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .case-study-header h3 {
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0;
    }
    .case-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-sm);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .case-badge.ecom {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .case-badge.fintech {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .case-badge.logistics {
      background: rgba(59, 130, 246, 0.15);
      color: #3b82f6;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }
    .case-badge.arch {
      background: rgba(139, 92, 246, 0.15);
      color: #8b5cf6;
      border: 1px solid rgba(139, 92, 246, 0.3);
    }
    .case-study-body {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .case-part {
      font-size: 0.85rem;
      line-height: 1.6;
    }
    .case-part strong {
      color: var(--text-primary);
      display: block;
      margin-bottom: 0.25rem;
    }
    .case-part p {
      color: var(--text-secondary);
      margin: 0;
    }
    .case-part.highlight {
      background: rgba(6, 182, 212, 0.06);
      border-left: 3px solid var(--accent-cyan);
      padding: 0.75rem 1rem;
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    }
    .case-part.highlight p {
      color: var(--text-primary);
    }
    .faq-accordion-box {
      margin-top: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .sub-h2 {
      font-size: 1.3rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .faq-item-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1.25rem;
    }
    .faq-item-card h4 {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--accent-blue);
      margin-bottom: 0.5rem;
    }
    .faq-item-card p {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.6;
    }
    .steps-mini-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-top: 0.75rem;
    }
    .mini-step {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .mini-step strong {
      font-size: 0.85rem;
    }
    .mini-step p {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin: 0;
    }
    .deploy-code-box {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      margin-top: 1.5rem;
    }
    .deploy-code-box h3 {
      font-size: 1.05rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .checklist-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      margin-top: 1.5rem;
    }
    .checklist-card h3 {
      font-size: 1.05rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    .check-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
    .check-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      font-size: 0.85rem;
      line-height: 1.5;
    }
    .check-icon {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .mt-3 {
      margin-top: 1.25rem;
    }
    .mt-4 {
      margin-top: 2rem;
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
      .capabilities-quad, .invariants-detail-grid, .steps-mini-grid, .check-grid {
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
