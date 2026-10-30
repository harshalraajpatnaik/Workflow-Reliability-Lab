package com.workflowlab.workspace.service;

import com.workflowlab.audit.service.AuditService;
import com.workflowlab.auth.model.User;
import com.workflowlab.auth.repository.UserRepository;
import com.workflowlab.common.exception.ConflictException;
import com.workflowlab.common.exception.ForbiddenException;
import com.workflowlab.common.exception.ResourceNotFoundException;
import com.workflowlab.workspace.dto.WorkspaceDtos.*;
import com.workflowlab.workspace.model.Workspace;
import com.workflowlab.workspace.model.WorkspaceMember;
import com.workflowlab.workspace.model.WorkspaceRole;
import com.workflowlab.workspace.repository.WorkspaceMemberRepository;
import com.workflowlab.workspace.repository.WorkspaceRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final PasswordEncoder passwordEncoder;

    public WorkspaceService(
        WorkspaceRepository workspaceRepository,
        WorkspaceMemberRepository memberRepository,
        UserRepository userRepository,
        AuditService auditService,
        PasswordEncoder passwordEncoder
    ) {
        this.workspaceRepository = workspaceRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<WorkspaceDto> getUserWorkspaces(UUID userId) {
        List<Workspace> workspaces = workspaceRepository.findAllByUserId(userId);
        List<WorkspaceDto> dtos = new ArrayList<>();
        for (Workspace w : workspaces) {
            WorkspaceRole role = memberRepository.findByWorkspaceIdAndUserId(w.getId(), userId)
                .map(WorkspaceMember::getRole)
                .orElse(WorkspaceRole.VIEWER);
            dtos.add(WorkspaceDto.from(w, role));
        }
        return dtos;
    }

    @Transactional(readOnly = true)
    public WorkspaceDto getWorkspace(UUID workspaceId, UUID userId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        WorkspaceMember member = memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
            .orElseThrow(() -> new ForbiddenException("You are not a member of this workspace"));

        return WorkspaceDto.from(workspace, member.getRole());
    }

    @Transactional
    public WorkspaceDto createWorkspace(CreateWorkspaceRequest request, UUID userId) {
        String baseSlug = request.name().toLowerCase().replaceAll("[^a-z0-9]", "-").replaceAll("-+", "-");
        String slug = baseSlug + "-" + UUID.randomUUID().toString().substring(0, 6);

        Workspace workspace = new Workspace(request.name().trim(), slug, userId);
        Workspace saved = workspaceRepository.save(workspace);

        WorkspaceMember ownerMember = new WorkspaceMember(saved.getId(), userId, WorkspaceRole.OWNER);
        memberRepository.save(ownerMember);

        auditService.record(
            saved.getId(),
            userId,
            "WORKSPACE_CREATED",
            "WORKSPACE",
            saved.getId().toString(),
            "{\"name\":\"" + saved.getName() + "\"}",
            "127.0.0.1",
            "Web Client"
        );

        return WorkspaceDto.from(saved, WorkspaceRole.OWNER);
    }

    @Transactional
    public WorkspaceDto updateWorkspace(UUID workspaceId, CreateWorkspaceRequest request, UUID userId) {
        assertAdminOrOwner(workspaceId, userId);

        Workspace workspace = workspaceRepository.findById(workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        workspace.setName(request.name().trim());
        Workspace updated = workspaceRepository.save(workspace);

        WorkspaceRole role = getMemberRole(workspaceId, userId);
        return WorkspaceDto.from(updated, role);
    }

    @Transactional(readOnly = true)
    public List<WorkspaceMemberDto> getMembers(UUID workspaceId, UUID userId) {
        assertMember(workspaceId, userId);

        List<WorkspaceMember> members = memberRepository.findByWorkspaceId(workspaceId);
        List<WorkspaceMemberDto> dtos = new ArrayList<>();

        for (WorkspaceMember m : members) {
            User user = userRepository.findById(m.getUserId()).orElse(null);
            if (user != null) {
                dtos.add(new WorkspaceMemberDto(
                    m.getId(),
                    m.getWorkspaceId(),
                    m.getUserId(),
                    user.getEmail(),
                    user.getFullName(),
                    m.getRole(),
                    m.getJoinedAt()
                ));
            }
        }
        return dtos;
    }

    @Transactional
    public WorkspaceMemberDto inviteMember(UUID workspaceId, InviteMemberRequest request, UUID requestingUserId) {
        assertAdminOrOwner(workspaceId, requestingUserId);

        String email = request.email().trim().toLowerCase();
        User invitee = userRepository.findByEmailIgnoreCase(email)
            .orElseGet(() -> {
                String prefix = email.split("@")[0];
                String name = Character.toUpperCase(prefix.charAt(0)) + prefix.substring(1);
                User newUser = new User(email, passwordEncoder.encode(UUID.randomUUID().toString()), name);
                newUser.setEmailVerified(false);
                return userRepository.save(newUser);
            });

        if (memberRepository.existsByWorkspaceIdAndUserId(workspaceId, invitee.getId())) {
            throw new ConflictException("User is already a member of this workspace");
        }

        WorkspaceRole role = request.role() != null ? request.role() : WorkspaceRole.DEVELOPER;
        WorkspaceMember member = new WorkspaceMember(workspaceId, invitee.getId(), role);
        WorkspaceMember saved = memberRepository.save(member);

        auditService.record(
            workspaceId,
            requestingUserId,
            "MEMBER_INVITED",
            "USER",
            invitee.getId().toString(),
            "{\"email\":\"" + invitee.getEmail() + "\",\"role\":\"" + role.name() + "\"}",
            "127.0.0.1",
            "Web Client"
        );

        return new WorkspaceMemberDto(
            saved.getId(),
            workspaceId,
            invitee.getId(),
            invitee.getEmail(),
            invitee.getFullName(),
            saved.getRole(),
            saved.getJoinedAt()
        );
    }

    @Transactional
    public void removeMember(UUID workspaceId, UUID memberUserId, UUID requestingUserId) {
        assertAdminOrOwner(workspaceId, requestingUserId);

        Workspace workspace = workspaceRepository.findById(workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        if (workspace.getOwnerId().equals(memberUserId)) {
            throw new ForbiddenException("Cannot remove the workspace owner");
        }

        memberRepository.deleteByWorkspaceIdAndUserId(workspaceId, memberUserId);

        auditService.record(
            workspaceId,
            requestingUserId,
            "MEMBER_REMOVED",
            "USER",
            memberUserId.toString(),
            "{}",
            "127.0.0.1",
            "Web Client"
        );
    }

    @Transactional
    public void updateMemberRole(UUID workspaceId, UUID targetUserId, WorkspaceRole newRole, UUID requestingUserId) {
        assertAdminOrOwner(workspaceId, requestingUserId);

        WorkspaceMember member = memberRepository.findByWorkspaceIdAndUserId(workspaceId, targetUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Member not found in workspace"));

        Workspace workspace = workspaceRepository.findById(workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        if (workspace.getOwnerId().equals(targetUserId)) {
            throw new ForbiddenException("Cannot change the owner's role");
        }

        member.setRole(newRole);
        memberRepository.save(member);

        auditService.record(
            workspaceId,
            requestingUserId,
            "MEMBER_ROLE_UPDATED",
            "USER",
            targetUserId.toString(),
            "{\"newRole\":\"" + newRole.name() + "\"}",
            "127.0.0.1",
            "Web Client"
        );
    }

    public void assertMember(UUID workspaceId, UUID userId) {
        if (!memberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId)) {
            throw new ForbiddenException("Access denied: You are not a member of this workspace");
        }
    }

    public void assertAdminOrOwner(UUID workspaceId, UUID userId) {
        WorkspaceRole role = getMemberRole(workspaceId, userId);
        if (role != WorkspaceRole.OWNER && role != WorkspaceRole.ADMIN) {
            throw new ForbiddenException("Operation requires ADMIN or OWNER role in this workspace");
        }
    }

    public WorkspaceRole getMemberRole(UUID workspaceId, UUID userId) {
        return memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
            .map(WorkspaceMember::getRole)
            .orElseThrow(() -> new ForbiddenException("You are not a member of this workspace"));
    }
}
