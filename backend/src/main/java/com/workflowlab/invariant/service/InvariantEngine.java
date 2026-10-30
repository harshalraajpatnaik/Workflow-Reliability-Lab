package com.workflowlab.invariant.service;

import com.workflowlab.common.dto.PageResponse;
import com.workflowlab.event.model.Event;
import com.workflowlab.event.repository.EventRepository;
import com.workflowlab.execution.model.Execution;
import com.workflowlab.execution.repository.ExecutionRepository;
import com.workflowlab.invariant.dto.InvariantDtos.*;
import com.workflowlab.invariant.model.InvariantDefinition;
import com.workflowlab.invariant.model.InvariantResult;
import com.workflowlab.invariant.repository.InvariantDefinitionRepository;
import com.workflowlab.invariant.repository.InvariantResultRepository;
import com.workflowlab.invariant.service.checks.InvariantCheck;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InvariantEngine {

    private static final Logger log = LoggerFactory.getLogger(InvariantEngine.class);

    private final Map<String, InvariantCheck> checkMap = new HashMap<>();
    private final InvariantDefinitionRepository defRepository;
    private final InvariantResultRepository resultRepository;
    private final ExecutionRepository executionRepository;
    private final EventRepository eventRepository;

    public InvariantEngine(
        List<InvariantCheck> checks,
        InvariantDefinitionRepository defRepository,
        InvariantResultRepository resultRepository,
        ExecutionRepository executionRepository,
        EventRepository eventRepository
    ) {
        for (InvariantCheck c : checks) {
            this.checkMap.put(c.ruleType(), c);
        }
        this.defRepository = defRepository;
        this.resultRepository = resultRepository;
        this.executionRepository = executionRepository;
        this.eventRepository = eventRepository;
    }

    @Transactional
    public List<InvariantResultDto> evaluateExecution(UUID executionId) {
        Execution execution = executionRepository.findById(executionId).orElse(null);
        if (execution == null) return List.of();

        List<Event> events = eventRepository.findByExecutionIdOrderByOccurredAtAsc(executionId);
        List<InvariantDefinition> definitions = defRepository.findByEnabledTrue();

        List<InvariantResult> savedResults = new ArrayList<>();
        Map<UUID, InvariantDefinition> defMap = new HashMap<>();

        for (InvariantDefinition def : definitions) {
            defMap.put(def.getId(), def);
            InvariantCheck check = checkMap.get(def.getRuleType());
            if (check != null) {
                InvariantResult result = check.evaluate(def, execution, events);
                savedResults.add(resultRepository.save(result));
            }
        }

        return savedResults.stream()
            .map(r -> InvariantResultDto.from(r, defMap.get(r.getInvariantId())))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<InvariantDefinitionDto> listDefinitions(UUID workspaceId) {
        return defRepository.findByWorkspaceIdOrBuiltinTrue(workspaceId)
            .stream().map(InvariantDefinitionDto::from).toList();
    }

    @Transactional(readOnly = true)
    public List<InvariantResultDto> getExecutionResults(UUID executionId) {
        List<InvariantResult> results = resultRepository.findByExecutionIdOrderByCheckedAtAsc(executionId);
        Map<UUID, InvariantDefinition> defMap = new HashMap<>();
        for (InvariantDefinition d : defRepository.findAll()) {
            defMap.put(d.getId(), d);
        }
        return results.stream()
            .map(r -> InvariantResultDto.from(r, defMap.get(r.getInvariantId())))
            .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<InvariantResultDto> listWorkspaceResults(UUID workspaceId, Pageable pageable) {
        Page<InvariantResult> page = resultRepository.findByWorkspaceIdOrderByCheckedAtDesc(workspaceId, pageable);
        Map<UUID, InvariantDefinition> defMap = new HashMap<>();
        for (InvariantDefinition d : defRepository.findAll()) {
            defMap.put(d.getId(), d);
        }
        return PageResponse.from(page.map(r -> InvariantResultDto.from(r, defMap.get(r.getInvariantId()))));
    }

    @Transactional(readOnly = true)
    public InvariantCheckSummaryDto getSummary(UUID executionId) {
        List<InvariantResult> results = resultRepository.findByExecutionIdOrderByCheckedAtAsc(executionId);
        int total = results.size();
        int violated = (int) results.stream().filter(r -> !r.isPassed()).count();
        int passed = total - violated;
        return new InvariantCheckSummaryDto(total, passed, violated, violated == 0);
    }
}
