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
public class OutOfOrderEventRule implements AnomalyDetectionRule {

    @Override
    public AnomalyRuleType ruleType() {
        return AnomalyRuleType.OUT_OF_ORDER_EVENT;
    }

    @Override
    public Optional<Anomaly> evaluate(Execution execution, List<Event> events) {
        // Look for out-of-order sequence (e.g., Shipped or Fulfilled appearing before Authorized or Paid)
        int paidIndex = -1;
        int shippedIndex = -1;

        for (int i = 0; i < events.size(); i++) {
            String type = events.get(i).getEventType().toLowerCase();
            if (type.contains("paid") || type.contains("captured") || type.contains("authorized")) {
                if (paidIndex == -1) paidIndex = i;
            }
            if (type.contains("shipped") || type.contains("delivered") || type.contains("fulfilled")) {
                if (shippedIndex == -1) shippedIndex = i;
            }
        }

        if (shippedIndex != -1 && paidIndex != -1 && shippedIndex < paidIndex) {
            String sequenceJson = events.stream()
                .map(Event::getEventType)
                .map(t -> "\"" + t.replace("\"", "\\\"") + "\"")
                .collect(java.util.stream.Collectors.joining(",", "[", "]"));
            String evidence = String.format("{\"shippedIndex\": %d, \"paidIndex\": %d, \"eventSequence\": %s}",
                shippedIndex, paidIndex, sequenceJson);

            return Optional.of(new Anomaly(
                execution.getWorkspaceId(),
                execution.getId(),
                ruleType(),
                AnomalySeverity.HIGH,
                "Out-of-Order Lifecycle Event Sequencing",
                "Fulfillment/shipping event arrived before payment capture event in the timeline, violating chronological causal ordering.",
                evidence
            ));
        }
        return Optional.empty();
    }
}
