package com.biblioo.community.domain.service;

import com.biblioo.community.domain.exception.CommunityAccessDeniedException;
import com.biblioo.community.domain.exception.CommunityBusinessException;
import com.biblioo.community.domain.model.CommunityMessage;
import com.biblioo.community.domain.model.CommunityRole;
import com.biblioo.community.domain.model.MessageReaction;
import com.biblioo.community.domain.model.ReactionType;
import com.biblioo.community.domain.port.in.CommunityMessageUseCase;
import com.biblioo.community.domain.port.out.MessageBroadcastPort;
import com.biblioo.community.domain.port.out.MessageCachePort;
import com.biblioo.community.infrastructure.dto.MessageMediaUploadResponse;
import com.biblioo.community.domain.port.out.CommunityEventPublisherPort;
import com.biblioo.community.infrastructure.persistence.CommunityMemberRepository;
import com.biblioo.community.infrastructure.persistence.CommunityMembershipCache;
import com.biblioo.community.infrastructure.persistence.CommunityMessageRepository;
import com.biblioo.community.infrastructure.persistence.CommunityRepository;
import com.biblioo.community.infrastructure.persistence.MessageReactionRepository;
import com.biblioo.feed.domain.port.out.FeedImagePort;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

@Slf4j
@RequiredArgsConstructor
public class CommunityMessageService implements CommunityMessageUseCase {

  private static final int EDIT_WINDOW_HOURS = 24;
  private static final int MAX_TAGS = 10;
  private static final int RECENT_MESSAGES_LIMIT = 100;

  private final CommunityMessageRepository messageRepository;
  private final MessageReactionRepository reactionRepository;
  private final CommunityMemberRepository memberRepository;
  private final CommunityMembershipCache membershipCache;
  private final MessageBroadcastPort broadcastPort;
  private final MessageCachePort cachePort;
  private final FeedImagePort feedImagePort;
  private final TransactionTemplate transactionTemplate;
  private final ApplicationEventPublisher eventPublisher;
  private final CommunityRepository communityRepository;
  private final CommunityEventPublisherPort communityEventPublisher;

  public record MessageSentEvent(CommunityMessage message) {}
  public record MessageEditedEvent(CommunityMessage message) {}
  public record MessageDeletedEvent(Long communityId, Long messageId) {}
  public record MessageReactionEvent(Long communityId, Long messageId, int newCount) {}

  @EventListener
  public void handleMessageSent(MessageSentEvent event) {
    cachePort.pushMessage(event.message().getCommunityId(), event.message());
    broadcastPort.broadcastNewMessage(event.message());
  }

  @EventListener
  public void handleMessageEdited(MessageEditedEvent event) {
    cachePort.invalidate(event.message().getCommunityId());
    broadcastPort.broadcastEdit(event.message());
  }

  @EventListener
  public void handleMessageDeleted(MessageDeletedEvent event) {
    cachePort.invalidate(event.communityId());
    broadcastPort.broadcastDelete(event.communityId(), event.messageId());
  }

  @EventListener
  public void handleMessageReaction(MessageReactionEvent event) {
    broadcastPort.broadcastReaction(event.communityId(), event.messageId(), event.newCount());
  }

  // ── Upload de mídia ───────────────────────────────────────────────────────

@Override
public MessageMediaUploadResponse uploadMessageMedia(
    Long communityId, Long userId, List<byte[]> images, byte[] gif) {

  // 1. Verifica membership — abre conexão, fecha conexão, pronto
  if (!membershipCache.isMember(communityId, userId)) {
    throw new CommunityAccessDeniedException("Apenas membros podem enviar mídia.");
  }

  // 2. Neste ponto, NENHUMA conexão está aberta.
  // O .join() abaixo bloqueia a thread HTTP, mas sem sessão Hibernate ativa.
  List<String> imageUrls = new ArrayList<>();
  if (images != null && !images.isEmpty()) {
    images.stream()
        .map(bytes -> feedImagePort.uploadImage(
            bytes, "community-" + communityId, UUID.randomUUID().toString()))
        .toList()                          // dispara todos os uploads em paralelo
        .forEach(f -> imageUrls.add(f.join())); // só então aguarda
  }

  String gifUrl = null;
  if (gif != null && gif.length > 0) {
    gifUrl = feedImagePort
        .uploadImage(gif, "community-" + communityId, UUID.randomUUID() + "_gif")
        .join();
  }

  return new MessageMediaUploadResponse(imageUrls, gifUrl);
}

  // ── Send ─────────────────────────────────────────────────────────────────

  @Override
  @Transactional
  public CommunityMessage sendMessage(
      Long communityId,
      Long authorId,
      String content,
      Long parentMessageId,
      Set<String> tags,
      List<String> images,
      String gifUrl,
      boolean hasSpoiler,
      String clientMessageId) {

    CommunityMessage savedMessage = transactionTemplate.execute(status -> {
      boolean member = membershipCache.isMember(communityId, authorId);
      log.debug(
          "isMember check — communityId={}, authorId={}, result={}", communityId, authorId, member);
      if (!member) {
        throw new CommunityAccessDeniedException("Apenas membros podem enviar mensagens.");
      }

      if (parentMessageId != null) {
        CommunityMessage parent =
            messageRepository
                .findById(parentMessageId)
                .orElseThrow(() -> new CommunityBusinessException("Mensagem pai não encontrada."));
        if (!parent.getCommunityId().equals(communityId) || parent.isDeleted()) {
          throw new CommunityBusinessException("Mensagem pai inválida.");
        }
      }

      String safeContent = (content != null) ? Jsoup.clean(content.trim(), Safelist.none()) : "";
      boolean hasMedia =
          (images != null && !images.isEmpty()) || (gifUrl != null && !gifUrl.isBlank());
      if (safeContent.isBlank() && !hasMedia) {
        throw new CommunityBusinessException(
            "A mensagem deve ter texto ou pelo menos uma imagem/GIF.");
      }

      Set<String> safeTags =
          tags == null
              ? new HashSet<>()
              : tags.stream()
                  .filter(t -> t != null && !t.isBlank())
                  .map(t -> Jsoup.clean(t.trim(), Safelist.none()))
                  .filter(t -> !t.isBlank() && t.length() <= 50)
                  .limit(MAX_TAGS)
                  .collect(Collectors.toSet());

      CommunityMessage message =
          CommunityMessage.builder()
              .communityId(communityId)
              .authorId(authorId)
              .content(safeContent.isBlank() ? null : safeContent)
              .parentMessageId(parentMessageId)
              .tags(safeTags)
              .images(images != null ? new ArrayList<>(images) : new ArrayList<>())
              .gifUrl(gifUrl)
              .hasSpoiler(hasSpoiler)
              .clientMessageId(clientMessageId)
              .build();

      return messageRepository.save(message);
    });

    eventPublisher.publishEvent(new MessageSentEvent(savedMessage));

    communityRepository
        .findActiveById(communityId)
        .ifPresent(
            c -> communityEventPublisher.publishMessagePostedForTrending(authorId, c.getBookId()));

    return savedMessage;
  }

  @Override
  public void editMessage(Long messageId, Long actorId, String newContent) {
    CommunityMessage savedMessage = transactionTemplate.execute(status -> {
      CommunityMessage message = requireActiveMessage(messageId);

      if (!message.getAuthorId().equals(actorId)) {
        throw new CommunityAccessDeniedException("Apenas o autor pode editar a mensagem.");
      }

      LocalDateTime editDeadline = message.getCreatedAt().plusHours(EDIT_WINDOW_HOURS);
      if (LocalDateTime.now().isAfter(editDeadline)) {
        throw new CommunityBusinessException(
            "Janela de edição expirada. Mensagens só podem ser editadas em até "
                + EDIT_WINDOW_HOURS
                + " horas.");
      }

      String safeContent = Jsoup.clean(newContent.trim(), Safelist.none());
      if (safeContent.isBlank()) {
        throw new CommunityBusinessException("Conteúdo da mensagem não pode ser vazio.");
      }

      message.setContent(safeContent);
      message.setEditedAt(LocalDateTime.now());

      try {
        return messageRepository.save(message);
      } catch (ObjectOptimisticLockingFailureException e) {
        throw new CommunityBusinessException(
            "Conflito de edição: a mensagem foi modificada por outra sessão. Recarregue e tente novamente.");
      }
    });

    eventPublisher.publishEvent(new MessageEditedEvent(savedMessage));
  }

  @Override
  public void deleteMessage(Long messageId, Long actorId) {
    CommunityMessage deletedMessage = transactionTemplate.execute(status -> {
      CommunityMessage message = requireActiveMessage(messageId);

      boolean isAuthor = message.getAuthorId().equals(actorId);
      boolean isModOrOwner =
          memberRepository
              .findRole(message.getCommunityId(), actorId)
              .map(role -> role == CommunityRole.OWNER || role == CommunityRole.MODERATOR)
              .orElse(false);

      if (!isAuthor && !isModOrOwner) {
        throw new CommunityAccessDeniedException(
            "Apenas o autor ou moderadores podem remover mensagens.");
      }

      message.setDeleted(true);
      message.setContent("[comentário removido]");
      return messageRepository.save(message);
    });

    List<String> urlsToDelete = new ArrayList<>(deletedMessage.getImages());
    if (deletedMessage.getGifUrl() != null && !deletedMessage.getGifUrl().isBlank())
      urlsToDelete.add(deletedMessage.getGifUrl());

    if (!urlsToDelete.isEmpty()) feedImagePort.deleteImages(urlsToDelete);

    cachePort.invalidate(deletedMessage.getCommunityId());
    broadcastPort.broadcastDelete(deletedMessage.getCommunityId(), messageId);
  }

  @Override
  public void toggleReaction(Long messageId, Long userId, ReactionType type) {
    ReactionStatus result = transactionTemplate.execute(status -> {
      CommunityMessage message = requireActiveMessage(messageId);

      if (!membershipCache.isMember(message.getCommunityId(), userId)) {
        throw new CommunityAccessDeniedException("Apenas membros podem reagir a mensagens.");
      }

      try {
        reactionRepository.save(
            MessageReaction.builder().messageId(messageId).userId(userId).reactionType(type).build());
        messageRepository.incrementHeartCount(messageId);
      } catch (DataIntegrityViolationException e) {
        reactionRepository.deleteByMessageIdAndUserIdAndReactionType(messageId, userId, type);
        messageRepository.decrementHeartCount(messageId);
      }

      int newCount = messageRepository.findHeartCountById(messageId);
      return new ReactionStatus(message.getCommunityId(), messageId, newCount);
    });

    eventPublisher.publishEvent(
        new MessageReactionEvent(result.communityId(), result.messageId(), result.newCount()));
  }

  private record ReactionStatus(Long communityId, Long messageId, int newCount) {}

  @Override
  @Transactional(readOnly = true)
  public List<CommunityMessage> getRecentMessages(Long communityId) {
    List<CommunityMessage> cached = cachePort.getRecentMessages(communityId);
    if (!cached.isEmpty()) {
      return cached;
    }

    List<CommunityMessage> messages =
        messageRepository.findRecentByCommunityId(communityId, RECENT_MESSAGES_LIMIT);

    messages.forEach(m -> cachePort.pushMessage(communityId, m));
    return messages;
  }

  @Override
  @Transactional(readOnly = true)
  public List<CommunityMessage> getMessagesBefore(Long communityId, Long beforeId, int limit) {
    int safeLimit = Math.min(limit, 100);
    return messageRepository.findByCommunityIdBeforeId(communityId, beforeId, safeLimit);
  }

  @Override
  @Transactional(readOnly = true)
  public List<CommunityMessage> getMessagesAfter(Long communityId, Long afterId) {
    return messageRepository.findByCommunityIdAfterId(communityId, afterId);
  }


  private CommunityMessage requireActiveMessage(Long messageId) {
    CommunityMessage message =
        messageRepository
            .findById(messageId)
            .orElseThrow(() -> new CommunityBusinessException("Mensagem não encontrada."));
    if (message.isDeleted()) {
      throw new CommunityBusinessException("Mensagem não encontrada.");
    }
    return message;
  }
}
