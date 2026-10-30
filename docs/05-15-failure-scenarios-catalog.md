# 15 Failure Scenarios Catalog — Workflow Reliability Lab

Each failure scenario is pre-engineered with reproducible chaos injection parameters, expected anomaly detections, and deterministic invariant checks:

| Code | Name | Category | Injected Fault | Expected Anomaly | Invariant Tested |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `SCEN_NET_TIMEOUT` | Gateway Network Timeout | NETWORK | 5000ms delay on third-party HTTP gateway | `EXECUTION_DURATION_THRESHOLD`, `REPEATED_FAILURES` | `INV-007` (Retry Boundedness) |
| `SCEN_DUP_EVENT` | Duplicate Webhook Replay | MESSAGING | Replays identical webhook with identical idempotency key | `DUPLICATE_IDEMPOTENCY_KEY` | `INV-002` (Idempotency Uniqueness) |
| `SCEN_OUT_OF_ORDER` | Out-of-Order Message Queue | MESSAGING | Delivers order fulfillment step before payment authorized | `OUT_OF_ORDER_EVENT` | `INV-003` (Sequence Monotonicity) |
| `SCEN_SAGA_COMP_FAIL` | Saga Compensation Failure | DISTRIBUTED_TXN | Step 2 fails, compensation webhook throws HTTP 500 | `FAILED_COMPENSATION` | `INV-006` (Compensation Completeness) |
| `SCEN_OVER_REFUND` | Concurrent Over-Refund Race | FINANCIAL | Parallel refund calls attempting to refund $150 on $100 charge | `INVARIANT_VIOLATION` | `INV-005` (Refund Ceiling) |
| `SCEN_DLQ_POISON` | Poison Pill Dead-Letter Flood | QUEUE | Malformed JSON schema causing consumer JSON parse error | `DEAD_LETTER_ACCUMULATION` | `INV-007` (Retry Boundedness) |
| `SCEN_PARTIAL_WRITE` | Split-Brain Partial DB Write | DISTRIBUTED_TXN | Database write timeout midway through order state update | `STATE_DESYNCHRONIZATION` | `INV-001` (Terminal Singularity) |
| `SCEN_RETRY_STORM` | Thundering Herd Retry Storm | NETWORK | 20 rapid retries without exponential backoff jitter | `EXCESSIVE_RETRIES` | `INV-007` (Retry Boundedness) |
| `SCEN_CIRCUIT_OPEN` | Cascading Circuit Breaker Trip | NETWORK | Error rate triggers circuit breaker open state | `CIRCUIT_BREAKER_TRIPPED` | `INV-008` (Valid State Transitions) |
| `SCEN_ZOMBIE_WORKER` | Zombie Worker Double Execution | DISTRIBUTED_TXN | Node lock expires prematurely; two workers claim task | `CONCURRENT_EXECUTION_CONFLICT`| `INV-002` (Idempotency Uniqueness) |
| `SCEN_CLOCK_SKEW` | Distributed Node Clock Skew | MESSAGING | Timestamps on events differ by +30 seconds | `CLOCK_DRIFT_ANOMALY` | `INV-003` (Sequence Monotonicity) |
| `SCEN_LEDGER_LEAK` | Asynchronous Ledger Imbalance | FINANCIAL | Debit recorded without corresponding credit entry | `LEDGER_IMBALANCE` | `INV-004` (Ledger Zero-Sum) |
| `SCEN_LOST_ACK` | Unacknowledged Broker Message | QUEUE | Message processed but TCP ACK lost before reaching broker | `UNACKNOWLEDGED_MESSAGE_REPLAY` | `INV-002` (Idempotency Uniqueness) |
| `SCEN_DB_DEADLOCK` | Relational Deadlock Rollback | DISTRIBUTED_TXN | Transaction deadlock triggers SQL state 40P01 rollback | `TRANSACTION_ROLLBACK` | `INV-008` (Valid State Transitions) |
| `SCEN_BACKPRESSURE` | Consumer Group Backpressure | QUEUE | Processing latency exceeds queue ingestion rate by 10x | `BACKPRESSURE_SATURATION` | `INV-007` (Retry Boundedness) |
