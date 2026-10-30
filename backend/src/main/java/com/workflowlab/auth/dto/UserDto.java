package com.workflowlab.auth.dto;

import com.workflowlab.auth.model.User;
import java.time.Instant;
import java.util.UUID;

public record UserDto(
    UUID id,
    String email,
    String fullName,
    boolean emailVerified,
    Instant createdAt
) {
    public static UserDto from(User user) {
        return new UserDto(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.isEmailVerified(),
            user.getCreatedAt()
        );
    }
}
