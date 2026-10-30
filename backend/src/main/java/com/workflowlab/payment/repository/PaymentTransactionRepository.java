package com.workflowlab.payment.repository;

import com.workflowlab.payment.model.PaymentTransaction;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, UUID> {
    Optional<PaymentTransaction> findByWorkspaceIdAndIdempotencyKey(UUID workspaceId, String idempotencyKey);
    Optional<PaymentTransaction> findByWorkspaceIdAndTransactionReference(UUID workspaceId, String reference);
    Optional<PaymentTransaction> findByIdAndWorkspaceId(UUID id, UUID workspaceId);
    Page<PaymentTransaction> findByWorkspaceIdOrderByCreatedAtDesc(UUID workspaceId, Pageable pageable);
    long countByWorkspaceId(UUID workspaceId);
}
