# Workflow Reliability Lab — Platform Guide, End-to-End Setup & Architectural Manual

> **Welcome to Workflow Reliability Lab (WRL)!**  
> This guide is an exhaustive, step-by-step developer and platform manual. It explains **what** this platform solves, **why** asynchronous distributed systems fail silently, and provides a **complete, beginner-friendly end-to-end setup flow** showing what to connect, how data flows into the platform, and how to verify distributed reliability in real-life enterprise environments.

---

## 1. What Problem Does This Platform Solve?

### The Hidden Trap of Modern Software
In a simple legacy application with a single server and a single SQL database, actions occur sequentially inside atomic ACID transactions. When a customer clicks "Place Order", either the order succeeds completely or it rolls back. There is no ambiguous in-between state.

In modern **cloud-native distributed systems**, however, an application is decomposed into dozens of independent microservices:
```
[Web / Mobile Client]
       │
       ▼ (HTTP / REST)
 [API Gateway]
       │
       ▼ (gRPC / HTTP)
 [Order Service] ──► [PostgreSQL Order DB]
       │
       ▼ (Publish Event)
 [Message Broker: Kafka / RabbitMQ / SQS]
       ├──► [Inventory Service] (Stock Reservation)
       ├──► [Payment Service] ──► [External Gateway: Stripe / Adyen]
       ├──► [Fulfillment Service] (Warehouse & Courier Dispatch)
       └──► [Notification Service] (Email & SMS Confirmation)
```

### Where Distributed Systems Go Terribly Wrong
Because these services communicate over networks that experience latency spikes, packet drops, worker crashes, and clock drifts, four critical failure modes emerge:

1. **At-Least-Once Delivery & Duplication:**  
   Message brokers guarantee delivery by redelivering unacknowledged messages. If the network drops the acknowledgement, the consumer receives the message twice. *Did your payment service charge the customer's credit card twice?*
2. **Out-of-Order Execution:**  
   A "Shipment Dispatched" event arrives at the ledger service before the "Payment Captured" event due to queue partitioning or network routing. *Did your system ship goods before funds were settled?*
3. **Ghost Retries & Idempotency Collisions:**  
   A payment gateway experiences a socket timeout after capturing funds but before returning the HTTP 200 response. The client retries the request with a new ID, creating two active charges for a single shopping cart.
4. **Partial Saga Failures & Unlogged Compensations:**  
   An order saga executes steps 1 and 2, but step 3 (warehouse stock reservation) fails. Did compensating transactions refund the customer and cancel the invoice, or did customer funds remain locked in escrow?

### Why Existing APMs and Orchestrators Aren't Enough
- **APMs (Datadog, New Relic, Dynatrace):** Measure infrastructure health (CPU, memory, HTTP error rates, unhandled exceptions), but have no awareness of *business state consistency* or *mathematical invariant correctness*. A 200 OK payment that was charged twice is invisible to standard APMs.
- **Orchestrators (Temporal, Camunda, AWS Step Functions):** Coordinate workflow state transitions, but do not provide a dedicated **chaos injection lab**, **distributed invariant verification engine**, or **multi-environment reliability testing harness**.

**Workflow Reliability Lab bridges this exact gap.** It is the single pane of glass for engineering teams to:
1. **Trace every execution** across asynchronous queues and microservices.
2. **Enforce formal mathematical invariants** (e.g. *Total refunded amount must never exceed captured amount*).
3. **Inject 15 real-world chaos scenarios** in staging before merging to production.
4. **Automatically detect 5 classes of anomalies** (missing steps, timeouts, out-of-order events, duplicate redeliveries, retry storms).
5. **Generate AI-powered root-cause postmortems** backed by deterministic evidence.
6. **Maintain an immutable SOC 2 / ISO 27001 Security Audit Log** of all operations.

---

## 2. Complete End-to-End Setup Flow: From Zero to Full Observability

This section walks through the complete setup of Workflow Reliability Lab from a clean workspace to full operational observability.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       END-TO-END DATA INGESTION FLOW                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                                                               
   [Your Microservices]                [Message Broker]        [Payment Provider]
 (Java / Python / Node / Go)           (Kafka / RabbitMQ)       (Stripe / Adyen) 
             │                                 │                        │        
             │ 1. SDK / REST Events            │ 2. Queue DLQ & Events  │ 3. Webhook Events
             │ (Idempotent Lifecycle)          │ (Consumer Dead-Letters)│ (Signature Verified)
             ▼                                 ▼                        ▼        
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │               Workflow Reliability Lab Ingestion Engine                     │
 │                     (Port 8085 / HTTPS Reverse Proxy)                       │
 ├─────────────────────────────────────────────────────────────────────────────┤
 │ • ApiKey / JWT Auth Filter & Workspace Tenant Isolation                     │
 │ • Memory & Postgres Deduplication Cache (Idempotency Key Check)             │
 │ • Execution Journey Correlator (Stitches Traces, Spans & Events)            │
 ├─────────────────────────────────────────────────────────────────────────────┤
 │                      DETERMINISTIC EVALUATION PIPELINE                      │
 │                                                                             │
 │ 1. Invariant Engine           2. Anomaly Detector      3. Financial Ledger  │
 │    • 8 Mathematical Rules        • Missing Steps          • Double-Entry    │
 │    • State Machine Asserts       • Socket Timeouts        • Reconciliation  │
 │    • Zero-Tolerance Violations   • Out-of-Order Events    • Excess Refunds  │
 ├─────────────────────────────────────────────────────────────────────────────┤
 │                          STORAGE & AUDIT LAYER                              │
 │  • PostgreSQL 16 (Durable Append-Only Journal & JSONB Evidence Store)       │
 │  • Security Audit Logger (Immutable User & System Operations)               │
 ├─────────────────────────────────────────────────────────────────────────────┤
 │                          OBSERVABILITY CONSOLE                              │
 │  • Angular 22 SPA Dashboard (Port 4200 / Production Static Web App)         │
 │  • Real-Time Waterfall, Incident Manager & AI Postmortem Diagnosis         │
 └─────────────────────────────────────────────────────────────────────────────┘
```

---

### Step 1: Workspace Creation & Team Member Onboarding
1. **Access the Console:** Open `http://localhost:4200` (or your production domain).
2. **Log In:** Use your administrator credentials (demo: `lead.architect@workflowlab.dev` / `Password123!@#`).
3. **Workspace Organization:** Workspaces isolate teams and projects. All API keys, executions, invariants, and traces belong to a specific workspace.
4. **Invite Team Members (`/workspace/team`):**
   - Click **+ Invite Team Member**.
   - Enter member email (e.g. `qa.lead@company.com`) and assign their role:
     - **ADMIN:** Full control over workspace, API keys, webhook configurations, and simulations.
     - **DEVELOPER:** Can run simulations, declare incidents, ingest telemetry, and evaluate invariants.
     - **VIEWER:** Read-only access to dashboards, trace waterfalls, and postmortem reports.
   - *Auto-Provisioning:* If the user has not registered yet, WRL auto-provisions a secure placeholder account with a random BCrypt password hash.

---

### Step 2: Projects & Environments Configuration (`/workspace/projects`)
Real-world systems run in tiered deployment stages. WRL models this via Projects and Environments:

1. **Default Environments:**
   - **DEVELOPMENT:** Local workstations and feature branch testing.
   - **STAGING:** Pre-production staging and integration environments.
   - **SIMULATION:** Isolated chaos testing and failure injection lab.
   - **PRODUCTION:** Live customer traffic telemetry and real-time invariant monitoring.
2. **Environment Filtering:**
   - On the **Executions Explorer (`/workspace/executions`)**, use the **Environment Dropdown** to filter executions specifically for `Production` or `Simulation`.

---

### Step 3: Machine Authentication & API Key Creation (`/workspace/api-keys`)
External applications, SDKs, and CI/CD pipelines authenticate with WRL using machine API keys.

1. Navigate to **API Keys (`/workspace/api-keys`)**.
2. Click **Generate New Key**.
3. Name your key (e.g. `Production Checkout Service Key`).
4. Select Scopes:
   - `events:write`: Permission to stream workflow events into the journal.
   - `traces:write`: Permission to publish OpenTelemetry spans.
   - `executions:read`: Permission to query execution status and timelines.
   - `scenarios:run`: Permission to trigger failure simulations from CI/CD.
5. **Copy the Key Immediately:**
   The key starts with `wrl_` (e.g. `wrl_QWYlStHzvi5ErbhyyfPP88FXbSOAaI1eCydggvVKq3k`).
   *Security Guarantee:* The raw key is never stored in the database. Only an irreversible SHA-256 hash is persisted.

---

### Step 4: Connecting the 3 Core Pillars (What to Connect & How Data Gets In)

> **Important Customer Question Answered:**  
> *"Is Integration Architecture alone sufficient from this product to work and get all info?"*  
> **Answer: No single tool works in isolation.**  
> - If you configure only a **Message Broker (RabbitMQ/Kafka)**, WRL intercepts message deliveries and queue dead-letters, but cannot see what happens inside your database or inside third-party APIs (like Stripe).  
> - For true **360-degree reliability**, production architectures connect three complementary data streams:
>   1. **Application SDK / REST:** Records business steps (`ORDER_PLACED`, `PAYMENT_CAPTURED`, `SHIPMENT_DISPATCHED`) with idempotency keys.
>   2. **OpenTelemetry Tracing:** Emits microservice HTTP/gRPC span waterfalls.
>   3. **Payment Webhooks:** Ingests external gateway callbacks for payment state machine validation.

Here is how to set up each pillar:

#### Pillar A: Official Python SDK (`sdk/python`)
*Zero external dependencies. Works out-of-the-box with Python's built-in standard library.*

```python
from workflow_reliability_lab import WorkflowLabClient

# 1. Initialize client with your API Key & Workspace ID
client = WorkflowLabClient(
    endpoint="http://localhost:8085",
    api_key="wrl_QWYlStHzvi5ErbhyyfPP88FXbSOAaI1eCydggvVKq3k",
    workspace_id="4c2dd3fa-5db1-4b8c-949f-ce2f6d169702"
)

# 2. Register a new workflow execution
execution = client.create_execution(
    workflow_name="Order Fulfillment Saga",
    environment_id="1129aaad-d15f-4910-b8b3-96c61743c8e8", # Production Env
    correlation_id="order-saga-882194",
    trigger_source="CHECKOUT_FRONTEND",
    input_payload_meta={"total": 149.99, "currency": "USD"}
)
exec_id = execution["id"]

# 3. Publish lifecycle events with strict idempotency keys
client.publish_event(
    execution_id=exec_id,
    event_type="PAYMENT_CAPTURED",
    source_service="checkout-service",
    target_service="payment-gateway",
    idempotency_key="idem-pay-882194",
    payload={"amount": 149.99, "currency": "USD", "provider": "Stripe"}
)

# 4. Publish OpenTelemetry distributed trace spans
client.publish_span(
    trace_id="trace-882194",
    span_id="span-root-checkout",
    service_name="checkout-api",
    operation_name="POST /v1/checkout",
    status_code="OK",
    execution_id=exec_id
)
```

#### Pillar B: Official Java SDK (`sdk/java`)
*Thread-safe Java 17+ client compatible with Spring Boot, Quarkus, and Micronaut.*

Add dependency to `pom.xml`:
```xml
<dependency>
    <groupId>dev.workflowlab</groupId>
    <artifactId>workflow-reliability-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

Sample Java microservice integration:
```java
WorkflowReliabilityClient client = WorkflowReliabilityClient.builder()
    .endpoint("http://localhost:8085")
    .apiKey("wrl_QWYlStHzvi5ErbhyyfPP88FXbSOAaI1eCydggvVKq3k")
    .workspaceId("4c2dd3fa-5db1-4b8c-949f-ce2f6d169702")
    .build();

// Register execution
Map<String, Object> execResult = client.createExecution(
    ExecutionSubmission.builder()
        .workflowName("Java Order Saga")
        .environmentId("1129aaad-d15f-4910-b8b3-96c61743c8e8")
        .correlationId("order-java-001")
        .triggerSource("API_GATEWAY")
        .build()
);

// Publish idempotent event
client.publishEvent(
    EventSubmission.builder()
        .executionId(executionId)
        .eventType("INVOICE_GENERATED")
        .sourceService("billing-service")
        .targetService("email-service")
        .idempotencyKey("idem-inv-001")
        .payload(Map.of("invoiceId", "INV-1029", "amount", 149.99))
        .build()
);
```

#### Pillar C: OpenTelemetry Collector OTLP Ingestion
In your `otel-collector-config.yaml`:
```yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:

exporters:
  otlphttp/workflowlab:
    endpoint: "http://localhost:8085/api/v1/workspaces/4c2dd3fa-5db1-4b8c-949f-ce2f6d169702/traces"
    headers:
      X-API-Key: "wrl_QWYlStHzvi5ErbhyyfPP88FXbSOAaI1eCydggvVKq3k"

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlphttp/workflowlab]
```

#### Pillar D: Message Broker Integration (RabbitMQ)
1. In the portal, navigate to **Integrations (`/workspace/integrations`)**.
2. Enter your broker credentials:
   - **Host:** `rabbitmq.prod.internal`
   - **AMQP Port:** `5672`
   - **Virtual Host:** `/`
   - **Queue / Routing Key:** `wrl.workflow.events`
3. Click **Test Connection** to verify socket connectivity.
4. Click **Save Configuration** (credentials are encrypted with AES-256).

---

### Step 5: How the Ingestion & Rule Evaluation Pipeline Works

When an event or span reaches WRL:
1. **Idempotency Gate:** Checks if `(executionId, idempotencyKey)` has already been processed. If yes, returns the existing record immediately without triggering duplicate side-effects.
2. **Correlation Stitching:** Links the event to its execution timeline using `correlationId` or `executionId`.
3. **8 Formal Business Invariants:**
   - `INV_STEP_REQ`: Verifies all mandatory saga steps occurred before terminal completion.
   - `INV_NO_DOUBLE_CHARGE`: Asserts no customer payment was debited twice.
   - `INV_REFUND_LIMIT`: Ensures total refunds do not exceed the captured amount.
   - `INV_DUP_TRANSITION`: Prohibits redundant state machine transitions.
   - `INV_TERMINAL_IMMUTABLE`: Prevents completed/failed workflows from resurrecting.
   - `INV_COMPENSATION_RECORDED`: Verifies rollback actions when a step fails midway.
   - `INV_STATE_MATCH_HISTORY`: Proves current aggregate state matches event replay.
   - `INV_RECONCILIATION_BALANCE`: Balances internal ledger against external payment statements.
4. **5 Automated Anomaly Detectors:**
   - Detects missing prerequisite events.
   - Flags durations exceeding service SLA thresholds (e.g. >5000ms).
   - Identifies out-of-order sequencing (e.g. shipment before payment).
   - Spots redelivery storms and broker duplicate deliveries.
   - Detects abnormal retry counts (>3 retries).

---

### Step 6: Step-by-Step Operator Guide (Portal Tour)

| Feature | URL Path | What You Do Here |
|---|---|---|
| **Executive Dashboard** | `/workspace/dashboard` | Monitor total executions, system reliability rate (e.g. 94.2%), active anomalies, and recent runs. |
| **Executions Explorer** | `/workspace/executions` | Filter workflows by Environment, Status, or Correlation ID. Inspect execution duration and errors. |
| **Execution Detail** | `/workspace/executions/:id` | View chronological event journals, OpenTelemetry waterfall trees, and linked anomalies. |
| **Deterministic Invariants** | `/workspace/invariants` | Review all 8 mathematical business rules, active status, and evaluate the latest execution with 1 click. |
| **Failure Simulation Lab** | `/workspace/scenarios` | Execute 15 controlled chaos scenarios (network timeouts, worker crashes, pool exhaustion) to test system resilience. |
| **Anomaly Detection Lab** | `/workspace/anomalies` | Review detected anomalies, inspect JSON evidence, and click **Acknowledge** to mark investigated. |
| **Payment Reliability** | `/workspace/payments` | Test payment authorizations, captures, and refunds. Trigger excess refunds to observe invariant rejection. |
| **Incident Investigation** | `/workspace/incidents` | Declare an incident, click **🤖 Request AI Diagnosis** for root cause analysis, and **📄 Generate Postmortem**. |
| **Integrations Architecture** | `/workspace/integrations` | Configure and test RabbitMQ broker connections and OpenTelemetry OTLP collector endpoints. |
| **API Keys & Tokens** | `/workspace/api-keys` | Generate scoped `wrl_...` keys for SDKs and CI/CD pipelines. Revoke compromised keys instantly. |
| **Outgoing Webhooks** | `/workspace/webhooks` | Register Slack / PagerDuty webhook endpoints to broadcast anomaly and incident alerts. |
| **Team & Roles** | `/workspace/team` | Invite engineers by email and assign roles (`ADMIN`, `DEVELOPER`, `VIEWER`). |
| **Security Audit History** | `/workspace/audit` | Review immutable compliance audit records for logins, key generation, simulations, and role changes. |

---

### Step 7: CI/CD Quality Gating & Pre-Release Failure Testing

Integrate Workflow Reliability Lab into your GitHub Actions workflow to block regressions before production deployment:

```yaml
name: Reliability & Chaos Quality Gate

on:
  pull_request:
    branches: [ main ]

jobs:
  reliability-gate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Run Downstream Network Timeout Chaos Simulation
        run: |
          RESPONSE=$(curl -s -X POST "http://localhost:8085/api/v1/workspaces/4c2dd3fa-5db1-4b8c-949f-ce2f6d169702/scenarios/SCEN_NET_TIMEOUT/run" \
            -H "X-API-Key: ${{ secrets.WRL_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"environmentId": "48ec9c97-2d8a-4782-ab6a-f3bb4d065f52"}')
          
          PASSED=$(echo $RESPONSE | jq -r '.data.passedInvariants')
          if [ "$PASSED" != "true" ]; then
            echo "Reliability gate failed: Invariants violated under chaos!"
            exit 1
          fi
          echo "Reliability gate passed: All formal invariants preserved under fault injection."
```

---

## 3. Go-to-Market: How to Publish and Deploy Now

Workflow Reliability Lab is containerized and cloud-ready for instant production deployment:

### Production Deployment Options

#### Option A: Docker Compose with SSL Reverse Proxy
1. **Prepare Environment File (`.env.prod`):**
   ```ini
   SPRING_PROFILES_ACTIVE=prod
   POSTGRES_DB=workflow_lab
   POSTGRES_USER=wrl_prod_user
   POSTGRES_PASSWORD=UltraSecurePassword99!@#
   JWT_SECRET=super_secret_512_bit_cryptographically_secure_random_key_wrl_prod_2026
   CORS_ALLOWED_ORIGINS=https://wrl.yourcompany.com
   ```
2. **Launch Services:**
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

#### Option B: Google Cloud Run & Cloud SQL
1. **Build and push images:**
   ```bash
   gcloud builds submit --tag gcr.io/my-project/wrl-backend ./backend
   gcloud builds submit --tag gcr.io/my-project/wrl-frontend ./frontend
   ```
2. **Deploy Backend:**
   ```bash
   gcloud run deploy wrl-backend \
     --image gcr.io/my-project/wrl-backend \
     --platform managed \
     --region us-central1 \
     --add-cloudsql-instances my-project:us-central1:wrl-db
   ```
3. **Deploy Frontend:**
   Deploy the Angular static build (`dist/frontend/browser`) to Firebase Hosting, Cloudflare Pages, or AWS S3 + CloudFront.

---

## 4. Frequently Asked Questions (FAQ)

**Q: Do I need to modify my database to use Workflow Reliability Lab?**  
*A: No.* WRL is completely non-intrusive. It runs as an independent observability service. Your microservices simply emit HTTP events or OpenTelemetry spans via our lightweight SDKs.

**Q: What happens if Workflow Reliability Lab is temporarily unreachable?**  
*A: Your application is never blocked.* Both the Python and Java SDKs are designed with non-blocking timeouts and failure tolerance. If WRL is temporarily offline, your business transactions continue unaffected.

**Q: How does WRL handle sensitive PII and credit card numbers?**  
*A: Automated Data Redaction.* WRL's event ingestion pipeline automatically redacts common sensitive keys (passwords, PAN credit card numbers, CVVs, API tokens) before persisting records in the journal.

---

*Workflow Reliability Lab — Built for engineering teams who take distributed systems resilience seriously.*
