package com.workflowlab.anomaly.service.rules;

import com.workflowlab.anomaly.model.Anomaly;
import com.workflowlab.anomaly.model.AnomalyRuleType;
import com.workflowlab.anomaly.model.AnomalySeverity;
import com.workflowlab.event.model.Event;
import com.workflowlab.execution.model.Execution;
import com.workflowlab.execution.model.ExecutionStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class MissingEventRule implements AnomalyDetectionRule {

    @Override
    public AnomalyRuleType ruleType() {
        return AnomalyRuleType.MISSING_EVENT;
    }

    @Override
    public Optional<Anomaly> evaluate(Execution execution, List<Event> events) {
        // If completed but fewer than 2 events were journaled (or no events at all)
        if (execution.getStatus() == ExecutionStatus.COMPLETED && events.isEmpty()) {
            String evidence = String.format("{\"executionStatus\": \"%s\", \"eventCount\": 0}", execution.getStatus());

            return Optional.of(new Anomaly(
                execution.getWorkspaceId(),
                execution.getId(),
                ruleType(),
                AnomalySeverity.HIGH,
                "Missing Step Lifecycle Events",
                "Execution reached COMPLETED status without recording any intermediate step events in the event journal.",
                evidence
            ));
        }
        return Optional.empty();
    }
}
