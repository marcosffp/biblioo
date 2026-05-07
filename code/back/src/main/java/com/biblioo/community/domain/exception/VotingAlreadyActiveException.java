package com.biblioo.community.domain.exception;

public class VotingAlreadyActiveException extends CommunityBusinessException {
  public VotingAlreadyActiveException(String message) {
    super(message);
  }
}
