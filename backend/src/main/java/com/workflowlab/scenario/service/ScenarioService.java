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
    public ScenarioDto getScenario(UUID scenarioId) {
        Scenario scenario = scenarioRepository.findById(scenarioId)
            .orElseThrow(() -> new ResourceNotFoundException("Scenario not found"));
        return ScenarioDto.from(scenario);
    }

    @Transactional
    public ScenarioRunDto runScenario(UUID workspaceId, UUID scenarioId, RunScenarioRequest request, UUID userId) {
        Scenario scenario = scenarioRepository.findById(scenarioId)
            .orElseThrow(() -> new ResourceNotFoundException("Scenario not found"));

        return simulationEngine.executeScenario(workspaceId, scenario, request.environmentId(), userId, request.customFaultConfig());
    }

    @Transactional(readOnly = true)
    public PageResponse<ScenarioRunDto> listScenarioRuns(UUID workspaceId, Pageable pageable) {
        Page<ScenarioRun> page = scenarioRunRepository.findByWorkspaceIdOrderByStartedAtDesc(workspaceId, pageable);
        return PageResponse.from(page.map(ScenarioRunDto::from));
    }

    @Transactional(readOnly = true)
    public ScenarioRunDto getScenarioRun(UUID workspaceId, UUID runId) {
        ScenarioRun run = scenarioRunRepository.findByIdAndWorkspaceId(runId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Scenario run not found"));
        return ScenarioRunDto.from(run);
    }
}
