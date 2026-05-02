---
name: code-patterns
description: Consulte esta skill quando o usuário pedir para criar um novo arquivo, módulo, componente ou feature do zero; ao refatorar código existente para alinhar com o padrão do projeto; quando houver dúvida sobre onde algo deve viver na estrutura de pastas; ou quando o usuário mencionar explicitamente "padrão", "convenção", "arquitetura" ou "como fazemos aqui". NÃO use para pequenas edições pontuais, correções de bug simples ou perguntas conceituais sobre código.
---

## 1. Stack & Versões

- Java 25, Spring Boot 4.0.4, Maven 4
- JPA/Hibernate via Spring Data JPA; Redis 7.4 (cache); RabbitMQ 4.0 (AMQP); Neo4j 5.18 (driver oficial, sem Spring Data Neo4j)
- MapStruct 1.5.5.Final (geração de mappers); Lombok (boilerplate); JJWT 0.12.6 (JWT)
- Formatação obrigatória: Spotless + Google Java Format 1.35.0 — rodar `./mvnw spotless:apply` antes de commit
- Threads virtuais habilitadas (`spring.threads.virtual.enabled=true`)

## 2. Estrutura de Pastas

```
com.biblioo.{modulo}/
  domain/
    model/       → entidades JPA e objetos de valor
    port/in/     → interfaces UseCase (entrada)
    port/out/    → interfaces de saída (publishers, repositórios do domínio)
    service/     → implementações dos use cases
    exception/   → exceções de negócio
  infrastructure/
    web/         → @RestController
    persistence/ → @Repository JPA
    dto/         → Request/Response + MapStruct mappers
    config/      → @Configuration do módulo
    messaging/   → publishers e @RabbitListener
    external/    → adaptadores de APIs externas
```

- Módulos: `books` (typo histórico: `infrasestructure`), `user`, `feed`, `community`, `notification`, `recommendation`
- Concerns transversais: `com.biblioo.infrastructure.{config,external,messaging,web}`
- Testes de performance: `performance-tests/{DomainName}/{resource}/{resource}-{load|spike|stress}.js` (K6)

## 3. Nomenclatura

| Tipo | Padrão | Exemplo |
|---|---|---|
| Entidade JPA | `NomeSingular` | `Book`, `ShelfItem` |
| Service | `NomeService` | `ShelfService` |
| Repository | `EntidadeRepository` | `ShelfItemRepository` |
| Controller | `EntidadeController` | `ShelfController` |
| Request DTO | `AcaoEntidadeRequest` | `CreateShelfRequest` |
| Response DTO | `EntidadeResponse` | `ShelfResponse` |
| Mapper | `EntidadeMapper` | `ShelfMapper` |
| Adapter externo | `ServicoAdapter` | `GoogleBooksAdapter` |
| Consumer | `DominioConsumer` | `RecommendationConsumer` |
| Exceção | `EntidadeNotFoundException` / `DominioBusinessException` | `BookNotFoundException` |

- Pacotes: `com.biblioo.{modulo}.{camada}.{subtipo}`
- Código-fonte em inglês; comentários, logs e mensagens de exceção em pt-BR

## 4. Padrões de Módulo/Componente

**Service:** `@Service @RequiredArgsConstructor @Slf4j`, injeção por construtor, implementa interface `port/in`
- Leitura: `@Transactional(readOnly = true)` + `@Cacheable`
- Escrita: `@Transactional` + `@CacheEvict` ou `@CachePut`
- Nunca publicar direto no RabbitMQ dentro de `@Transactional` — usar `OutboxEvent`

**Controller:** `@RestController @RequestMapping("/rota") @RequiredArgsConstructor @Tag(name=...) @Validated`
- Delegar 100% ao UseCase; zero lógica de negócio; zero Repository injetado diretamente
- Retornar sempre `ResponseEntity<T>`; documentar com `@Operation(summary=...)`

**Consumer RabbitMQ:** verificar idempotência via `eventLogRepository.existsByEventId(eventId)` antes de processar; registrar com transação `REQUIRES_NEW`; relançar exceção para NACK → DLQ; usar `MDC.put("event_id", ...)` e `MDC.clear()` no `finally`

**Mapper:** `@Mapper(componentModel = "spring")` — interface pura, sem lógica

**Entidade JPA:** `@Entity @Table(name=..., indexes={...}) @Data @Builder @NoArgsConstructor @AllArgsConstructor`; timestamps com `@CreationTimestamp` / `@UpdateTimestamp`; soft delete com coluna `deletedAt` ou `isDeleted`

## 5. Tratamento de Erros

- Exceções de negócio estendem `RuntimeException` com mensagem em pt-BR; ficam em `domain/exception/`
- Controllers NÃO capturam exceções — deixar propagar para `@ControllerAdvice` global
- Nunca `catch (Exception e) { return null; }` ou retorno silencioso em streams
- Nunca `e.printStackTrace()` ou `System.err/out` — usar `log.error("...", e)` com SLF4J
- Consumer: exceção relançada como `RuntimeException` para acionar NACK automático

## 6. Tipagem

- Todos os campos de entidade com tipo explícito; evitar `var` em assinaturas públicas
- DTOs de entrada anotados com Bean Validation (`@NotBlank`, `@NotNull`, `@Valid`) no controller
- Mappers MapStruct são a única forma de converter domínio ↔ DTO; sem conversão manual espalhada
- `@Value("${chave.config}")` nos services para parâmetros configuráveis; nunca hardcodar valores de negócio

## 7. Proibições Explícitas

- **Não usar Spring Data Neo4j** — driver `neo4j-java-driver` com Cypher raw direto
- **Não injetar campo com `@Autowired`** — sempre `private final` + `@RequiredArgsConstructor`
- **Não publicar em RabbitMQ dentro de `@Transactional`** — usar Outbox
- **Não armazenar `null` em cache** (`spring.cache.redis.cache-null-values=false`)
- **Não reverter `open-in-view=false`** e não bypassar `JwtAuthenticationFilter` sem declarar no `SecurityConfig`
- **Não relançar `serialize` com payload vazio `"{}"` no Outbox** — abortar a transação

## 8. Exemplo Canônico

```java
// domain/port/in/ExemploUseCase.java
public interface ExemploUseCase {
  ExemploResponse getById(Long id);
  ExemploResponse create(CreateExemploRequest request);
}

// domain/service/ExemploService.java
@Service
@RequiredArgsConstructor
@Slf4j
public class ExemploService implements ExemploUseCase {

  private final ExemploRepository exemploRepository;
  private final ExemploEventPublisherPort eventPublisher;

  @Override
  @Transactional(readOnly = true)
  @Cacheable(cacheNames = "exemplo", key = "#id")
  public ExemploResponse getById(Long id) {
    return exemploRepository.findById(id)
        .map(exemploMapper::toResponse)
        .orElseThrow(() -> new ExemploNotFoundException(id));
  }

  @Override
  @Transactional
  @CacheEvict(cacheNames = "exemplo", key = "#result.id")
  public ExemploResponse create(CreateExemploRequest request) {
    var entity = Exemplo.builder().nome(request.getNome()).build();
    var saved = exemploRepository.save(entity);
    eventPublisher.publish(new ExemploCriadoEvent(saved.getId()));
    log.info("Exemplo criado id={}", saved.getId());
    return exemploMapper.toResponse(saved);
  }
}

// infrastructure/web/ExemploController.java
@RestController
@RequestMapping("/exemplos")
@RequiredArgsConstructor
@Tag(name = "Exemplo", description = "CRUD de exemplos")
public class ExemploController {

  private final ExemploUseCase exemploUseCase;

  @GetMapping("/{id}")
  @Operation(summary = "Busca exemplo por ID")
  public ResponseEntity<ExemploResponse> getById(@PathVariable Long id) {
    return ResponseEntity.ok(exemploUseCase.getById(id));
  }

  @PostMapping
  @Operation(summary = "Cria exemplo")
  public ResponseEntity<ExemploResponse> create(@RequestBody @Valid CreateExemploRequest req) {
    return ResponseEntity.status(HttpStatus.CREATED).body(exemploUseCase.create(req));
  }
}
## 9. Comunicação Entre Módulos

- Módulos **nunca importam classes concretas de outros módulos** (Services, Repositories, entidades JPA)
- A única forma de acionar outro módulo é via **interface UseCase** do módulo alvo (`port/in/`)
- Se o módulo alvo não expõe o UseCase necessário, criar a interface antes de qualquer implementação
- Eventos assíncronos via RabbitMQ são preferíveis para comunicação não-bloqueante entre módulos
- **Nunca** injetar `*Repository` ou `*Service` de outro módulo — viola o isolamento de domínio

**Correto:**
```java
// módulo feed consumindo módulo books via contrato
@Service
@RequiredArgsConstructor
public class FeedService implements FeedUseCase {
  private final GetBookUseCase getBookUseCase; // interface de books/port/in
}
```

**Errado:**
```java
// acoplamento direto à implementação concreta de outro módulo
@Service
@RequiredArgsConstructor
public class FeedService implements FeedUseCase {
  private final BookService bookService;       // ❌ concreto de outro módulo
  private final BookRepository bookRepository; // ❌ repositório de outro módulo
}
```