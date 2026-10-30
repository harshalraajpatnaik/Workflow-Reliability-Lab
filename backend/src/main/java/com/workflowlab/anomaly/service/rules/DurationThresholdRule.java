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
public class DurationThresholdRule implements AnomalyDetectionRule {

    private static final long DURATION_THRESHOLD_MS = 8000; // 8 seconds

    @Override
    public AnomalyRuleType ruleType() {
        return AnomalyRuleType.DURATION_THRESHOLD;
    }

    @Override
    public Optional<Anomaly> evaluate(Execution execution, List<Event> events) {
        if (execution.getDurationMs() != null && execution.getDurationMs() > DURATION_THRESHOLD_MS) {
            String evidence = String.format("{\"durationMs\": %d, \"thresholdMs\": %d, \"startedAt\": \"%s\", \"endedAt\": \"%s\"}",
                execution.getDurationMs(), DURATION_THRESHOLD_MS, execution.getStartedAt(), execution.getEndedAt());

            return Optional.of(new Anomaly(
                execution.getWorkspaceId(),
                execution.getId(),
                ruleType(),
                AnomalySeverity.HIGH,
                "Execution Duration Exceeded Threshold",
                String.format("Workflow execution took %d ms, which exceeds the critical SLA threshold of %d ms.",
                    execution.getDurationMs(), DURATION_THRESHOLD_MS),
                evidence
            ));
        }
        return Optional.empty();
    }
}
