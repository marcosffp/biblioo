package com.biblioo.notification.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "device_tokens",
    indexes = {@Index(name = "idx_device_tokens_user", columnList = "user_id")},
    uniqueConstraints = {@UniqueConstraint(columnNames = {"user_id", "token"})})
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceToken {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Column(nullable = false, length = 512)
  private String token;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  void onCreate() {
    this.createdAt = LocalDateTime.now();
  }
}
