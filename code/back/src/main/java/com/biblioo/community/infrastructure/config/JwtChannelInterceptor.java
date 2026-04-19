package com.biblioo.community.infrastructure.config;

import com.biblioo.user.infrastructure.security.JwtService;
import java.util.Collections;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;

@Component
public class JwtChannelInterceptor implements ChannelInterceptor {

  @Autowired private JwtService jwtService;

  @Override
  public Message<?> preSend(Message<?> message, MessageChannel channel) {
    StompHeaderAccessor accessor =
        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

    if (accessor == null || !StompCommand.CONNECT.equals(accessor.getCommand())) {
      return message;
    }

    String authHeader = accessor.getFirstNativeHeader("Authorization");

    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      throw new IllegalArgumentException("Token JWT ausente ou inválido no header STOMP CONNECT.");
    }

    String token = authHeader.substring(7);

    if (!jwtService.isValidAccessToken(token)) {
      throw new IllegalArgumentException("Token JWT inválido ou expirado.");
    }

    Long userId = jwtService.extractUserId(token);
    UsernamePasswordAuthenticationToken auth =
        new UsernamePasswordAuthenticationToken(
            User.withUsername(userId.toString()).password("").roles("USER").build(),
            null,
            Collections.emptyList());

    accessor.setUser(auth);
    return message;
  }
}
