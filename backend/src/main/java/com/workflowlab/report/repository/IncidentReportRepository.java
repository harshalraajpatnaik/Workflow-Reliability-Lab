package com.workflowlab.report.repository;

import com.workflowlab.report.model.IncidentReport;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IncidentReportRepository extends JpaRepository<IncidentReport, UUID> {
    List<IncidentReport> findByIncidentIdOrderByCreatedAtDesc(UUID incidentId);
    Optional<IncidentReport> findByIdAndWorkspaceId(UUID id, UUID workspaceId);
}
