package com.workflowlab.project.dto;

import com.workflowlab.project.model.Environment;
import com.workflowlab.project.model.EnvironmentType;
import com.workflowlab.project.model.Project;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class ProjectDtos {
    private ProjectDtos() {}

    public record CreateProjectRequest(
        @NotBlank(message = "Project name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name,

        String description
    ) {}

    public record ProjectDto(
        UUID id,
        UUID workspaceId,
        String name,
        String description,
        List<EnvironmentDto> environments,
        Instant createdAt
    ) {
        public static ProjectDto from(Project p, List<EnvironmentDto> envs) {
            return new ProjectDto(
                p.getId(),
                p.getWorkspaceId(),
                p.getName(),
                p.getDescription(),
                envs,
                p.getCreatedAt()
            );
        }
    }

    public record CreateEnvironmentRequest(
        @NotBlank(message = "Environment name is required")
        @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
        String name,

        @NotNull(message = "Environment type is required")
        EnvironmentType environmentType,

        String description,
        String settings
    ) {}

    public record EnvironmentDto(
        UUID id,
        UUID projectId,
        String name,
        EnvironmentType environmentType,
        String description,
        String settings,
        Instant createdAt
    ) {
        public static EnvironmentDto from(Environment e) {
            return new EnvironmentDto(
                e.getId(),
                e.getProjectId(),
                e.getName(),
                e.getEnvironmentType(),
                e.getDescription(),
                e.getSettings(),
                e.getCreatedAt()
            );
        }
    }
}
