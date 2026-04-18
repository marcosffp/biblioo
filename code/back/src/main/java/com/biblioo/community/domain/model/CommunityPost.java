package com.biblioo.community.domain.model;

import com.biblioo.feed.domain.model.Commentable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.PrimaryKeyJoinColumn;
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
    name = "community_posts",
    indexes = {
      @Index(name = "idx_cp_community", columnList = "community_id"),
      @Index(name = "idx_cp_community_created", columnList = "community_id")
    })
@PrimaryKeyJoinColumn(name = "id")
public class CommunityPost extends Commentable {

  @Column(name = "community_id", nullable = false)
  private Long communityId;

  @Column(name = "page_ref")
  private Integer pageRef;
}
