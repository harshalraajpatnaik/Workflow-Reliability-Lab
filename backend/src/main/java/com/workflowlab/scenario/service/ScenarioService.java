package com.workflowlab.scenario.service;

import com.workflowlab.common.dto.PageResponse;
import com.workflowlab.common.exception.ResourceNotFoundException;
import com.workflowlab.scenario.dto.ScenarioDtos.*;
import com.workflowlab.scenario.model.Scenario;
import com.workflowlab.scenario.model.ScenarioRun;
import com.workflowlab.scenario.repository.ScenarioRepository;
import com.workflowlab.scenario.repository.ScenarioRunRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ScenarioService {

    private final ScenarioRepository scenarioRepository;
    private final ScenarioRunRepository scenarioRunRepository;
    private final SimulationEngine simulationEngine;

    public ScenarioService(
        ScenarioRepository scenarioRepository,
        ScenarioRunRepository scenarioRunRepository,
        SimulationEngine simulationEngine
    ) {
        this.scenarioRepository = scenarioRepository;
        this.scenarioRunRepository = scenarioRunRepository;
        this.simulationEngine = simulationEngine;
    }

    @Transactional(readOnly = true)
    public List<ScenarioDto> listScenarios(UUID workspaceId) {
        return scenarioRepository.findByWorkspaceIdOrBuiltinTrue(workspaceId)
            .stream().map(ScenarioDto::from).toList();
    }

    @Transactional(readOnly = true)
    public ScenarioDto getScenario(String scenarioIdentifier) {
        Scenario scenario = resolveScenario(scenarioIdentifier);
        return ScenarioDto.from(scenario);
    }

    @Transactional
    public ScenarioRunDto runScenario(UUID workspaceId, String scenarioIdentifier, RunScenarioRequest request, UUID userId) {
        Scenario scenario = resolveScenario(scenarioIdentifier);
        return simulationEngine.executeScenario(workspaceId, scenario, request.environmentId(), userId, request.customFaultConfig());
    }

    @Transactional(readOnly = true)
    public PageResponse<ScenarioRunDto> listScenarioRuns(UUID workspaceId, Pageable pageable) {
        Page<ScenarioRun> page = scenarioRunRepository.findByWorkspaceIdOrderByStartedAtDesc(workspaceId, pageable);
        return PageResponse.from(page.map(ScenarioRunDto::from));
    }

    private Scenario resolveScenario(String identifier) {
        try {
            UUID id = UUID.fromString(identifier);
            return scenarioRepository.findById(id)
                .or(() -> scenarioRepository.findByCode(identifier))
                .orElseThrow(() -> new ResourceNotFoundException("Scenario not found with ID or code: " + identifier));
        } catch (IllegalArgumentException e) {
            return scenarioRepository.findByCode(identifier)
                .orElseThrow(() -> new ResourceNotFoundException("Scenario not found with code: " + identifier));
        }
    }
}
