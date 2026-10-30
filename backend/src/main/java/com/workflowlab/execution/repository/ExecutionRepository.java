package com.workflowlab.execution.repository;

import com.workflowlab.execution.model.Execution;
import com.workflowlab.execution.model.ExecutionStatus;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ExecutionRepository extends JpaRepository<Execution, UUID> {

    Optional<Execution> findByIdAndWorkspaceId(UUID id, UUID workspaceId);

    @Query("SELECT e FROM Execution e WHERE e.workspaceId = :workspaceId " +
           "AND (:environmentId IS NULL OR e.environmentId = :environmentId) " +
           "AND (:status IS NULL OR e.status = :status) " +
           "AND (:search IS NULL OR LOWER(e.workflowName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.correlationId) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY e.startedAt DESC")
    Page<Execution> findFiltered(
        @Param("workspaceId") UUID workspaceId,
        @Param("environmentId") UUID environmentId,
        @Param("status") ExecutionStatus status,
        @Param("search") String search,
        Pageable pageable
    );

    long countByWorkspaceIdAndStatus(UUID workspaceId, ExecutionStatus status);

    long countByWorkspaceId(UUID workspaceId);
}
