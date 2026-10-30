# SDK Integration Guide (Java & Python)

Workflow Reliability Lab provides lightweight native SDKs for Java and Python to ingest lifecycle events, spans, and simulation triggers with zero external runtime dependencies.

---

## 1. Java SDK Quickstart

### Maven Dependency
```xml
<dependency>
    <groupId>dev.workflowlab</groupId>
    <artifactId>workflow-reliability-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Initializing Client
```java
import dev.workflowlab.sdk.WorkflowReliabilityClient;
import dev.workflowlab.sdk.model.EventSubmission;
import dev.workflowlab.sdk.model.TraceSubmission;

WorkflowReliabilityClient client = WorkflowReliabilityClient.builder()
    .endpoint("http://localhost:8085")
    .apiKey("wrl_live_8f7b249a0c1e84d6b...")
    .workspaceId("4c2dd3fa-5db1-4b8c-949f-ce2f6d169702")
    .build();
```

### Publishing Workflow Event with Idempotency Key
```java
boolean success = client.publishEvent(EventSubmission.builder()
    .executionId("exec_order_88192")
    .eventType("ORDER_SUBMITTED")
    .sourceService("checkout-api")
    .targetService("order-service")
    .idempotencyKey("idem_order_88192_submit")
    .sequenceNumber(1)
    .payload(Map.of("total", 125.00, "currency", "USD"))
    .build());
```

---

## 2. Python SDK Quickstart

### Installation
```bash
pip install ./sdk/python
```

### Publishing Event & Spans
```python
from workflow_reliability_lab import WorkflowLabClient

client = WorkflowLabClient(
    endpoint="http://localhost:8085",
    api_key="wrl_live_8f7b249a0c1e84d6b...",
    workspace_id="4c2dd3fa-5db1-4b8c-949f-ce2f6d169702"
)

# Publish lifecycle event
client.publish_event(
    execution_id="exec_order_88192",
    event_type="PAYMENT_CAPTURED",
    source_service="checkout-service",
    idempotency_key="idem_pay_88192_cap",
    payload={"amount": 125.00, "currency": "USD"}
)

# Publish OpenTelemetry trace span
client.publish_span(
    trace_id="4bf92f3577b34da6a3ce929d0e0e4736",
    span_id="00f067aa0ba902b7",
    service_name="payment-service",
    operation_name="POST /charges",
    status_code="OK",
    duration_ms=45
)
```
