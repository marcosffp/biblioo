package com.biblioo.community.infrastructure.web;

import com.biblioo.community.domain.exception.CommunityAccessDeniedException;
import com.biblioo.community.domain.exception.CommunityBusinessException;
import com.biblioo.community.domain.port.in.CommunityMessageUseCase;
import com.biblioo.community.infrastructure.dto.EditMessageRequest;
import com.biblioo.community.infrastructure.dto.MessageEventPayload;
import com.biblioo.community.infrastructure.dto.MessageResponse;
import com.biblioo.community.infrastructure.dto.ReactMessageRequest;
import com.biblioo.community.infrastructure.dto.SendMessageRequest;
import jakarta.validation.Valid;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class CommunityMessageController {

  private final CommunityMessageUseCase messageUseCase;

  @MessageMapping("/community/{communityId}/send")
  public void sendMessage(
      @DestinationVariable Long communityId,
      @Valid @Payload SendMessageRequest request,
      Principal principal) {

    messageUseCase.sendMessage(
        communityId,
        userId(principal),
        request.content(),
        request.parentMessageId(),
        request.tags(),
        request.images(),
        request.gifUrl(),
        request.hasSpoiler(),
        request.clientMessageId());
  }

  @MessageMapping("/community/{communityId}/messages/{messageId}/edit")
  public void editMessage(
      @DestinationVariable Long communityId,
      @DestinationVariable Long messageId,
      @Valid @Payload EditMessageRequest request,
      Principal principal) {

    messageUseCase.editMessage(messageId, userId(principal), request.content());
  }

  @MessageMapping("/community/{communityId}/messages/{messageId}/delete")
  public void deleteMessage(
      @DestinationVariable Long communityId,
      @DestinationVariable Long messageId,
      Principal principal) {

    messageUseCase.deleteMessage(messageId, userId(principal));
  }

  @MessageMapping("/community/{communityId}/messages/{messageId}/react")
  public void react(
      @DestinationVariable Long communityId,
      @DestinationVariable Long messageId,
      @Valid @Payload ReactMessageRequest request,
      Principal principal) {

    messageUseCase.toggleReaction(messageId, userId(principal), request.reactionType());
  }

  @MessageMapping("/community/{communityId}/typing")
  public void typing(@DestinationVariable Long communityId, Principal principal) {
    messageUseCase.notifyTyping(communityId, userId(principal));
  }

  @MessageExceptionHandler({CommunityBusinessException.class, CommunityAccessDeniedException.class})
  @SendToUser("/queue/errors")
  public MessageEventPayload handleDomainError(Exception ex) {
    MessageResponse error =
        new MessageResponse(
            null,
            null,
            null,
            null,
            ex.getMessage(),
            null,
            Set.of(),
            List.of(),
            null,
            false,
            0,
            false,
            LocalDateTime.now(),
            null);
    return new MessageEventPayload("ERROR", error);
  }

  private Long userId(Principal principal) {
    return Long.parseLong(principal.getName());
  }
}
