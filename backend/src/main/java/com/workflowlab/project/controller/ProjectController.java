package com.workflowlab.project.controller;

import com.workflowlab.common.dto.ApiResponse;
import com.workflowlab.project.dto.ProjectDtos.*;
import com.workflowlab.project.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/projects")
@Tag(name = "Projects & Environments", description = "Management of projects and environments (Dev, Staging, Prod, Simulation)")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    @Operation(summary = "List all projects in workspace")
    public ResponseEntity<ApiResponse<List<ProjectDto>>> listProjects(@PathVariable UUID workspaceId) {
        List<ProjectDto> projects = projectService.getWorkspaceProjects(workspaceId);
        return ResponseEntity.ok(ApiResponse.ok(projects));
    }

    @PostMapping
    @Operation(summary = "Create a new project with default environments")
    public ResponseEntity<ApiResponse<ProjectDto>> createProject(
        @PathVariable UUID workspaceId,
        @Valid @RequestBody CreateProjectRequest request
    ) {
        ProjectDto project = projectService.createProject(workspaceId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Project created successfully", project));
    }

    @GetMapping("/{projectId}")
    @Operation(summary = "Get project details by ID")
    public ResponseEntity<ApiResponse<ProjectDto>> getProject(
        @PathVariable UUID workspaceId,
        @PathVariable UUID projectId
    ) {
        ProjectDto project = projectService.getProject(workspaceId, projectId);
        return ResponseEntity.ok(ApiResponse.ok(project));
    }

    @GetMapping("/{projectId}/environments")
    @Operation(summary = "List environments for a project")
    public ResponseEntity<ApiResponse<List<EnvironmentDto>>> listEnvironments(
        @PathVariable UUID workspaceId,
        @PathVariable UUID projectId
    ) {
        List<EnvironmentDto> envs = projectService.getEnvironments(workspaceId, projectId);
        return ResponseEntity.ok(ApiResponse.ok(envs));
    }

    @PostMapping("/{projectId}/environments")
    @Operation(summary = "Create an additional environment")
    public ResponseEntity<ApiResponse<EnvironmentDto>> createEnvironment(
        @PathVariable UUID workspaceId,
        @PathVariable UUID projectId,
        @Valid @RequestBody CreateEnvironmentRequest request
    ) {
        EnvironmentDto env = projectService.createEnvironment(workspaceId, projectId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Environment created", env));
    }
}
