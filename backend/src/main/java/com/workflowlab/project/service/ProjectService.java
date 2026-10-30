package com.workflowlab.project.service;

import com.workflowlab.audit.service.AuditService;
import com.workflowlab.common.exception.ConflictException;
import com.workflowlab.common.exception.ResourceNotFoundException;
import com.workflowlab.project.dto.ProjectDtos.*;
import com.workflowlab.project.model.Environment;
import com.workflowlab.project.model.EnvironmentType;
import com.workflowlab.project.model.Project;
import com.workflowlab.project.repository.EnvironmentRepository;
import com.workflowlab.project.repository.ProjectRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final EnvironmentRepository environmentRepository;
    private final AuditService auditService;

    public ProjectService(
        ProjectRepository projectRepository,
        EnvironmentRepository environmentRepository,
        AuditService auditService
    ) {
        this.projectRepository = projectRepository;
        this.environmentRepository = environmentRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> getWorkspaceProjects(UUID workspaceId) {
        List<Project> projects = projectRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);
        List<ProjectDto> dtos = new ArrayList<>();
        for (Project p : projects) {
            List<EnvironmentDto> envs = environmentRepository.findByProjectIdOrderByCreatedAtAsc(p.getId())
                .stream().map(EnvironmentDto::from).toList();
            dtos.add(ProjectDto.from(p, envs));
        }
        return dtos;
    }

    @Transactional(readOnly = true)
    public ProjectDto getProject(UUID workspaceId, UUID projectId) {
        Project project = projectRepository.findByIdAndWorkspaceId(projectId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found in this workspace"));

        List<EnvironmentDto> envs = environmentRepository.findByProjectIdOrderByCreatedAtAsc(projectId)
            .stream().map(EnvironmentDto::from).toList();

        return ProjectDto.from(project, envs);
    }

    @Transactional
    public ProjectDto createProject(UUID workspaceId, CreateProjectRequest request) {
        if (projectRepository.existsByWorkspaceIdAndName(workspaceId, request.name().trim())) {
            throw new ConflictException("A project with this name already exists in this workspace");
        }

        Project project = new Project(workspaceId, request.name().trim(), request.description());
        Project savedProject = projectRepository.save(project);

        // Provision default environments
        List<Environment> defaultEnvs = List.of(
            new Environment(savedProject.getId(), "Development", EnvironmentType.DEVELOPMENT, "Local & feature branch testing"),
            new Environment(savedProject.getId(), "Staging", EnvironmentType.STAGING, "Pre-production integration environment"),
            new Environment(savedProject.getId(), "Production", EnvironmentType.PRODUCTION, "Production telemetry environment"),
            new Environment(savedProject.getId(), "Simulation", EnvironmentType.SIMULATION, "Isolated chaos and reliability fault injection lab")
        );
        List<Environment> savedEnvs = environmentRepository.saveAll(defaultEnvs);

        auditService.record(
            workspaceId,
            null,
            "PROJECT_CREATED",
            "PROJECT",
            savedProject.getId().toString(),
            "{\"name\":\"" + savedProject.getName() + "\"}",
            "127.0.0.1",
            "Web Client"
        );

        return ProjectDto.from(savedProject, savedEnvs.stream().map(EnvironmentDto::from).toList());
    }

    @Transactional
    public EnvironmentDto createEnvironment(UUID workspaceId, UUID projectId, CreateEnvironmentRequest request) {
        projectRepository.findByIdAndWorkspaceId(projectId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (environmentRepository.existsByProjectIdAndName(projectId, request.name().trim())) {
            throw new ConflictException("An environment with this name already exists in this project");
        }

        Environment env = new Environment(projectId, request.name().trim(), request.environmentType(), request.description());
        if (request.settings() != null) {
            env.setSettings(request.settings());
        }
        Environment saved = environmentRepository.save(env);

        auditService.record(
            workspaceId,
            null,
            "ENVIRONMENT_CREATED",
            "ENVIRONMENT",
            saved.getId().toString(),
            "{\"name\":\"" + saved.getName() + "\",\"type\":\"" + saved.getEnvironmentType() + "\"}",
            "127.0.0.1",
            "Web Client"
        );

        return EnvironmentDto.from(saved);
    }

    @Transactional(readOnly = true)
    public List<EnvironmentDto> getEnvironments(UUID workspaceId, UUID projectId) {
        projectRepository.findByIdAndWorkspaceId(projectId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        return environmentRepository.findByProjectIdOrderByCreatedAtAsc(projectId)
            .stream().map(EnvironmentDto::from).toList();
    }
}
