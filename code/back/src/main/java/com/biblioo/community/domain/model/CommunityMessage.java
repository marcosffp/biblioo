package com.biblioo.community.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.*;

@Entity
@Table(
    name = "community_messages",
    indexes = {
      @Index(name = "idx_cmsg_community_id", columnList = "community_id, id DESC"),
      @Index(name = "idx_cmsg_parent", columnList = "parent_message_id"),
      @Index(name = "idx_cmsg_author", columnList = "author_id")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityMessage {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "community_id", nullable = false)
  private Long communityId;

  @Column(name = "author_id", nullable = false)
  private Long authorId;

  @Column(nullable = true, length = 4000)
  private String content;

  @Column(name = "parent_message_id")
  private Long parentMessageId;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "community_message_tags", joinColumns = @JoinColumn(name = "message_id"))
  @Column(name = "tag", length = 50)
  @Builder.Default
  private Set<String> tags = new HashSet<>();

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(
      name = "community_message_images",
      joinColumns = @JoinColumn(name = "message_id"))
  @Column(name = "image_url", length = 2048)
  @Builder.Default
  private List<String> images = new ArrayList<>();

  @Column(name = "gif_url", length = 2048)
  private String gifUrl;

  @Column(name = "has_spoiler", nullable = false)
  @Builder.Default
  private boolean hasSpoiler = false;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  @Builder.Default
  private MessageType type = MessageType.USER;

  @Column(name = "client_message_id", length = 36)
  private String clientMessageId;

  @Column(name = "heart_count", nullable = false)
  @Builder.Default
  private int heartCount = 0;

  @Column(name = "is_deleted", nullable = false)
  @Builder.Default
  private boolean deleted = false;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "edited_at")
  private LocalDateTime editedAt;

  @Version private Long version;

  @PrePersist
  protected void onCreate() {
    this.createdAt = LocalDateTime.now();
  }
}
