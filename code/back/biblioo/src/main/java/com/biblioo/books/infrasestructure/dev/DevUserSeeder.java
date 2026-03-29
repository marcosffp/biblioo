package com.biblioo.books.infrasestructure.dev;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Popula usuários de teste em ambiente local.
 *
 * <p>Ativo apenas quando dev.user-stub.enabled=true (application-local.properties). A tabela
 * "users" é gerenciada pelo JPA — este seeder apenas insere linhas de teste se ainda não existirem
 * (idempotente).
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "dev.user-stub.enabled", havingValue = "true")
public class DevUserSeeder {

  private final JdbcTemplate jdbc;

  @PostConstruct
  public void seed() {
    String[][] users = {
      {"devuser1", "dev1@biblioo.local"},
      {"devuser2", "dev2@biblioo.local"},
      {"devuser3", "dev3@biblioo.local"},
      {"devuser4", "dev4@biblioo.local"},
    };

    // BCrypt hash de "password123" — pré-calculado para não depender do PasswordEncoder aqui
    String passwordHash = "$2a$10$7EqJtq98hPqEX7fNZaFWoO9EZUQ2mP6qD8sVKNTVbI3MJx.cLZxAa";

    for (String[] u : users) {
      int exists =
          jdbc.queryForObject("SELECT COUNT(*) FROM users WHERE username = ?", Integer.class, u[0]);
      if (exists == 0) {
        jdbc.update(
            "INSERT INTO users (username, email, password_hash, is_private, created_at, updated_at)"
                + " VALUES (?, ?, ?, ?, NOW(), NOW())",
            u[0],
            u[1],
            passwordHash,
            false);
        log.info("[DEV] Usuário stub criado: username={}", u[0]);
      }
    }

    log.info("[DEV] Seed de usuários concluído.");
  }
}
