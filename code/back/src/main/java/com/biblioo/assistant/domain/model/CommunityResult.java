package com.biblioo.assistant.domain.model;

public record CommunityResult(
    Long id, String name, String description, String type, Integer memberCount) {}
