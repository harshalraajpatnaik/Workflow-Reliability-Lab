package com.workflowlab.execution.service;

import com.workflowlab.common.dto.PageResponse;
import com.workflowlab.common.exception.BadRequestException;
import com.workflowlab.common.exception.ResourceNotFoundException;
import com.workflowlab.execution.dto.ExecutionDtos.*;
import com.workflowlab.execution.model.Execution;
import com.workflowlab.execution.model.ExecutionStatus;
import com.workflowlab.execution.repository.ExecutionRepository;
import java.time.Instant;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExecutionService {

    private final ExecutionRepository executionRepository;

    public ExecutionService(ExecutionRepository executionRepository) {
        this.executionRepository = executionRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<ExecutionDto> listExecutions(
        UUID workspaceId,
        UUID environmentId,
        ExecutionStatus status,
        String search,
        Pageable pageable
    ) {
        Page<Execution> page = executionRepository.findFiltered(workspaceId, environmentId, status, search, pageable);
        return PageResponse.from(page.map(ExecutionDto::from));
    }

    @Transactional(readOnly = true)
    public ExecutionDto getExecution(UUID workspaceId, UUID executionId) {
        Execution execution = executionRepository.findByIdAndWorkspaceId(executionId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Execution not found in this workspace"));
        return ExecutionDto.from(execution);
    }

    @Transactional
    public ExecutionDto createExecution(UUID workspaceId, CreateExecutionRequest request) {
        Execution execution = new Execution(
            workspaceId,
            request.environmentId(),
            request.workflowName().trim(),
            request.correlationId().trim(),
            request.triggerSource(),
            Boolean.TRUE.equals(request.isDemo())
        );

        if (request.parentExecutionId() != null) {
            execution.setParentExecutionId(request.parentExecutionId());
        }
        if (request.inputPayloadMeta() != null) {
            execution.setInputPayloadMeta(request.inputPayloadMeta());
        }

        Execution saved = executionRepository.save(execution);
        return ExecutionDto.from(saved);
    }

    @Transactional
    public ExecutionDto updateExecutionStatus(UUID workspaceId, UUID executionId, UpdateExecutionStatusRequest request) {
        Execution execution = executionRepository.findByIdAndWorkspaceId(executionId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Execution not found"));

        if (execution.getStatus().isTerminal() && request.status() != execution.getStatus()) {
            throw new BadRequestException("Cannot transition execution from terminal status " + execution.getStatus() + " to " + request.status());
        }

        execution.setStatus(request.status());
        if (request.status().isTerminal()) {
            execution.setEndedAt(Instant.now());
        }
        if (request.outputPayloadMeta() != null) {
            execution.setOutputPayloadMeta(request.outputPayloadMeta());
        }
        if (request.errorMessage() != null) {
            execution.setErrorMessage(request.errorMessage());
        }
        if (request.errorStack() != null) {
            execution.setErrorStack(request.errorStack());
        }

        Execution updated = executionRepository.save(execution);
        return ExecutionDto.from(updated);
    }

    @Transactional(readOnly = true)
    public ExecutionStatsDto getStats(UUID workspaceId) {
        long total = executionRepository.countByWorkspaceId(workspaceId);
        long completed = executionRepository.countByWorkspaceIdAndStatus(workspaceId, ExecutionStatus.COMPLETED);
        long failed = executionRepository.countByWorkspaceIdAndStatus(workspaceId, ExecutionStatus.FAILED);
        long running = executionRepository.countByWorkspaceIdAndStatus(workspaceId, ExecutionStatus.RUNNING);
        long timedOut = executionRepository.countByWorkspaceIdAndStatus(workspaceId, ExecutionStatus.TIMED_OUT);

        double rate = total > 0 ? (double) completed / total * 100.0 : 0.0;
        return new ExecutionStatsDto(total, completed, failed, running, timedOut, Math.round(rate * 10.0) / 10.0);
    }
}
