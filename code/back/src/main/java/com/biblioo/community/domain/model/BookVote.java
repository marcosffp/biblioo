package com.biblioo.community.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(
    name = "community_votes",
    indexes = {@Index(name = "idx_cvote_option", columnList = "option_id")},
    uniqueConstraints = {
      @UniqueConstraint(name = "uk_cv_user_voting", columnNames = {"voting_id", "user_id"})
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookVote {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "voting_id", nullable = false)
  private Long votingId;

  @Column(name = "option_id", nullable = false)
  private Long optionId;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Column(name = "voted_at", nullable = false)
  private LocalDateTime votedAt;
}
