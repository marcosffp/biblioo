package com.biblioo.books.infrasestructure.dev;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Cria e popula a tabela stub de usuários em ambiente local.
 *
 * Ativo apenas quando dev.user-stub.enabled=true (application-local.properties).
 *
 * O que faz na inicialização:
 *   1. Cria a tabela "users" se ainda não existir — estrutura mínima
 *      com apenas o id, suficiente para satisfazer as foreign keys
 *      das tabelas de estantes, coleções e itens.
 *   2. Insere os usuários de teste (id 1 a 4) se ainda não existirem
 *      — idempotente, pode reiniciar a aplicação sem duplicar.
 *
 * Quando o módulo de usuários for implementado, basta remover este
 * componente e o application-local.properties — nada mais muda.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "dev.user-stub.enabled", havingValue = "true")
public class DevUserSeeder {

    private final JdbcTemplate jdbc;

    @PostConstruct
    public void seed() {
        createTableIfNotExists();
        insertStubUsers();
    }

    private void createTableIfNotExists() {
        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id         BIGINT       NOT NULL AUTO_INCREMENT,
                    name       VARCHAR(100) NOT NULL DEFAULT 'Dev User',
                    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                """);

        log.info("[DEV] Tabela 'users' verificada/criada.");
    }

    private void insertStubUsers() {
        int[] ids = {1, 2, 3, 4};

        for (int id : ids) {
            int exists = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM users WHERE id = ?",
                    Integer.class, id);

            if (exists == 0) {
                jdbc.update(
                        "INSERT INTO users (id, name) VALUES (?, ?)",
                        id, "Dev User " + id);
                log.info("[DEV] Usuário stub criado: id={}", id);
            }
        }

        log.info("[DEV] Seed de usuários concluído. IDs disponíveis: 1, 2, 3, 4");
    }
}