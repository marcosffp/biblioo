package com.biblioo.notification.infrastructure.persistence;

import com.biblioo.notification.domain.model.DeviceToken;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface DeviceTokenRepository extends JpaRepository<DeviceToken, Long> {

  @Query("SELECT d.token FROM DeviceToken d WHERE d.userId = :userId")
  List<String> findTokensByUserId(@Param("userId") Long userId);

  boolean existsByUserIdAndToken(Long userId, String token);

  @Modifying
  @Transactional
  @Query("DELETE FROM DeviceToken d WHERE d.userId = :userId AND d.token = :token")
  void deleteByUserIdAndToken(@Param("userId") Long userId, @Param("token") String token);
}
