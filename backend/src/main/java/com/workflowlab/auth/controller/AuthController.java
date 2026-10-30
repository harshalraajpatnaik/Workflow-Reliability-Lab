package com.workflowlab.auth.controller;

import com.workflowlab.auth.dto.*;
import com.workflowlab.auth.dto.AuthRequests.ForgotPasswordRequest;
import com.workflowlab.auth.dto.AuthRequests.ResetPasswordRequest;
import com.workflowlab.auth.dto.AuthRequests.VerifyEmailRequest;
import com.workflowlab.auth.security.UserPrincipal;
import com.workflowlab.auth.service.AuthService;
import com.workflowlab.auth.service.AuthService.LoginResult;
import com.workflowlab.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.time.Duration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "User registration, authentication, token rotation, and password management")
public class AuthController {

    private static final String REFRESH_COOKIE_NAME = "wrl_refresh_token";
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user account and provision default workspace")
    public ResponseEntity<ApiResponse<UserDto>> register(@Valid @RequestBody RegisterRequest request) {
        UserDto user = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Registration successful. Please check your email to verify your account.", user));
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Verify account email with verification token")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request.token());
        return ResponseEntity.ok(ApiResponse.ok("Email successfully verified. You may now log in.", null));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
        @Valid @RequestBody LoginRequest request,
        HttpServletRequest httpRequest,
        HttpServletResponse httpResponse
    ) {
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        LoginResult result = authService.login(request, ipAddress, userAgent);
        setRefreshTokenCookie(httpResponse, result.rawRefreshToken(), Duration.between(java.time.Instant.now(), result.refreshExpiry()));

        return ResponseEntity.ok(ApiResponse.ok("Login successful", result.authResponse()));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using HTTP-only refresh token cookie")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
        HttpServletRequest httpRequest,
        HttpServletResponse httpResponse,
        @RequestBody(required = false) RefreshTokenRequest bodyRequest
    ) {
        String rawToken = extractRefreshToken(httpRequest, bodyRequest);
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        LoginResult result = authService.refreshAccessToken(rawToken, ipAddress, userAgent);
        setRefreshTokenCookie(httpResponse, result.rawRefreshToken(), Duration.between(java.time.Instant.now(), result.refreshExpiry()));

        return ResponseEntity.ok(ApiResponse.ok("Token refreshed", result.authResponse()));
    }

    @PostMapping("/logout")
    @Operation(summary = "Log out user and invalidate refresh token")
    public ResponseEntity<ApiResponse<Void>> logout(
        HttpServletRequest httpRequest,
        HttpServletResponse httpResponse,
        @RequestBody(required = false) RefreshTokenRequest bodyRequest
    ) {
        String rawToken = extractRefreshToken(httpRequest, bodyRequest);
        authService.logout(rawToken);

        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE_NAME, "")
            .httpOnly(true)
            .secure(false)
            .path("/")
            .maxAge(0)
            .sameSite("Lax")
            .build();
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully", null));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset email")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.requestPasswordReset(request.email());
        return ResponseEntity.ok(ApiResponse.ok("If an account with that email exists, password reset instructions have been sent.", null));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using reset token")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.ok(ApiResponse.ok("Password successfully reset. You may now log in with your new password.", null));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Not authenticated", "UNAUTHORIZED"));
        }
        UserDto userDto = new UserDto(
            principal.getId(),
            principal.getUsername(),
            principal.getFullName(),
            true,
            null
        );
        return ResponseEntity.ok(ApiResponse.ok(userDto));
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String token, Duration duration) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE_NAME, token)
            .httpOnly(true)
            .secure(false) // local dev; prod proxy terminates SSL
            .path("/")
            .maxAge(duration)
            .sameSite("Lax")
            .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String extractRefreshToken(HttpServletRequest request, RefreshTokenRequest bodyRequest) {
        if (bodyRequest != null && bodyRequest.refreshToken() != null && !bodyRequest.refreshToken().isBlank()) {
            return bodyRequest.refreshToken();
        }
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (REFRESH_COOKIE_NAME.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    public record RefreshTokenRequest(String refreshToken) {}
}
