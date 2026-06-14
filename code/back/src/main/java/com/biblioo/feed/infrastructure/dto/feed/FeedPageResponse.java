package com.biblioo.feed.infrastructure.dto.feed;

import java.util.List;

public record FeedPageResponse(List<FeedItemResponse> items, String nextCursor, boolean hasMore) {}
