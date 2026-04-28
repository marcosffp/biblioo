package com.biblioo.user.domain.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;
import jakarta.persistence.*;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "users",
    indexes = {
      @Index(name = "idx_users_email", columnList = "email"),
      @Index(name = "idx_users_username", columnList = "username")
    })
@Getter
@Setter
@NoArgsConstructor
public class User implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 30)
  private String username;

  @Column(nullable = false, unique = true, length = 255)
  private String email;

  @JsonProperty(access = Access.WRITE_ONLY)
  @Column(name = "password_hash")
  private String passwordHash;

  @Column(name = "google_id", unique = true, length = 255)
  private String googleId;

  @Column(length = 500)
  private String bio;

  @Column(name = "avatar_url", length = 1000)
  private String avatarUrl;

  @Column(name = "banner_url", length = 1000)
  private String bannerUrl;

  @Column(name = "is_private", nullable = false)
  private boolean isPrivate = false;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}
