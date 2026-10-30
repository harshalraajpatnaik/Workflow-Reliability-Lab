package com.workflowlab.anomaly.repository;

import com.workflowlab.anomaly.model.Anomaly;
import com.workflowlab.anomaly.model.AnomalySeverity;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnomalyRepository extends JpaRepository<Anomaly, UUID> {
    List<Anomaly> findByExecutionIdOrderByDetectedAtDesc(UUID executionId);
    Page<Anomaly> findByWorkspaceIdOrderByDetectedAtDesc(UUID workspaceId, Pageable pageable);
    Optional<Anomaly> findByIdAndWorkspaceId(UUID id, UUID workspaceId);
    long countByWorkspaceIdAndAcknowledgedFalse(UUID workspaceId);
    long countByWorkspaceIdAndSeverity(UUID workspaceId, AnomalySeverity severity);
    boolean existsByExecutionIdAndRuleType(UUID executionId, com.workflowlab.anomaly.model.AnomalyRuleType ruleType);
}
