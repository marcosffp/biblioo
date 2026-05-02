package com.biblioo.community.infrastructure.config;

import com.biblioo.community.infrastructure.persistence.CommunityMemberRepository;

import lombok.RequiredArgsConstructor;

import java.security.Principal;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SubscriptionAuthorizationInterceptor implements ChannelInterceptor {

  private static final Pattern COMMUNITY_TOPIC =
      Pattern.compile("^/topic/community\\.(\\d+)(?:\\..*)?$");

  private final CommunityMemberRepository memberRepository;

  @Override
  public Message<?> preSend(Message<?> message, MessageChannel channel) {
    StompHeaderAccessor accessor =
        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

    if (accessor == null || !StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
      return message;
    }

    String destination = accessor.getDestination();
    if (destination == null) {
      return message;
    }

    Matcher matcher = COMMUNITY_TOPIC.matcher(destination);
    if (!matcher.matches()) {
      return message;
    }

    Long communityId = Long.parseLong(matcher.group(1));

    Principal user = accessor.getUser();
    if (user == null) {
      throw new IllegalArgumentException("Usuário não autenticado.");
    }

    Long userId = Long.parseLong(user.getName());

    if (!memberRepository.isMember(communityId, userId)) {
      throw new IllegalArgumentException(
          "Acesso negado: você não é membro da comunidade " + communityId + ".");
    }

    return message;
  }
}
