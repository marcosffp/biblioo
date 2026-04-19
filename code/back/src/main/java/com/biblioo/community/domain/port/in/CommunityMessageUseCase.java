package com.biblioo.community.domain.port.in;

import com.biblioo.community.domain.model.CommunityMessage;
import com.biblioo.community.domain.model.ReactionType;
import com.biblioo.community.infrastructure.dto.MessageMediaUploadResponse;
import java.util.List;
import java.util.Set;

public interface CommunityMessageUseCase {

  CommunityMessage sendMessage(
      Long communityId,
      Long authorId,
      String content,
      Long parentMessageId,
      Set<String> tags,
      List<String> images,
      String gifUrl,
      boolean hasSpoiler,
      String clientMessageId);

  MessageMediaUploadResponse uploadMessageMedia(
      Long communityId, Long userId, List<byte[]> images, byte[] gif);

  void editMessage(Long messageId, Long actorId, String newContent);

  void deleteMessage(Long messageId, Long actorId);

  void toggleReaction(Long messageId, Long userId, ReactionType type);

  List<CommunityMessage> getRecentMessages(Long communityId);

  List<CommunityMessage> getMessagesBefore(Long communityId, Long beforeId, int limit);

  List<CommunityMessage> getMessagesAfter(Long communityId, Long afterId);
}
