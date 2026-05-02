package com.biblioo.infrastructure.messaging.adapter;

import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
import com.biblioo.infrastructure.messaging.service.OutboxEventService;
import com.biblioo.user.domain.port.out.PasswordResetEmailPort;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RabbitMQPasswordResetEmailAdapter implements PasswordResetEmailPort {

  private final OutboxEventService outboxEventService;

  @Override
  public void sendPasswordResetEmail(String toEmail, String username, String resetLink) {
            System.out.println("Scheduling password reset email to " + toEmail + " with reset link: " + resetLink);
    Map<String, Object> payload = new HashMap<>();
    payload.put("toEmail", toEmail);
    payload.put("username", username);
    payload.put("resetLink", resetLink);

    outboxEventService.saveAndSchedulePublish(
        RabbitMQConfig.EVENT_PASSWORD_RESET_REQUESTED,
        "USER",
        toEmail,
        RabbitMQConfig.EMAIL_PASSWORD_RESET_ROUTING_KEY,
        payload);
  }

  @Override
  public void sendPasswordChangedConfirmation(String toEmail, String username) {
    Map<String, Object> payload = new HashMap<>();
    payload.put("toEmail", toEmail);
    payload.put("username", username);

    outboxEventService.saveAndSchedulePublish(
        RabbitMQConfig.EVENT_PASSWORD_CHANGED,
        "USER",
        toEmail,
        RabbitMQConfig.EMAIL_PASSWORD_CHANGED_ROUTING_KEY,
        payload);
  }
}
