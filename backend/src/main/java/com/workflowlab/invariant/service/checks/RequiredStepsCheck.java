package com.workflowlab.invariant.service.checks;

import com.workflowlab.event.model.Event;
import com.workflowlab.execution.model.Execution;
import com.workflowlab.execution.model.ExecutionStatus;
import com.workflowlab.invariant.model.InvariantDefinition;
import com.workflowlab.invariant.model.InvariantResult;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class RequiredStepsCheck implements InvariantCheck {

    @Override
    public String ruleType() {
        return "REQUIRED_STEPS";
    }

    @Override
    public InvariantResult evaluate(InvariantDefinition def, Execution execution, List<Event> events) {
        if (execution.getStatus() == ExecutionStatus.COMPLETED) {
            boolean hasProcessingOrDone = events.stream().anyMatch(e ->
                e.getEventType().toLowerCase().contains("processed") ||
                e.getEventType().toLowerCase().contains("completed") ||
                e.getEventType().toLowerCase().contains("captured") ||
                e.getEventType().toLowerCase().contains("confirmed"));

            if (!hasProcessingOrDone && !events.isEmpty()) {
                String evidence = String.format("{\"executionStatus\": \"%s\", \"eventCount\": %d}", execution.getStatus(), events.size());
                return new InvariantResult(
                    execution.getWorkspaceId(),
                    def.getId(),
                    execution.getId(),
                    false,
                    "Workflow marked COMPLETED but required processing/capture step events were never journaled.",
                    evidence
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
