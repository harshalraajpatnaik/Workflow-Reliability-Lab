# Security Threat Model & Multi-Tenant Isolation

## 1. Threat Model & Mitigations (STRIDE Matrix)

| Threat Category | Potential Attack Vector | Platform Defensive Mitigation |
| :--- | :--- | :--- |
| **Spoofing** | Forged user identity or token fabrication | Cryptographically signed JWTs (HMAC-SHA256) with short expiration (15 min); rotating refresh tokens in HTTP-only SameSite cookies. |
| **Tampering** | Injected events or modified sequence numbers | Immutable append-only event journal; SQL constraints enforce sequence integrity; audit log tracks administrative changes. |
| **Repudiation** | Denying an administrative action or key creation | Immutable `audit_logs` record user ID, IP address, timestamp, resource ID, and JSON payload. |
| **Information Disclosure** | Cross-tenant data leakage via URL ID tampering | Multi-tenancy isolation enforced in every JPA repository query via `workspace_id = :workspaceId`. |
| **Denial of Service** | Thundering herd event ingestion flood | API rate limiting; bounded connection pools; asynchronous decoupled webhook delivery queues. |
| **Elevation of Privilege** | Normal developer modifying workspace role to OWNER | Spring Security `@PreAuthorize` method security; RBAC hierarchy checks (`OWNER` > `ADMIN` > `DEVELOPER` > `VIEWER`). |

---

## 2. Multi-Tenant Isolation
Tenant boundaries are never enforced solely in the presentation tier. Every REST endpoint:
1. Validates that the authenticated principal has access to the target `workspaceId`.
2. Sets `TenantContext.setCurrentWorkspaceId(...)` for the request thread.
3. Automatically appends `workspace_id` predicates to all SQL queries and inserts.

---

## 3. Cryptographic Storage Standards
- **User Passwords:** Hashed with Argon2id or BCrypt (12 rounds) with unique salt per user.
- **API Keys (`wrl_...`):** Hashed with SHA-256 before storage in `api_keys.key_hash`. Raw key is displayed only once.
- **Broker Credentials:** RabbitMQ passwords encrypted with AES-256-GCM using managed encryption key in `application.yml`.
