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


**VUL-002** · ABERTA · `OutboxEventService.java:39-46`
Falha de serialização do payload é silenciada; evento é salvo e publicado com payload `"{}"` (vazio).
Impacto: data loss — consumer recebe mensagem sem dados de negócio, processa estado inválido silenciosamente.
Fix: relançar a exceção para abortar a transação; nunca persistir evento com payload inválido.ol

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

**VUL-012** · ABERTA · `RabbitMQEventPublisher.java:38-57` · `OutboxEventService.java:44` · `BookStatsConsumer.java:29-54`
`System.out.println`, `System.err.println`, `e.printStackTrace()` em código de produção.
Impacto: dados de eventos (IDs, tipos, routing keys) em stdout sem controle de nível; falhas sem rastreamento em agregadores de log.
Fix: substituir por `log.info/warn/error("...", e)` com `@Slf4j`.

**VUL-013** · ABERTA · `application.properties:176`
`logging.level.com.biblioo.community=DEBUG` ativo em produção.
Impacto: possível vazamento de conteúdo de mensagens e IDs de usuário em logs.
Fix: `logging.level.com.biblioo.community=INFO` (ou `WARN`) em produção.


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

## O que esta varredura NÃO cobre

- Dependências transitivas não listadas no `pom.xml`
- Segurança do ambiente de produção (K8s, cloud, IAM, TLS terminado externamente)
- Testes de penetração ativos (fuzzing, DAST, exploração real de CVEs)
- Segurança do cliente (front-end Next.js, app Flutter)
- Histórico git (segredos commitados e revertidos ainda ficam no histórico)

---

> **Regra de manutenção:** ao corrigir um item, atualizar `Status` para MITIGADA e registrar a data. Ao descobrir novo item, adicionar antes de fechar a tarefa. Realizar nova varredura a cada upgrade significativo de dependências ou mudança arquitetural.
