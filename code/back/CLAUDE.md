# CLAUDE.md — Biblioo Backend

Rede social de leitura: estantes, reviews, comunidades com chat em tempo real, notificações push/SSE e recomendações personalizadas via grafo.
Stack: Java 25 · Spring Boot 4.0.4 · MySQL 8.4 · Neo4j 5.18 · Redis 7.4 · OpenSearch 2.18 · RabbitMQ 4.0 · Firebase FCM · Cloudinary · Google Books API.

---

## Roteamento de Skills

| Situação | Skill |
|---|---|
| Criar arquivo, módulo, feature, entidade, service ou controller | `code-patterns` |
| Refatorar código para alinhar com o padrão do projeto | `code-patterns` |
| Comunicação entre módulos, contratos UseCase, proibições | `code-patterns` |
| Saber onde algo existe ou onde criar algo novo | `project-map` |
| Qual classe faz o quê, qual rota pertence a qual controller | `project-map` |
| Escrever ou gerar testes (K6 ou Java) | `test-patterns` |
| Qualquer coisa relacionada a segurança ou risco | `security-vulnerabilities` |
| Vulnerabilidade corrigida ou nova encontrada | `security-vulnerabilities` → atualizar registro |

---

## Comandos Essenciais

```bash
# Infraestrutura local (MySQL, Redis, RabbitMQ, OpenSearch, Neo4j, Prometheus, Grafana)
docker-compose up -d

# Rodar a aplicação
./mvnw spring-boot:run

# Formatação OBRIGATÓRIA antes de qualquer commit
./mvnw spotless:apply

# Build completo
./mvnw clean package

# Testes
./mvnw test
```

Acessos: API `:8080` · Swagger `:8080/swagger-ui.html` · Grafana `:3001` · Prometheus `:9090` · RabbitMQ `:15672` · Neo4j `:7474`

---

## Variáveis de Ambiente (`.env` obrigatório)

`MYSQL_PORT` · `MYSQL_USER` · `MYSQL_PASSWORD` · `MYSQL_DATABASE` ·
`REDIS_HOST` · `REDIS_PORT` · `REDIS_PASSWORD` ·
`RABBITMQ_HOST` · `RABBITMQ_PORT` · `RABBITMQ_USER` · `RABBITMQ_PASSWORD` · `RABBITMQ_VHOST` · `RABBITMQ_STOMP_PORT` ·
`NEO4J_URI` · `NEO4J_USER` · `NEO4J_PASSWORD` ·
`OPENSEARCH_HOST` · `OPENSEARCH_PORT` ·
`JWT_SECRET` ·
`GOOGLE_BOOKS_API_KEY` · `GOOGLE_CLIENT_ID` ·
`CLOUDINARY_URL` ·
`FIREBASE_SERVICE_ACCOUNT_BASE64` ·
`APP_WEBSOCKET_ALLOWED_ORIGINS`

**Nunca versionar `.env` em produção.**

---

## Regras Sempre Ativas

1. **Neo4j:** usar somente `neo4j-java-driver` com Cypher raw — nunca `spring-boot-starter-data-neo4j`.
2. **`schema.sql`** executa a cada startup (`spring.sql.init.mode=always`); não remover nem desabilitar.
3. **Idempotência RabbitMQ:** todo consumer que persiste estado deve verificar `event_id` antes de processar. Referência: `BecauseYouReadConsumer`.
4. **Outbox:** nunca publicar direto no RabbitMQ dentro de `@Transactional` que também persiste entidade — usar `OutboxEvent`.
5. **`open-in-view=false`** não reverter; intencional para evitar N+1 em requests assíncronos.
6. **`JwtAuthenticationFilter`** não bypassar; endpoints públicos declarados explicitamente no `SecurityConfig`.
7. **Spotless** obrigatório antes de commit: `./mvnw spotless:apply` (Google Java Format 1.35.0).
8. **Parâmetros `recommendation.*`** nunca hardcoded — sempre via `@Value("${recommendation...}")`.
9. **Cache** nunca armazena `null` (`spring.cache.redis.cache-null-values=false`); não sobrescrever.
10. **Idioma:** código em inglês; comentários, logs e mensagens de exceção em pt-BR.
