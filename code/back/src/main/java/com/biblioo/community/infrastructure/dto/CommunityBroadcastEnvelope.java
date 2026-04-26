package com.biblioo.community.infrastructure.dto;

/**
 * Envelope AMQP para entrega cross-instance de broadcasts WebSocket. Cada instância publica para
 * o FanoutExchange e consome das outras instâncias, entregando localmente via SimpleBroker.
 */
public record CommunityBroadcastEnvelope(String destination, MessageEventPayload payload) {}
