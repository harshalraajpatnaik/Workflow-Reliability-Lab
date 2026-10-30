# REST API & OpenAPI Integration Guide

## 1. Overview
The platform exposes a fully versioned REST API at `/api/v1` documented via OpenAPI 3.0 / Swagger UI at:
`http://localhost:8085/swagger-ui/index.html`

All responses follow a standard envelope:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "errorCode": null,
  "timestamp": "2026-10-31T00:00:00Z"
}
```

---

## 2. Authentication Schemes
1. **Interactive Session:** Pass JWT in `Authorization: Bearer <jwt_access_token>` with cookie `wrl_refresh_token`.
2. **Machine-to-Machine Integration:** Pass workspace API key in header `X-API-Key: wrl_live_<key>` or `Authorization: Bearer wrl_live_<key>`.

---

## 3. Core Endpoint Catalog

### Public & Authentication
- `GET /api/v1/public/overview` — System health and capabilities overview.
- `POST /api/v1/auth/register` — Register user account and create default workspace.
- `POST /api/v1/auth/login` — Authenticate and receive JWT access token + refresh cookie.
- `POST /api/v1/auth/refresh` — Rotate refresh token and issue new JWT access token.
- `POST /api/v1/auth/logout` — Revoke active refresh token.
- `POST /api/v1/auth/forgot-password` — Dispatch password reset token.
- `POST /api/v1/auth/reset-password` — Submit new password using reset token.
- `POST /api/v1/auth/verify-email` — Verify user email address with verification token.

### Workspace & Project Management
- `GET /api/v1/workspaces` — List authenticated user's workspaces.
- `POST /api/v1/workspaces` — Create new workspace.
- `GET /api/v1/workspaces/{wsId}/projects` — List projects and associated environments.
- `POST /api/v1/workspaces/{wsId}/projects` — Create new project.

### Observability & Ingestion
- `GET /api/v1/workspaces/{wsId}/executions` — Filter and list workflow executions.
- `GET /api/v1/workspaces/{wsId}/executions/{id}` — Retrieve execution metadata.
- `GET /api/v1/workspaces/{wsId}/executions/{id}/events` — Retrieve event journal.
- `POST /api/v1/workspaces/{wsId}/events` — Ingest workflow event.
- `GET /api/v1/workspaces/{wsId}/executions/{id}/traces` — Retrieve execution trace waterfall.
- `POST /api/v1/workspaces/{wsId}/traces/spans` — Ingest OpenTelemetry span.
- `GET /api/v1/workspaces/{wsId}/traces/service-graph` — Retrieve dynamic service dependency graph.

### Anomaly Lab & Invariants
- `GET /api/v1/workspaces/{wsId}/anomalies` — List detected anomalies with severity filter.
- `POST /api/v1/workspaces/{wsId}/anomalies/{id}/acknowledge` — Acknowledge anomaly.
- `GET /api/v1/workspaces/{wsId}/invariants/definitions` — List 8 formal invariants.
- `GET /api/v1/workspaces/{wsId}/executions/{id}/invariants` — Evaluate and return invariant results for an execution.

### Failure Simulation Lab
- `GET /api/v1/workspaces/{wsId}/scenarios` — Catalog of 15 failure scenarios.
- `POST /api/v1/workspaces/{wsId}/scenarios/{id}/run` — Trigger isolated chaos simulation.
- `GET /api/v1/workspaces/{wsId}/scenarios/runs` — Retrieve simulation run history.

### Financial Simulator
- `GET /api/v1/workspaces/{wsId}/payments` — List payment transactions.
- `POST /api/v1/workspaces/{wsId}/payments/initiate` — Initiate payment with fault injection mode.
- `POST /api/v1/workspaces/{wsId}/payments/{id}/refund` — Refund payment with ceiling check.
- `POST /api/v1/workspaces/{wsId}/payments/{id}/reconcile` — Reconcile transaction against ledger.

### Incident Management
- `GET /api/v1/workspaces/{wsId}/incidents` — List active and resolved incidents.
- `POST /api/v1/workspaces/{wsId}/incidents` — Declare new incident.
- `POST /api/v1/workspaces/{wsId}/incidents/{id}/ai-analysis` — Trigger AI root cause analysis.
- `POST /api/v1/workspaces/{wsId}/incidents/{id}/reports` — Generate structured postmortem Markdown report.
