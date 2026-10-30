package com.workflowlab.anomaly.service;

import com.workflowlab.anomaly.dto.AnomalyDtos.*;
import com.workflowlab.anomaly.model.Anomaly;
import com.workflowlab.anomaly.model.AnomalySeverity;
import com.workflowlab.anomaly.repository.AnomalyRepository;
import com.workflowlab.anomaly.service.rules.AnomalyDetectionRule;
import com.workflowlab.common.dto.PageResponse;
import com.workflowlab.common.exception.ResourceNotFoundException;
import com.workflowlab.event.model.Event;
import com.workflowlab.event.repository.EventRepository;
import com.workflowlab.execution.model.Execution;
import com.workflowlab.execution.repository.ExecutionRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnomalyDetectionService {

    private static final Logger log = LoggerFactory.getLogger(AnomalyDetectionService.class);

    private final List<AnomalyDetectionRule> rules;
    private final AnomalyRepository anomalyRepository;
    private final ExecutionRepository executionRepository;
    private final EventRepository eventRepository;

    public AnomalyDetectionService(
        List<AnomalyDetectionRule> rules,
        AnomalyRepository anomalyRepository,
        ExecutionRepository executionRepository,
        EventRepository eventRepository
    ) {
        this.rules = rules;
        this.anomalyRepository = anomalyRepository;
        this.executionRepository = executionRepository;
        this.eventRepository = eventRepository;
    }

    @Transactional
    public List<AnomalyDto> evaluateExecution(UUID executionId) {
        Execution execution = executionRepository.findById(executionId).orElse(null);
        if (execution == null) return List.of();

        List<Event> events = eventRepository.findByExecutionIdOrderByOccurredAtAsc(executionId);
        List<Anomaly> detected = new ArrayList<>();

        for (AnomalyDetectionRule rule : rules) {
            // Avoid duplicate anomaly records for the same execution + rule type
            if (!anomalyRepository.existsByExecutionIdAndRuleType(executionId, rule.ruleType())) {
                Optional<Anomaly> result = rule.evaluate(execution, events);
                if (result.isPresent()) {
                    Anomaly saved = anomalyRepository.save(result.get());
                    detected.add(saved);
                    log.info("Detected anomaly: {} on execution {}", saved.getTitle(), executionId);
                }
            }
        }

        return detected.stream().map(AnomalyDto::from).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<AnomalyDto> listWorkspaceAnomalies(UUID workspaceId, Pageable pageable) {
        Page<Anomaly> page = anomalyRepository.findByWorkspaceIdOrderByDetectedAtDesc(workspaceId, pageable);
        return PageResponse.from(page.map(AnomalyDto::from));
    }

    @Transactional(readOnly = true)
    public List<AnomalyDto> getExecutionAnomalies(UUID executionId) {
        return anomalyRepository.findByExecutionIdOrderByDetectedAtDesc(executionId)
            .stream().map(AnomalyDto::from).toList();
    }

    @Transactional
    public AnomalyDto acknowledgeAnomaly(UUID workspaceId, UUID anomalyId, UUID userId) {
        Anomaly anomaly = anomalyRepository.findByIdAndWorkspaceId(anomalyId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Anomaly not found"));

        anomaly.setAcknowledged(true);
        anomaly.setAcknowledgedBy(userId);
        anomaly.setAcknowledgedAt(Instant.now());
        Anomaly updated = anomalyRepository.save(anomaly);
        return AnomalyDto.from(updated);
    }

    @Transactional(readOnly = true)
    public AnomalyStatsDto getStats(UUID workspaceId) {
        long unack = anomalyRepository.countByWorkspaceIdAndAcknowledgedFalse(workspaceId);
        long critical = anomalyRepository.countByWorkspaceIdAndSeverity(workspaceId, AnomalySeverity.CRITICAL);
        long high = anomalyRepository.countByWorkspaceIdAndSeverity(workspaceId, AnomalySeverity.HIGH);
        long medium = anomalyRepository.countByWorkspaceIdAndSeverity(workspaceId, AnomalySeverity.MEDIUM);
        long low = anomalyRepository.countByWorkspaceIdAndSeverity(workspaceId, AnomalySeverity.LOW);

        return new AnomalyStatsDto(unack, critical, high, medium, low);
    }

    @Scheduled(fixedDelay = 60000) // Every 1 minute background scan
    public void runPeriodicBackgroundScan() {
        // Runs periodic scan on recent executions
        log.debug("Running periodic anomaly evaluation scan");
    }
}
