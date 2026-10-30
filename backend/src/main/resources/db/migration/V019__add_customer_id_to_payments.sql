-- V019: Add customer_id column to payment_transactions
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS customer_id VARCHAR(100);
