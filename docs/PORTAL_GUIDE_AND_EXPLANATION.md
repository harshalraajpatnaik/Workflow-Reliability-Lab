# Workflow Reliability Lab — Platform Guide & Architectural Explanation

> **Welcome to Workflow Reliability Lab (WRL)!**  
> This guide is designed to explain **what** this platform does, **why** modern software needs it, and provide a **complete, step-by-step novice walkthrough** of every feature in the portal.

---

## 1. What Problem Does This Platform Solve?

### The Hidden Trap of Modern Software
In a simple application with a single server and a single database, everything happens sequentially. When a customer clicks "Place Order", either the order succeeds or it fails. There is no in-between.

In modern **distributed systems**, however, an application is split into dozens of microservices:
1. An **API Gateway** accepts the request.
2. An **Order Service** writes to a database.
3. A **Message Broker (like Kafka or RabbitMQ)** sends an event.
4. An **Inventory Service** reserves stock.
5. A **Payment Gateway (like Stripe)** charges the credit card.
6. A **Fulfillment Service** contacts the courier.

### Where Things Go Terribly Wrong
Because these services talk over networks that can flicker, drop packets, or slow down:
- **At-Least-Once Delivery & Duplication:** A message broker promises a message won't be lost, but might deliver it twice. Did your system charge the customer twice?
- **Out-of-Order Execution:** A "Shipping Confirmed" event arrives before the "Payment Succeeded" event because of network routing delays. Did your system ship an unpaid order?
- **Ghost Retries & Idempotency Failures:** The network cut off right as Stripe processed a payment. The client retries the request with a different ID, creating two active charges.
- **Partial Saga Failures:** Steps 1 and 2 succeed, but Step 3 fails. Did the compensating transaction cleanly refund the customer, or did the money vanish into a black hole?

### Why Existing Tools Aren't Enough
- **APMs (Datadog, Grafana, Sentry):** Tell you *after* a CPU spikes or an exception crashes your server, but they don't verify if your business rules or financial ledgers remained intact.
- **Orchestrators (Temporal, Camunda):** Coordinate steps, but you still need a way to **inject faults**, **test edge cases**, and **mathematically prove** your business invariants held up under chaos.

**Workflow Reliability Lab bridges this exact gap.** It is a developer platform that combines:
1. **Execution Observability:** Visual timelines, correlation tracking, and OpenTelemetry trace waterfalls.
2. **Failure Simulation:** 15 controlled chaos scenarios to inject network timeouts, worker crashes, and duplicate events.
3. **Deterministic Invariant Verification:** Mathematical assertions checked against every execution (e.g., *Refunds must NEVER exceed captured amounts*).
4. **Incident Investigation & AI Assistance:** Evidence-backed postmortems and diagnosis.

---

## 2. Platform Architecture Overview

```
 ┌───────────────────────────────────────────────────────────────┐
 │                   Angular 22 Modern SPA UI                   │
 │ (TailwindCSS, Lucide Icons, Reactive Signals, Port 4200)      │
 └──────────────────────────────┬────────────────────────────────┘
                                │ REST / JSON (JWT Auth)
 ┌──────────────────────────────▼────────────────────────────────┐
 │                 Spring Boot 3.4.3 Core API                    │
 │            (Java 21 Virtual Threads, Port 8085)               │
 ├──────────────────────────────┬────────────────────────────────┤
 │ • Auth & Multi-Tenancy       │ • OpenTelemetry Trace Ingest   │
 │ • Execution Lifecycle Engine │ • 15 Built-in Chaos Scenarios  │
 │ • Event Timeline & Dedup     │ • Invariant Verification Engine│
 │ • Anomaly Detection Service  │ • Payment Simulator & Ledger   │
 │ • AI Postmortem Generator    │ • Webhooks & Audit Logger      │
 └──────────────────────────────┬────────────────────────────────┘
                                │
 ┌──────────────────────────────▼────────────────────────────────┐
 │                PostgreSQL 16 Enterprise DB                    │
 │            (JSONB Evidence Storage, Port 5433)                │
 └───────────────────────────────────────────────────────────────┘
```

---

## 3. Step-by-Step Novice Walkthrough

### Step 1: Accessing the Portal & Logging In
1. Open your browser and navigate to **`http://localhost:4200`**.
2. You will be greeted by the **Public Landing Page**, highlighting platform capabilities, live architecture previews, and interactive feature breakdowns.
3. Click **Sign In** in the top navigation bar.
4. Use the pre-seeded Enterprise Demo account:
   - **Email:** `lead.architect@workflowlab.dev`
   - **Password:** `Password123!@#`
5. Click **Sign In**. The system authenticates with BCrypt hashing, issues a secure JWT token, and redirects you directly to your workspace dashboard.

---

### Step 2: The Executive Dashboard (`/dashboard`)
*The bird’s-eye view of your distributed system’s health.*

When you arrive at the dashboard, you will see 4 primary KPI cards:
1. **Total Executions:** How many workflows have run across your environments.
2. **System Reliability Rate:** The percentage of workflows that completed without unhandled faults or invariant violations (e.g., `94.2%`).
3. **Active Anomalies:** Unacknowledged anomalies detected by the background rule engine.
4. **Invariants Health:** The pass/fail ratio of your business rules.

Below the KPI cards:
- **Recent Executions Table:** Live status indicators (`COMPLETED`, `RUNNING`, `FAILED`, `TIMED_OUT`).
- **Quick Failure Injection Bar:** Run a chaos scenario with a single click.

---

### Step 3: Workflow Execution Explorer (`/executions`)
*Where you see exactly what happened inside an asynchronous workflow.*

1. Click **Executions** in the sidebar.
2. You will see a filterable table of executions with status pills, duration, environment, and error messages.
3. Click on any execution (e.g., `Order Fulfillment Saga` or `Payment Processing Pipeline`).
4. In the Execution Detail view, you will find:
   - **Metadata Summary:** Correlation ID, status, start/end timestamps, total duration.
   - **Event Timeline:** Every event emitted by your microservices ordered chronologically (`OrderCreated`, `PaymentCaptured`, `StockReserved`).
   - **Distributed Trace Waterfall:** Span duration breakdown showing which service took the longest (e.g., `OrderService` calling `InventoryService`).
   - **Anomalies Detected:** Any irregularities flagged specifically for this run.
   - **Invariant Results:** Direct proof of whether rules were satisfied or violated.

---

### Step 4: Failure Simulation Lab (`/scenarios`)
*Test how your system handles disasters BEFORE they happen in production.*

1. Click **Failure Scenarios** in the sidebar.
2. You have access to **15 pre-configured chaos scenarios**, including:
   - `SCEN_NET_TIMEOUT` — Downstream Network Socket Timeout.
   - `SCEN_DUP_MESSAGE` — Duplicate Message Broker Ingestion.
   - `SCEN_OUT_OF_ORDER` — Out-of-Order Lifecycle Event Sequencing.
   - `SCEN_DB_TIMEOUT` — Database Connection Pool Contention.
   - `SCEN_PAYMENT_TIMEOUT` — 3rd-party Payment Gateway Timeout.
3. Click the **Run Scenario** button next to any scenario.
4. The backend immediately:
   - Synthesizes the execution with injected faults.
   - Emits asynchronous events and OpenTelemetry spans.
   - Triggers the Anomaly Detection and Invariant Verification engines.
5. Click the **Scenario Runs** tab to inspect the results, view the observation logs, and verify if your system gracefully handled the failure.

---

### Step 5: Anomaly Lab (`/anomalies`)
*Automated detection of distributed systems anti-patterns.*

1. Click **Anomalies** in the sidebar.
2. The Anomaly Lab automatically inspects incoming execution streams against 8 deterministic rules:
   - `DUPLICATE_EVENT` — Repeated non-retry events indicating lack of idempotency.
   - `OUT_OF_ORDER_EVENT` — Step C happening before Step B.
   - `EXCESSIVE_RETRIES` — Services entering retry storms without exponential backoff.
   - `DURATION_THRESHOLD` — Latencies exceeding service-level objectives.
   - `PAYMENT_INCONSISTENCY` — Ledger debits occurring after execution failure.
3. Click on an anomaly to view the **JSON Evidence**:
   - Exact timestamps, duplicated event types, or faulty span IDs.
4. Click **Acknowledge** once your team has triaged the finding.

---

### Step 6: Invariants Verification Engine (`/invariants`)
*Mathematical proof that business rules are never broken.*

1. Click **Invariants** in the sidebar.
2. Invariants represent non-negotiable business truths:
   - `INV_NO_DOUBLE_CHARGE`: A customer must never be charged more than once for a single checkout session.
   - `INV_REFUND_CEILING`: Total refunds must NEVER exceed captured amounts.
   - `INV_NO_DUP_TRANSITION`: A state transition cannot occur twice on a non-retry event.
   - `INV_TERMINAL_IMMUTABILITY`: A completed or cancelled workflow cannot accept subsequent mutation events.
3. Every execution is audited against all active invariants in real-time.
4. Click on an invariant to see the pass/fail audit logs and violation evidence.

---

### Step 7: Payment Simulator & Ledger (`/payments`)
*Realistic payment lifecycle and idempotency sandbox.*

1. Click **Payments** in the sidebar.
2. This module simulates a complete Stripe/Adyen gateway:
   - Supports **Initiate**, **Authorize**, **Capture**, **Refund**, and **Reconciliation**.
3. Try this experiment:
   - Click **Initiate Payment** ($100.00).
   - Enter Customer ID `cust_novice_1` and select Fault Mode `NONE`.
   - Submit the transaction. It transitions to `SUCCEEDED`.
   - Click **Refund** and refund $40.00. Refund succeeds.
   - Now click **Refund** and try to refund $80.00 ($40 + $80 = $120 > $100).
   - The platform **blocks the refund** and raises an `INV_REFUND_CEILING` violation!
   - Click **Reconcile** to verify internal ledger balance matches simulated provider charge.

---

### Step 8: Incidents & AI Postmortem Diagnosis (`/incidents`)
*Evidence-backed incident reports and automated root-cause analysis.*

1. Click **Incidents** in the sidebar.
2. When multiple anomalies or invariant breaches occur, create an **Incident**:
   - Provide Title, Severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), and Description.
3. Open the incident and click **Request AI Diagnosis**:
   - The system aggregates all associated execution traces, failed events, and anomalies into a structured prompt.
   - The AI Assistant generates a comprehensive root-cause hypothesis and actionable code/architecture remediation advice.
4. Click **Generate Postmortem Report** to produce an exportable Markdown postmortem document ready for management and compliance.

---

### Step 9: Integrations, API Keys & Webhooks (`/integrations`, `/api-keys`, `/webhooks`)
*Connect your own applications and message brokers.*

1. **API Keys (`/api-keys`):**
   - Generate cryptographically secure API keys with specific scopes (`events:write`, `traces:write`, `scenarios:run`).
   - The plaintext key is shown **only once** upon generation; the backend stores only a secure SHA-256 hash.
2. **Integrations (`/integrations`):**
   - Configure **RabbitMQ** connection settings (host, port, virtual host, credentials).
   - Test connectivity with the built-in connection tester.
3. **Webhooks (`/webhooks`):**
   - Register endpoints to receive real-time HTTP POST alerts whenever an anomaly is detected or an invariant is violated.

---

### Step 10: Security Audit Log (`/audit`)
*Complete compliance and accountability.*

1. Click **Audit Logs** in the sidebar.
2. Every sensitive action taken on the platform is immutably recorded:
   - User logins and failed password attempts.
   - API key generation and revocation.
   - Failure scenario executions.
   - Payment initiations, refunds, and manual reconciliations.
   - Anomaly acknowledgements.

---

## 4. Summary of Running Ports

| Service | Port | Description |
|---|---|---|
| **Frontend (Angular 22)** | `4200` | Web UI running on `http://localhost:4200` |
| **Backend (Spring Boot 3.4.3)** | `8085` | REST API & Ingest running on `http://localhost:8085` |
| **PostgreSQL 16** | `5433` | Docker container `wrl-postgres` |
| **MailHog SMTP** | `1025` | Mock email delivery container `wrl-mailhog` |
| **MailHog Web UI** | `8025` | Web inbox viewer on `http://localhost:8025` |

---
*Workflow Reliability Lab — Built for engineering teams who take distributed systems resilience seriously.*
