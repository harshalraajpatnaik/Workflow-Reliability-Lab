package com.workflowlab.common.controller;

import com.workflowlab.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public")
@Tag(name = "Public Information", description = "Public overview, capabilities, pricing tiers, and developer documentation")
public class PublicController {

    @GetMapping("/overview")
    @Operation(summary = "Platform overview, capabilities, and system features")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOverview() {
        Map<String, Object> overview = Map.of(
            "name", "Workflow Reliability Lab",
            "tagline", "Developer platform for testing, diagnosing, and proving the correctness of distributed workflows",
            "capabilities", List.of(
                "Execution Observability & Interactive Timelines",
                "Deterministic Correctness & Invariant Validation",
                "Chaos & Failure Simulation Lab (15 Built-in Scenarios)",
                "Payment Reliability & Timeout Recovery Simulator",
                "Automated Root-Cause Evidence Investigation"
            ),
            "version", "1.0.0",
            "status", "OPERATIONAL"
        );
        return ResponseEntity.ok(ApiResponse.ok(overview));
    }

    @GetMapping("/plans")
    @Operation(summary = "Developer and team pricing tiers")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPlans() {
        List<Map<String, Object>> plans = List.of(
            Map.of(
                "id", "developer",
                "name", "Developer Community",
                "price", "$0",
                "period", "Forever Free",
                "features", List.of(
                    "Single Workspace with 3 Environments",
                    "Up to 100,000 monthly workflow events",
                    "15 Built-in Failure Scenarios",
                    "8 Deterministic Invariant Checks",
                    "OpenTelemetry Ingestion",
                    "PostgreSQL Docker local lab"
                )
            ),
            Map.of(
                "id", "team",
                "name", "Engineering Team",
                "price", "$49",
                "period", "per workspace / month",
                "features", List.of(
                    "Unlimited Workspaces & Projects",
                    "5,000,000 monthly events",
                    "Custom Invariant Rule Authoring",
                    "RabbitMQ & Kafka Integration Support",
                    "Automated Postmortem Incident Reports",
                    "Team RBAC & Audit History",
                    "Optional LM Studio Local AI Diagnosis"
                )
            ),
            Map.of(
                "id", "enterprise",
                "name", "Enterprise Mission-Critical",
                "price", "Custom",
                "period", "annual contract",
                "features", List.of(
                    "Dedicated Single-Tenant or Self-Hosted",
                    "Unlimited events & custom retention",
                    "SLA Correctness Certifications",
                    "SOC2 Type II Audit Trails",
                    "24/7 SRE Technical Escalation",
                    "Custom Integration Connectors"
                )
            )
        );
        return ResponseEntity.ok(ApiResponse.ok(plans));
    }
}
