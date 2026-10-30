package com.workflowlab.invariant.service.checks;

import com.workflowlab.event.model.Event;
import com.workflowlab.execution.model.Execution;
import com.workflowlab.invariant.model.InvariantDefinition;
import com.workflowlab.invariant.model.InvariantResult;

import java.util.List;

public interface InvariantCheck {
    String ruleType();
    InvariantResult evaluate(InvariantDefinition def, Execution execution, List<Event> events);
}
