package dev.workflowlab.sdk;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import dev.workflowlab.sdk.model.EventSubmission;
import dev.workflowlab.sdk.model.TraceSubmission;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class WorkflowReliabilityClient {
    private final String endpoint;
    private final String apiKey;
    private final String workspaceId;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    private WorkflowReliabilityClient(Builder builder) {
        this.endpoint = builder.endpoint.replaceAll("/+$", "");
        this.apiKey = builder.apiKey;
        this.workspaceId = builder.workspaceId;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    }

    public static Builder builder() {
        return new Builder();
    }

    /**
     * Ingests a workflow event into the durable event journal.
     */
    public boolean publishEvent(EventSubmission event) throws IOException, InterruptedException {
        String url = String.format("%s/api/v1/workspaces/%s/events", endpoint, workspaceId);
        String body = objectMapper.writeValueAsString(event);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .header("X-API-Key", apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .timeout(Duration.ofSeconds(10))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return response.statusCode() >= 200 && response.statusCode() < 300;
    }

    /**
     * Ingests an OpenTelemetry span into the distributed trace store.
     */
    public boolean publishSpan(TraceSubmission span) throws IOException, InterruptedException {
        String url = String.format("%s/api/v1/workspaces/%s/traces/spans", endpoint, workspaceId);
        String body = objectMapper.writeValueAsString(span);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .header("X-API-Key", apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .timeout(Duration.ofSeconds(10))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return response.statusCode() >= 200 && response.statusCode() < 300;
    }

    public static class Builder {
        private String endpoint = "http://localhost:8085";
        private String apiKey;
        private String workspaceId;

        public Builder endpoint(String endpoint) {
            this.endpoint = endpoint;
            return this;
        }

        public Builder apiKey(String apiKey) {
            this.apiKey = apiKey;
            return this;
        }

        public Builder workspaceId(String workspaceId) {
            this.workspaceId = workspaceId;
            return this;
        }

        public WorkflowReliabilityClient build() {
            if (apiKey == null || apiKey.isBlank()) {
                throw new IllegalArgumentException("API Key must be provided");
            }
            if (workspaceId == null || workspaceId.isBlank()) {
                throw new IllegalArgumentException("Workspace ID must be provided");
            }
            return new WorkflowReliabilityClient(this);
        }
    }
}
