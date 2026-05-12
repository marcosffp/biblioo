package com.biblioo.community.infrastructure.persistence;

import com.biblioo.community.domain.model.MessageReaction;
import com.biblioo.community.domain.model.enumeration.ReactionType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MessageReactionRepository extends JpaRepository<MessageReaction, Long> {

  @Modifying
  @Query(
      "DELETE FROM MessageReaction r "
          + "WHERE r.messageId = :messageId AND r.userId = :userId AND r.reactionType = :type")
  void deleteByMessageIdAndUserIdAndReactionType(
      @Param("messageId") Long messageId,
      @Param("userId") Long userId,
      @Param("type") ReactionType type);
}
