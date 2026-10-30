package com.workflowlab.scenario.service;

import com.workflowlab.anomaly.service.AnomalyDetectionService;
import com.workflowlab.event.model.Event;
import com.workflowlab.event.model.EventStatus;
import com.workflowlab.event.repository.EventRepository;
import com.workflowlab.execution.model.Execution;
import com.workflowlab.execution.model.ExecutionStatus;
import com.workflowlab.execution.repository.ExecutionRepository;
import com.workflowlab.invariant.service.InvariantEngine;
import com.workflowlab.scenario.dto.ScenarioDtos.*;
import com.workflowlab.scenario.model.Scenario;
import com.workflowlab.scenario.model.ScenarioRun;
import com.workflowlab.scenario.repository.ScenarioRunRepository;
import com.workflowlab.trace.dto.TraceDtos.*;
import com.workflowlab.trace.service.TraceService;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SimulationEngine {

    private static final Logger log = LoggerFactory.getLogger(SimulationEngine.class);

    private final ExecutionRepository executionRepository;
    private final EventRepository eventRepository;
    private final TraceService traceService;
    private final AnomalyDetectionService anomalyService;
    private final InvariantEngine invariantEngine;
    private final ScenarioRunRepository scenarioRunRepository;

    public SimulationEngine(
        ExecutionRepository executionRepository,
        EventRepository eventRepository,
        TraceService traceService,
        AnomalyDetectionService anomalyService,
        InvariantEngine invariantEngine,
        ScenarioRunRepository scenarioRunRepository
    ) {
        this.executionRepository = executionRepository;
        this.eventRepository = eventRepository;
        this.traceService = traceService;
        this.anomalyService = anomalyService;
        this.invariantEngine = invariantEngine;
        this.scenarioRunRepository = scenarioRunRepository;
    }

    @Transactional
    public ScenarioRunDto executeScenario(UUID workspaceId, Scenario scenario, UUID environmentId, UUID userId, String customFault) {
        log.info("Executing failure simulation scenario: {} ({}) in workspace {}", scenario.getName(), scenario.getCode(), workspaceId);

        String faultConfig = (customFault != null && !customFault.isBlank()) ? customFault : scenario.getFaultConfig();
        ScenarioRun run = new ScenarioRun(workspaceId, scenario.getId(), environmentId, userId, faultConfig);
        run = scenarioRunRepository.save(run);

        String correlationId = "sim-corr-" + UUID.randomUUID().toString().substring(0, 8);
        String workflowName = "Simulation: " + scenario.getName();

        // 1. Create simulated execution
        Execution execution = new Execution(
            workspaceId,
            environmentId,
            workflowName,
            correlationId,
            "FAULT_INJECTION_LAB",
            true
        );
        execution.setInputPayloadMeta("{\"scenario\": \"" + scenario.getCode() + "\", \"injected\": true}");
        execution = executionRepository.save(execution);
        run.setExecutionId(execution.getId());

        // 2. Synthesize workflow events & trace based on scenario code
        Instant now = Instant.now();
        synthesizeScenarioData(workspaceId, execution, scenario.getCode(), now);

        // 3. Evaluate deterministic anomalies
        var detectedAnomalies = anomalyService.evaluateExecution(execution.getId());
        run.setAnomaliesDetected(detectedAnomalies.size());

        // 4. Verify business invariants
        var invariantResults = invariantEngine.evaluateExecution(execution.getId());
        boolean allPassed = invariantResults.stream().allMatch(com.workflowlab.invariant.dto.InvariantDtos.InvariantResultDto::passed);
        run.setPassedInvariants(allPassed);

        // 5. Conclude simulation run
        run.setStatus("COMPLETED");
        run.setEndedAt(Instant.now());
        String safeExpected = scenario.getExpectedBehavior() != null
            ? scenario.getExpectedBehavior().replace("\"", "\\\"").replace("\n", " ").replace("\r", "")
            : "";
        String observations = String.format(
            "{\"executionId\": \"%s\", \"correlationId\": \"%s\", \"anomaliesCount\": %d, \"invariantsPassed\": %s, \"expectedBehavior\": \"%s\"}",
            execution.getId(), correlationId, detectedAnomalies.size(), allPassed, safeExpected
        );
        run.setObservations(observations);
        ScenarioRun savedRun = scenarioRunRepository.save(run);

        return ScenarioRunDto.from(savedRun);
    }

    private void synthesizeScenarioData(UUID workspaceId, Execution execution, String code, Instant baseTime) {
        String corrId = execution.getCorrelationId();
        List<Event> events = new ArrayList<>();
        List<IngestSpanRequest> spans = new ArrayList<>();
        String traceId = UUID.randomUUID().toString().replace("-", "");
        String rootSpanId = UUID.randomUUID().toString().substring(0, 16);

        switch (code) {
            case "SCEN_NET_TIMEOUT" -> {
                // Downstream network timeout: OrderCreated -> InventoryCheck (timed out)
                events.add(new Event(workspaceId, execution.getId(), "OrderCreated", "OrderService", corrId, "idemp-1-" + corrId, "{\"orderId\": \"ORD-9101\"}", EventStatus.PROCESSED, 0, baseTime));
                events.add(new Event(workspaceId, execution.getId(), "InventoryCheckInitiated", "OrderService", corrId, "idemp-2-" + corrId, "{\"sku\": \"WRL-ITEM-42\"}", EventStatus.RETRIED, 3, baseTime.plus(500, ChronoUnit.MILLIS)));
                events.add(new Event(workspaceId, execution.getId(), "InventoryCheckTimeout", "InventoryService", corrId, "idemp-3-" + corrId, "{\"timeoutMs\": 8200}", EventStatus.FAILED, 3, baseTime.plus(8700, ChronoUnit.MILLIS)));

                spans.add(new IngestSpanRequest(rootSpanId, null, "OrderService", "POST /orders", "SERVER", "ERROR", "Downstream timeout calling InventoryService", "{\"http.status\": 504}", baseTime, baseTime.plus(8700, ChronoUnit.MILLIS)));
                spans.add(new IngestSpanRequest(UUID.randomUUID().toString().substring(0, 16), rootSpanId, "InventoryService", "checkStock", "CLIENT", "ERROR", "SocketTimeoutException: Read timed out after 8000ms", "{\"retry.count\": 3}", baseTime.plus(500, ChronoUnit.MILLIS), baseTime.plus(8700, ChronoUnit.MILLIS)));

                execution.setStatus(ExecutionStatus.FAILED);
                execution.setErrorMessage("SocketTimeoutException: Connection to InventoryService timed out after 8000ms");
                execution.setEndedAt(baseTime.plus(8700, ChronoUnit.MILLIS));
            }
            case "SCEN_PAYMENT_TIMEOUT" -> {
                // Payment timeout: Initiated -> Stripe timeout -> Reconciliation Pending
                events.add(new Event(workspaceId, execution.getId(), "PaymentInitiated", "CheckoutService", corrId, "idemp-p1-" + corrId, "{\"amount\": 250.00, \"currency\": \"USD\"}", EventStatus.PROCESSED, 0, baseTime));
                events.add(new Event(workspaceId, execution.getId(), "ChargeAttempted", "PaymentGateway", corrId, "idemp-p2-" + corrId, "{\"gateway\": \"Stripe\", \"amount\": 250.00}", EventStatus.RETRIED, 2, baseTime.plus(1, ChronoUnit.SECONDS)));
                events.add(new Event(workspaceId, execution.getId(), "PaymentFailed", "PaymentGateway", corrId, "idemp-p3-" + corrId, "{\"error\": \"GATEWAY_TIMEOUT\", \"reconciliation_pending\": true}", EventStatus.FAILED, 2, baseTime.plus(10, ChronoUnit.SECONDS)));

                spans.add(new IngestSpanRequest(rootSpanId, null, "CheckoutService", "POST /checkout", "SERVER", "ERROR", "Payment timeout awaiting external provider", "{\"amount\": 250.00}", baseTime, baseTime.plus(10, ChronoUnit.SECONDS)));
                spans.add(new IngestSpanRequest(UUID.randomUUID().toString().substring(0, 16), rootSpanId, "PaymentGateway", "stripe.charges.create", "CLIENT", "ERROR", "Stripe API Connection Timeout", "{\"idempotency_key\": \"idemp-p2\"}", baseTime.plus(1, ChronoUnit.SECONDS), baseTime.plus(10, ChronoUnit.SECONDS)));

                execution.setStatus(ExecutionStatus.TIMED_OUT);
                execution.setErrorMessage("Payment provider timed out after 10000ms. Transitioned to ReconciliationPending.");
                execution.setEndedAt(baseTime.plus(10, ChronoUnit.SECONDS));
            }
            case "SCEN_DUP_MESSAGE" -> {
                // Duplicate message arriving:
                events.add(new Event(workspaceId, execution.getId(), "OrderCreated", "OrderService", corrId, "idemp-dup-1", "{\"orderId\": \"ORD-DUP-01\"}", EventStatus.PROCESSED, 0, baseTime));
                events.add(new Event(workspaceId, execution.getId(), "OrderCreated", "OrderService", corrId, "idemp-dup-1-redelivery", "{\"orderId\": \"ORD-DUP-01\"}", EventStatus.PROCESSED, 0, baseTime.plus(250, ChronoUnit.MILLIS)));
                events.add(new Event(workspaceId, execution.getId(), "PaymentCaptured", "PaymentService", corrId, "idemp-dup-2", "{\"amount\": 49.99}", EventStatus.PROCESSED, 0, baseTime.plus(500, ChronoUnit.MILLIS)));

                spans.add(new IngestSpanRequest(rootSpanId, null, "OrderConsumer", "onMessage: OrderCreated", "CONSUMER", "OK", null, "{\"redelivery\": true}", baseTime, baseTime.plus(600, ChronoUnit.MILLIS)));
                execution.setStatus(ExecutionStatus.COMPLETED);
                execution.setEndedAt(baseTime.plus(600, ChronoUnit.MILLIS));
            }
            case "SCEN_OUT_OF_ORDER" -> {
                // Out of order: OrderShipped before OrderPaid
                events.add(new Event(workspaceId, execution.getId(), "OrderCreated", "OrderService", corrId, "idemp-seq-1", "{\"orderId\": \"ORD-SEQ-99\"}", EventStatus.PROCESSED, 0, baseTime));
                events.add(new Event(workspaceId, execution.getId(), "OrderShipped", "FulfillmentService", corrId, "idemp-seq-2", "{\"carrier\": \"FedEx\"}", EventStatus.PROCESSED, 0, baseTime.plus(1, ChronoUnit.SECONDS)));
                events.add(new Event(workspaceId, execution.getId(), "PaymentCaptured", "PaymentService", corrId, "idemp-seq-3", "{\"amount\": 120.00}", EventStatus.PROCESSED, 0, baseTime.plus(2, ChronoUnit.SECONDS)));

                spans.add(new IngestSpanRequest(rootSpanId, null, "OrderPipeline", "ProcessOrder", "INTERNAL", "OK", null, "{}", baseTime, baseTime.plus(2, ChronoUnit.SECONDS)));
                execution.setStatus(ExecutionStatus.COMPLETED);
                execution.setEndedAt(baseTime.plus(2, ChronoUnit.SECONDS));
            }
            default -> {
                // Generic scenario synthesis with failure injection
                events.add(new Event(workspaceId, execution.getId(), "StepInitiated", "WorkflowEngine", corrId, "idemp-gen-1-" + corrId, "{\"step\": 1}", EventStatus.PROCESSED, 0, baseTime));
                events.add(new Event(workspaceId, execution.getId(), "StepExecuting", "WorkflowEngine", corrId, "idemp-gen-2-" + corrId, "{\"step\": 2}", EventStatus.RETRIED, 4, baseTime.plus(2, ChronoUnit.SECONDS)));
                events.add(new Event(workspaceId, execution.getId(), "StepFailed", "WorkerNode", corrId, "idemp-gen-3-" + corrId, "{\"fault\": \"" + code + "\"}", EventStatus.FAILED, 4, baseTime.plus(9, ChronoUnit.SECONDS)));

                spans.add(new IngestSpanRequest(rootSpanId, null, "WorkflowEngine", "ExecuteStep", "INTERNAL", "ERROR", "Fault injected: " + code, "{\"code\": \"" + code + "\"}", baseTime, baseTime.plus(9, ChronoUnit.SECONDS)));
                execution.setStatus(ExecutionStatus.FAILED);
                execution.setErrorMessage("Simulated fault injected: " + code);
                execution.setEndedAt(baseTime.plus(9, ChronoUnit.SECONDS));
            }
        }

        eventRepository.saveAll(events);
        executionRepository.save(execution);

        // Ingest trace
        if (!spans.isEmpty()) {
            traceService.ingestTrace(workspaceId, new IngestTraceRequest(
                traceId,
                execution.getId(),
                spans.get(0).serviceName(),
                spans.get(0).operationName(),
                spans
            ));
        }
    }
}
