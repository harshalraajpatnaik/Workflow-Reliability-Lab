import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://localhost:8085/api/v1"

def test_endpoint(name, method, url, headers=None, json_data=None, expected_status=[200, 201]):
    req_headers = {"Content-Type": "application/json"}
    if headers:
        req_headers.update(headers)

    body = json.dumps(json_data).encode("utf-8") if json_data is not None else None
    req = urllib.request.Request(url, data=body, headers=req_headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            status = response.getcode()
            res_text = response.read().decode("utf-8")
            status_ok = status in expected_status
            result = "PASS" if status_ok else "FAIL"
            print(f"[{result}] {name:38s} | {method:6s} {url:60s} | Status: {status}")
            try:
                res_json = json.loads(res_text)
                return status_ok, res_json
            except:
                return status_ok, res_text
    except urllib.error.HTTPError as e:
        status = e.code
        status_ok = status in expected_status
        result = "PASS" if status_ok else "FAIL"
        err_body = e.read().decode("utf-8")
        print(f"[{result}] {name:38s} | {method:6s} {url:60s} | Status: {status}")
        if not status_ok:
            print(f"       Response: {err_body[:300]}")
        try:
            return status_ok, json.loads(err_body)
        except:
            return status_ok, err_body
    except Exception as e:
        print(f"[FAIL] {name:38s} | {method:6s} {url:60s} | Exception: {e}")
        return False, None

def run_tests():
    print("================================================================================")
    print("WORKFLOW RELIABILITY LAB — EXHAUSTIVE API ENDPOINT AUDIT")
    print("================================================================================")

    # 1. Public endpoints
    test_endpoint("Public Overview", "GET", f"{BASE_URL}/public/overview")

    # 2. Auth: Login
    login_data = {
        "email": "lead.architect@workflowlab.dev",
        "password": "Password123!@#"
    }
    ok, res = test_endpoint("Auth Login", "POST", f"{BASE_URL}/auth/login", json_data=login_data)
    if not ok or not res:
        print("Fatal: Login failed!")
        return

    data = res.get("data", {})
    token = data.get("accessToken")
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Workspaces
    ok, res = test_endpoint("List Workspaces", "GET", f"{BASE_URL}/workspaces", headers=headers)
    ws_list = res.get("data", [])
    if not ws_list:
        print("Fatal: No workspaces found!")
        return
    ws_id = ws_list[0]["id"]
    print(f"--> Using Workspace ID: {ws_id}")

    test_endpoint("Workspace Members", "GET", f"{BASE_URL}/workspaces/{ws_id}/members", headers=headers)

    # 4. Projects & Environments
    ok, res = test_endpoint("List Projects", "GET", f"{BASE_URL}/workspaces/{ws_id}/projects", headers=headers)
    projects = res.get("data", [])
    env_id = None
    if projects and projects[0].get("environments"):
        env_id = projects[0]["environments"][0]["id"]
    print(f"--> Using Environment ID: {env_id}")

    # 5. Executions
    ok, res = test_endpoint("List Executions", "GET", f"{BASE_URL}/workspaces/{ws_id}/executions", headers=headers)
    test_endpoint("Execution Stats", "GET", f"{BASE_URL}/workspaces/{ws_id}/executions/stats", headers=headers)

    executions = res.get("data", {}).get("content", [])
    exec_id = executions[0]["id"] if executions else None
    print(f"--> Using Execution ID: {exec_id}")

    if exec_id:
        test_endpoint("Get Execution Details", "GET", f"{BASE_URL}/workspaces/{ws_id}/executions/{exec_id}", headers=headers)
        test_endpoint("Get Execution Events", "GET", f"{BASE_URL}/workspaces/{ws_id}/executions/{exec_id}/events", headers=headers)
        test_endpoint("Get Execution Traces", "GET", f"{BASE_URL}/workspaces/{ws_id}/executions/{exec_id}/traces", headers=headers)
        test_endpoint("Get Execution Anomalies", "GET", f"{BASE_URL}/workspaces/{ws_id}/executions/{exec_id}/anomalies", headers=headers)
        test_endpoint("Get Execution Invariants", "GET", f"{BASE_URL}/workspaces/{ws_id}/executions/{exec_id}/invariants", headers=headers)

    # 6. Events
    test_endpoint("List Workspace Events", "GET", f"{BASE_URL}/workspaces/{ws_id}/events", headers=headers)
    event_payload = {
        "executionId": exec_id or "00000000-0000-0000-0000-000000000000",
        "eventType": "ORDER_SUBMITTED",
        "sourceService": "audit-tester",
        "targetService": "backend-core",
        "idempotencyKey": f"idem_audit_{hash('test')}"
    }
    test_endpoint("Ingest Event", "POST", f"{BASE_URL}/workspaces/{ws_id}/events", headers=headers, json_data=event_payload)

    # 7. Traces
    test_endpoint("List Workspace Traces", "GET", f"{BASE_URL}/workspaces/{ws_id}/traces", headers=headers)
    test_endpoint("Get Service Graph", "GET", f"{BASE_URL}/workspaces/{ws_id}/traces/service-graph", headers=headers)

    span_payload = {
        "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
        "spanId": "00f067aa0ba902b7",
        "name": "TEST /api/health",
        "serviceName": "audit-tester",
        "startTimeUs": 1730300000000000,
        "endTimeUs": 1730300000050000,
        "statusCode": "OK"
    }
    test_endpoint("Ingest Span", "POST", f"{BASE_URL}/workspaces/{ws_id}/traces/spans", headers=headers, json_data=span_payload)

    # 8. Anomalies
    test_endpoint("List Anomalies", "GET", f"{BASE_URL}/workspaces/{ws_id}/anomalies", headers=headers)
    test_endpoint("Anomaly Stats", "GET", f"{BASE_URL}/workspaces/{ws_id}/anomalies/stats", headers=headers)

    # 9. Scenarios
    test_endpoint("List Scenarios", "GET", f"{BASE_URL}/workspaces/{ws_id}/scenarios", headers=headers)
    test_endpoint("List Scenario Runs", "GET", f"{BASE_URL}/workspaces/{ws_id}/scenarios/runs", headers=headers)
    run_scenario_payload = {"environmentId": env_id}
    test_endpoint("Run Scenario SCEN_DUP_MESSAGE", "POST", f"{BASE_URL}/workspaces/{ws_id}/scenarios/SCEN_DUP_MESSAGE/run", headers=headers, json_data=run_scenario_payload)

    # 10. Invariants
    test_endpoint("Invariant Definitions", "GET", f"{BASE_URL}/workspaces/{ws_id}/invariants/definitions", headers=headers)
    test_endpoint("Invariant Results", "GET", f"{BASE_URL}/workspaces/{ws_id}/invariants/results", headers=headers)

    # 11. Payments
    test_endpoint("List Payments", "GET", f"{BASE_URL}/workspaces/{ws_id}/payments", headers=headers)
    pay_payload = {
        "amount": 99.50,
        "currency": "USD",
        "customerId": "cust_test_101",
        "faultMode": "NONE"
    }
    ok, res = test_endpoint("Initiate Payment", "POST", f"{BASE_URL}/workspaces/{ws_id}/payments/initiate", headers=headers, json_data=pay_payload)
    if ok and res:
        pay_id = res.get("data", {}).get("id")
        if pay_id:
            test_endpoint("Reconcile Payment", "POST", f"{BASE_URL}/workspaces/{ws_id}/payments/{pay_id}/reconcile", headers=headers, json_data={})
            ref_payload = {"amount": 20.00, "reason": "Test Refund"}
            test_endpoint("Refund Payment", "POST", f"{BASE_URL}/workspaces/{ws_id}/payments/{pay_id}/refund", headers=headers, json_data=ref_payload)

    # 12. Incidents
    test_endpoint("List Incidents", "GET", f"{BASE_URL}/workspaces/{ws_id}/incidents", headers=headers)
    inc_payload = {
        "title": "Automated Audit Incident",
        "severity": "HIGH",
        "description": "Triggered by API validation audit suite"
    }
    ok, res = test_endpoint("Create Incident", "POST", f"{BASE_URL}/workspaces/{ws_id}/incidents", headers=headers, json_data=inc_payload)
    if ok and res:
        inc_id = res.get("data", {}).get("id")
        if inc_id:
            test_endpoint("Request AI Diagnosis", "POST", f"{BASE_URL}/workspaces/{ws_id}/incidents/{inc_id}/ai-analysis", headers=headers, json_data={})
            test_endpoint("Generate Postmortem Report", "POST", f"{BASE_URL}/workspaces/{ws_id}/incidents/{inc_id}/reports", headers=headers, json_data={})

    # 13. API Keys
    test_endpoint("List API Keys", "GET", f"{BASE_URL}/workspaces/{ws_id}/api-keys", headers=headers)
    key_payload = {"name": "Test Key Audit", "scopes": "events:write,traces:write"}
    ok, res = test_endpoint("Create API Key", "POST", f"{BASE_URL}/workspaces/{ws_id}/api-keys", headers=headers, json_data=key_payload)
    if ok and res:
        key_id = res.get("data", {}).get("apiKey", {}).get("id")
        if key_id:
            test_endpoint("Revoke API Key", "DELETE", f"{BASE_URL}/workspaces/{ws_id}/api-keys/{key_id}", headers=headers)

    # 14. Integrations
    test_endpoint("List Integrations", "GET", f"{BASE_URL}/workspaces/{ws_id}/integrations", headers=headers)
    rabbit_test_payload = {
        "host": "localhost",
        "port": 5672,
        "username": "guest",
        "password": "guest"
    }
    test_endpoint("Test RabbitMQ Connection", "POST", f"{BASE_URL}/workspaces/{ws_id}/integrations/rabbitmq/test", headers=headers, json_data=rabbit_test_payload, expected_status=[200, 400, 503])

    # 15. Webhooks
    test_endpoint("List Webhooks", "GET", f"{BASE_URL}/workspaces/{ws_id}/webhooks", headers=headers)
    wh_payload = {
        "url": "https://example.com/webhook",
        "eventTypes": "ANOMALY_DETECTED"
    }
    test_endpoint("Register Webhook", "POST", f"{BASE_URL}/workspaces/{ws_id}/webhooks", headers=headers, json_data=wh_payload)

    # 16. Audit Log
    test_endpoint("List Audit Logs", "GET", f"{BASE_URL}/workspaces/{ws_id}/audit", headers=headers)

    print("================================================================================")
    print("AUDIT COMPLETE")
    print("================================================================================")

if __name__ == "__main__":
    run_tests()
