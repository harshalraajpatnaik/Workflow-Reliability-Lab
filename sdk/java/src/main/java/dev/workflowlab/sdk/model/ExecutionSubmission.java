package dev.workflowlab.sdk.model;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

public class ExecutionSubmission {
    private String workflowName;
    private String environmentId;
    private String correlationId;
    private String triggerSource = "JAVA_SDK";
    private String inputPayloadMeta;

    public ExecutionSubmission() {}

    public static Builder builder() {
        return new Builder();
    }

    public String getWorkflowName() { return workflowName; }
    public void setWorkflowName(String workflowName) { this.workflowName = workflowName; }

    public String getEnvironmentId() { return environmentId; }
    public void setEnvironmentId(String environmentId) { this.environmentId = environmentId; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public String getTriggerSource() { return triggerSource; }
    public void setTriggerSource(String triggerSource) { this.triggerSource = triggerSource; }

    public String getInputPayloadMeta() { return inputPayloadMeta; }
    public void setInputPayloadMeta(String inputPayloadMeta) { this.inputPayloadMeta = inputPayloadMeta; }

    public static class Builder {
        private static final ObjectMapper MAPPER = new ObjectMapper();
        private final ExecutionSubmission submission = new ExecutionSubmission();

        public Builder workflowName(String workflowName) {
            submission.workflowName = workflowName;
            return this;
        }

        public Builder environmentId(String environmentId) {
            submission.environmentId = environmentId;
            return this;
        }

        public Builder correlationId(String correlationId) {
            submission.correlationId = correlationId;
            return this;
        }

        public Builder triggerSource(String triggerSource) {
            submission.triggerSource = triggerSource;
            return this;
        }

        public Builder inputPayloadMeta(String inputPayloadMeta) {
            submission.inputPayloadMeta = inputPayloadMeta;
            return this;
        }

        public Builder inputPayloadMeta(Map<String, Object> map) {
            try {
                submission.inputPayloadMeta = MAPPER.writeValueAsString(map);
            } catch (Exception e) {
                submission.inputPayloadMeta = map.toString();
            }
            return this;
        }

        public ExecutionSubmission build() {
            return submission;
        }
    }
}
