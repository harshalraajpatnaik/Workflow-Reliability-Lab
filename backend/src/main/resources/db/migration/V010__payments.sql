-- V010: Payment Reliability Simulator
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    execution_id UUID REFERENCES executions(id) ON DELETE SET NULL,
    transaction_reference VARCHAR(100) NOT NULL,
    idempotency_key VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'INITIATED',
    provider VARCHAR(50) NOT NULL DEFAULT 'SIMULATED_STRIPE',
    captured_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    refunded_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    provider_charge_id VARCHAR(255),
    error_code VARCHAR(100),
    error_message TEXT,
    reconciliation_status VARCHAR(50) NOT NULL DEFAULT 'NOT_REQUIRED',
    reconciliation_notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_payment_idempotency UNIQUE (workspace_id, idempotency_key)
);

CREATE TABLE payment_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES payment_transactions(id) ON DELETE SET NULL,
    provider_event_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    duplicate BOOLEAN NOT NULL DEFAULT FALSE,
    processing_error TEXT,
    received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_payment_webhook_provider_event UNIQUE (workspace_id, provider_event_id)
);

CREATE INDEX idx_payments_workspace ON payment_transactions(workspace_id);
CREATE INDEX idx_payments_status ON payment_transactions(status);
CREATE INDEX idx_payments_reference ON payment_transactions(transaction_reference);
CREATE INDEX idx_payments_idempotency ON payment_transactions(idempotency_key);
CREATE INDEX idx_payment_webhooks_event ON payment_webhooks(provider_event_id);
