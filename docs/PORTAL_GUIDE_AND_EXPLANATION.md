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

## 4. Real-World Scenarios: How Production Systems Fail & How WRL Solves Them

Distributed systems don't fail because the code is bad; they fail because the **network is asynchronous, unreliable, and prone to silent anomalies**. Here are 4 concrete, real-life production incidents and how Workflow Reliability Lab protects you.

---

### Scenario A: E-Commerce Black Friday Surge (Double Charges & Kafka Duplication)

#### The Production Incident
During a flash sale, high database contention causes the `PaymentService` to take 5,200 ms to answer the API Gateway. The HTTP client in the web checkout times out at 5,000 ms. 
1. The user's browser displays: *"Payment failed, please try again."*
2. The user clicks **"Pay Now"** a second time.
3. However, the first payment charge **actually succeeded** in Stripe 200 ms after the client gave up!
4. The second payment also succeeds with a newly generated checkout transaction ID.
5. Meanwhile, a Kafka broker rebalance occurs due to pod rescheduling, delivering the `OrderCreated` event to the `InventoryService` twice. The warehouse reserve counter decrements stock twice for one customer.

#### The Consequence
- The customer was charged \$150.00 twice (\$300.00 total).
- 2 items were removed from inventory, causing an artificial stockout and cancelled orders for other shoppers.
- Customer files a credit card dispute, incurring \$25.00 in chargeback penalty fees plus customer support labor.

#### How Workflow Reliability Lab Prevents It
1. **Pre-Production Chaos Simulation:** The engineering team runs `SCEN_PAYMENT_TIMEOUT` and `SCEN_DUP_MESSAGE` in WRL's Failure Scenario Lab.
2. **Instant Invariant Violation:** WRL evaluates `INV_NO_DOUBLE_CHARGE` and immediately flags:
   ```json
   {
     "invariant": "INV_NO_DOUBLE_CHARGE",
     "violation": "Customer cust_user_8912 charged 2 times for order ord_blackfriday_4410",
     "charges": ["ch_stripe_881", "ch_stripe_882"]
   }
   ```
3. **Automated Anomaly Detection:** The Anomaly engine flags `DUPLICATE_EVENT` for the repeated `StockReserved` step.
4. **The Fix:** The team adopts deterministic idempotency keys generated from the cart hash (`idem_cart_sha256`) and adds a Transactional Inbox table to the inventory service before launching the sale.

---

### Scenario B: FinTech & Payment Rails (Excess Refunds & Silent Ledger Drift)

#### The Production Incident
A customer returns an expensive laptop (\$1,200.00). In a distributed microservice setup:
1. Customer support agent 1 approves a partial goodwill refund of \$300.00.
2. Simultaneously, an automated returns processing worker receives the physical return package at the depot and triggers a full refund of \$1,200.00.
3. Both services execute concurrently. Because of read-modify-write race conditions in distributed databases without distributed locking, both check that the original transaction was \$1,200.00 and proceed to dispatch refund requests.

#### The Consequence
- \$300.00 + \$1,200.00 = **\$1,500.00 refunded** on a \$1,200.00 purchase!
- The company loses \$300.00 of hard capital directly from their merchant settlement account.
- The company's internal ledger shows \$1,200.00 captured and \$1,500.00 refunded, breaking accounting audit compliance.

#### How Workflow Reliability Lab Prevents It
1. The team uses WRL's **Payment Simulator & Ledger Sandbox (`/payments`)**.
2. When multiple refund webhooks or API requests arrive for the same payment session, WRL's `INV_REFUND_CEILING` invariant evaluates:
   $$\sum \text{Refunds} \le \text{Captured Amount}$$
3. The platform instantly triggers an invariant violation alert, rejects the excessive transaction, and records an immutable audit log.
4. In production, teams connect WRL's Invariant Verification API into their staging payment pipelines to guarantee that no build can be deployed if refund ceiling checks can be bypassed.

---

### Scenario C: Logistics & On-Demand Delivery (Out-of-Order Lifecycle Events)

#### The Production Incident
In an on-demand grocery delivery platform:
1. The courier's mobile app enters an underground parking garage with zero cell reception right after picking up the order (`ORDER_PICKED_UP`).
2. The courier delivers the groceries to the doorstep and reconnects to 5G network.
3. The phone's offline event queue flushes out of order or experiences HTTP retry delays: the `PACKAGE_DELIVERED` event reaches the message broker at `14:02:10`, while the buffered `PACKAGE_PICKED_UP` event arrives at `14:02:15`.

#### The Consequence
- The Order Fulfillment state machine receives `DELIVERED` while still in the `CREATED` state.
- The workflow transitions into an illegal state or throws an unhandled `IllegalStateException`, locking the courier's app from receiving future jobs.
- The customer receives an SMS saying "Your order is picked up" 5 minutes *after* eating the food!

#### How Workflow Reliability Lab Prevents It
1. The team runs `SCEN_OUT_OF_ORDER` in WRL.
2. WRL's `OUT_OF_ORDER_EVENT` rule compares the event timestamps and state transition sequence.
3. The engine flags the anomaly, displays the visual waterfall timeline showing the inverted step order, and provides code recommendations to implement event versioning / monotonic state progression.

---

### Scenario D: Microservices Migration (Monolith to Distributed Saga)

#### The Production Incident
An engineering team decomposes a monolithic database into three separate services: `OrderService`, `PaymentService`, and `NotificationService`.
1. In the monolith, this was a single ACID database transaction: `BEGIN ... COMMIT`.
2. In microservices, they implement a distributed Saga using RabbitMQ.
3. `OrderService` creates the order.
4. `PaymentService` successfully debits the customer's balance.
5. `NotificationService` throws an unhandled OutOfMemory error.
6. The compensating transaction to refund the customer's balance fails because the compensating message was sent to a dead-letter queue without retry handling.

#### The Consequence
- The customer's money was taken, no order was created, no email was sent, and no compensation occurred.
- Customer support has to manually inspect server logs to understand who lost money and why.

#### How Workflow Reliability Lab Prevents It
1. The team routes execution telemetry to WRL's OpenTelemetry trace collector.
2. WRL generates an execution trace waterfall clearly displaying that `NotificationService` failed and that no compensating `PAYMENT_REFUNDED` event was observed within the expected SLA window (`INV_SAGA_COMPENSATION`).
3. An automated Incident is declared with the full trace timeline attached, allowing engineers to fix the saga orchestrator before customer impact.

---

## 5. Customer Questions & Objections Answered (The GTM Playbook)

### Q1: "We already have Datadog, Grafana, and Sentry. Why do we need Workflow Reliability Lab?"
> **The Key Distinction: Infrastructure APM vs. Business Invariant Correctness.**
>
> - **Datadog / Grafana:** Tell you that *CPU is at 85%* or that *HTTP p99 latency is 450 ms*. They do NOT know that a customer was charged twice or that a refund exceeded the captured amount.
> - **Sentry:** Tells you that a *NullPointerException occurred at line 42*. It does NOT tell you that step 4 executed before step 2, leaving your database in an inconsistent state.
> - **Workflow Reliability Lab:** Specifically monitors **business invariants**, **event ordering**, **idempotency failures**, and **distributed saga compensations**. It provides deterministic proof that your business rules hold true even when infrastructure is failing.

| Capability | Datadog / Grafana | Sentry | Workflow Reliability Lab |
|---|---|---|---|
| Infrastructure CPU/RAM Metrics | ✅ Native | ❌ No | ❌ (Not our focus) |
| Exception Stack Traces | ✅ Yes | ✅ Native | ✅ Yes |
| Distributed Trace Waterfalls | ✅ Yes | ⚠️ Basic | ✅ Yes (OpenTelemetry Native) |
| Business Invariant Verification | ❌ No | ❌ No | ✅ **Automated & Real-time** |
| Built-in Fault Injection / Chaos | ❌ No | ❌ No | ✅ **15 Pre-built Scenarios** |
| Payment Ledger Reconciliation | ❌ No | ❌ No | ✅ **Built-in Gateway Sandbox** |
| Idempotency & Duplicate Checks | ❌ No | ❌ No | ✅ **Automated Anomaly Rules** |
| AI Postmortem Generation | ⚠️ Generic | ⚠️ Generic | ✅ **Root-Cause Rooted in Traces** |

---

### Q2: "Do we need to rewrite our backend code to use this?"
> **No. WRL is completely non-invasive.**
>
> 1. **Option A (Zero Code Changes — Pure Sandbox):** You can run WRL as a standalone test environment. Test your architectural ideas, simulate failure scenarios, and train junior developers on distributed systems anti-patterns.
> 2. **Option B (1-Line OpenTelemetry Exporter):** If your services already use OpenTelemetry, simply point your exporter endpoint to WRL:
>    ```bash
>    export OTEL_EXPORTER_OTLP_ENDPOINT="http://wrl.company.internal:8085/api/v1/traces"
>    ```
> 3. **Option C (Lightweight SDKs):** Emit lightweight lifecycle events with our Java or Python SDKs using 3 lines of code.

---

### Q3: "What is the concrete ROI for our company?"
> 1. **Direct Financial Savings:** Preventing a single Black Friday double-charge or excess refund glitch can save \$50,000 to \$500,000 in immediate capital loss, chargeback disputes, and merchant processing penalties.
> 2. **Engineering Velocity:** Reproducing asynchronous bugs in distributed systems typically takes senior engineers **3 to 7 days**. With WRL's event timeline, trace waterfalls, and scenario replay, mean time to diagnosis (MTTD) drops from **days to minutes**.
> 3. **Brand Reputation:** Customers lose trust when charged twice or when delivery notifications fail. WRL prevents silent corruption before users notice.

---

### Q4: "How does a novice or junior developer use this without getting overwhelmed?"
> WRL is built with a **guided progressive disclosure UX**:
> 1. **Visual Status Colors:** Every execution, anomaly, and invariant is color-coded (`COMPLETED` in emerald green, `FAILED` in rose red, `TIMED_OUT` in amber).
> 2. **Human-Readable Explanations:** The platform explains *why* an anomaly was triggered in plain English before showing raw JSON payloads.
> 3. **Interactive Demos:** The Payment Sandbox and Chaos Scenarios allow junior engineers to click buttons and immediately observe the consequences of distributed failures safely.

---

## 6. Customer 3-Step Adoption Playbook

Adopting Workflow Reliability Lab inside an organization takes three simple stages:

```
┌─────────────────────────────────┐
│     STAGE 1: DAY 1              │
│ Pre-Production Chaos Sandbox    │ ──► Zero production risk. Train team on 15 chaos scenarios.
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│     STAGE 2: WEEK 1             │
│ Shadow Telemetry Ingestion      │ ──► Route OTel spans & webhooks to WRL API keys.
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│     STAGE 3: WEEK 2             │
│ Automated CI/CD Quality Gate    │ ──► Fail Pull Requests automatically on invariant violations!
└─────────────────────────────────┘
```

1. **Stage 1 (Day 1 - Zero Setup):** Run pre-built chaos scenarios in WRL console. Observe how network timeouts, duplicate events, and out-of-order deliveries behave.
2. **Stage 2 (Week 1 - Passive Ingest):** Create a Workspace API key (`/api-keys`). Configure your staging microservices or message broker consumers to emit trace spans and step events to WRL.
3. **Stage 3 (Week 2 - Continuous Gate):** Add a step to your GitHub Actions / GitLab CI pipeline:
   ```yaml
   - name: Verify Workflow Invariants
     run: |
       curl -X POST https://wrl.company.internal/api/v1/workspaces/$WS_ID/scenarios/run-all \
         -H "Authorization: Bearer ${{ secrets.WRL_API_KEY }}"
   ```
   If any invariant check fails, the pull request cannot merge!

---

## 7. How to Publish & Go to Market Now (Production Deployment Runbook)

To take Workflow Reliability Lab and publish it to production right now:

### Production Architecture
- **Frontend:** Compiled Angular 22 SPA served via high-performance Nginx with HTTP/2 and gzip/brotli compression.
- **Backend:** Spring Boot 3.4.3 container running on Java 21 with Virtual Threads (`-XX:+UseZGC`).
- **Database:** Managed PostgreSQL 16 (AWS RDS, GCP Cloud SQL, or Supabase) with connection pooling (HikariCP).
- **Reverse Proxy / SSL:** Automated Let's Encrypt TLS termination via Caddy, Nginx, or Cloudflare.

---

### Option A: Instant Production Deploy with Docker Compose

Save this as `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  # 1. PostgreSQL Database
  wrl-postgres:
    image: postgres:16-alpine
    container_name: wrl-postgres-prod
    restart: always
    environment:
      POSTGRES_DB: workflow_reliability_lab
      POSTGRES_USER: wrl_user
      POSTGRES_PASSWORD: ${DB_PASSWORD:-StrongSecurePassword2026!}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U wrl_user -d workflow_reliability_lab"]
      interval: 5s
      timeout: 5s
      retries: 5

  # 2. Spring Boot Core API
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
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD:-StrongSecurePassword2026!}
      JWT_SECRET: ${JWT_SECRET:-9vA4...min64chars...2026SecureProductionSecretKey}
      CORS_ALLOWED_ORIGINS: "https://wrl.yourdomain.com"
      SERVER_PORT: 8085

  # 3. Angular Frontend + Nginx Reverse Proxy
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
  postgres_prod_data:
```

#### Production Nginx Reverse Proxy Configuration (`nginx.conf`)
```nginx
server {
    listen 80;
    server_name wrl.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name wrl.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/wrl.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wrl.yourdomain.com/privkey.pem;

    root /usr/share/nginx/html;
    index index.html;

    # Frontend Single Page App Routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend REST API Proxy
    location /api/ {
        proxy_pass http://wrl-backend:8085;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

### Option B: Cloud-Native Serverless (Google Cloud Run & Cloud SQL)

1. **Build & Push Containers:**
   ```bash
   gcloud builds submit --tag gcr.io/my-project/wrl-backend ./backend
   gcloud builds submit --tag gcr.io/my-project/wrl-frontend ./frontend
   ```

2. **Deploy Backend to Cloud Run:**
   ```bash
   gcloud run deploy wrl-backend \
     --image gcr.io/my-project/wrl-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --add-cloudsql-instances my-project:us-central1:wrl-db \
     --set-env-vars "SPRING_DATASOURCE_URL=jdbc:postgresql:///workflow_reliability_lab?cloudSqlInstance=my-project:us-central1:wrl-db&socketFactory=com.google.cloud.sql.postgres.SocketFactory,SPRING_DATASOURCE_USERNAME=postgres,SPRING_DATASOURCE_PASSWORD=secret"
   ```

3. **Deploy Frontend to Firebase App Hosting / Cloud Run:**
   ```bash
   gcloud run deploy wrl-frontend \
     --image gcr.io/my-project/wrl-frontend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

---

### Production Pre-Flight Security Checklist

Before directing customer traffic to the platform:
- [x] **Secure JWT Secret:** Set a 512-bit cryptographically random `JWT_SECRET` in production environment variables.
- [x] **Password Hashing:** Verified BCrypt / Argon2id password encoding with salt rounds.
- [x] **Database Isolation:** PostgreSQL user permissions restricted to the `workflow_reliability_lab` schema.
- [x] **CORS Origin Lockdown:** Set `CORS_ALLOWED_ORIGINS` strictly to your production domain (e.g. `https://wrl.company.com`).
- [x] **API Key Hashing:** API keys are hashed with SHA-256 before database storage; raw keys are displayed only once.
- [x] **SSL / TLS 1.3:** Enforce HTTPS redirects and HSTS headers.
- [x] **Audit Logging:** Security-sensitive actions (login, key creation, deletion, simulation) are captured in immutable audit logs.

---

## 8. Summary of Local & Production Endpoints

| Service | Local Dev | Production Target | Description |
|---|---|---|---|
| **Frontend UI** | `http://localhost:4200` | `https://wrl.company.com` | Angular 22 Single Page Application |
| **Backend REST API** | `http://localhost:8085` | `https://wrl.company.com/api` | Spring Boot 3.4.3 & Java 21 Engine |
| **Swagger UI** | `http://localhost:8085/swagger-ui/index.html` | `/api/swagger-ui/index.html` | Interactive OpenAPI Documentation |
| **Database** | `localhost:5433` | Managed Cloud SQL / RDS | PostgreSQL 16 Enterprise Storage |
| **Mail Testing** | `http://localhost:8025` | Production SMTP (SendGrid/SES) | MailHog / Email Verification |

---
*Workflow Reliability Lab — Built for engineering teams who take distributed systems resilience seriously.*
