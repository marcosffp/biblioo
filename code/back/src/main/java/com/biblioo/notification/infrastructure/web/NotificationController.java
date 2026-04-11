package com.biblioo.notification.infrastructure.web;

import com.biblioo.notification.domain.model.DeviceToken;
import com.biblioo.notification.domain.port.in.NotificationUseCase;
import com.biblioo.notification.infrastructure.delivery.SseNotificationAdapter;
import com.biblioo.notification.infrastructure.dto.NotificationResponse;
import com.biblioo.notification.infrastructure.dto.RegisterDeviceTokenRequest;
import com.biblioo.notification.infrastructure.persistence.DeviceTokenRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notificações em tempo real e histórico")
public class NotificationController {

  private final NotificationUseCase notificationUseCase;
  private final SseNotificationAdapter sseAdapter;
  private final DeviceTokenRepository deviceTokenRepo;

  @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  @Operation(summary = "Abre stream SSE para receber notificações em tempo real (web)")
  public SseEmitter stream(@AuthenticationPrincipal UserDetails principal) {
    return sseAdapter.subscribe(currentUserId(principal));
  }

  @GetMapping
  @Operation(summary = "Lista o histórico de notificações do usuário autenticado")
  public ResponseEntity<List<NotificationResponse>> getNotifications(
      @Parameter(example = "0") @RequestParam(defaultValue = "0") int page,
      @Parameter(example = "20") @RequestParam(defaultValue = "20") int size,
      @AuthenticationPrincipal UserDetails principal) {
    List<NotificationResponse> list =
        notificationUseCase.getNotifications(currentUserId(principal), page, size).stream()
            .map(NotificationResponse::from)
            .toList();
    return ResponseEntity.ok(list);
  }

  @GetMapping("/unread-count")
  @Operation(summary = "Retorna a quantidade de notificações não lidas (badge)")
  public ResponseEntity<Map<String, Long>> unreadCount(
      @AuthenticationPrincipal UserDetails principal) {
    long count = notificationUseCase.countUnread(currentUserId(principal));
    return ResponseEntity.ok(Map.of("count", count));
  }

  @PutMapping("/{id}/read")
  @Operation(summary = "Marca uma notificação como lida")
  public ResponseEntity<Void> markAsRead(
      @PathVariable String id, @AuthenticationPrincipal UserDetails principal) {
    notificationUseCase.markAsRead(currentUserId(principal), id);
    return ResponseEntity.noContent().build();
  }

  @PutMapping("/read-all")
  @Operation(summary = "Marca todas as notificações como lidas")
  public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal UserDetails principal) {
    notificationUseCase.markAllAsRead(currentUserId(principal));
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/device-token")
  @Operation(summary = "Registra o device token FCM para push notifications (mobile)")
  public ResponseEntity<Void> registerDeviceToken(
      @Valid @RequestBody RegisterDeviceTokenRequest request,
      @AuthenticationPrincipal UserDetails principal) {
    Long userId = currentUserId(principal);
    if (!deviceTokenRepo.existsByUserIdAndToken(userId, request.token())) {
      deviceTokenRepo.save(
          DeviceToken.builder().userId(userId).token(request.token()).build());
    }
    return ResponseEntity.noContent().build();
  }

  @DeleteMapping("/device-token")
  @Operation(summary = "Remove o device token FCM (logout do mobile)")
  public ResponseEntity<Void> removeDeviceToken(
      @Valid @RequestBody RegisterDeviceTokenRequest request,
      @AuthenticationPrincipal UserDetails principal) {
    deviceTokenRepo.deleteByUserIdAndToken(currentUserId(principal), request.token());
    return ResponseEntity.noContent().build();
  }

  private Long currentUserId(UserDetails principal) {
    return Long.parseLong(principal.getUsername());
  }
}
