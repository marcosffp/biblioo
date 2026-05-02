---
name: security-vulnerabilities
description: "Consulte ao analisar segurança, revisar código sensível, implementar auth/authz, lidar com dados de usuário, configurar infra, ou quando o usuário mencionar 'vulnerabilidade', 'segurança', 'risco', 'auditoria', 'isso é seguro?'. Consulte antes de qualquer PR que toque em config, filtros, tokens, filas ou acesso a dados. NÃO use para bugs funcionais sem implicação de segurança."
---

## Resumo Executivo

**Última varredura:** 2026-05-01

| Severidade | Total | Aberta | Mitigada | Aceita |
|---|---|---|---|---|
| CRÍTICA | 3 | 3 | 0 | 0 |
| ALTA | 6 | 6 | 0 | 0 |
| MÉDIA | 8 | 8 | 0 | 0 |
| BAIXA | 2 | 2 | 0 | 0 |

---

## Registro — CRÍTICA

**VUL-001** · ABERTA · `pom.xml:241`
Apache Tika 2.9.2 possui CVE-2025-66516 (CVSS 10.0 — XXE/RCE em parsing de PDF malicioso).
Impacto: execução remota de código, exfiltração de arquivos, SSRF.
Fix: atualizar `tika-core` para 3.2.2+.

**VUL-002** · ABERTA · `OutboxEventService.java:39-46`
Falha de serialização do payload é silenciada; evento é salvo e publicado com payload `"{}"` (vazio).
Impacto: data loss — consumer recebe mensagem sem dados de negócio, processa estado inválido silenciosamente.
Fix: relançar a exceção para abortar a transação; nunca persistir evento com payload inválido.

**VUL-003** · ABERTA · `ReviewService.java:158,168,216` (chamado de `deleteImagesAsync:279`)
`CompletableFuture.runAsync()` disparado dentro de `@Transactional`; se a transação sofrer rollback, a deleção já foi iniciada no Cloudinary.
Impacto: imagens órfãs em storage sem correspondência no banco; deleção assíncrona sem retry, sem tratamento de erro.
Fix: mover deleção de imagens para evento de domínio via Outbox; processar via consumer com retry.

---

## Registro — ALTA

**VUL-004** · ABERTA · `application.properties:6`
`rate.limit.enabled=false` — rate limiting desabilitado globalmente.
Impacto: brute-force em `/auth/login`, DoS, enumeração de usuários sem bloqueio.
Fix: habilitar em produção; configurar por IP + endpoint (implementação já existe em `RateLimitingFilter`).

**VUL-005** · ABERTA · `NotificationConsumer.java:28-65`
Nenhum check de idempotência (`existsByEventId`) antes de criar notificação — padrão oposto ao `BecauseYouReadConsumer`.
Impacto: notificações duplicadas em qualquer reentrega do RabbitMQ (restart, ACK perdido).
Fix: adicionar verificação + registro em tabela de log com `REQUIRES_NEW`, seguindo o padrão de `BecauseYouReadConsumer`.

**VUL-006** · ABERTA · `application.properties:11`
`useSSL=false&allowPublicKeyRetrieval=true` na URL do MySQL.
Impacto: credenciais e dados transmitidos em texto plano; `allowPublicKeyRetrieval=true` permite captura de senha via MITM.
Fix: `useSSL=true&allowPublicKeyRetrieval=false&serverSslMode=REQUIRED`.

**VUL-007** · ABERTA · `docker-compose.yml:233,248`
Prometheus (`9090:9090`) e Grafana (`3001:3000`) sem bind de host — expostos em `0.0.0.0`.
Impacto: métricas internas e dashboard acessíveis de qualquer host na rede.
Fix: `127.0.0.1:9090:9090` e `127.0.0.1:3001:3000`.

**VUL-008** · ABERTA · `.env:6,9,96`
Senhas fracas: MySQL root/user = `root`; Grafana password = `admin`.
Impacto: acesso trivial ao banco e ao dashboard de monitoramento.
Fix: usar senhas fortes (≥ 20 chars, aleatórias) e rotacionar antes de qualquer exposição de ambiente.

**VUL-009** · ABERTA · `application.properties:26`
`spring.jpa.hibernate.ddl-auto=update` — Hibernate altera schema automaticamente no startup.
Impacto: migration não intencional em produção pode corromper tabelas ou apagar colunas.
Fix: `validate` em produção; adotar Flyway ou Liquibase para migrações controladas.

---

## Registro — MÉDIA

**VUL-010** · ACEITA (dev) · `docker-compose.yml:126`
`DISABLE_SECURITY_PLUGIN=true` no OpenSearch — sem autenticação na porta 9200.
Impacto: qualquer host na rede interna pode ler/escrever índices de livros e usuários.
Fix: habilitar security plugin com usuários/roles antes de deploy em ambiente compartilhado.

**VUL-011** · ABERTA · `ShelfController.java:62-68,105-111`
`catch (ShelfBusinessException e) { return null; }` dentro de stream; nulos filtrados com `Objects::nonNull`.
Impacto: erros de autorização/negócio são silenciados; cliente recebe lista incompleta sem saber o motivo.
Fix: deixar exceção propagar para `GlobalExceptionHandler` (retorna status HTTP correto).

**VUL-012** · ABERTA · `RabbitMQEventPublisher.java:38-57` · `OutboxEventService.java:44` · `BookStatsConsumer.java:29-54`
`System.out.println`, `System.err.println`, `e.printStackTrace()` em código de produção.
Impacto: dados de eventos (IDs, tipos, routing keys) em stdout sem controle de nível; falhas sem rastreamento em agregadores de log.
Fix: substituir por `log.info/warn/error("...", e)` com `@Slf4j`.

**VUL-013** · ABERTA · `application.properties:176`
`logging.level.com.biblioo.community=DEBUG` ativo em produção.
Impacto: possível vazamento de conteúdo de mensagens e IDs de usuário em logs.
Fix: `logging.level.com.biblioo.community=INFO` (ou `WARN`) em produção.

**VUL-014** · ABERTA · `WebConfig.java:19`
`allowedHeaders("*")` — qualquer header HTTP aceito em CORS.
Impacto: vetores de ataque via headers customizados; desnecessariamente permissivo.
Fix: `allowedHeaders("Authorization", "Content-Type", "X-Requested-With")`.

**VUL-015** · ABERTA · `SecurityConfig.java:48` + `application.properties:181`
`/actuator/health` e `/actuator/prometheus` com `permitAll()` + `show-details=always`.
Impacto: detalhes de saúde interna (datasources, filas, memória) visíveis sem autenticação.
Fix: `management.endpoint.health.show-details=when-authorized`; proteger `/actuator/prometheus` com auth básica.

**VUL-016** · ABERTA · `JwtAuthenticationFilter.java:35-37`
Token JWT inválido passa pelo filtro silenciosamente (sem lançar exceção, sem setar 401).
Impacto: se rota for incorretamente marcada `permitAll()`, token forjado/expirado não é rejeitado pelo filtro.
Fix: retornar 401 explicitamente ao detectar token inválido, não apenas `filterChain.doFilter()`.

**VUL-017** · ABERTA · `NotificationController.java:39,89-100`
`DeviceTokenRepository` injetado diretamente no controller (lógica de negócio no controller, sem transação).
Impacto: operações de save/delete sem `@Transactional`; violação de isolamento arquitetural; difícil testar e auditar.
Fix: mover para `NotificationService` com método `registerDeviceToken(userId, token)`.

---

## Registro — BAIXA

**VUL-018** · ACEITA (dev) · `SecurityConfig.java:63-69`
Swagger UI (`/swagger-ui/**`, `/v3/api-docs/**`) público sem autenticação.
Impacto: estrutura completa da API exposta; facilita reconhecimento por atacantes.
Fix: proteger ou desabilitar via `springdoc.api-docs.enabled=false` em perfil de produção.

**VUL-019** · ABERTA · `JwtChannelInterceptor.java:19` · `SubscriptionAuthorizationInterceptor.java:22`
`@Autowired` field injection (não constructor injection) em ambos os interceptors.
Impacto: campos não são `final`, dificulta testes e pode mascarar dependências circulares.
Fix: usar `@RequiredArgsConstructor` com campos `private final`.

---

## O que esta varredura NÃO cobre

- Dependências transitivas não listadas no `pom.xml`
- Segurança do ambiente de produção (K8s, cloud, IAM, TLS terminado externamente)
- Testes de penetração ativos (fuzzing, DAST, exploração real de CVEs)
- Segurança do cliente (front-end Next.js, app Flutter)
- Histórico git (segredos commitados e revertidos ainda ficam no histórico)

---

> **Regra de manutenção:** ao corrigir um item, atualizar `Status` para MITIGADA e registrar a data. Ao descobrir novo item, adicionar antes de fechar a tarefa. Realizar nova varredura a cada upgrade significativo de dependências ou mudança arquitetural.
