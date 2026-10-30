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
public class StateJournalMatchCheck implements InvariantCheck {

    @Override
    public String ruleType() {
        return "STATE_JOURNAL_MATCH";
    }

    @Override
    public InvariantResult evaluate(InvariantDefinition def, Execution execution, List<Event> events) {
        // If execution says COMPLETED but last event failed or dead-lettered
        if (execution.getStatus() == ExecutionStatus.COMPLETED && !events.isEmpty()) {
            Event lastEvent = events.get(events.size() - 1);
            if (lastEvent.getStatus() == EventStatus.FAILED || lastEvent.getStatus() == EventStatus.DEAD_LETTERED) {
                return new InvariantResult(
                    execution.getWorkspaceId(),
                    def.getId(),
                    execution.getId(),
                    false,
                    "Execution aggregate state (COMPLETED) contradicts event journal: final step failed.",
                    String.format("{\"lastEventStatus\": \"%s\", \"lastEventType\": \"%s\"}",
                        lastEvent.getStatus(), lastEvent.getEventType())
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
