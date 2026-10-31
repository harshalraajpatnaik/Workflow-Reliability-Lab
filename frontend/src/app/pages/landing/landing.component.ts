import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-page">
      <!-- Header -->
      <header class="landing-header">
        <div class="container header-container">
          <div class="brand">
            <div class="brand-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" stroke="var(--accent-blue)" />
                <polyline points="2 17 12 22 22 17" stroke="var(--accent-cyan)" />
                <polyline points="2 12 12 17 22 12" stroke="var(--accent-purple)" />
              </svg>
            </div>
            <span class="brand-name">Workflow Reliability Lab</span>
          </div>
          <nav class="header-nav">
            <a href="#pillars" (click)="scrollTo('pillars', $event)">Capabilities</a>
            <a href="#scenarios" (click)="scrollTo('scenarios', $event)">Scenarios</a>
            <a href="#invariants" (click)="scrollTo('invariants', $event)">Invariants</a>
            <a routerLink="/docs">Docs</a>
            <a href="http://localhost:8085/swagger-ui/index.html" target="_blank">OpenAPI</a>
          </nav>
          <div class="header-actions">
            <a routerLink="/login" class="btn btn-secondary btn-sm">Sign In</a>
            <a routerLink="/register" class="btn btn-primary btn-sm">Get Started Free</a>
          </div>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container hero-container">
          <div class="hero-badge">
            <span class="badge-dot"></span>
            <span>Deterministic Workflow Resilience & Observability Platform</span>
          </div>
          <h1 class="hero-title">
            Test, Diagnose & Prove the Correctness of
            <span class="gradient-text">Asynchronous Distributed Workflows</span>
          </h1>
          <p class="hero-subtitle">
            Workflow Reliability Lab empowers distributed systems engineers to observe end-to-end execution journeys, inject real-world failure patterns, verify formal business invariants, and diagnose incidents with evidence-backed postmortems.
          </p>

          <div class="hero-cta">
            <a routerLink="/login" class="btn btn-primary btn-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Launch Reliability Lab</span>
            </a>
            <a routerLink="/docs" class="btn btn-secondary btn-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              <span>Explore Platform Docs</span>
            </a>
          </div>

          <!-- Quick Terminal Preview -->
          <div class="terminal-preview">
            <div class="terminal-bar">
              <div class="terminal-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <span class="terminal-title">wrl-cli simulation --scenario SCEN_PAYMENT_TIMEOUT --env Simulation</span>
            </div>
            <pre class="terminal-body font-mono">
<code><span class="token-cyan">➜</span> <span class="token-blue">POST</span> /api/v1/workspaces/4c2dd3fa.../scenarios/SCEN_PAYMENT_TIMEOUT/run
<span class="token-green">✓</span> <span class="token-muted">Spawned execution:</span> <span class="token-yellow">exec_pay_sim_9a7e1</span> [Workflow: order-fulfillment-saga]
<span class="token-purple">⚡ Fault Injected:</span> Upstream Gateway Read Timeout (4500ms delay, HTTP 504)
<span class="token-cyan">ℹ Event Journal:</span> 6 state transitions recorded with idempotency keys
<span class="token-red">⚠ Anomaly Detected:</span> REPEATED_FAILURES (Severity: HIGH, Evidence: 3 timeouts in 12s)
<span class="token-red">✗ Invariant Violation:</span> INV-004 Payment Ledger Balance Mismatch ($150.00 un-settled)
<span class="token-green">✓ Auto-Diagnosis:</span> Root cause isolated to PaymentGatewayClient timeout setting</code>
            </pre>
          </div>
        </div>
      </section>

      <!-- 4 Pillars Section -->
      <section id="pillars" class="pillars-section">
        <div class="container">
          <div class="section-heading text-center">
            <span class="badge badge-primary">FOUR RELIABILITY PILLARS</span>
            <h2>Complete Control Over Workflow Asynchrony</h2>
            <p>Designed to complement Temporal, Kafka, RabbitMQ, Sentry, and OpenTelemetry without vendor lock-in.</p>
          </div>

          <div class="pillars-grid">
            <div class="pillar-card">
              <div class="pillar-icon bg-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <h3>1. Execution Observability</h3>
              <p>Correlate distributed events, microsecond-accurate trace spans, and live dependency graphs across asynchronous queues and microservices.</p>
              <ul class="pillar-features">
                <li>Durable event journal with idempotency keys</li>
                <li>W3C Trace Context & OpenTelemetry span waterfall</li>
                <li>Interactive service dependency graph</li>
                <li>Execution state machine timelines</li>
              </ul>
            </div>

            <div class="pillar-card">
              <div class="pillar-icon bg-yellow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
              <h3>2. Failure Simulation Lab</h3>
              <p>15 battle-tested failure scenarios ready out of the box. Inject network partitions, deadlocks, out-of-order events, and duplicate deliveries.</p>
              <ul class="pillar-features">
                <li>Deterministic chaos injection & fault configuration</li>
                <li>Saga compensation failure testing</li>
                <li>Dead-letter queue backpressure simulations</li>
                <li>Isolated sandbox environments</li>
              </ul>
            </div>

            <div class="pillar-card">
              <div class="pillar-icon bg-purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3>3. Deterministic Invariants</h3>
              <p>Mathematically verify business invariants on every workflow execution. Catch silent data corruption before customer transactions fail.</p>
              <ul class="pillar-features">
                <li>8 core invariant checks (Ledger balance, terminal state, refund ceiling)</li>
                <li>Strict idempotency & duplicate webhook prevention</li>
                <li>Valid state transition matrix enforcement</li>
                <li>Continuous invariant scorecards</li>
              </ul>
            </div>

            <div class="pillar-card">
              <div class="pillar-icon bg-cyan">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h3>4. Incident Investigation</h3>
              <p>Turn mysterious intermittent failures into documented incident postmortems with evidence timelines and actionable remediations.</p>
              <ul class="pillar-features">
                <li>Automated rule-based & AI root-cause diagnosis</li>
                <li>One-click Markdown postmortem generation</li>
                <li>Direct linking of traces, anomalies, and logs</li>
                <li>Historical incident search & team collaboration</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Scenarios Highlight -->
      <section id="scenarios" class="scenarios-section">
        <div class="container">
          <div class="section-heading text-center">
            <span class="badge badge-warning">BUILT-IN SCENARIOS</span>
            <h2>15 Pre-Engineered Distributed Failure Scenarios</h2>
            <p>Simulate the exact edge cases that wake up on-call engineers at 3 AM.</p>
          </div>

          <div class="scenarios-list">
            <div class="scenario-badge-item">
              <span class="scenario-code font-mono">SCEN_NET_TIMEOUT</span>
              <span class="scenario-name">Gateway Network Timeout & Retry Storm</span>
            </div>
            <div class="scenario-badge-item">
              <span class="scenario-code font-mono">SCEN_DUP_EVENT</span>
              <span class="scenario-name">Duplicate Webhook Delivery & At-Least-Once Replay</span>
            </div>
            <div class="scenario-badge-item">
              <span class="scenario-code font-mono">SCEN_OUT_OF_ORDER</span>
              <span class="scenario-name">Out-of-Order Asynchronous Event Processing</span>
            </div>
            <div class="scenario-badge-item">
              <span class="scenario-code font-mono">SCEN_SAGA_COMP_FAIL</span>
              <span class="scenario-name">Distributed Saga Partial Failure & Compensation Rollback</span>
            </div>
            <div class="scenario-badge-item">
              <span class="scenario-code font-mono">SCEN_OVER_REFUND</span>
              <span class="scenario-name">Concurrent Refund Race Condition & Ceiling Bypass</span>
            </div>
            <div class="scenario-badge-item">
              <span class="scenario-code font-mono">SCEN_DLQ_POISON</span>
              <span class="scenario-name">Poison Message Dead-Letter Queue Flooding</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Invariants Highlight -->
      <section id="invariants" class="invariants-section">
        <div class="container">
          <div class="section-heading text-center">
            <span class="badge badge-purple">DETERMINISTIC INVARIANTS</span>
            <h2>8 Mathematical Business Rules Verified in Real-Time</h2>
            <p>Non-negotiable correctness rules verified automatically across every execution journal.</p>
          </div>

          <div class="invariants-grid">
            <div class="inv-card">
              <div class="inv-header">
                <span class="inv-code font-mono">INV_NO_DOUBLE_CHARGE</span>
                <span class="inv-badge green">CRITICAL</span>
              </div>
              <h4 class="inv-title">Zero Double-Charge Guarantee</h4>
              <p class="inv-desc">Guarantees that a customer is never billed more than once for a single checkout session, even under duplicate event replays.</p>
              <div class="inv-formula font-mono">&sum; ChargeEvents(e) &le; 1</div>
            </div>

            <div class="inv-card">
              <div class="inv-header">
                <span class="inv-code font-mono">INV_REFUND_CEILING</span>
                <span class="inv-badge green">CRITICAL</span>
              </div>
              <h4 class="inv-title">Refund Ceiling Enforcement</h4>
              <p class="inv-desc">Mathematical assertion ensuring total refunded capital never exceeds the actual captured transaction amount.</p>
              <div class="inv-formula font-mono">&sum; Refunds &le; &sum; Captured</div>
            </div>

            <div class="inv-card">
              <div class="inv-header">
                <span class="inv-code font-mono">INV_NO_DUP_TRANSITION</span>
                <span class="inv-badge purple">HIGH</span>
              </div>
              <h4 class="inv-title">State Transition Uniqueness</h4>
              <p class="inv-desc">Prevents duplicate state transitions on non-retry operations, catching missing consumer deduplication.</p>
              <div class="inv-formula font-mono">Count(Transition(s₁ &rarr; s₂)) &le; 1</div>
            </div>

            <div class="inv-card">
              <div class="inv-header">
                <span class="inv-code font-mono">INV_TERMINAL_IMMUTABILITY</span>
                <span class="inv-badge blue">STRICT</span>
              </div>
              <h4 class="inv-title">Terminal State Immutability</h4>
              <p class="inv-desc">Once a workflow reaches COMPLETED, CANCELLED, or FAILED, subsequent state mutation attempts are rejected.</p>
              <div class="inv-formula font-mono">&forall; t &gt; t_term, &Delta;State = &empty;</div>
            </div>

            <div class="inv-card">
              <div class="inv-header">
                <span class="inv-code font-mono">INV_COMPENSATION_LOGGED</span>
                <span class="inv-badge yellow">RECOVERY</span>
              </div>
              <h4 class="inv-title">Saga Rollback Audit Trail</h4>
              <p class="inv-desc">Every failed distributed orchestration must record explicit compensating events for all completed forward steps.</p>
              <div class="inv-formula font-mono">Failed &rArr; Logged(Compensate)</div>
            </div>

            <div class="inv-card">
              <div class="inv-header">
                <span class="inv-code font-mono">INV_JOURNAL_MATCH</span>
                <span class="inv-badge cyan">CONSISTENCY</span>
              </div>
              <h4 class="inv-title">State Journal Consistency</h4>
              <p class="inv-desc">The top-level workflow engine status must exactly match the terminal status of the last timeline event.</p>
              <div class="inv-formula font-mono">Terminal(Exec) &equiv; LastEvent</div>
            </div>

            <div class="inv-card">
              <div class="inv-header">
                <span class="inv-code font-mono">INV_RECONCILIATION_BAL</span>
                <span class="inv-badge green">LEDGER</span>
              </div>
              <h4 class="inv-title">Ledger Parity &amp; Reconciliation</h4>
              <p class="inv-desc">Internal system ledger debits must strictly equal provider charge settlement amounts with zero discrepancy.</p>
              <div class="inv-formula font-mono">Ledger(Net) == Provider(Net)</div>
            </div>

            <div class="inv-card">
              <div class="inv-header">
                <span class="inv-code font-mono">INV_REQUIRED_STEPS</span>
                <span class="inv-badge blue">SEQUENCE</span>
              </div>
              <h4 class="inv-title">Mandatory Lifecycle Sequence</h4>
              <p class="inv-desc">Workflows marked COMPLETED must satisfy all required domain lifecycle steps in forward chronological order.</p>
              <div class="inv-formula font-mono">Steps(e) &supe; &#123;Created, Paid, Final&#125;</div>
            </div>
          </div>

          <div class="invariants-cta text-center">
            <a routerLink="/workspace/invariants" class="btn btn-primary btn-md">
              <span>Inspect Live Invariants in Console</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </a>
            <a routerLink="/docs" class="btn btn-secondary btn-md">Explore Platform Guide &amp; FAQs</a>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="landing-footer">
        <div class="container footer-content">
          <div class="footer-left">
            <span class="brand-name">Workflow Reliability Lab</span>
            <p class="footer-desc">An engineering platform for distributed systems resilience, observability, and deterministic correctness.</p>
          </div>
          <div class="footer-links">
            <a routerLink="/login">Sign In</a>
            <a routerLink="/register">Register</a>
            <a routerLink="/docs">Platform Docs</a>
            <a href="http://localhost:8085/swagger-ui/index.html" target="_blank">OpenAPI Docs</a>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .landing-page {
      background-color: var(--bg-primary);
      min-height: 100vh;
      color: var(--text-primary);
    }
    .landing-header {
      height: 70px;
      border-bottom: 1px solid var(--border);
      background-color: rgba(17, 24, 39, 0.8);
      backdrop-filter: blur(10px);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .header-container {
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
    .brand-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background-color: var(--bg-card);
      border: 1px solid var(--border);
    }
    .brand-name {
      font-size: 1.1rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .header-nav {
      display: flex;
      align-items: center;
      gap: 1.75rem;
    }
    .header-nav a {
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
    }
    .header-nav a:hover {
      color: var(--text-primary);
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .hero-section {
      padding: 5rem 0 4rem;
      text-align: center;
    }
    .hero-container {
      max-width: 900px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.85rem;
      border-radius: var(--radius-full);
      background-color: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.25);
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--accent-blue);
      margin-bottom: 1.5rem;
    }
    .badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--accent-blue);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.9); }
    }
    .hero-title {
      font-size: 3rem;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.03em;
      margin-bottom: 1.25rem;
    }
    .gradient-text {
      background: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan), var(--accent-purple));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-subtitle {
      font-size: 1.15rem;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 2.25rem;
      max-width: 780px;
    }
    .hero-cta {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 3rem;
    }
    .terminal-preview {
      width: 100%;
      max-width: 820px;
      background: #060911;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7);
      text-align: left;
      overflow: hidden;
    }
    .terminal-bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 1rem;
      background: #0f1624;
      border-bottom: 1px solid var(--border);
    }
    .terminal-dots {
      display: flex;
      gap: 6px;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .dot.red { background-color: #ef4444; }
    .dot.yellow { background-color: #f59e0b; }
    .dot.green { background-color: #10b981; }
    .terminal-title {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }
    .terminal-body {
      padding: 1.25rem 1.5rem;
      font-size: 0.85rem;
      line-height: 1.6;
      overflow-x: auto;
    }
    .token-cyan { color: var(--accent-cyan); }
    .token-blue { color: var(--accent-blue); }
    .token-green { color: var(--accent-green); }
    .token-yellow { color: var(--accent-yellow); }
    .token-purple { color: var(--accent-purple); }
    .token-red { color: var(--accent-red); }
    .token-muted { color: var(--text-muted); }
    .pillars-section, .scenarios-section {
      padding: 5rem 0;
      border-top: 1px solid var(--border);
    }
    .section-heading {
      margin-bottom: 3.5rem;
    }
    .section-heading h2 {
      font-size: 2.2rem;
      font-weight: 700;
      margin-top: 0.75rem;
      margin-bottom: 0.5rem;
    }
    .section-heading p {
      color: var(--text-secondary);
      font-size: 1rem;
    }
    .pillars-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.75rem;
    }
    .pillar-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 2rem;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .pillar-card:hover {
      transform: translateY(-4px);
      border-color: var(--accent-blue);
    }
    .pillar-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }
    .bg-blue { background: rgba(59, 130, 246, 0.15); color: var(--accent-blue); }
    .bg-yellow { background: rgba(245, 158, 11, 0.15); color: var(--accent-yellow); }
    .bg-purple { background: rgba(139, 92, 246, 0.15); color: var(--accent-purple); }
    .bg-cyan { background: rgba(6, 182, 212, 0.15); color: var(--accent-cyan); }
    .pillar-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }
    .pillar-card p {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-bottom: 1.25rem;
      line-height: 1.5;
    }
    .pillar-features {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .pillar-features li {
      font-size: 0.85rem;
      color: var(--text-muted);
      position: relative;
      padding-left: 1.25rem;
    }
    .pillar-features li::before {
      content: "✓";
      position: absolute;
      left: 0;
      color: var(--accent-green);
      font-weight: 600;
    }
    .scenarios-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.25rem;
    }
    .scenario-badge-item {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      padding: 1.25rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
    }
    .scenario-code {
      font-size: 0.8rem;
      color: var(--accent-cyan);
      font-weight: 600;
    }
    .scenario-name {
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--text-primary);
    }
    .invariants-section {
      padding: 5rem 0;
      background: radial-gradient(circle at center, rgba(168, 85, 247, 0.05) 0%, transparent 70%);
      border-top: 1px solid var(--border);
    }
    .badge-purple {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }
    .invariants-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-top: 2.5rem;
    }
    .inv-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      transition: transform 0.2s, border-color 0.2s;
    }
    .inv-card:hover {
      transform: translateY(-2px);
      border-color: rgba(168, 85, 247, 0.4);
    }
    .inv-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .inv-code {
      font-size: 0.75rem;
      color: var(--accent-purple);
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .inv-badge {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-full);
      text-transform: uppercase;
    }
    .inv-badge.green { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
    .inv-badge.purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
    .inv-badge.blue { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
    .inv-badge.yellow { background: rgba(234, 179, 8, 0.15); color: #facc15; }
    .inv-badge.cyan { background: rgba(6, 182, 212, 0.15); color: #22d3ee; }
    .inv-title {
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
    .inv-desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.5;
      margin: 0;
      flex: 1;
    }
    .inv-formula {
      font-size: 0.8rem;
      padding: 0.5rem 0.75rem;
      background: var(--bg-secondary);
      border-radius: var(--radius-sm);
      border-left: 3px solid var(--accent-purple);
      color: var(--accent-cyan);
    }
    .invariants-cta {
      margin-top: 3rem;
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .landing-footer {
      border-top: 1px solid var(--border);
      padding: 2.5rem 0;
      background-color: var(--bg-secondary);
    }
    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    .footer-desc {
      color: var(--text-muted);
      font-size: 0.85rem;
      margin-top: 0.25rem;
    }
    .footer-links {
      display: flex;
      gap: 1.5rem;
    }
    .footer-links a {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }
    .footer-links a:hover {
      color: var(--text-primary);
    }
  `]
})
export class LandingComponent {
  scrollTo(id: string, event?: Event) {
    if (event) event.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
