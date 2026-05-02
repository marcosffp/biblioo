package com.biblioo.user.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "password_reset_tokens",
    indexes = {
      @Index(name = "idx_prt_token", columnList = "token"),
      @Index(name = "idx_prt_user_id", columnList = "user_id")
    })
@Getter
@Setter
@NoArgsConstructor
public class PasswordResetToken {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 64)
  private String token;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Column(name = "expires_at", nullable = false)
  private LocalDateTime expiresAt;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(nullable = false)
  private boolean used = false;

  @PrePersist
  protected void onCreate() {
    this.createdAt = LocalDateTime.now();
  }

  public boolean isExpired() {
    return LocalDateTime.now().isAfter(expiresAt);
  }

  public boolean isValid() {
    return !used && !isExpired();
  }
}
