#!/usr/bin/env python3
"""
Complete End-to-End demonstration of Workflow Reliability Lab Python SDK.
Demonstrates:
  1. Initializing client with API Key and Workspace
  2. Registering a workflow execution
  3. Ingesting durable lifecycle events with idempotency keys
  4. Publishing distributed OpenTelemetry trace spans
  5. Reading back the execution timeline
"""

import os
import sys
import uuid
from workflow_reliability_lab import WorkflowLabClient

def main():
    endpoint = os.getenv("WRL_ENDPOINT", "http://127.0.0.1:8085")
    api_key = os.getenv("WRL_API_KEY", "wrl_QWYlStHzvi5ErbhyyfPP88FXbSOAaI1eCydggvVKq3k")
    workspace_id = os.getenv("WRL_WORKSPACE_ID", "4c2dd3fa-5db1-4b8c-949f-ce2f6d169702")
    environment_id = os.getenv("WRL_ENVIRONMENT_ID", "6b47169a-db33-4943-aaa4-21b2635cd64f")

    print(f"Connecting to Workflow Reliability Lab at {endpoint}...")
    client = WorkflowLabClient(endpoint=endpoint, api_key=api_key, workspace_id=workspace_id)

    # 1. Register a new workflow execution
    correlation_id = f"order-saga-{uuid.uuid4().hex[:8]}"
    print(f"\n[1/4] Registering new workflow execution for correlationId: {correlation_id}...")
    execution = client.create_execution(
        workflow_name="E-Commerce Order Fulfillment Saga",
        environment_id=environment_id,
        correlation_id=correlation_id,
        trigger_source="CHECKOUT_FRONTEND",
        input_payload_meta={"cartTotal": 149.99, "currency": "USD", "items": 3}
    )
    exec_id = execution["id"]
    print(f"Execution successfully created! Execution ID: {exec_id}")

    # 2. Publish lifecycle events with idempotency keys
    print(f"\n[2/4] Ingesting lifecycle events into durable journal...")
    client.publish_event(
        execution_id=exec_id,
        event_type="ORDER_SUBMITTED",
        source_service="checkout-frontend",
        target_service="order-service",
        correlation_id=correlation_id,
        idempotency_key=f"idem-submit-{correlation_id}",
        payload={"orderId": correlation_id, "amount": 149.99}
    )

    client.publish_event(
        execution_id=exec_id,
        event_type="PAYMENT_CAPTURED",
        source_service="order-service",
        target_service="payment-gateway",
        correlation_id=correlation_id,
        idempotency_key=f"idem-pay-{correlation_id}",
        payload={"provider": "Stripe", "transactionRef": f"ch_{uuid.uuid4().hex[:12]}", "status": "succeeded"}
    )

    # Demonstrate deduplication
    print("Testing idempotency guarantee (re-sending duplicate PAYMENT_CAPTURED)...")
    duplicate_accepted = client.publish_event(
        execution_id=exec_id,
        event_type="PAYMENT_CAPTURED",
        source_service="order-service",
        target_service="payment-gateway",
        correlation_id=correlation_id,
        idempotency_key=f"idem-pay-{correlation_id}",
        payload={"provider": "Stripe", "transactionRef": "duplicate-attempt"}
    )
    print(f"Duplicate event safely handled: {duplicate_accepted}")

    # 3. Ingest OpenTelemetry distributed trace spans
    trace_id = f"trace-{uuid.uuid4().hex[:16]}"
    print(f"\n[3/4] Publishing OpenTelemetry distributed trace spans (Trace ID: {trace_id})...")
    client.publish_span(
        trace_id=trace_id,
        span_id="span-root-http",
        service_name="api-gateway",
        operation_name="POST /v1/orders",
        status_code="OK",
        duration_ms=45,
        execution_id=exec_id,
        attributes={"http.status_code": 200, "client.ip": "192.168.1.1"}
    )

    client.publish_span(
        trace_id=trace_id,
        span_id="span-child-db",
        parent_span_id="span-root-http",
        service_name="order-service",
        operation_name="SQL INSERT INTO orders",
        status_code="OK",
        duration_ms=12,
        execution_id=exec_id,
        attributes={"db.system": "postgresql", "db.statement": "INSERT INTO orders..."}
    )
    print("Traces and spans published successfully.")

    # 4. Verify chronological event timeline
    print(f"\n[4/4] Verifying event journal timeline...")
    events = client.get_execution_timeline(exec_id)
    print(f"Total events in journal: {len(events)}")
    for ev in events:
        print(f"  - [{ev.get('occurredAt')}] {ev.get('eventType')} (Service: {ev.get('sourceService')}, Idempotency: {ev.get('idempotencyKey')})")

    print("\nEnd-to-end Python SDK run completed successfully! All data persisted to Workflow Reliability Lab.")

if __name__ == "__main__":
    main()
