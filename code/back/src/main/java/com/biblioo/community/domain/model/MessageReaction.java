package com.biblioo.community.domain.model;

import com.biblioo.community.domain.model.enumeration.ReactionType;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(
    name = "community_message_reactions",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uk_reaction_msg_user_type",
            columnNames = {"message_id", "user_id", "reaction_type"}),
    indexes = {
      @Index(name = "idx_reaction_message", columnList = "message_id"),
      @Index(name = "idx_reaction_user", columnList = "user_id")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageReaction {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "message_id", nullable = false)
  private Long messageId;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Enumerated(EnumType.STRING)
  @Column(name = "reaction_type", nullable = false, length = 20)
  private ReactionType reactionType;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    this.createdAt = LocalDateTime.now();
  }
}
