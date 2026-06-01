package com.biblioo.community.domain.exception;

public class AlreadyVotedDifferentOptionException extends CommunityBusinessException {
  public AlreadyVotedDifferentOptionException(String message) {
    super(message);
  }
}
