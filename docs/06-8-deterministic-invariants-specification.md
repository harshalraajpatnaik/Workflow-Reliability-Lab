# 8 Deterministic Business Invariants Specification

Business invariants are formal mathematical constraints evaluated deterministically on an execution journal to guarantee distributed system correctness.

---

### INV-001: Terminal State Singularity
- **Formula:** $\forall e \in \text{Events}(x) : \text{state}(e) \in \{\text{COMPLETED}, \text{FAILED}, \text{CANCELLED}\} \implies \text{index}(e) = \max(\text{Indices}(x))$
- **Constraint:** Once an execution transitions into a terminal status, no subsequent state transitions or events may be recorded.
- **Severity:** `CRITICAL`
- **Failure Symptom:** Zombie execution threads writing to already completed or cancelled workflows.

---

### INV-002: Strict Idempotency Key Uniqueness
- **Formula:** $\forall e_1, e_2 \in \text{Events}(x) : e_1.\text{idempotencyKey} = e_2.\text{idempotencyKey} \implies e_1.\text{sideEffects} \equiv e_2.\text{sideEffects} = \emptyset$
- **Constraint:** Multiple occurrences of an identical idempotency key must not execute duplicated side effects.
- **Severity:** `CRITICAL`
- **Failure Symptom:** Double billing customers or duplicate shipment creation on network retransmits.

---

### INV-003: Monotonic Event Sequence Ordering
- **Formula:** $\forall i < j : \text{seq}(e_i) < \text{seq}(e_j)$
- **Constraint:** Sequence numbers within a workflow execution partition must be strictly monotonically increasing without gaps or inversions.
- **Severity:** `HIGH`
- **Failure Symptom:** Out-of-order queue consumers processing fulfillment before payment authorization.

---

### INV-004: Payment Ledger Balance Zero-Sum
- **Formula:** $\sum \text{Debits} - \sum \text{Credits} - \sum \text{PendingAuthorizations} = 0$
- **Constraint:** In double-entry transaction ledgers, debits must strictly equal credits upon saga completion.
- **Severity:** `CRITICAL`
- **Failure Symptom:** Financial ledger drift, unallocated balance holds, or reconciliation discrepancies.

---

### INV-005: Refund Cumulative Amount Ceiling
- **Formula:** $\sum \text{Refunds}(t) \le \text{CapturedAmount}(t)$
- **Constraint:** Cumulative refund amounts issued for a transaction must never exceed the captured charge amount.
- **Severity:** `CRITICAL`
- **Failure Symptom:** Race conditions allowing multiple refund requests to issue over 100% of charge value.

---

### INV-006: Saga Compensation Completeness
- **Formula:** $\exists s_k \text{ failed} \implies \forall j < k : \exists c_j \text{ (compensation for } s_j\text{)}$
- **Constraint:** If an orchestrated distributed saga fails at step $k$, all previously successful forward steps $j < k$ must execute their compensating actions.
- **Severity:** `HIGH`
- **Failure Symptom:** Partial distributed transaction state (e.g. inventory reserved but payment never captured).

---

### INV-007: Maximum Retry Boundedness
- **Formula:** $\forall a \in \text{Activities}(x) : \text{retries}(a) \le \text{MAX\_RETRIES}$ (default: 5)
- **Constraint:** No activity or message consumer may retry beyond the configured upper bound before escalating or routing to a DLQ.
- **Severity:** `MEDIUM`
- **Failure Symptom:** Thundering herd retry storms causing cascading saturation across downstream microservices.

---

### INV-008: Valid State Transition Matrix
- **Formula:** $\forall (s_i, s_{i+1}) \in \text{Transitions}(x) : (s_i, s_{i+1}) \in \mathcal{T}_{\text{valid}}$
- **Constraint:** State changes must strictly adhere to the defined state machine topology (e.g., `PENDING` $\to$ `AUTHORIZED` $\to$ `CAPTURED` $\to$ `REFUNDED`; never `REFUNDED` $\to$ `CAPTURED`).
- **Severity:** `CRITICAL`
- **Failure Symptom:** Invalid state transitions corrupting the transaction lifecycle.
