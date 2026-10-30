package com.workflowlab.auth.service;

import com.workflowlab.audit.service.AuditService;
import com.workflowlab.auth.dto.*;
import com.workflowlab.auth.model.RefreshToken;
import com.workflowlab.auth.model.User;
import com.workflowlab.auth.repository.RefreshTokenRepository;
import com.workflowlab.auth.repository.UserRepository;
import com.workflowlab.common.exception.BadRequestException;
import com.workflowlab.common.exception.ConflictException;
import com.workflowlab.workspace.model.Workspace;
import com.workflowlab.workspace.model.WorkspaceMember;
import com.workflowlab.workspace.model.WorkspaceRole;
import com.workflowlab.workspace.repository.WorkspaceMemberRepository;
import com.workflowlab.workspace.repository.WorkspaceRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCKOUT_MINUTES = 15;

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;
    private final EmailNotificationService emailService;
    private final AuditService auditService;

    public AuthService(
        UserRepository userRepository,
        RefreshTokenRepository refreshTokenRepository,
        WorkspaceRepository workspaceRepository,
        WorkspaceMemberRepository workspaceMemberRepository,
        TokenService tokenService,
        PasswordEncoder passwordEncoder,
        EmailNotificationService emailService,
        AuditService auditService
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.auditService = auditService;
    }

    @Transactional
    public UserDto register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email().trim())) {
            throw new ConflictException("An account with this email address already exists");
        }

        String encodedPassword = passwordEncoder.encode(request.password());
        User user = new User(request.email().trim().toLowerCase(), encodedPassword, request.fullName().trim());

        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(Instant.now().plus(24, ChronoUnit.HOURS));

        User savedUser = userRepository.save(user);

        // Provision default workspace for the user
        String wsName = request.fullName().trim() + "'s Workspace";
        String wsSlug = "ws-" + UUID.randomUUID().toString().substring(0, 8);
        Workspace workspace = new Workspace(wsName, wsSlug, savedUser.getId());
        Workspace savedWorkspace = workspaceRepository.save(workspace);

        WorkspaceMember member = new WorkspaceMember(savedWorkspace.getId(), savedUser.getId(), WorkspaceRole.OWNER);
        workspaceMemberRepository.save(member);

        // Send verification email
        emailService.sendVerificationEmail(savedUser.getEmail(), savedUser.getFullName(), verificationToken);

        return UserDto.from(savedUser);
    }

    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
            .orElseThrow(() -> new BadRequestException("Invalid or expired verification token"));

        if (user.getVerificationTokenExpiry() != null && user.getVerificationTokenExpiry().isBefore(Instant.now())) {
            throw new BadRequestException("Verification token has expired. Please request a new one.");
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);
    }

    @Transactional
    public LoginResult login(LoginRequest request, String ipAddress, String userAgent) {
        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!user.isActive()) {
            throw new BadCredentialsException("Account is disabled. Please contact support.");
        }

        if (user.isLocked()) {
            long remainingMinutes = ChronoUnit.MINUTES.between(Instant.now(), user.getLockedUntil()) + 1;
            throw new LockedException("Account is temporarily locked due to too many failed attempts. Try again in " + remainingMinutes + " minutes.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            handleFailedLogin(user);
            throw new BadCredentialsException("Invalid email or password");
        }

        // Reset failed attempts on success
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        String accessToken = tokenService.generateAccessToken(user.getId(), user.getEmail());
        String rawRefreshToken = tokenService.generateRefreshToken();
        String tokenHash = tokenService.hashToken(rawRefreshToken);

        Instant refreshExpiry = Instant.now().plusMillis(tokenService.getRefreshExpirationMs());
        RefreshToken rt = new RefreshToken(user.getId(), tokenHash, refreshExpiry, ipAddress, userAgent);
        refreshTokenRepository.save(rt);

        UUID userWsId = workspaceMemberRepository.findByUserId(user.getId()).stream()
            .map(WorkspaceMember::getWorkspaceId).findFirst().orElse(null);
        auditService.record(
            userWsId,
            user.getId(),
            "USER_LOGIN",
            "USER",
            user.getId().toString(),
            "{\"email\":\"" + user.getEmail() + "\",\"authMethod\":\"PASSWORD\"}",
            ipAddress != null ? ipAddress : "127.0.0.1",
            userAgent != null ? userAgent : "Web Browser"
        );

        AuthResponse authResponse = AuthResponse.of(accessToken, tokenService.getJwtExpirationMs(), UserDto.from(user));
        return new LoginResult(authResponse, rawRefreshToken, refreshExpiry);
    }

    private void handleFailedLogin(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);
        if (attempts >= MAX_FAILED_ATTEMPTS) {
            user.setLockedUntil(Instant.now().plus(LOCKOUT_MINUTES, ChronoUnit.MINUTES));
            log.warn("User {} locked out for {} minutes after {} failed attempts", user.getEmail(), LOCKOUT_MINUTES, attempts);
        }
        userRepository.save(user);
    }

    @Transactional
    public LoginResult refreshAccessToken(String rawRefreshToken, String ipAddress, String userAgent) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new BadRequestException("Missing refresh token");
        }

        String tokenHash = tokenService.hashToken(rawRefreshToken);
        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
            .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        if (storedToken.isRevoked() || storedToken.isExpired()) {
            throw new BadCredentialsException("Refresh token is expired or has been revoked");
        }

        // Token rotation: revoke previous token
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        User user = userRepository.findById(storedToken.getUserId())
            .orElseThrow(() -> new BadCredentialsException("User not found"));

        if (!user.isActive()) {
            throw new BadCredentialsException("Account is disabled");
        }

        String newAccessToken = tokenService.generateAccessToken(user.getId(), user.getEmail());
        String newRawRefreshToken = tokenService.generateRefreshToken();
        String newTokenHash = tokenService.hashToken(newRawRefreshToken);

        Instant refreshExpiry = Instant.now().plusMillis(tokenService.getRefreshExpirationMs());
        RefreshToken newRt = new RefreshToken(user.getId(), newTokenHash, refreshExpiry, ipAddress, userAgent);
        refreshTokenRepository.save(newRt);

        AuthResponse authResponse = AuthResponse.of(newAccessToken, tokenService.getJwtExpirationMs(), UserDto.from(user));
        return new LoginResult(authResponse, newRawRefreshToken, refreshExpiry);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            String tokenHash = tokenService.hashToken(rawRefreshToken);
            refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(rt -> {
                rt.setRevoked(true);
                refreshTokenRepository.save(rt);
            });
        }
    }

    @Transactional
    public void requestPasswordReset(String email) {
        // Secure implementation: do not reveal whether user exists
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String resetToken = UUID.randomUUID().toString();
            user.setResetPasswordToken(resetToken);
            user.setResetPasswordTokenExpiry(Instant.now().plus(1, ChronoUnit.HOURS));
            userRepository.save(user);

            emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetToken);
        }
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetPasswordToken(token)
            .orElseThrow(() -> new BadRequestException("Invalid or expired password reset token"));

        if (user.getResetPasswordTokenExpiry() != null && user.getResetPasswordTokenExpiry().isBefore(Instant.now())) {
            throw new BadRequestException("Password reset token has expired. Please request a new one.");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        // Invalidate all active sessions for security
        refreshTokenRepository.revokeAllUserTokens(user.getId());
    }

    public record LoginResult(AuthResponse authResponse, String rawRefreshToken, Instant refreshExpiry) {}
}
