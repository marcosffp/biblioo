package com.biblioo.feed.domain.model;

import java.util.List;

/**
 * Resultado paginado do feed via cursor. {@code nextCursor} é nulo quando não há mais itens.
 */
public record FeedSlice(List<FeedItem> items, String nextCursor, boolean hasMore) {}
