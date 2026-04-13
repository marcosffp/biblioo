package com.biblioo.user.domain.model;

/**
 * Resultado da consulta de perfil com visibilidade aplicada.
 *
 * @param user o usuário alvo
 * @param restricted true quando o perfil é privado e o viewer não tem acesso completo
 */
public record ProfileAccess(User user, boolean restricted) {}
