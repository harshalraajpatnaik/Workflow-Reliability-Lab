package com.workflowlab.report.service;

import com.workflowlab.ai.service.AiAnalysisService;
import com.workflowlab.common.dto.PageResponse;
import com.workflowlab.common.exception.ResourceNotFoundException;
import com.workflowlab.event.model.Event;
import com.workflowlab.event.repository.EventRepository;
import com.workflowlab.execution.model.Execution;
import com.workflowlab.execution.repository.ExecutionRepository;
import com.workflowlab.report.dto.IncidentDtos.*;
import com.workflowlab.report.model.Incident;
import com.workflowlab.report.model.IncidentReport;
import com.workflowlab.report.repository.IncidentReportRepository;
import com.workflowlab.report.repository.IncidentRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final IncidentReportRepository reportRepository;
    private final ExecutionRepository executionRepository;
    private final EventRepository eventRepository;
    private final AiAnalysisService aiService;

    public IncidentService(
        IncidentRepository incidentRepository,
        IncidentReportRepository reportRepository,
        ExecutionRepository executionRepository,
        EventRepository eventRepository,
        AiAnalysisService aiService
    ) {
        this.incidentRepository = incidentRepository;
        this.reportRepository = reportRepository;
        this.executionRepository = executionRepository;
        this.eventRepository = eventRepository;
        this.aiService = aiService;
    }

    @Transactional
    public IncidentDto createIncident(UUID workspaceId, CreateIncidentRequest request, UUID userId) {
        Incident incident = new Incident(
            workspaceId,
            request.executionId(),
            request.title().trim(),
            request.summary(),
            request.severity(),
            userId
        );

        if (request.rootCauseHypothesis() != null) incident.setRootCauseHypothesis(request.rootCauseHypothesis());
        if (request.evidenceRefs() != null) incident.setEvidenceRefs(request.evidenceRefs());
        if (request.remediationSteps() != null) incident.setRemediationSteps(request.remediationSteps());

        Incident saved = incidentRepository.save(incident);
        return IncidentDto.from(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<IncidentDto> listIncidents(UUID workspaceId, Pageable pageable) {
        Page<Incident> page = incidentRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId, pageable);
        return PageResponse.from(page.map(IncidentDto::from));
    }

    @Transactional(readOnly = true)
    public IncidentDto getIncident(UUID workspaceId, UUID incidentId) {
        Incident incident = incidentRepository.findByIdAndWorkspaceId(incidentId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Incident not found"));
        return IncidentDto.from(incident);
    }

    @Transactional
    public IncidentDto updateIncident(UUID workspaceId, UUID incidentId, UpdateIncidentRequest request, UUID userId) {
        Incident incident = incidentRepository.findByIdAndWorkspaceId(incidentId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Incident not found"));

        if (request.title() != null) incident.setTitle(request.title().trim());
        if (request.summary() != null) incident.setSummary(request.summary());
        if (request.severity() != null) incident.setSeverity(request.severity());
        if (request.rootCauseHypothesis() != null) incident.setRootCauseHypothesis(request.rootCauseHypothesis());
        if (request.remediationSteps() != null) incident.setRemediationSteps(request.remediationSteps());
        if (request.status() != null) {
            incident.setStatus(request.status());
            if ("RESOLVED".equalsIgnoreCase(request.status()) || "CLOSED".equalsIgnoreCase(request.status())) {
                incident.setResolvedAt(Instant.now());
                incident.setResolvedBy(userId);
            }
        }

        Incident updated = incidentRepository.save(incident);
        return IncidentDto.from(updated);
    }

    @Transactional
    public IncidentDto generateAiAnalysis(UUID workspaceId, UUID incidentId) {
        Incident incident = incidentRepository.findByIdAndWorkspaceId(incidentId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Incident not found"));

        String analysis = aiService.analyzeIncident(
            incident.getTitle(),
            incident.getSummary(),
            incident.getEvidenceRefs()
        );

        incident.setAiAnalysis(analysis);
        incident.setAiModelUsed(aiService.isEnabled() ? "LM Studio Local" : "Deterministic Engine");
        Incident saved = incidentRepository.save(incident);
        return IncidentDto.from(saved);
    }

    @Transactional
    public IncidentReportDto generatePostmortemReport(UUID workspaceId, UUID incidentId) {
        Incident incident = incidentRepository.findByIdAndWorkspaceId(incidentId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Incident not found"));

        StringBuilder md = new StringBuilder();
        md.append("# Incident Postmortem: ").append(incident.getTitle()).append("\n\n");
        md.append("**Incident ID:** `").append(incident.getId()).append("`  \n");
        md.append("**Severity:** `").append(incident.getSeverity()).append("`  \n");
        md.append("**Status:** `").append(incident.getStatus()).append("`  \n");
        md.append("**Date Recorded:** ").append(incident.getCreatedAt()).append("  \n\n");

        md.append("## Executive Summary\n\n");
        md.append(incident.getSummary() != null ? incident.getSummary() : "No summary provided.").append("\n\n");

        if (incident.getExecutionId() != null) {
            Execution exec = executionRepository.findById(incident.getExecutionId()).orElse(null);
            if (exec != null) {
                md.append("## Associated Workflow Execution\n\n");
                md.append("- **Workflow Name:** ").append(exec.getWorkflowName()).append("\n");
                md.append("- **Execution ID:** `").append(exec.getId()).append("`\n");
                md.append("- **Correlation ID:** `").append(exec.getCorrelationId()).append("`\n");
                md.append("- **Status:** `").append(exec.getStatus()).append("`\n");
                md.append("- **Duration:** ").append(exec.getDurationMs()).append(" ms\n");
                if (exec.getErrorMessage() != null) {
                    md.append("- **Error Message:** `").append(exec.getErrorMessage()).append("`\n");
                }
                md.append("\n");

                List<Event> events = eventRepository.findByExecutionIdOrderByOccurredAtAsc(exec.getId());
                if (!events.isEmpty()) {
                    md.append("### Timeline of Events\n\n");
                    md.append("| Timestamp | Event Type | Service | Status | Retries |\n");
                    md.append("|-----------|------------|---------|--------|---------|\n");
                    for (Event ev : events) {
                        md.append(String.format("| %s | `%s` | %s | %s | %d |\n",
                            ev.getOccurredAt(), ev.getEventType(), ev.getSourceService(), ev.getStatus(), ev.getRetryCount()));
                    }
                    md.append("\n");
                }
            }
        }

        md.append("## Root-Cause Hypothesis\n\n");
        md.append(incident.getRootCauseHypothesis() != null ? incident.getRootCauseHypothesis() : "Investigation ongoing.").append("\n\n");

        md.append("## Diagnostic Evidence\n\n");
        md.append("```json\n").append(incident.getEvidenceRefs()).append("\n```\n\n");

        if (incident.getAiAnalysis() != null) {
            md.append("## AI Diagnostic Analysis\n\n");
            md.append(incident.getAiAnalysis()).append("\n\n");
        }

        md.append("## Remediation Steps\n\n");
        md.append(incident.getRemediationSteps() != null ? incident.getRemediationSteps() : "No remediation steps recorded.").append("\n");

        IncidentReport report = new IncidentReport(
            incident.getId(),
            workspaceId,
            "Postmortem: " + incident.getTitle(),
            md.toString(),
            "SYSTEM"
        );
        IncidentReport saved = reportRepository.save(report);
        return IncidentReportDto.from(saved);
    }

    @Transactional(readOnly = true)
    public List<IncidentReportDto> getReports(UUID workspaceId, UUID incidentId) {
        return reportRepository.findByIncidentIdOrderByCreatedAtDesc(incidentId)
            .stream().map(IncidentReportDto::from).toList();
    }
}
