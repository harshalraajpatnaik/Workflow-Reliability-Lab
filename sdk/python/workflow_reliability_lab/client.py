import json
import uuid
import urllib.request
import urllib.error
from typing import Any, Dict, List, Optional

class WorkflowLabClient:
    """
    Official Python Client for Workflow Reliability Lab.
    Standard library based: zero external dependencies required.
    """

    def __init__(self, endpoint: str, api_key: str, workspace_id: str, timeout: int = 15):
        self.endpoint = endpoint.rstrip("/")
        self.api_key = api_key
        self.workspace_id = workspace_id
        self.timeout = timeout

    def _call(self, method: str, path: str, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        url = f"{self.endpoint}{path}"
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-API-Key": self.api_key,
            "Authorization": f"Bearer {self.api_key}",
            "User-Agent": "WorkflowLab-Python-SDK/1.0.0"
        }
        body_bytes = json.dumps(payload).encode("utf-8") if payload is not None else None
        req = urllib.request.Request(url, data=body_bytes, headers=headers, method=method)

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                resp_text = resp.read().decode("utf-8")
                return json.loads(resp_text) if resp_text else {}
        except urllib.error.HTTPError as e:
            raw_err = e.read().decode("utf-8")
            try:
                err_json = json.loads(raw_err)
                return err_json
            except Exception:
                raise RuntimeError(f"WorkflowLab API error HTTP {e.code}: {raw_err}")
        except Exception as e:
            raise RuntimeError(f"Failed to connect to WorkflowLab at {url}: {str(e)}")

    def create_execution(
        self,
        workflow_name: str,
        environment_id: str,
        correlation_id: Optional[str] = None,
        trigger_source: str = "PYTHON_SDK",
        input_payload_meta: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Registers a new workflow execution in the workspace."""
        path = f"/api/v1/workspaces/{self.workspace_id}/executions"
        data = {
            "workflowName": workflow_name,
            "environmentId": environment_id,
            "correlationId": correlation_id or str(uuid.uuid4()),
            "triggerSource": trigger_source,
            "inputPayloadMeta": json.dumps(input_payload_meta) if input_payload_meta else None
        }
        res = self._call("POST", path, data)
        return res.get("data", res)

    def get_execution(self, execution_id: str) -> Dict[str, Any]:
        """Retrieves execution details and status."""
        path = f"/api/v1/workspaces/{self.workspace_id}/executions/{execution_id}"
        res = self._call("GET", path)
        return res.get("data", res)

    def publish_event(
        self,
        execution_id: str,
        event_type: str,
        source_service: str = "python-client",
        target_service: Optional[str] = None,
        correlation_id: Optional[str] = None,
        idempotency_key: Optional[str] = None,
        idempotencyKey: Optional[str] = None,
        payload: Optional[Any] = None,
        sequence_number: Optional[int] = None
    ) -> bool:
        """Publishes a workflow lifecycle event with idempotency guarantees."""
        path = f"/api/v1/workspaces/{self.workspace_id}/events"
        key = idempotency_key or idempotencyKey or f"idem_{uuid.uuid4().hex[:16]}"
        payload_str = payload if isinstance(payload, str) else (json.dumps(payload) if payload else None)

        data = {
            "executionId": execution_id,
            "eventType": event_type,
            "sourceService": source_service,
            "targetService": target_service,
            "correlationId": correlation_id or str(uuid.uuid4()),
            "idempotencyKey": key,
            "payload": payload_str,
            "sequenceNumber": sequence_number
        }
        res = self._call("POST", path, data)
        return res.get("success", False) or "event" in res.get("data", {})

    def get_execution_timeline(self, execution_id: str) -> List[Dict[str, Any]]:
        """Retrieves chronological event journal for an execution."""
        path = f"/api/v1/workspaces/{self.workspace_id}/executions/{execution_id}/events"
        res = self._call("GET", path)
        return res.get("data", [])

    def publish_span(
        self,
        trace_id: str,
        span_id: str,
        service_name: str,
        operation_name: str,
        parent_span_id: Optional[str] = None,
        status_code: str = "OK",
        duration_ms: Optional[int] = None,
        attributes: Optional[Dict[str, Any]] = None,
        execution_id: Optional[str] = None
    ) -> bool:
        """Publishes an OpenTelemetry span into the distributed trace waterfall."""
        path = f"/api/v1/workspaces/{self.workspace_id}/traces/spans"
        data = {
            "traceId": trace_id,
            "spanId": span_id,
            "parentSpanId": parent_span_id,
            "serviceName": service_name,
            "name": operation_name,
            "operationName": operation_name,
            "statusCode": status_code,
            "durationMs": duration_ms,
            "attributes": json.dumps(attributes) if isinstance(attributes, dict) else attributes,
            "executionId": execution_id
        }
        res = self._call("POST", path, data)
        return res.get("success", False)

    def get_trace(self, trace_id: str) -> Dict[str, Any]:
        """Retrieves full distributed trace waterfall and spans."""
        path = f"/api/v1/workspaces/{self.workspace_id}/traces/{trace_id}"
        res = self._call("GET", path)
        return res.get("data", res)

    def run_scenario(self, scenario_code: str, environment_id: str) -> Dict[str, Any]:
        """Triggers a controlled failure scenario simulation."""
        path = f"/api/v1/workspaces/{self.workspace_id}/scenarios/{scenario_code}/run"
        res = self._call("POST", path, {"environmentId": environment_id})
        return res.get("data", res)
