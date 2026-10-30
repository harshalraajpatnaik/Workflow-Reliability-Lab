-- V020: Seed Baseline Security Audit Events for Default Workspace

INSERT INTO audit_events (workspace_id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at)
SELECT 
    w.id,
    w.owner_id,
    'WORKSPACE_CREATED',
    'WORKSPACE',
    w.id::text,
    '{"name": "Lead Architect''s Workspace", "tier": "ENTERPRISE"}'::jsonb,
    '127.0.0.1',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    NOW() - INTERVAL '3 days'
FROM workspaces w
WHERE w.slug = 'ws-2d02e258'
ON CONFLICT DO NOTHING;

INSERT INTO audit_events (workspace_id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at)
SELECT 
    w.id,
    w.owner_id,
    'API_KEY_CREATED',
    'API_KEY',
    'wrl_live_8f7b249a0c',
    '{"name": "Production Ingestion Gateway", "scopes": ["events:write", "traces:write"]}'::jsonb,
    '127.0.0.1',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    NOW() - INTERVAL '2 days'
FROM workspaces w
WHERE w.slug = 'ws-2d02e258'
ON CONFLICT DO NOTHING;

INSERT INTO audit_events (workspace_id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at)
SELECT 
    w.id,
    w.owner_id,
    'PROJECT_CREATED',
    'PROJECT',
    'Order Fulfillment Saga',
    '{"name": "Order Fulfillment Saga", "defaultEnvironments": ["Development", "Staging", "Production", "Simulation"]}'::jsonb,
    '127.0.0.1',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    NOW() - INTERVAL '36 hours'
FROM workspaces w
WHERE w.slug = 'ws-2d02e258'
ON CONFLICT DO NOTHING;

INSERT INTO audit_events (workspace_id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at)
SELECT 
    w.id,
    w.owner_id,
    'SCENARIO_EXECUTED',
    'SCENARIO',
    'SCEN_NET_TIMEOUT',
    '{"scenario": "Downstream Network Timeout", "environment": "Simulation", "injectedFault": "5000ms delay"}'::jsonb,
    '127.0.0.1',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    NOW() - INTERVAL '24 hours'
FROM workspaces w
WHERE w.slug = 'ws-2d02e258'
ON CONFLICT DO NOTHING;

INSERT INTO audit_events (workspace_id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at)
SELECT 
    w.id,
    w.owner_id,
    'PAYMENT_INITIATED',
    'PAYMENT',
    'TXN-DEMO-1001',
    '{"amount": 100.00, "currency": "USD", "gateway": "SimulatedStripe", "status": "CAPTURED"}'::jsonb,
    '127.0.0.1',
    'Payment Gateway Worker',
    NOW() - INTERVAL '12 hours'
FROM workspaces w
WHERE w.slug = 'ws-2d02e258'
ON CONFLICT DO NOTHING;

INSERT INTO audit_events (workspace_id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at)
SELECT 
    w.id,
    w.owner_id,
    'PAYMENT_RECONCILED',
    'PAYMENT',
    'TXN-DEMO-1001',
    '{"reconciliationStatus": "RECONCILED", "matchedLedger": true}'::jsonb,
    '127.0.0.1',
    'Payment Gateway Worker',
    NOW() - INTERVAL '6 hours'
FROM workspaces w
WHERE w.slug = 'ws-2d02e258'
ON CONFLICT DO NOTHING;

INSERT INTO audit_events (workspace_id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at)
SELECT 
    w.id,
    w.owner_id,
    'USER_LOGIN',
    'USER',
    w.owner_id::text,
    '{"email": "lead.architect@workflowlab.dev", "authMethod": "PASSWORD", "status": "SUCCESS"}'::jsonb,
    '127.0.0.1',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    NOW() - INTERVAL '1 hour'
FROM workspaces w
WHERE w.slug = 'ws-2d02e258'
ON CONFLICT DO NOTHING;
