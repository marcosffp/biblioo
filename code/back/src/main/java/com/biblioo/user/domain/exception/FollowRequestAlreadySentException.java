package com.biblioo.user.domain.exception;

public class FollowRequestAlreadySentException extends RuntimeException {
  public FollowRequestAlreadySentException() {
    super("Solicitação de seguir já enviada e aguardando aprovação");
  }
}
