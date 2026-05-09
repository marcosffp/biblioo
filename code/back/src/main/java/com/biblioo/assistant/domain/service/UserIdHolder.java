package com.biblioo.assistant.domain.service;

/**
 * Carrega o userId do usuário autenticado em um ThreadLocal, garantindo que o agente nunca opere em
 * nome de outro usuário — independente do que o modelo instruir.
 */
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
