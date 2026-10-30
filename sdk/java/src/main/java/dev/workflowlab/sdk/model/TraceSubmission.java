package dev.workflowlab.sdk.model;

import java.time.Instant;
import java.util.Map;

public class TraceSubmission {
    private String traceId;
    private String spanId;
    private String parentSpanId;
    private String name;
    private String serviceName;
    private Long startTimeUs;
    private Long endTimeUs;
    private String statusCode;
    private Map<String, Object> attributes;

    public TraceSubmission() {}

    public static Builder builder() {
        return new Builder();
    }

    public String getTraceId() { return traceId; }
    public void setTraceId(String traceId) { this.traceId = traceId; }

    public String getSpanId() { return spanId; }
    public void setSpanId(String spanId) { this.spanId = spanId; }

    public String getParentSpanId() { return parentSpanId; }
    public void setParentSpanId(String parentSpanId) { this.parentSpanId = parentSpanId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public Long getStartTimeUs() { return startTimeUs; }
    public void setStartTimeUs(Long startTimeUs) { this.startTimeUs = startTimeUs; }

    public Long getEndTimeUs() { return endTimeUs; }
    public void setEndTimeUs(Long endTimeUs) { this.endTimeUs = endTimeUs; }

    public String getStatusCode() { return statusCode; }
    public void setStatusCode(String statusCode) { this.statusCode = statusCode; }

    public Map<String, Object> getAttributes() { return attributes; }
    public void setAttributes(Map<String, Object> attributes) { this.attributes = attributes; }

    public static class Builder {
        private final TraceSubmission submission = new TraceSubmission();

        public Builder traceId(String traceId) {
            submission.traceId = traceId;
            return this;
        }

        public Builder spanId(String spanId) {
            submission.spanId = spanId;
            return this;
        }

        public Builder parentSpanId(String parentSpanId) {
            submission.parentSpanId = parentSpanId;
            return this;
        }

        public Builder name(String name) {
            submission.name = name;
            return this;
        }

        public Builder serviceName(String serviceName) {
            submission.serviceName = serviceName;
            return this;
        }

        public Builder startTimeUs(Long startTimeUs) {
            submission.startTimeUs = startTimeUs;
            return this;
        }

        public Builder endTimeUs(Long endTimeUs) {
            submission.endTimeUs = endTimeUs;
            return this;
        }

        public Builder statusCode(String statusCode) {
            submission.statusCode = statusCode;
            return this;
        }

        public Builder attributes(Map<String, Object> attributes) {
            submission.attributes = attributes;
            return this;
        }

        public TraceSubmission build() {
            return submission;
        }
    }
}
