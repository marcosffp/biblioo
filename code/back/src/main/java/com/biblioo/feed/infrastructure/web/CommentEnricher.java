package com.biblioo.feed.infrastructure.web;

import com.biblioo.feed.domain.port.out.UserPort;
import com.biblioo.feed.infrastructure.dto.comment.CommentBasicResponse;
import com.biblioo.user.domain.model.User;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CommentEnricher {

  private final UserPort userPort;

  public Page<CommentBasicResponse> enrich(Page<CommentBasicResponse> page) {
    List<Long> userIds =
        page.getContent().stream().map(CommentBasicResponse::userId).distinct().toList();
    if (userIds.isEmpty()) return page;

    Map<Long, User> userMap =
        userPort.getUsersByIds(userIds).stream()
            .collect(Collectors.toMap(User::getId, u -> u));

    return page.map(
        c -> {
          User user = userMap.get(c.userId());
          return new CommentBasicResponse(
              c.id(),
              c.userId(),
              c.parentId(),
              c.text(),
              c.likeCount(),
              c.createdAt(),
              user != null ? user.getUsername() : null,
              user != null ? user.getAvatarUrl() : null,
              c.deleted());
        });
  }
}
