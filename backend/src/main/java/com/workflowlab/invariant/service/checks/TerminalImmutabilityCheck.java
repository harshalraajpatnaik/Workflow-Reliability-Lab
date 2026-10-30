package com.workflowlab.invariant.service.checks;

import com.workflowlab.event.model.Event;
import com.workflowlab.execution.model.Execution;
import com.workflowlab.execution.model.ExecutionStatus;
import com.workflowlab.invariant.model.InvariantDefinition;
import com.workflowlab.invariant.model.InvariantResult;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class TerminalImmutabilityCheck implements InvariantCheck {

    @Override
    public String ruleType() {
        return "TERMINAL_IMMUTABLE";
    }

    @Override
    public InvariantResult evaluate(InvariantDefinition def, Execution execution, List<Event> events) {
        if (execution.getStatus().isTerminal() && execution.getEndedAt() != null) {
            boolean hasPostTerminalEvents = events.stream().anyMatch(e ->
                e.getOccurredAt().isAfter(execution.getEndedAt()));

            if (hasPostTerminalEvents) {
                return new InvariantResult(
                    execution.getWorkspaceId(),
                    def.getId(),
                    execution.getId(),
                    false,
                    "Terminal state immutability violated: Events arrived after execution marked in terminal state " + execution.getStatus(),
                    String.format("{\"endedAt\": \"%s\"}", execution.getEndedAt())
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
