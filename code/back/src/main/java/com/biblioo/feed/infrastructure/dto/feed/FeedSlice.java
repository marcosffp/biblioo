package com.biblioo.feed.infrastructure.dto.feed;

import com.biblioo.feed.domain.model.FeedItem;
import java.util.List;

public record FeedSlice(List<FeedItem> items, String nextCursor, boolean hasMore) {}
