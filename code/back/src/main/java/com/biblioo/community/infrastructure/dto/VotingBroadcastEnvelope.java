package com.biblioo.community.infrastructure.dto;

public record VotingBroadcastEnvelope(String destination, VotingEventPayload payload) {}
