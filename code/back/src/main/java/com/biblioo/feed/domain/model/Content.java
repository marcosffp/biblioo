package com.biblioo.feed.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Data
@NoArgsConstructor
@SuperBuilder
@MappedSuperclass
public abstract class Content {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Column(length = 2000)
  private String text;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "content_images", joinColumns = @JoinColumn(name = "content_id"))
  @Column(name = "image_url")
  @Builder.Default
  private List<String> images = new ArrayList<>();

  @Column(name = "gif_url")
  private String gifUrl;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "content_tags", joinColumns = @JoinColumn(name = "content_id"))
  @Column(name = "tag")
  @Builder.Default
  private List<String> tags = new ArrayList<>();

  @Column(name = "has_spoiler", nullable = false)
  @Builder.Default
  private Boolean hasSpoiler = false;

  @Column(name = "is_deleted", nullable = false)
  @Builder.Default
  private Boolean isDeleted = false;

  @Column(name = "like_count", nullable = false)
  @Builder.Default
  private Integer likeCount = 0;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;
}
