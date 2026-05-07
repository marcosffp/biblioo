package com.biblioo.community.domain.exception;

public class VotingNotActiveException extends CommunityBusinessException {
  public VotingNotActiveException(String message) {
    super(message);
  }
}
