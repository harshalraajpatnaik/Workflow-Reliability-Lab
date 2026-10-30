package com.workflowlab.integration.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workflowlab.common.exception.ResourceNotFoundException;
import com.workflowlab.common.util.EncryptionService;
import com.workflowlab.integration.dto.IntegrationDtos.*;
import com.workflowlab.integration.model.Integration;
import com.workflowlab.integration.repository.IntegrationRepository;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.time.Instant;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IntegrationService {

    private static final Logger log = LoggerFactory.getLogger(IntegrationService.class);

    private final IntegrationRepository integrationRepository;
    private final EncryptionService encryptionService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public IntegrationService(IntegrationRepository integrationRepository, EncryptionService encryptionService) {
        this.integrationRepository = integrationRepository;
        this.encryptionService = encryptionService;
    }

    @Transactional(readOnly = true)
    public List<IntegrationDto> getIntegrations(UUID workspaceId) {
        return integrationRepository.findByWorkspaceId(workspaceId)
            .stream().map(IntegrationDto::from).toList();
    }

    @Transactional
    public IntegrationDto configureRabbitMq(UUID workspaceId, ConfigureRabbitMqRequest request) {
        try {
            Map<String, Object> configMap = new HashMap<>();
            configMap.put("host", request.host().trim());
            configMap.put("port", request.port() > 0 ? request.port() : 5672);
            configMap.put("virtualHost", request.virtualHost() != null ? request.virtualHost().trim() : "/");
            configMap.put("username", request.username().trim());
            if (request.password() != null && !request.password().isBlank()) {
                configMap.put("password", request.password());
            }
            configMap.put("useTls", request.useTls());
            configMap.put("exchange", request.exchange());
            configMap.put("queue", request.queue());
            configMap.put("routingKey", request.routingKey());

            String json = objectMapper.writeValueAsString(configMap);
            String encrypted = encryptionService.encrypt(json);

            Optional<Integration> existing = integrationRepository.findByWorkspaceIdAndIntegrationType(workspaceId, "RABBITMQ");
            Integration integration;
            if (existing.isPresent()) {
                integration = existing.get();
                integration.setEncryptedConfig(encrypted);
                integration.setEnabled(request.enabled());
            } else {
                integration = new Integration(workspaceId, "RABBITMQ", "RabbitMQ Broker Integration", encrypted);
                integration.setEnabled(request.enabled());
            }

            Integration saved = integrationRepository.save(integration);
            return IntegrationDto.from(saved);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save RabbitMQ configuration", e);
        }
    }

    public TestConnectionResult testRabbitMqConnection(ConfigureRabbitMqRequest request) {
        long start = System.currentTimeMillis();
        int port = request.port() > 0 ? request.port() : 5672;
        String host = request.host().trim();

        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), 3000);
            long latency = System.currentTimeMillis() - start;
            return new TestConnectionResult(true, "Successfully connected to RabbitMQ broker at " + host + ":" + port, latency);
        } catch (Exception e) {
            long latency = System.currentTimeMillis() - start;
            return new TestConnectionResult(false, "Connection failed: " + e.getMessage(), latency);
        }
    }
}
