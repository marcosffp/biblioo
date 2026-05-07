package com.biblioo.community.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "community_voting_options",
    indexes = {@Index(name = "idx_cvo_voting", columnList = "voting_id")})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookVotingOption {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "voting_id", nullable = false)
  private Long votingId;

  @Column(name = "book_id", nullable = false)
  private Long bookId;

  @Column(name = "book_title", nullable = false, length = 500)
  private String bookTitle;

  @Column(name = "book_cover_url", length = 1000)
  private String bookCoverUrl;

  @Column(name = "vote_count", nullable = false)
  @Builder.Default
  private Integer voteCount = 0;
}
