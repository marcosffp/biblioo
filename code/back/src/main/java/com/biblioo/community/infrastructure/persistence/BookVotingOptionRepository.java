package com.biblioo.community.infrastructure.persistence;

import com.biblioo.community.domain.model.BookVotingOption;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookVotingOptionRepository extends JpaRepository<BookVotingOption, Long> {

  List<BookVotingOption> findByVotingId(Long votingId);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("SELECT o FROM BookVotingOption o WHERE o.id = :id")
  Optional<BookVotingOption> findByIdForUpdate(@Param("id") Long id);
}
