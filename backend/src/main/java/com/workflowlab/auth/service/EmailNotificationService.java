package com.workflowlab.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    private final JavaMailSender mailSender;
    private final String fromEmail;
    private final String frontendUrl;

    public EmailNotificationService(
        JavaMailSender mailSender,
        @Value("${app.mail.from:noreply@workflowlab.dev}") String fromEmail,
        @Value("${app.cors.allowed-origins:http://localhost:4200}") String allowedOrigins
    ) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
        this.frontendUrl = allowedOrigins.split(",")[0].trim();
    }

    @Async
    public void sendVerificationEmail(String toEmail, String fullName, String token) {
        String verifyUrl = frontendUrl + "/verify-email?token=" + token;
        log.info("Preparing verification email for: {} [Token: {}]", toEmail, token);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Verify your Workflow Reliability Lab account");
            message.setText("Hello " + fullName + ",\n\n" +
                "Welcome to Workflow Reliability Lab! Please verify your email by clicking the link below:\n\n" +
                verifyUrl + "\n\n" +
                "This link will expire in 24 hours.\n\n" +
                "If you did not request this account, please ignore this email.\n\n" +
                "— The Workflow Reliability Lab Team");

            mailSender.send(message);
            log.info("Verification email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.warn("Could not dispatch email via SMTP (MailHog may be offline). Local verification link: {}", verifyUrl);
        }
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String fullName, String token) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        log.info("Preparing password reset email for: {} [Token: {}]", toEmail, token);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Reset your Workflow Reliability Lab password");
            message.setText("Hello " + fullName + ",\n\n" +
                "We received a request to reset your password. Click the link below to set a new password:\n\n" +
                resetUrl + "\n\n" +
                "This link will expire in 1 hour.\n\n" +
                "If you did not request this, your account remains secure and no action is required.\n\n" +
                "— The Workflow Reliability Lab Team");

            mailSender.send(message);
            log.info("Password reset email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.warn("Could not dispatch email via SMTP (MailHog may be offline). Local reset link: {}", resetUrl);
        }
    }
}
