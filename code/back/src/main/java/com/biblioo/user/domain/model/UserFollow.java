package com.biblioo.user.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "user_follows",
    indexes = {
      @Index(name = "idx_user_follows_follower", columnList = "follower_id"),
      @Index(name = "idx_user_follows_followed", columnList = "followed_id")
    })
@IdClass(UserFollowId.class)
@Getter
@Setter
@NoArgsConstructor
public class UserFollow {

  @Id
  @Column(name = "follower_id")
  private Long followerId;

  @Id
  @Column(name = "followed_id")
  private Long followedId;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  public UserFollow(Long followerId, Long followedId) {
    this.followerId = followerId;
    this.followedId = followedId;
  }

  @PrePersist
  protected void onCreate() {
    this.createdAt = LocalDateTime.now();
  }
}
