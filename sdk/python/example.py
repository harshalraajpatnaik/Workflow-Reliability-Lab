#!/usr/bin/env python3
"""
Sample demonstration of Workflow Reliability Lab Python SDK.
"""

from workflow_reliability_lab import WorkflowLabClient

def main():
    client = WorkflowLabClient(
        endpoint="http://localhost:8085",
        api_key="wrl_live_demo_test_key",
        workspace_id="4c2dd3fa-5db1-4b8c-949f-ce2f6d169702"
    )

    print("Publishing workflow event...")
    success = client.publish_event(
        execution_id="exec_order_882194",
        event_type="PAYMENT_CAPTURED",
        source_service="checkout-frontend",
        target_service="payment-gateway",
        idempotencyKey="idem_pay_882194",
        payload={"amount": 149.99, "currency": "USD"}
    )
    print(f"Event published: {success}")

if __name__ == "__main__":
    main()
