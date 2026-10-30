package com.workflowlab.invariant.service.checks;

import com.workflowlab.event.model.Event;
import com.workflowlab.execution.model.Execution;
import com.workflowlab.invariant.model.InvariantDefinition;
import com.workflowlab.invariant.model.InvariantResult;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class NoDoubleChargeCheck implements InvariantCheck {

    @Override
    public String ruleType() {
        return "NO_DOUBLE_CHARGE";
    }

    @Override
    public InvariantResult evaluate(InvariantDefinition def, Execution execution, List<Event> events) {
        long chargeCount = events.stream()
            .filter(e -> e.getEventType().equalsIgnoreCase("PaymentCaptured") ||
                         e.getEventType().equalsIgnoreCase("ChargeSucceeded") ||
                         e.getEventType().equalsIgnoreCase("FundsDebited"))
            .count();

        if (chargeCount > 1) {
            String evidence = String.format("{\"chargeEventsCount\": %d, \"violation\": \"Multiple payment debits detected\"}", chargeCount);
            return new InvariantResult(
                execution.getWorkspaceId(),
                def.getId(),
                execution.getId(),
                false,
                "Double charge invariant violated! Found " + chargeCount + " capture events for this single execution.",
                evidence
            );
        }

        return new InvariantResult(
            execution.getWorkspaceId(),
            def.getId(),
            execution.getId(),
            true,
            null,
            String.format("{\"chargeCount\": %d, \"satisfied\": true}", chargeCount)
        );
    }
}
