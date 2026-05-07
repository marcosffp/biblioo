---
name: security-vulnerabilities
description: "Consulte ao analisar segurança, revisar código sensível, implementar auth/authz, lidar com dados de usuário, configurar infra, ou quando o usuário mencionar 'vulnerabilidade', 'segurança', 'risco', 'auditoria', 'isso é seguro?'. Consulte antes de qualquer PR que toque em config, filtros, tokens, filas ou acesso a dados. NÃO use para bugs funcionais sem implicação de segurança."
---

## Resumo Executivo

**Última varredura:** 2026-05-07

| Severidade | Total | Aberta | Mitigada | Aceita |
|---|---|---|---|---|
| CRÍTICA | 5 | 5 | 0 | 0 |
| ALTA | 10 | 10 | 0 | 0 |
| MÉDIA | 8 | 7 | 0 | 1 |

---

## Registro — CRÍTICA

**VUL-002** · ABERTA · `OutboxEventService.java:39-46`
Falha de serialização do payload é silenciada; evento é salvo e publicado com payload `"{}"` (vazio).
Impacto: data loss — consumer recebe mensagem sem dados de negócio, processa estado inválido silenciosamente.
Fix: relançar a exceção para abortar a transação; nunca persistir evento com payload inválido.

**VUL-020** · ABERTA (NOVA) · `FeedController.java:46,136`
O endpoint `GET /feed` aceita `userId` como `@RequestParam` sem nenhuma verificação de autorização. Qualquer usuário autenticado pode passar o ID de outro usuário e receber o feed personalizado completo daquele usuário (posts e reviews das pessoas que ele segue), além de contar novos itens via `GET /feed/new-count`.
```java
public ResponseEntity<FeedPageResponse> getFeed(@RequestParam Long userId, ...)
// userId não é comparado com principal — nenhum @AuthenticationPrincipal presente
```
Impacto: IDOR — expõe o feed privado de qualquer usuário, revelando quem ele segue e o que publicam.
Fix: extrair userId do `@AuthenticationPrincipal` ou comparar o parâmetro recebido contra o usuário autenticado.

**VUL-021** · ABERTA (NOVA) · `DnaController.java:52-64`
Endpoint `GET /dna/{userId}` não possui `@AuthenticationPrincipal` nem verificação de propriedade. Qualquer usuário autenticado pode obter o DNA Literário completo (arquétipos, dimensões, temas, estatísticas) de qualquer outro usuário apenas conhecendo o ID.
```java
@GetMapping("/{userId}")
public ResponseEntity<?> getDna(@PathVariable Long userId) {
    // sem verificação de ownership
}
```
Impacto: IDOR — vazamento de perfil de leitura privado (dados sensíveis de comportamento cultural/literário do usuário).
Fix: verificar que `userId` do path == `currentUserId(principal)` ou adicionar lógica de visibilidade pública/privada.

**VUL-022** · ABERTA (NOVA) · `CommunityMessageRestController.java:37-62`
Os endpoints `GET /communities/{id}/messages` e `GET /communities/{id}/messages/sync` recebem `@AuthenticationPrincipal` mas **nunca o utilizam** e **não verificam membership**. Qualquer usuário autenticado pode ler o histórico completo de mensagens de qualquer comunidade, inclusive comunidades fechadas/privadas.
```java
public ResponseEntity<List<MessageResponse>> getMessages(
    @PathVariable Long communityId, ...,
    @AuthenticationPrincipal UserDetails principal) { // principal NUNCA USADO
  messages = mapper.toResponseList(messageUseCase.getRecentMessages(communityId));
  // sem verificação de isMember(communityId, userId)
}
```
Impacto: acesso não autorizado ao histórico de chat de comunidades privadas por usuários externos.
Fix: adicionar `if (!memberRepository.isMember(communityId, userId)) throw ...` seguindo o padrão do `uploadMessageMedia`.

**VUL-023** · ABERTA (NOVA) · `CacheConfig.java:29-33`
O serializer do Redis usa `enableDefaultTyping` com `allowIfBaseType(Object.class)`, que permite deserialização de **qualquer classe Java** presente no classpath a partir da propriedade `@class` no JSON armazenado.
```java
var typeValidator = BasicPolymorphicTypeValidator.builder()
    .allowIfBaseType(Object.class) // permite QUALQUER tipo
    .build();
return GenericJacksonJsonRedisSerializer.builder()
    .enableDefaultTyping(typeValidator)
    .typePropertyName("@class")
    .build();
```
Impacto: se um atacante conseguir escrever no Redis (acesso à rede interna, SSRF, Redis sem auth), pode injetar payloads de gadget chain e obter RCE. Aplicável aos caches `bookCacheTemplate`, `shelf-list`, `shelf-item`, `user-profile`, etc.
Fix: restringir o validator para apenas classes do próprio projeto: `.allowIfSubType("com.biblioo.")`.

---

## Registro — ALTA

**VUL-004** · ABERTA · `application.properties:6`
`rate.limit.enabled=false` — rate limiting desabilitado globalmente.
Impacto: brute-force em `/auth/login`, DoS, enumeração de usuários sem bloqueio.
Fix: habilitar em produção; configurar por IP + endpoint (implementação já existe em `RateLimitingFilter`).

**VUL-005** · ABERTA · `NotificationConsumer.java:28-65`
Nenhum check de idempotência (`existsByEventId`) antes de criar notificação.
Impacto: notificações duplicadas em qualquer reentrega do RabbitMQ (restart, ACK perdido).
Fix: adicionar verificação + registro com `REQUIRES_NEW`, seguindo o padrão de `SimilarAuthorsConsumer`.

**VUL-006** · ABERTA · `application.properties:11`
`useSSL=false&allowPublicKeyRetrieval=true` na URL do MySQL.
Impacto: credenciais transmitidas em texto plano; MITM permite captura de senha.
Fix: `useSSL=true&allowPublicKeyRetrieval=false&serverSslMode=REQUIRED`.

**VUL-008** · ABERTA · `.env:6,9,96`
Senhas fracas: MySQL root/user = `root`; Grafana password = `admin`.
Fix: senhas fortes (≥ 20 chars, aleatórias), rotacionar antes de qualquer exposição.

**VUL-009** · ABERTA · `application.properties:26`
`spring.jpa.hibernate.ddl-auto=update` — Hibernate altera schema no startup.
Fix: `validate` em produção com Flyway/Liquibase para migrações controladas.

**VUL-018** · ABERTA · `RabbitMQPasswordResetEmailAdapter.java:19`
Token de reset de senha (credencial one-time) gravado literalmente em `System.out`:
```
System.out.println("Scheduling password reset email to " + toEmail + " with reset link: " + resetLink);
```
Impacto: o `resetLink` contém o token; qualquer agregador de logs (Docker, CI/CD) pode capturar e usá-lo para resetar senha de qualquer usuário.
Fix: remover a linha; se necessário registrar, usar `log.info("Agendando reset para userId={}")` sem o link.

**VUL-024** · ABERTA (NOVA) · `UserController.java:270-274`
Upload de avatar/banner valida apenas `file.getContentType()` (header HTTP controlado pelo cliente), sem verificação real do conteúdo do arquivo via magic bytes (Apache Tika). Contraste com `CommunityMessageRestController` que usa `TIKA.detect(file.getInputStream())` corretamente.
```java
String contentType = file.getContentType(); // header enviado pelo cliente — não confiável
if (!ALLOWED_MIME_TYPES.contains(contentType)) throw ...;
// sem: TIKA.detect(file.getInputStream())
```
Impacto: atacante pode enviar SVG com JavaScript embutido com `Content-Type: image/jpeg`; se a CDN (Cloudinary) servir o arquivo sem revalidação, pode resultar em stored XSS em todos os visualizadores do perfil.
Fix: usar `TIKA.detect(file.getInputStream())` como em `CommunityMessageRestController`, rejeitar SVG explicitamente.

**VUL-025** · ABERTA (NOVA) · `RateLimitingFilter.java:58-64`
O método `resolveClientIp()` usa o header `X-Forwarded-For` sem validação. Um atacante pode rotacionar IPs sintéticos para obter buckets infinitos e burlar completamente o rate limiter.
```java
private String resolveClientIp(HttpServletRequest request) {
  String forwarded = request.getHeader("X-Forwarded-For"); // user-controlled
  if (forwarded != null && !forwarded.isEmpty()) {
    return forwarded.split(",")[0]; // aceita qualquer valor sem validação
  }
  return request.getRemoteAddr();
}
```
Impacto: bypass total de rate limiting → brute force em `/auth/login`, `/auth/forgot-password`, enumeração irrestrita de usuários.
Fix: confiar apenas no IP de rede real (`getRemoteAddr()`) ou usar apenas o IP mais à direita do header (que é inserido pelo proxy confiável), nunca o primeiro valor que é definido pelo cliente.

**VUL-026** · ABERTA (NOVA) · `AuthServiceImpl.java:91-106`
O método `refresh()` não é `@Transactional`. Sob carga concorrente, duas requisições com o mesmo refresh token podem ambas passar na verificação `token.isValid()` antes de qualquer UPDATE ser commitado, gerando dois novos pares de tokens válidos a partir de um único token.
```java
public AuthResult refresh(String refreshToken) {
  RefreshToken token = tokenRepo.findByToken(refreshToken)...;
  if (!token.isValid()) throw ...; // ← leitura: used=false (ambas as threads)
  token.setUsed(true);             // ← ambas as threads chegam aqui
  tokenRepo.save(token);           // ← ambas commitam used=true, mas já criaram sessão
  return buildAuthResult(user);    // ← duas sessões geradas
}
```
Impacto: race condition → um refresh token roubado pode ser utilizado simultaneamente à renovação legítima, resultando em duas sessões ativas.
Fix: adicionar `@Transactional` com `SELECT ... FOR UPDATE` no `findByToken` (via query nativa ou `@Lock(PESSIMISTIC_WRITE)`).

**VUL-027** · ABERTA (NOVA) · `ShelfController.java:79-108`
`GET /shelves/user/{userId}` e `GET /shelves/user/{userId}/{shelfId}` não possuem `@AuthenticationPrincipal` nem verificação de visibilidade do perfil. Mesmo usuários com perfil `PRIVATE` têm suas estantes expostas a qualquer usuário autenticado, diferente dos endpoints de seguidores (`/users/{username}/followers`) que já respeitam a restrição de perfil privado.
Impacto: IDOR — hábitos e biblioteca de leitura de usuários com perfil privado ficam expostos.
Fix: verificar `userUseCase.getProfile(viewerId, targetUsername).restricted()` antes de retornar estantes, ou exigir que `userId == currentUserId(principal)`.

---

## Registro — MÉDIA

**VUL-010** · ACEITA (dev) · `docker-compose.yml:126`
`DISABLE_SECURITY_PLUGIN=true` no OpenSearch — porta 9200 sem autenticação.
Fix: habilitar security plugin antes de deploy em ambiente compartilhado.

**VUL-012** · ABERTA · múltiplos arquivos
`System.out.println`, `System.err.println`, `e.printStackTrace()` em código de produção:
- `RabbitMQEventPublisher.java:38,50,57`
- `OutboxEventService.java:44-45`
- `BookStatsConsumer.java:29,38,49,67`
- `BookStatsDlqConsumer.java:18`
- `DnaController.java:38` — imprime `principal.getUsername()` (ID de usuário) em stdout

Fix: substituir por `log.info/warn/error("...", e)` com `@Slf4j`.

**VUL-013** · ABERTA · `application.properties:176`
`logging.level.com.biblioo.community=DEBUG` ativo em produção.
Fix: mudar para `INFO` ou `WARN` em produção.

**VUL-015** · ABERTA · `SecurityConfig.java:51` + `application.properties:191`
`/actuator/health` e `/actuator/prometheus` com `permitAll()` + `show-details=always`.
Fix: `show-details=when-authorized`; proteger `/actuator/prometheus` com auth básica.

**VUL-016** · ABERTA · `JwtAuthenticationFilter.java:35-38`
Token JWT inválido passa pelo filtro silenciosamente — expõe rotas `permitAll()` a tokens forjados.
Fix: retornar 401 explicitamente ao detectar token inválido.

**VUL-017** · ABERTA · `NotificationController.java:39,89-100`
`DeviceTokenRepository` injetado diretamente no controller; operações sem `@Transactional`; race condition no padrão check-then-act (linhas 89-91).
Fix: mover para `NotificationService` com `@Transactional` e UNIQUE constraint no banco.

**VUL-019** · ABERTA · `BookVotingService.java:276-307`
`getVoting()` e `listVotings()` retornam votações `DRAFT` (rascunhos não publicados) para qualquer usuário autenticado, inclusive não-membros da comunidade.
Fix: filtrar `DRAFT` para retornar apenas ao OWNER, ou adicionar verificação de membership.

**VUL-028** · ABERTA (NOVA) · `GlobalExceptionHandler.java:96-100` + `AuthServiceImpl.java:58`
`EmailAlreadyExistsException` retorna HTTP 409 CONFLICT, enquanto e-mail inexistente retorna outros códigos durante o registro. Permite enumeração de todos os e-mails cadastrados via tentativas de registro.
```java
if (userRepo.existsByEmail(email)) throw new EmailAlreadyExistsException(email);
// → 409 Conflict (diferenciável de outros erros)
```
Impacto: enumeração de usuários → auxilia credential stuffing e phishing direcionado.
Fix: retornar sempre 200/202 com mensagem genérica "Verifique seu e-mail" independente de o e-mail já existir.

---

## O que esta varredura NÃO cobre

- Dependências transitivas não listadas no `pom.xml`
- Segurança do ambiente de produção (K8s, cloud, IAM, TLS terminado externamente)
- Testes de penetração ativos (fuzzing, DAST, exploração real de CVEs)
- Segurança do cliente (front-end Next.js, app Flutter)
- Histórico git (segredos commitados e revertidos ainda ficam no histórico)

---

> **Regra de manutenção:** ao corrigir um item, atualizar `Status` para MITIGADA e registrar a data. Ao descobrir novo item, adicionar antes de fechar a tarefa. Realizar nova varredura a cada upgrade significativo de dependências ou mudança arquitetural.
