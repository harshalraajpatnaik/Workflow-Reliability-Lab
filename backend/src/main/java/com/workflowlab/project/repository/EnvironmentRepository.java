package com.workflowlab.project.repository;

import com.workflowlab.project.model.Environment;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EnvironmentRepository extends JpaRepository<Environment, UUID> {
    List<Environment> findByProjectIdOrderByCreatedAtAsc(UUID projectId);
    Optional<Environment> findByIdAndProjectId(UUID id, UUID projectId);
    boolean existsByProjectIdAndName(UUID projectId, String name);
}
