package com.biblioo.user.infrastructure.dto;

import java.util.List;

public record FollowPageResponse(
    List<UserSummaryResponse> users, int page, int size, boolean hasMore) {}
