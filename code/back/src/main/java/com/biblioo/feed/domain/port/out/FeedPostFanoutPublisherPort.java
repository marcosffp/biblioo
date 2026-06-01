package com.biblioo.feed.domain.port.out;

public interface FeedPostFanoutPublisherPort {

  void publishPostCreated(Long postId, Long authorId, long createdAtEpochMilli);
}
