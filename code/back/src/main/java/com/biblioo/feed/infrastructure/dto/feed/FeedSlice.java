package com.biblioo.feed.infrastructure.dto.feed;

import java.util.List;

import com.biblioo.feed.domain.model.FeedItem;

public record FeedSlice(List<FeedItem> items, String nextCursor, boolean hasMore) {}
