package dev.workflowlab.sdk;

import dev.workflowlab.sdk.model.EventSubmission;
import dev.workflowlab.sdk.model.ExecutionSubmission;
import dev.workflowlab.sdk.model.TraceSubmission;

import java.util.Map;
import java.util.UUID;

/**
 * Example demonstrating how to use the Workflow Reliability Lab Java SDK.
 */
public class Example {

    public static void main(String[] args) throws Exception {
        String endpoint = System.getenv().getOrDefault("WRL_ENDPOINT", "http://127.0.0.1:8085");
        String apiKey = System.getenv().getOrDefault("WRL_API_KEY", "wrl_QWYlStHzvi5ErbhyyfPP88FXbSOAaI1eCydggvVKq3k");
        String workspaceId = System.getenv().getOrDefault("WRL_WORKSPACE_ID", "4c2dd3fa-5db1-4b8c-949f-ce2f6d169702");
        String environmentId = System.getenv().getOrDefault("WRL_ENVIRONMENT_ID", "6b47169a-db33-4943-aaa4-21b2635cd64f");

        WorkflowReliabilityClient client = WorkflowReliabilityClient.builder()
                .endpoint(endpoint)
                .apiKey(apiKey)
                .workspaceId(workspaceId)
                .build();

        System.out.println("1. Registering workflow execution via Java SDK...");
        String correlationId = "java-saga-" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> execResult = client.createExecution(
                ExecutionSubmission.builder()
                        .workflowName("Java Microservice Payment Flow")
                        .environmentId(environmentId)
                        .correlationId(correlationId)
                        .triggerSource("SPRING_BOOT_MICROSERVICE")
                        .inputPayloadMeta(Map.of("amount", 250.00, "currency", "EUR"))
                        .build()
        );
        System.out.println("Execution created: " + execResult);

        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) execResult.get("data");
        String executionId = data != null ? (String) data.get("id") : UUID.randomUUID().toString();

        System.out.println("2. Ingesting workflow event with idempotency guarantee...");
        boolean eventOk = client.publishEvent(
                EventSubmission.builder()
                        .executionId(executionId)
                        .eventType("INVOICE_GENERATED")
                        .sourceService("billing-service")
                        .targetService("email-service")
                        .correlationId(correlationId)
                        .idempotencyKey("idem-inv-" + correlationId)
                        .payload(Map.of("invoiceId", "INV-9921", "total", 250.00))
                        .build()
        );
        System.out.println("Event published successfully: " + eventOk);

        System.out.println("3. Emitting OpenTelemetry span...");
        boolean spanOk = client.publishSpan(
                TraceSubmission.builder()
                        .traceId("trace-java-" + UUID.randomUUID().toString().substring(0, 12))
                        .spanId("span-java-root")
                        .serviceName("billing-service")
                        .name("POST /api/invoices")
                        .statusCode("OK")
                        .attributes(Map.of("http.method", "POST", "http.status_code", 200))
                        .build()
        );
        System.out.println("Span published successfully: " + spanOk);
        System.out.println("Java SDK End-to-End demonstration completed successfully!");
    }
}
