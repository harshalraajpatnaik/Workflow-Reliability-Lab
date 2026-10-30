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
public class PaymentInconsistencyRule implements AnomalyDetectionRule {

    @Override
    public AnomalyRuleType ruleType() {
        return AnomalyRuleType.PAYMENT_INCONSISTENCY;
    }

    @Override
    public Optional<Anomaly> evaluate(Execution execution, List<Event> events) {
        boolean hasFailedPayment = events.stream()
            .anyMatch(e -> e.getEventType().equalsIgnoreCase("PaymentFailed") ||
                           e.getEventType().equalsIgnoreCase("ChargeFailed"));

        boolean hasSuccessOrder = events.stream()
            .anyMatch(e -> e.getEventType().equalsIgnoreCase("OrderCompleted") ||
                           e.getEventType().equalsIgnoreCase("OrderShipped"));

        if (hasFailedPayment && (hasSuccessOrder || execution.getStatus() == ExecutionStatus.COMPLETED)) {
            String evidence = String.format("{\"hasFailedPayment\": true, \"executionStatus\": \"%s\"}", execution.getStatus());

            return Optional.of(new Anomaly(
                execution.getWorkspaceId(),
                execution.getId(),
                ruleType(),
                AnomalySeverity.CRITICAL,
                "Payment Inconsistency: Order Completed Despite Payment Failure",
                "Workflow reached completed status or shipped order despite a PaymentFailed event in the event journal. High financial risk.",
                evidence
            ));
        }
        return Optional.empty();
    }
}
