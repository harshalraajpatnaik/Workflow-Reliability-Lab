package com.workflowlab.anomaly.service.rules;

import com.workflowlab.anomaly.model.Anomaly;
import com.workflowlab.anomaly.model.AnomalyRuleType;
import com.workflowlab.anomaly.model.AnomalySeverity;
import com.workflowlab.event.model.Event;
import com.workflowlab.event.model.EventStatus;
import com.workflowlab.execution.model.Execution;
import com.workflowlab.execution.model.ExecutionStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class RepeatedFailuresRule implements AnomalyDetectionRule {

    @Override
    public AnomalyRuleType ruleType() {
        return AnomalyRuleType.REPEATED_FAILURES;
    }

    @Override
    public Optional<Anomaly> evaluate(Execution execution, List<Event> events) {
        long failedEventsCount = events.stream()
            .filter(e -> e.getStatus() == EventStatus.FAILED || e.getStatus() == EventStatus.DEAD_LETTERED)
            .count();

        if (failedEventsCount >= 2 || execution.getStatus() == ExecutionStatus.FAILED) {
            String evidence = String.format("{\"failedEventsCount\": %d, \"executionStatus\": \"%s\", \"errorMessage\": \"%s\"}",
                failedEventsCount, execution.getStatus(), execution.getErrorMessage() != null ? execution.getErrorMessage() : "");

            return Optional.of(new Anomaly(
                execution.getWorkspaceId(),
                execution.getId(),
                ruleType(),
                AnomalySeverity.CRITICAL,
                "Repeated Service Failure Concentration",
                String.format("Execution encountered %d failed step events and ended with status %s.",
                    failedEventsCount, execution.getStatus()),
                evidence
            ));
        }
        return Optional.empty();
    }
}
