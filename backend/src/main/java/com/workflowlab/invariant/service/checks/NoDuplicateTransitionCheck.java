package com.workflowlab.invariant.service.checks;

import com.workflowlab.event.model.Event;
import com.workflowlab.execution.model.Execution;
import com.workflowlab.invariant.model.InvariantDefinition;
import com.workflowlab.invariant.model.InvariantResult;
import java.util.*;
import org.springframework.stereotype.Component;

@Component
public class NoDuplicateTransitionCheck implements InvariantCheck {

    @Override
    public String ruleType() {
        return "NO_DUP_TRANSITION";
    }

    @Override
    public InvariantResult evaluate(InvariantDefinition def, Execution execution, List<Event> events) {
        Set<String> transitions = new HashSet<>();
        List<String> duplicates = new ArrayList<>();

        for (Event event : events) {
            String key = event.getEventType() + ":" + event.getStatus();
            if (event.getRetryCount() == 0 && !transitions.add(key)) {
                duplicates.add(key);
            }
        }

        if (!duplicates.isEmpty()) {
            return new InvariantResult(
                execution.getWorkspaceId(),
                def.getId(),
                execution.getId(),
                false,
                "Duplicate state transitions detected for: " + duplicates,
                String.format("{\"duplicateTransitions\": %s}", duplicates)
            );
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
