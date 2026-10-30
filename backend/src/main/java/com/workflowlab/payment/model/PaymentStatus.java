package com.workflowlab.payment.model;

public enum PaymentStatus {
    INITIATED,
    AUTHORIZED,
    CAPTURED,
    FAILED,
    PENDING,
    TIMED_OUT,
    REFUNDED,
    PARTIALLY_REFUNDED,
    RECONCILIATION_PENDING,
    RECONCILED;

    public boolean canCapture() {
        return this == INITIATED || this == AUTHORIZED;
    }

    public boolean canRefund() {
        return this == CAPTURED || this == PARTIALLY_REFUNDED;
    }
}
