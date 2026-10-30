# Operations Runbook & Local Deployment

This runbook describes local deployment, operational monitoring, environment variables, and disaster recovery procedures for Workflow Reliability Lab.

---

## 1. Port Allocation Map
To prevent port collisions with existing local Docker containers or developer processes:
| Service | Internal Port | Mapped Host Port | URL | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL 16** | 5432 | **5433** | `localhost:5433` | Container: `wrl-postgres` (avoids 5432 collision) |
| **MailHog SMTP** | 1025 | **1025** | `localhost:1025` | Container: `wrl-mailhog` |
| **MailHog UI** | 8025 | **8025** | `http://localhost:8025` | Webmail inbox for email verification & reset |
| **Spring Boot API** | 8085 | **8085** | `http://localhost:8085` | OpenAPI: `http://localhost:8085/swagger-ui/index.html` |
| **Angular Web UI** | 4200 | **4200** | `http://localhost:4200` | Full reactive dark console |

---

## 2. Environment Variables (`.env`)
```bash
# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_DB=workflow_lab
POSTGRES_USER=wrl_user
POSTGRES_PASSWORD=wrl_dev_password_change_me_in_prod

# MailHog SMTP
SPRING_MAIL_HOST=localhost
SPRING_MAIL_PORT=1025

# Server & Security
SERVER_PORT=8085
JWT_SECRET=super_secret_jwt_signing_key_at_least_256_bits_length_for_wrl_lab_2026
JWT_ACCESS_EXPIRATION_MS=900000
JWT_REFRESH_EXPIRATION_MS=604800000

# Optional AI Configuration
AI_ENABLED=false
LM_STUDIO_URL=http://localhost:1234/v1
```

---

## 3. Starting the Platform Locally

### Step 1: Start Docker Infrastructure
```bash
docker compose up -d
```

### Step 2: Build & Start Spring Boot Backend
```bash
cd backend
mvn clean package -DskipTests
java -jar target/workflow-reliability-lab-backend-1.0.0-SNAPSHOT.jar
```

### Step 3: Start Angular Frontend Console
```bash
cd frontend
npm install
npx ng serve --port 4200 --host 0.0.0.0
```

---

## 4. Default Seed Credentials
- **Lead Architect Demo Account:**
  - Email: `lead.architect@workflowlab.dev`
  - Password: `Password123!@#`
  - Default Workspace: `Lead Architect's Workspace`
- **MailHog Inbox:**
  - Web UI: `http://localhost:8025`
