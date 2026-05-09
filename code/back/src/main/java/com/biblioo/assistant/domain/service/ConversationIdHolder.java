package com.biblioo.assistant.domain.service;

public final class ConversationIdHolder {

  private static final ThreadLocal<String> HOLDER = new ThreadLocal<>();

  private ConversationIdHolder() {}

  public static void set(String conversationId) {
    HOLDER.set(conversationId);
  }

  public static String get() {
    return HOLDER.get();
  }

  public static void clear() {
    HOLDER.remove();
  }
}
