package com.workflowlab.invariant.repository;

import com.workflowlab.invariant.model.InvariantResult;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvariantResultRepository extends JpaRepository<InvariantResult, UUID> {
    List<InvariantResult> findByExecutionIdOrderByCheckedAtAsc(UUID executionId);
    Page<InvariantResult> findByWorkspaceIdOrderByCheckedAtDesc(UUID workspaceId, Pageable pageable);
    long countByExecutionIdAndPassedFalse(UUID executionId);
    long countByWorkspaceIdAndPassedFalse(UUID workspaceId);
}
