-- V018: Built-in Scenarios and Invariant Definitions

-- 1. Built-in Invariant Definitions
INSERT INTO invariant_definitions (code, name, description, severity, rule_type, is_builtin) VALUES
('INV_STEP_REQ', 'Required Steps Completion', 'A workflow cannot reach COMPLETED status if mandatory lifecycle steps are missing.', 'CRITICAL', 'REQUIRED_STEPS', true),
('INV_NO_DOUBLE_CHARGE', 'No Duplicate Charges', 'A completed payment transaction cannot be charged again for the same idempotency key.', 'CRITICAL', 'NO_DOUBLE_CHARGE', true),
('INV_REFUND_LIMIT', 'Refund Exceeds Captured Limit', 'Total refunded amount cannot exceed the original captured amount.', 'CRITICAL', 'REFUND_LIMIT', true),
('INV_DUP_TRANSITION', 'No Duplicate State Transition', 'A duplicate event or webhook must not produce duplicate state transitions.', 'HIGH', 'NO_DUP_TRANSITION', true),
('INV_TERMINAL_IMMUTABLE', 'Terminal State Immutability', 'A terminal execution state (COMPLETED, FAILED, CANCELLED) cannot transition to any other state.', 'CRITICAL', 'TERMINAL_IMMUTABLE', true),
('INV_COMPENSATION_RECORDED', 'Compensating Actions Logged', 'When a workflow fails midway, all compensating transaction actions must be explicitly recorded.', 'HIGH', 'COMPENSATION_LOGGED', true),
('INV_STATE_MATCH_HISTORY', 'State Matches Event Journal', 'Current aggregate entity state must mathematically and logically match the replay of its event journal.', 'HIGH', 'STATE_JOURNAL_MATCH', true),
('INV_RECONCILIATION_BALANCE', 'Reconciliation Balancing', 'Ledger balance entries must zero-balance against external payment provider statements.', 'HIGH', 'RECONCILIATION_BALANCE', true);

-- 2. Built-in Failure Scenarios (15 Scenarios from specification)
INSERT INTO scenarios (code, name, category, description, severity, preconditions, fault_config, expected_behavior, detection_rule, recovery_guidance, is_builtin) VALUES
('SCEN_NET_TIMEOUT', 'Downstream Network Timeout', 'Network', 'Simulates downstream HTTP service latency exceeding the 5000ms socket timeout.', 'HIGH',
 '["Service reachable", "Circuit breaker closed"]',
 '{"type": "NETWORK_TIMEOUT", "targetService": "InventoryService", "delayMs": 8000, "timeoutThresholdMs": 5000}',
 'Client aborts with SocketTimeoutException, records retry attempt with exponential backoff.', 'DURATION_THRESHOLD', 'Implement resilient timeouts and fallback caches.', true),

('SCEN_SERVICE_503', 'Upstream Dependency Unavailable (503)', 'Service', 'Simulates upstream auth/payment provider returning HTTP 503 Service Unavailable.', 'HIGH',
 '["Target endpoint configured"]',
 '{"type": "SERVICE_UNAVAILABLE", "targetService": "BillingGateway", "httpStatus": 503}',
 'Workflow captures transient error, increments retry count, does not mark payment failed prematurely.', 'REPEATED_FAILURES', 'Employ jittered backoff and circuit breaker tripping.', true),

('SCEN_DB_TIMEOUT', 'Database Connection Pool Exhaustion', 'Database', 'Simulates HikariCP connection acquisition timeout under database lock contention.', 'CRITICAL',
 '["Hikari pool max 10"]',
 '{"type": "DB_TIMEOUT", "acquireTimeoutMs": 3000, "simulatedQueryHoldMs": 6000}',
 'Connection acquisition throws CannotAcquireLockException, transaction rolls back cleanly.', 'LONG_RUNNING_EXECUTION', 'Optimize slow queries, add index, scale connection pool.', true),

('SCEN_WORKER_CRASH', 'Async Worker Sudden Crash', 'Compute', 'Simulates SIGKILL on background worker node mid-saga execution before event ack.', 'CRITICAL',
 '["Event dequeued but not acked"]',
 '{"type": "WORKER_CRASH", "killSignal": 9, "step": "PROCESS_PAYMENT"}',
 'Heartbeat fails, message visibility timeout expires, another worker claims task without duplicate processing.', 'MISSING_EVENT', 'Ensure worker heartbeats and idempotent task consumers.', true),

('SCEN_DUP_MESSAGE', 'Duplicate Message Ingestion', 'Messaging', 'Simulates at-least-once message broker redelivery of the exact same event.', 'HIGH',
 '["Event previously processed"]',
 '{"type": "DUPLICATE_MESSAGE", "duplicateCount": 2, "intervalMs": 250}',
 'Idempotency filter identifies duplicate key, ignores redundant processing, returns identical success result.', 'DUPLICATE_EVENT', 'Use transactional inbox with unique idempotency keys.', true),

('SCEN_DELAYED_MESSAGE', 'Delayed Message Delivery', 'Messaging', 'Simulates 45-minute broker queue backpressure and message delay.', 'MEDIUM',
 '["Queue depth elevated"]',
 '{"type": "DELAYED_MESSAGE", "delayMinutes": 45}',
 'Consumer receives message after expected window, validates current state before executing stale instructions.', 'OUT_OF_ORDER_EVENT', 'Include TTL and state freshness assertions on consumers.', true),

('SCEN_OUT_OF_ORDER', 'Out-of-Order Event Sequencing', 'Messaging', 'Simulates Step 3 (Shipped) arriving before Step 2 (Paid).', 'HIGH',
 '["Step 1 Completed"]',
 '{"type": "OUT_OF_ORDER", "sequence": ["OrderCreated", "OrderShipped", "OrderPaid"]}',
 'State machine rejects invalid transition or buffers future event until prerequisites arrive.', 'OUT_OF_ORDER_EVENT', 'Implement sequence resequencer or reject illegal transition.', true),

('SCEN_RETRY_STORM', 'Thundering Herd / Retry Storm', 'Resilience', 'Simulates 50 workers simultaneously retrying a failing service without jitter.', 'HIGH',
 '["Downstream degraded"]',
 '{"type": "RETRY_STORM", "concurrentRetries": 50, "backoffJitter": false}',
 'Rate limiter engages, sheds 80% traffic, downstream receives throttled load.', 'EXCESSIVE_RETRIES', 'Apply full-jitter randomized exponential backoff and token buckets.', true),

('SCEN_POISON_MESSAGE', 'Malformed Poison Pill Payload', 'Messaging', 'Simulates schema deserialization failure causing unhandled Jackson exception.', 'HIGH',
 '["Valid queue listener active"]',
 '{"type": "POISON_MESSAGE", "malformedField": "amount", "payload": "{amount: NaN}"}',
 'Error handler captures validation error, routes message directly to DLQ without crashing listener thread.', 'UNEXPECTED_PAYLOAD', 'Wrap deserializer in safe DLQ routing handler.', true),

('SCEN_DEAD_LETTER', 'Dead-Letter Queue Re-routing', 'Messaging', 'Simulates message exhausting 5 retry attempts and moving to DLQ.', 'HIGH',
 '["Max retries = 5"]',
 '{"type": "DEAD_LETTER", "retryLimit": 5}',
 'Final attempt fails, event dead-lettered with diagnostic error headers.', 'REPEATED_FAILURES', 'Configure DLQ alerting, inspection dashboard and redrive tools.', true),

('SCEN_PARTIAL_SAGA_FAIL', 'Saga Mid-Flight Failure & Rollback', 'Workflow', 'Step 1 succeeds, Step 2 succeeds, Step 3 fails, triggering compensating transactions.', 'CRITICAL',
 '["Steps 1 and 2 completed"]',
 '{"type": "PARTIAL_SAGA_FAIL", "failedStep": "RESERVE_FLIGHT"}',
 'Saga coordinator executes compensating transactions in reverse order (CancelHotel, RefundDeposit).', 'MISSING_EVENT', 'Build reliable saga coordinators with backward compensation.', true),

('SCEN_PAYMENT_TIMEOUT', 'Payment Gateway Timeout on Capture', 'Payment', 'Simulates Stripe/Adyen charge call timing out with uncertain outcome.', 'CRITICAL',
 '["Payment initiated"]',
 '{"type": "PAYMENT_TIMEOUT", "providerTimeoutMs": 10000}',
 'System does NOT blindly retry charge; flags reconciliation pending, queries gateway before re-attempting.', 'PAYMENT_INCONSISTENCY', 'Never blind-retry. Always query gateway reconciliation API first.', true),

('SCEN_WEBHOOK_DUP', 'Duplicate Payment Webhook Delivery', 'Payment', 'Simulates payment provider delivering charge.succeeded webhook 3 times.', 'HIGH',
 '["Payment authorized"]',
 '{"type": "WEBHOOK_DUP", "deliveries": 3, "providerEventId": "evt_test_dup_999"}',
 'Webhook inbox checks provider_event_id, processes first, returns 200 OK for subsequent duplicates without double-capturing.', 'DUPLICATE_EVENT', 'Persist incoming webhooks with unique provider event IDs.', true),

('SCEN_WEBHOOK_DELAY', 'Webhook Delivered Before Redirect Response', 'Payment', 'Simulates webhook arriving at backend before browser returns from 3D-Secure redirect.', 'MEDIUM',
 '["3DS authentication active"]',
 '{"type": "WEBHOOK_BEFORE_REDIRECT", "webhookDeltaMs": -1500}',
 'Backend safely transitions state; redirect handler checks state and observes already completed payment.', 'OUT_OF_ORDER_EVENT', 'Treat webhooks and redirect callbacks as concurrent converging updates.', true),

('SCEN_DB_CONFLICT', 'Optimistic Locking Version Conflict', 'Database', 'Simulates concurrent updates to the same execution record triggering OptimisticLockException.', 'HIGH',
 '["Record version = 1"]',
 '{"type": "DB_CONFLICT", "concurrentThreads": 2}',
 'Spring Data JPA catches ObjectOptimisticLockingFailureException, re-reads fresh entity, retries transaction.', 'REPEATED_FAILURES', 'Use JPA @Version and bounded application-level retry loops.', true);
