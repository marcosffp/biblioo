package com.biblioo.feed.infrastructure.persistence;

import com.biblioo.feed.domain.model.Commentable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentableRepository extends JpaRepository<Commentable, Long> {

  @Query("SELECT COUNT(c) > 0 FROM Commentable c WHERE c.id = :id AND c.isDeleted = false")
  boolean existsActiveById(@Param("id") Long id);

  @Modifying
  @Query("UPDATE Commentable c SET c.commentCount = c.commentCount + 1 WHERE c.id = :id")
  int incrementCommentCount(@Param("id") Long id);

  @Modifying
  @Query(
      "UPDATE Commentable c SET c.commentCount = c.commentCount - 1 WHERE c.id = :id AND c.commentCount > 0")
  int decrementCommentCount(@Param("id") Long id);
}
