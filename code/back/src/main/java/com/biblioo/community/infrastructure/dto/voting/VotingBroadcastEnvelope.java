package com.biblioo.community.infrastructure.dto.voting;

public record VotingBroadcastEnvelope(String destination, VotingEventPayload payload) {}
