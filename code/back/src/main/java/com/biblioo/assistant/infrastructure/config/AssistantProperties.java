package com.biblioo.assistant.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "assistant")
public record AssistantProperties(
    String model,
    double temperature,
    int maxOutputTokens,
    int maxInputChars,
    int maxHistoryTurns,
    int rateLimitPerMinutePerUser,
    int conversationTtlMinutes) {}
