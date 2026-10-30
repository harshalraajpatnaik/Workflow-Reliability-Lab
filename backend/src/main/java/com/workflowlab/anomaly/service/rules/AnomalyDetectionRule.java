package com.workflowlab.anomaly.service.rules;

import com.workflowlab.anomaly.model.Anomaly;
import com.workflowlab.anomaly.model.AnomalyRuleType;
import com.workflowlab.event.model.Event;
import com.workflowlab.execution.model.Execution;
import java.util.List;
import java.util.Optional;

public interface AnomalyDetectionRule {
    AnomalyRuleType ruleType();
    Optional<Anomaly> evaluate(Execution execution, List<Event> events);
}
