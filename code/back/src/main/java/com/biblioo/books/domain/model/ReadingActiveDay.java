package com.biblioo.books.domain.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "reading_active_days",
    uniqueConstraints = {
      @UniqueConstraint(
          name = "uk_user_book_date",
          columnNames = {"user_id", "book_id", "active_date"})
    })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReadingActiveDay {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Column(name = "book_id", nullable = false)
  private Long bookId;

  @Column(name = "active_date", nullable = false)
  private LocalDate activeDate;
}
