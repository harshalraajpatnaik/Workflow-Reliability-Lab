package com.workflowlab.invariant.repository;

import com.workflowlab.invariant.model.InvariantDefinition;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvariantDefinitionRepository extends JpaRepository<InvariantDefinition, UUID> {
    Optional<InvariantDefinition> findByCode(String code);
    List<InvariantDefinition> findByWorkspaceIdOrBuiltinTrue(UUID workspaceId);
    List<InvariantDefinition> findByEnabledTrue();
}
