package com.workflowlab.anomaly.service.rules;

import com.workflowlab.anomaly.model.Anomaly;
import com.workflowlab.anomaly.model.AnomalyRuleType;
import com.workflowlab.anomaly.model.AnomalySeverity;
import com.workflowlab.event.model.Event;
import com.workflowlab.execution.model.Execution;
import java.util.*;
import org.springframework.stereotype.Component;

@Component
public class DuplicateEventRule implements AnomalyDetectionRule {

    @Override
    public AnomalyRuleType ruleType() {
        return AnomalyRuleType.DUPLICATE_EVENT;
    }

    @Override
    public Optional<Anomaly> evaluate(Execution execution, List<Event> events) {
        Set<String> seenTypes = new HashSet<>();
        List<String> duplicatedTypes = new ArrayList<>();

        for (Event event : events) {
            // Check if identical non-retry event type occurred multiple times
            if (event.getRetryCount() == 0 && !seenTypes.add(event.getEventType())) {
                duplicatedTypes.add(event.getEventType());
            }
        }

        if (!duplicatedTypes.isEmpty()) {
            String jsonArray = duplicatedTypes.stream()
                .map(t -> "\"" + t.replace("\"", "\\\"") + "\"")
                .collect(java.util.stream.Collectors.joining(",", "[", "]"));
            String evidence = String.format("{\"duplicatedEventTypes\": %s}", jsonArray);

            return Optional.of(new Anomaly(
                execution.getWorkspaceId(),
                execution.getId(),
                ruleType(),
                AnomalySeverity.MEDIUM,
                "Duplicate Event Type Ingestion",
                String.format("Duplicate non-retry events detected for types: %s. Indicates message redelivery or missing client-side deduplication.", duplicatedTypes),
                evidence
            ));
        }
        return Optional.empty();
    }
}
