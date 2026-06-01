package com.biblioo.assistant.domain.service;

public final class UserIdHolder {

  private static final ThreadLocal<Long> HOLDER = new ThreadLocal<>();

  private UserIdHolder() {}

  public static void set(Long userId) {
    HOLDER.set(userId);
  }

  public static Long get() {
    return HOLDER.get();
  }

  public static void clear() {
    HOLDER.remove();
  }
}
