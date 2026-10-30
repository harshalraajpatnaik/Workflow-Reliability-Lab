package com.workflowlab.scenario.repository;

import com.workflowlab.scenario.model.Scenario;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ScenarioRepository extends JpaRepository<Scenario, UUID> {
    Optional<Scenario> findByCode(String code);
    List<Scenario> findByWorkspaceIdOrBuiltinTrue(UUID workspaceId);
    List<Scenario> findByCategory(String category);
}
