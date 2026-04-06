package com.biblioo.feed.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@SuperBuilder
@Entity
@Table(
    name = "comments",
    indexes = {
      @Index(name = "idx_comment_parent_id", columnList = "parent_id"),
      @Index(name = "idx_comment_user_id", columnList = "user_id"),
      @Index(name = "idx_comment_created_at", columnList = "created_at"),
      @Index(name = "idx_comment_parent_created", columnList = "parent_id, created_at DESC"),
      @Index(name = "idx_comment_is_deleted", columnList = "is_deleted")
    })
public class Comment extends Content {

  @Column(name = "parent_id", nullable = false)
  private Long parentId;
}
