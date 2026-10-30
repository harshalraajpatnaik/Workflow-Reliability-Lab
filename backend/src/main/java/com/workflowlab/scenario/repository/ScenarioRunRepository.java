package com.workflowlab.scenario.repository;

import com.workflowlab.scenario.model.ScenarioRun;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ScenarioRunRepository extends JpaRepository<ScenarioRun, UUID> {
    Page<ScenarioRun> findByWorkspaceIdOrderByStartedAtDesc(UUID workspaceId, Pageable pageable);
    List<ScenarioRun> findByScenarioIdOrderByStartedAtDesc(UUID scenarioId);
    Optional<ScenarioRun> findByIdAndWorkspaceId(UUID id, UUID workspaceId);
}
