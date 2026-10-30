import json
from typing import Any, Dict, Optional
import requests

class WorkflowLabClient:
    """Official Python Client for Workflow Reliability Lab."""

    def __init__(self, endpoint: str, api_key: str, workspace_id: str, timeout: int = 10):
        self.endpoint = endpoint.rstrip("/")
        self.api_key = api_key
        self.workspace_id = workspace_id
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
            "X-API-Key": self.api_key
        })

    def publish_event(
        self,
        execution_id: str,
        event_type: str,
        source_service: str = "python-client",
        target_service: Optional[str] = None,
        idempotency_key: Optional[str] = None,
        payload: Optional[Dict[str, Any]] = None,
        sequence_number: Optional[int] = None
    ) -> bool:
        """Publishes a workflow lifecycle event with idempotency guarantees."""
        url = f"{self.endpoint}/api/v1/workspaces/{self.workspace_id}/events"
        data = {
            "executionId": execution_id,
            "eventType": event_type,
            "sourceService": source_service,
            "targetService": target_service,
            "idempotencyKey": idempotency_key,
            "payload": json.dumps(payload) if payload else None,
            "sequenceNumber": sequence_number
        }
        res = self.session.post(url, json=data, timeout=self.timeout)
        return res.status_code in (200, 201)

    def publish_span(
        self,
        trace_id: str,
        span_id: str,
        service_name: str,
        operation_name: str,
        parent_span_id: Optional[str] = None,
        status_code: str = "OK",
        duration_ms: Optional[int] = None,
        attributes: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Publishes an OpenTelemetry span into the distributed trace waterfall."""
        url = f"{self.endpoint}/api/v1/workspaces/{self.workspace_id}/traces/spans"
        data = {
            "traceId": trace_id,
            "spanId": span_id,
            "parentSpanId": parent_span_id,
            "serviceName": service_name,
            "name": operation_name,
            "statusCode": status_code,
            "durationMs": duration_ms,
            "attributes": attributes
        }
        res = self.session.post(url, json=data, timeout=self.timeout)
        return res.status_code in (200, 201)

    def run_scenario(self, scenario_code: str, environment_id: str) -> Dict[str, Any]:
        """Triggers a controlled failure scenario simulation."""
        url = f"{self.endpoint}/api/v1/workspaces/{self.workspace_id}/scenarios/{scenario_code}/run"
        res = self.session.post(url, json={"environmentId": environment_id}, timeout=self.timeout)
        res.raise_for_status()
        return res.json()
