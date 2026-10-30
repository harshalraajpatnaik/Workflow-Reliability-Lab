package com.workflowlab.event.model;

public enum EventStatus {
    RECEIVED,
    ACCEPTED,
    PROCESSED,
    RETRIED,
    FAILED,
    IGNORED,
    DEAD_LETTERED
}
