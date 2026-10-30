package com.workflowlab.invariant.service.checks;

import com.workflowlab.event.model.Event;
import com.workflowlab.event.model.EventStatus;
import com.workflowlab.execution.model.Execution;
import com.workflowlab.execution.model.ExecutionStatus;
import com.workflowlab.invariant.model.InvariantDefinition;
import com.workflowlab.invariant.model.InvariantResult;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class CompensationLoggedCheck implements InvariantCheck {

    @Override
    public String ruleType() {
        return "COMPENSATION_LOGGED";
    }

    @Override
    public InvariantResult evaluate(InvariantDefinition def, Execution execution, List<Event> events) {
        boolean hasFailure = execution.getStatus() == ExecutionStatus.FAILED ||
            events.stream().anyMatch(e -> e.getStatus() == EventStatus.FAILED);

        boolean isCompensated = execution.getStatus() == ExecutionStatus.COMPENSATED ||
            execution.getStatus() == ExecutionStatus.COMPENSATING;

        if (isCompensated) {
            boolean hasCompensationEvent = events.stream().anyMatch(e ->
                e.getEventType().toLowerCase().contains("compensat") ||
                e.getEventType().toLowerCase().contains("rollback") ||
                e.getEventType().toLowerCase().contains("refund"));

            if (!hasCompensationEvent) {
                return new InvariantResult(
                    execution.getWorkspaceId(),
                    def.getId(),
                    execution.getId(),
                    false,
                    "Execution status is COMPENSATED but no compensating actions or rollback events were recorded in event journal.",
                    "{\"status\": \"" + execution.getStatus() + "\", \"hasCompensationEvents\": false}"
                );
            }
        }

        return new InvariantResult(
            execution.getWorkspaceId(),
            def.getId(),
            execution.getId(),
            true,
            null,
            "{\"satisfied\": true}"
        );
    }
}
