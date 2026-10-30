package com.workflowlab.invariant.service.checks;

import com.workflowlab.event.model.Event;
import com.workflowlab.execution.model.Execution;
import com.workflowlab.invariant.model.InvariantDefinition;
import com.workflowlab.invariant.model.InvariantResult;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class ReconciliationBalanceCheck implements InvariantCheck {

    @Override
    public String ruleType() {
        return "RECONCILIATION_BALANCE";
    }

    @Override
    public InvariantResult evaluate(InvariantDefinition def, Execution execution, List<Event> events) {
        boolean hasUnreconciledFlag = events.stream().anyMatch(e ->
            e.getEventType().equalsIgnoreCase("ReconciliationMismatch") ||
            (e.getPayloadMetadata() != null && e.getPayloadMetadata().contains("reconciliation_failed")));

        if (hasUnreconciledFlag) {
            return new InvariantResult(
                execution.getWorkspaceId(),
                def.getId(),
                execution.getId(),
                false,
                "Ledger reconciliation balancing check failed: Discrepancy between ledger and external statement.",
                "{\"reconciled\": false}"
            );
        }

        return new InvariantResult(
            execution.getWorkspaceId(),
            def.getId(),
            execution.getId(),
            true,
            null,
            "{\"satisfied\": true, \"reconciled\": true}"
        );
    }
}
