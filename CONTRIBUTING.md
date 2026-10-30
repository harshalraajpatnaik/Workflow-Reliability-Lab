# Contributing to Workflow Reliability Lab

Thank you for your interest in contributing to **Workflow Reliability Lab**! We welcome contributions from developers, SREs, QA engineers, and distributed systems architects.

---

## Code of Conduct
By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Development Setup

### 1. Prerequisites
- **Java 21 LTS**
- **Maven 3.9+**
- **Node.js 20+** and **npm**
- **Docker** and **Docker Compose**

### 2. Fork and Clone
```bash
git clone https://github.com/harshalraajpatnaik/Workflow-Reliability-Lab.git
cd Workflow-Reliability-Lab
```

### 3. Local Verification
Start the infrastructure:
```bash
docker-compose up -d
```

Build the backend:
```bash
cd backend
mvn clean package -DskipTests
```

Build the frontend:
```bash
cd ../frontend
npm install
npx ng build
```

---

## Submitting a Pull Request

1. **Create a Topic Branch:**
   ```bash
   git checkout -b feature/my-new-fault-scenario
   ```
2. **Commit Guidelines:**
   - Follow Conventional Commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`.
3. **Verify Locally:**
   - Ensure the backend compiles cleanly without errors.
   - Run `python3 test_all_apis.py` to ensure all 36 endpoints pass.
4. **Push and Open PR:**
   - Push your branch to GitHub and submit a PR to `main`.
   - Provide a concise description of the motivation, changes, and test results.
