package com.workflowlab.payment.repository;

import com.workflowlab.payment.model.PaymentWebhook;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentWebhookRepository extends JpaRepository<PaymentWebhook, UUID> {
    Optional<PaymentWebhook> findByWorkspaceIdAndProviderEventId(UUID workspaceId, String providerEventId);
    List<PaymentWebhook> findByTransactionIdOrderByReceivedAtAsc(UUID transactionId);
    long countByWorkspaceId(UUID workspaceId);
}
