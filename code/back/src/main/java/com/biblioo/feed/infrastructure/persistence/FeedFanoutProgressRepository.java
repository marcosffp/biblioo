package com.biblioo.feed.infrastructure.persistence;

import com.biblioo.feed.domain.model.FeedFanoutProgress;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedFanoutProgressRepository extends JpaRepository<FeedFanoutProgress, Long> {

  Optional<FeedFanoutProgress> findByEventId(String eventId);
}
