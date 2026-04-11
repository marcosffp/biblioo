package com.biblioo.feed.infrastructure.persistence;

import com.biblioo.feed.domain.model.Comment;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

  Optional<Comment> findByIdAndIsDeletedFalse(Long id);

  Page<Comment> findByParentIdAndIsDeletedFalseOrderByCreatedAtDesc(
      Long parentId, Pageable pageable);

  @Modifying
  @Query(
      "UPDATE Comment c SET c.isDeleted = true"
          + " WHERE c.id = :commentId AND c.userId = :userId AND c.isDeleted = false")
  int softDeleteComment(@Param("commentId") Long commentId, @Param("userId") Long userId);

  @Modifying
  @Query(
      "UPDATE Comment c SET c.isDeleted = true WHERE c.parentId = :parentId AND c.isDeleted = false")
  int softDeleteAllByParentId(@Param("parentId") Long parentId);

  @Modifying
  @Query("DELETE FROM Comment c WHERE c.parentId = :parentId")
  void deleteAllByParentId(@Param("parentId") Long parentId);
}
