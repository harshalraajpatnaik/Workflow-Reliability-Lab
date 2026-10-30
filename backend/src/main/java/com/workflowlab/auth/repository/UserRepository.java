package com.workflowlab.auth.repository;

import com.workflowlab.auth.model.User;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByVerificationToken(String verificationToken);
    Optional<User> findByResetPasswordToken(String resetPasswordToken);
    boolean existsByEmailIgnoreCase(String email);
}
