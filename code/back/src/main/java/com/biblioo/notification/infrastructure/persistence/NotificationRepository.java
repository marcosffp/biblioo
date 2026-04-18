package com.biblioo.notification.infrastructure.persistence;

import com.biblioo.notification.domain.model.Notification;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface NotificationRepository extends JpaRepository<Notification, String> {

  @Query(
      "SELECT n FROM Notification n WHERE n.recipientId = :userId" + " ORDER BY n.createdAt DESC")
  List<Notification> findByRecipientId(@Param("userId") Long userId, PageRequest pageable);

  @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipientId = :userId AND n.readAt IS NULL")
  long countUnreadByRecipientId(@Param("userId") Long userId);

  @Modifying
  @Transactional
  @Query("UPDATE Notification n SET n.readAt = :now WHERE n.id = :id AND n.recipientId = :userId")
  void markAsRead(
      @Param("id") String id, @Param("userId") Long userId, @Param("now") LocalDateTime now);

  @Modifying
  @Transactional
  @Query(
      "UPDATE Notification n SET n.readAt = :now"
          + " WHERE n.recipientId = :userId AND n.readAt IS NULL")
  void markAllAsRead(@Param("userId") Long userId, @Param("now") LocalDateTime now);
}
