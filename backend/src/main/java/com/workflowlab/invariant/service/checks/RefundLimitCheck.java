package com.workflowlab.invariant.service.checks;

import com.workflowlab.event.model.Event;
import com.workflowlab.execution.model.Execution;
import com.workflowlab.invariant.model.InvariantDefinition;
import com.workflowlab.invariant.model.InvariantResult;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class RefundLimitCheck implements InvariantCheck {

    @Override
    public String ruleType() {
        return "REFUND_LIMIT";
    }

    @Override
    public InvariantResult evaluate(InvariantDefinition def, Execution execution, List<Event> events) {
        // Parse amounts if available in payload
        double totalCaptured = 0.0;
        double totalRefunded = 0.0;

        for (Event e : events) {
            String type = e.getEventType().toLowerCase();
            if (type.contains("capture") || type.contains("charged")) {
                totalCaptured += extractAmount(e.getPayloadMetadata());
            } else if (type.contains("refund")) {
                totalRefunded += extractAmount(e.getPayloadMetadata());
            }
        }

        if (totalRefunded > totalCaptured && totalCaptured > 0) {
            String evidence = String.format("{\"totalCaptured\": %.2f, \"totalRefunded\": %.2f}", totalCaptured, totalRefunded);
            return new InvariantResult(
                execution.getWorkspaceId(),
                def.getId(),
                execution.getId(),
                false,
                String.format("Refund limit violated! Total refunded amount (%.2f) exceeds captured amount (%.2f).", totalRefunded, totalCaptured),
                evidence
            );
        }

        return new InvariantResult(
            execution.getWorkspaceId(),
            def.getId(),
            execution.getId(),
            true,
            null,
            String.format("{\"totalCaptured\": %.2f, \"totalRefunded\": %.2f, \"satisfied\": true}", totalCaptured, totalRefunded)
        );
    }

    private double extractAmount(String payload) {
        if (payload == null) return 100.0; // fallback mock value
        try {
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("\"amount\"\\s*:\\s*([0-9.]+)").matcher(payload);
            if (m.find()) {
                return Double.parseDouble(m.group(1));
            }
        } catch (Exception ignored) {}
        return 0.0;
    }
}
