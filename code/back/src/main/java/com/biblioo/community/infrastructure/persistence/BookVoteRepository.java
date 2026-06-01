package com.biblioo.community.infrastructure.persistence;

import com.biblioo.community.domain.model.BookVote;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookVoteRepository extends JpaRepository<BookVote, Long> {

  Optional<BookVote> findByVotingIdAndUserId(Long votingId, Long userId);

  boolean existsByVotingIdAndUserId(Long votingId, Long userId);
}
