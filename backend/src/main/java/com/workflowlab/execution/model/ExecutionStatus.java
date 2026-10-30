package com.workflowlab.execution.model;

public enum ExecutionStatus {
    PENDING,
    RUNNING,
    COMPLETED,
    FAILED,
    TIMED_OUT,
    CANCELLED,
    COMPENSATING,
    COMPENSATED;

    public boolean isTerminal() {
        return this == COMPLETED || this == FAILED || this == TIMED_OUT || this == CANCELLED || this == COMPENSATED;
    }
}
