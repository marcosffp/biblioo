package com.biblioo.community.infrastructure.persistence;

import com.biblioo.community.domain.model.BookVotingOption;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookVotingOptionRepository extends JpaRepository<BookVotingOption, Long> {

  List<BookVotingOption> findByVotingId(Long votingId);

  @Query(
      value = "SELECT * FROM community_voting_options WHERE id = :id FOR UPDATE",
      nativeQuery = true)
  Optional<BookVotingOption> findByIdForUpdate(@Param("id") Long id);
}
