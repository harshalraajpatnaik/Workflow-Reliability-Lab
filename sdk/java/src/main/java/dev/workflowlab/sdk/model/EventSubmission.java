package dev.workflowlab.sdk.model;

import java.util.Map;

public class EventSubmission {
    private String executionId;
    private String eventType;
    private String sourceService;
    private String targetService;
    private String correlationId;
    private String idempotencyKey;
    private Integer sequenceNumber;
    private Map<String, Object> payload;

    public EventSubmission() {}

    public static Builder builder() {
        return new Builder();
    }

    public String getExecutionId() { return executionId; }
    public void setExecutionId(String executionId) { this.executionId = executionId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getSourceService() { return sourceService; }
    public void setSourceService(String sourceService) { this.sourceService = sourceService; }

    public String getTargetService() { return targetService; }
    public void setTargetService(String targetService) { this.targetService = targetService; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }

    public Integer getSequenceNumber() { return sequenceNumber; }
    public void setSequenceNumber(Integer sequenceNumber) { this.sequenceNumber = sequenceNumber; }

    public Map<String, Object> getPayload() { return payload; }
    public void setPayload(Map<String, Object> payload) { this.payload = payload; }

    public static class Builder {
        private final EventSubmission submission = new EventSubmission();

        public Builder executionId(String executionId) {
            submission.executionId = executionId;
            return this;
        }

        public Builder eventType(String eventType) {
            submission.eventType = eventType;
            return this;
        }

        public Builder sourceService(String sourceService) {
            submission.sourceService = sourceService;
            return this;
        }

        public Builder targetService(String targetService) {
            submission.targetService = targetService;
            return this;
        }

        public Builder correlationId(String correlationId) {
            submission.correlationId = correlationId;
            return this;
        }

        public Builder idempotencyKey(String idempotencyKey) {
            submission.idempotencyKey = idempotencyKey;
            return this;
        }

        public Builder sequenceNumber(Integer sequenceNumber) {
            submission.sequenceNumber = sequenceNumber;
            return this;
        }

        public Builder payload(Map<String, Object> payload) {
            submission.payload = payload;
            return this;
        }

        public EventSubmission build() {
            return submission;
        }
    }
}
