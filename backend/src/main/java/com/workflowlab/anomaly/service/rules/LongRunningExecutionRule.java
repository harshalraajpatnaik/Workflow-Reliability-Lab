package com.workflowlab.anomaly.service.rules;

import com.workflowlab.anomaly.model.Anomaly;
import com.workflowlab.anomaly.model.AnomalyRuleType;
import com.workflowlab.anomaly.model.AnomalySeverity;
import com.workflowlab.event.model.Event;
import com.workflowlab.execution.model.Execution;
import com.workflowlab.execution.model.ExecutionStatus;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class LongRunningExecutionRule implements AnomalyDetectionRule {

    private static final long MAX_RUNNING_MINUTES = 30;

    @Override
    public AnomalyRuleType ruleType() {
        return AnomalyRuleType.LONG_RUNNING_EXECUTION;
    }

    @Override
    public Optional<Anomaly> evaluate(Execution execution, List<Event> events) {
        if (execution.getStatus() == ExecutionStatus.RUNNING && execution.getStartedAt() != null) {
            long minutes = Duration.between(execution.getStartedAt(), Instant.now()).toMinutes();
            if (minutes >= MAX_RUNNING_MINUTES) {
                String evidence = String.format("{\"runningMinutes\": %d, \"maxAllowedMinutes\": %d, \"startedAt\": \"%s\"}",
                    minutes, MAX_RUNNING_MINUTES, execution.getStartedAt());

                return Optional.of(new Anomaly(
                    execution.getWorkspaceId(),
                    execution.getId(),
                    ruleType(),
                    AnomalySeverity.HIGH,
                    "Long-Running Stuck Execution",
                    String.format("Execution has remained in RUNNING state for %d minutes, exceeding the maximum allowed window of %d minutes.",
                        minutes, MAX_RUNNING_MINUTES),
                    evidence
                ));
            }
        }
        return Optional.empty();
    }
}
