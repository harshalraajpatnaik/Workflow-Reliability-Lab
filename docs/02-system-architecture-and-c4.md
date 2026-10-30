# System Architecture & C4 Model — Workflow Reliability Lab

## 1. High-Level Architecture Overview
Workflow Reliability Lab is built on a clean three-tier distributed architecture:
- **Presentation Tier:** Angular 22 Single Page Application (SPA) using TypeScript, reactive Signals, standalone components, and dark developer-tool design system.
- **Application Tier:** Java 25 / Spring Boot 3.4.3 REST API with Spring Security, Spring Data JPA, and Flyway database migrations.
- **Data Tier:** PostgreSQL 16 relational database with native `JSONB` support for schema-flexible event journals, trace spans, and anomaly evidence.
- **External Integration Bridges:** OpenTelemetry OTLP receiver, optional RabbitMQ AMQP bridge with AES-256 encrypted credential storage, and MailHog SMTP test harness.

---

## 2. C4 Context Diagram (System Context)

```mermaid
graph TD
    User["Developer / SRE / Architect"] -->|HTTPS / Web Console| WRL_Web["Workflow Reliability Lab UI (Angular 22)"]
    Service["Customer Microservices / SDKs"] -->|HTTP REST / OTLP Traces| WRL_API["Workflow Reliability Lab API (Spring Boot 8085)"]
    WRL_Web -->|REST APIs + JWT / Cookies| WRL_API
    WRL_API -->|SQL + JSONB| DB[(PostgreSQL 16 DB)]
    WRL_API -->|AMQP Socket Check| RabbitMQ["RabbitMQ Broker (Optional)"]
    WRL_API -->|SMTP| MailHog["MailHog SMTP Harness"]
```

---

## 3. C4 Container Diagram (Platform Containers)

```mermaid
graph TD
    subgraph Frontend [Browser Client - Port 4200]
        SPA["Angular 22 SPA"]
        AuthG["Auth Guards & Interceptors"]
        Sig["Reactive Signals Store"]
    end

    subgraph Backend [Spring Boot 3.4.3 - Port 8085]
        Sec["Spring Security (JWT + Refresh Cookies)"]
        EventIngest["Event & Trace Ingestion Controller"]
        SimEng["Failure Simulation Engine"]
        AnomEng["Deterministic Anomaly Detector"]
        InvEng["Business Invariants Evaluator"]
        PaySim["Payment Reliability State Machine"]
        IncEng["Incident & Postmortem Generator"]
    end

    subgraph Storage [Container Infrastructure]
        PG[(PostgreSQL 16 on Port 5433)]
        MH[(MailHog on Port 1025 / 8025)]
    end

    SPA -->|REST API| Sec
    Sec --> EventIngest
    Sec --> SimEng
    Sec --> PaySim
    Sec --> IncEng
    EventIngest --> PG
    SimEng --> PG
    AnomEng --> PG
    InvEng --> PG
    PaySim --> PG
    IncEng --> PG
```

---

## 4. Key Architectural Patterns
- **Transactional Outbox / Journaling:** Events are written durably with unique idempotency keys before downstream notification dispatch.
- **Tenant Context ThreadLocal:** `TenantContext` extracts workspace identifiers from request headers, route paths, or API keys, ensuring multi-tenant isolation across all database queries.
- **Idempotency Gate:** Checks incoming idempotency keys against the database; duplicate submissions return existing execution results without re-triggering side effects.
- **Microsecond Clock:** Traces and span intervals use microsecond timestamps (`startTimeUs`, `endTimeUs`) to calculate accurate waterfall spans.
