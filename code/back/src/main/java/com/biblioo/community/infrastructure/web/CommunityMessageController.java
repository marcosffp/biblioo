package com.biblioo.community.infrastructure.web;

import com.biblioo.community.domain.exception.CommunityAccessDeniedException;
import com.biblioo.community.domain.exception.CommunityBusinessException;
import com.biblioo.community.domain.model.enumeration.MessageType;
import com.biblioo.community.domain.port.in.CommunityMessageUseCase;
import com.biblioo.community.infrastructure.dto.message.EditMessageRequest;
import com.biblioo.community.infrastructure.dto.message.MessageEventPayload;
import com.biblioo.community.infrastructure.dto.message.MessageResponse;
import com.biblioo.community.infrastructure.dto.message.ReactMessageRequest;
import com.biblioo.community.infrastructure.dto.message.SendMessageRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(
    name = "Community Messaging",
    description = "Endpoints para envio, edição, exclusão e reação de mensagens em comunidades.")
public class CommunityMessageController {

  private final CommunityMessageUseCase messageUseCase;

  @MessageMapping("/community/{communityId}/send")
  @Tag(name = "Send Message", description = "Envia uma nova mensagem para uma comunidade.")
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
  @Tag(name = "Edit Message", description = "Edita uma mensagem existente em uma comunidade.")
  public void editMessage(
      @DestinationVariable Long communityId,
      @DestinationVariable Long messageId,
      @Valid @Payload EditMessageRequest request,
      Principal principal) {

    messageUseCase.editMessage(messageId, userId(principal), request.content());
  }

  @MessageMapping("/community/{communityId}/messages/{messageId}/delete")
  @Tag(name = "Delete Message", description = "Exclui uma mensagem existente em uma comunidade.")
  public void deleteMessage(
      @DestinationVariable Long communityId,
      @DestinationVariable Long messageId,
      Principal principal) {

    messageUseCase.deleteMessage(messageId, userId(principal));
  }

  @MessageMapping("/community/{communityId}/messages/{messageId}/react")
  @Tag(
      name = "React to Message",
      description = "Adiciona ou remove uma reação (ex.: ❤️) a uma mensagem em uma comunidade.")
  public void react(
      @DestinationVariable Long communityId,
      @DestinationVariable Long messageId,
      @Valid @Payload ReactMessageRequest request,
      Principal principal) {

    messageUseCase.toggleReaction(messageId, userId(principal), request.reactionType());
  }

  @MessageMapping("/community/{communityId}/typing")
  @Tag(
      name = "Typing Indicator",
      description = "Notifica que um usuário está digitando em uma comunidade.")
  public void typing(@DestinationVariable Long communityId, Principal principal) {
    messageUseCase.notifyTyping(communityId, userId(principal));
  }

  @MessageExceptionHandler({CommunityBusinessException.class, CommunityAccessDeniedException.class})
  @SendToUser("/queue/errors")
  @Tag(
      name = "Error Handling",
      description = "Lida com erros de domínio nas operações de mensagens.")
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
            MessageType.USER,
            LocalDateTime.now(),
            null);
    return new MessageEventPayload("ERROR", error);
  }

  private Long userId(Principal principal) {
    return Long.parseLong(principal.getName());
  }
}
