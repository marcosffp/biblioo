package com.biblioo.feed.infrastructure.persistence;

import com.biblioo.feed.domain.model.Like;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class LikeSaveHelper {

  private final LikeRepository likeRepository;


  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public boolean tryInsert(Like like) {
    try {
      likeRepository.saveAndFlush(like);
      return true;
    } catch (DataIntegrityViolationException ignored) {
      return false;
    }
  }
}
