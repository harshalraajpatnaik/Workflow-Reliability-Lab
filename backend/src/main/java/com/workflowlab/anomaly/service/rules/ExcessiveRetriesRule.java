package com.workflowlab.anomaly.service.rules;

import com.workflowlab.anomaly.model.Anomaly;
import com.workflowlab.anomaly.model.AnomalyRuleType;
import com.workflowlab.anomaly.model.AnomalySeverity;
import com.workflowlab.event.model.Event;
import com.workflowlab.execution.model.Execution;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class ExcessiveRetriesRule implements AnomalyDetectionRule {

    private static final int RETRY_THRESHOLD = 3;

    @Override
    public AnomalyRuleType ruleType() {
        return AnomalyRuleType.EXCESSIVE_RETRIES;
    }

    @Override
    public Optional<Anomaly> evaluate(Execution execution, List<Event> events) {
        Optional<Event> excessiveEvent = events.stream()
            .filter(e -> e.getRetryCount() >= RETRY_THRESHOLD)
            .findFirst();

        if (excessiveEvent.isPresent()) {
            Event e = excessiveEvent.get();
            String evidence = String.format("{\"eventId\": \"%s\", \"eventType\": \"%s\", \"retryCount\": %d, \"threshold\": %d}",
                e.getId(), e.getEventType(), e.getRetryCount(), RETRY_THRESHOLD);

            return Optional.of(new Anomaly(
                execution.getWorkspaceId(),
                execution.getId(),
                ruleType(),
                AnomalySeverity.HIGH,
                "Excessive Step Retries Detected",
                String.format("Event '%s' experienced %d retries, exceeding the retry limit of %d. Indicates downstream degradation or retry storm risk.",
                    e.getEventType(), e.getRetryCount(), RETRY_THRESHOLD),
                evidence
            ));
        }
        return Optional.empty();
    }
}
