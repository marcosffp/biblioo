# Guia de Arquitetura Modular — Biblioo

> Versão 1.0 · Confidencial · Padrão: Ports & Adapters · Stack: Spring Boot

---

## Índice

1. [Princípio central](#1-princípio-central)
2. [Estrutura de pacotes obrigatória](#2-estrutura-de-pacotes-obrigatória)
3. [Camada domain — o que entra e o que não entra](#3-camada-domain--o-que-entra-e-o-que-não-entra)
4. [Portas de entrada — port/in (UseCase)](#4-portas-de-entrada--portin-usecase)
5. [Portas de saída — port/out (Ports)](#5-portas-de-saída--portout-ports)
6. [Service — o orquestrador puro](#6-service--o-orquestrador-puro)
7. [Infraestrutura — onde o mundo externo entra](#7-infraestrutura--onde-o-mundo-externo-entra)
8. [Controller — a borda HTTP](#8-controller--a-borda-http)
9. [Comunicação entre módulos](#9-comunicação-entre-módulos)
10. [Checklist antes de commitar](#10-checklist-antes-de-commitar)

---

## 1. Princípio central

O projeto segue o padrão **Ports & Adapters** (Hexagonal Architecture). A regra é simples: o domínio de negócio não conhece nenhuma tecnologia. Ele não sabe se o banco é MySQL ou PostgreSQL, se a busca usa OpenSearch ou Elasticsearch, se existe HTTP ou mensageria. Toda essa implementação fica na camada de infraestrutura, conectada ao domínio via interfaces (portas).

> **Regra de ouro:** Se você precisar importar algo de `jakarta.persistence`, `org.springframework`, `com.fasterxml.jackson` ou qualquer client HTTP dentro de um `Service`, algo está errado. Esse import pertence à infraestrutura.

**✓ Correto:** Service depende de interfaces. Infraestrutura implementa essas interfaces. Spring injeta a implementação certa via `@Configuration`.

**✗ Proibido:** Service instancia diretamente um repository JPA, um client HTTP ou qualquer adaptador de tecnologia. `new GoogleBooksClient()` dentro de um service é violação grave.

---

## 2. Estrutura de pacotes obrigatória

Todo módulo de negócio segue exatamente esta estrutura. Não invente variações — a consistência entre módulos é o que permite qualquer dev navegar em qualquer parte do código sem surpresa.

```
com.biblioo.{modulo}/
├── domain/
│   ├── model/            ← entidades e value objects
│   ├── port/
│   │   ├── in/           ← interfaces que o módulo expõe (UseCases)
│   │   └── out/          ← interfaces que o módulo precisa (Ports)
│   └── service/          ← implementação das regras de negócio
└── infrastructure/
    ├── persistence/      ← adapters de banco (JPA, JDBC)
    ├── search/           ← adapters de busca (OpenSearch)
    ├── external/         ← adapters de APIs externas (Google Books)
    ├── messaging/        ← adapters de mensageria (RabbitMQ)
    ├── web/              ← controllers REST + DTOs + mappers
    └── config/           ← @Configuration, injeção de dependências
```

**Regra de nomenclatura:** Adapters sempre terminam em `Adapter`. Use Cases terminam em `UseCase`. Ports de saída terminam em `Port`. Services terminam em `Service`. Controllers terminam em `Controller`.

---

## 3. Camada domain — o que entra e o que não entra

### Permitido em `domain/model`

- Entidades JPA (`@Entity`, `@Table`, `@Column`, `@Index`)
- Value Objects simples
- Enums de negócio
- Exceções de negócio
- Hooks de ciclo de vida (`@PrePersist`, `@PreUpdate`)

### Proibido em `domain/`

- Imports de Spring MVC (`@RestController`, `@RequestMapping`)
- `@FeignClient` ou qualquer client HTTP
- Classes de DTO de request/response
- Anotações Jackson em entidades (`@JsonIgnore`, `@JsonProperty`)
- Imports de `infrastructure.*` de qualquer módulo

### Exemplo correto — entidade Book

```java
// domain/model/Book.java
@Entity
@Table(name = "books", indexes = {
    @Index(name = "idx_isbn",    columnList = "isbn"),
    @Index(name = "idx_title",   columnList = "title"),
    @Index(name = "idx_created", columnList = "created_at")
})
public class Book {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20, unique = true)
    private String isbn;

    @Column(nullable = false, length = 500)
    private String title;

    @ElementCollection
    @CollectionTable(name = "book_authors",
        joinColumns = @JoinColumn(name = "book_id"))
    @Column(name = "author")
    private List<String> authors;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    private String description;

    // ... demais campos

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
```

> **✗ Proibido em entidades:** Nunca coloque `@JsonIgnore`, `@JsonProperty` ou qualquer anotação de serialização HTTP em entidades de domínio. Serialização é responsabilidade do DTO na camada `infrastructure/web`.

---

## 4. Portas de entrada — port/in (UseCase)

Uma interface em `port/in` declara _tudo que o módulo oferece ao mundo externo_. Controllers, outros módulos e testes se comunicam exclusivamente por essa interface — nunca pela implementação concreta do Service.

```java
// domain/port/in/BookUseCase.java
public interface BookUseCase {

    List<Book> search(String query);

    List<Book> suggest(String query);

    Book getById(Long id);

    Book getByIsbn(String isbn);
}
```

**✓ Regra:** Se você precisar expor uma nova operação para o mundo externo, declare-a aqui primeiro. O Controller nunca injeta `BookService` diretamente — ele injeta `BookUseCase`.

**✗ Anti-padrão:** Adicionar métodos internos (helpers, validações privadas) na interface UseCase. UseCase expõe apenas o contrato público do módulo.

---

## 5. Portas de saída — port/out (Ports)

Uma interface em `port/out` declara _tudo que o módulo precisa de fora_. Se o módulo precisa persistir, buscar em índice ou chamar API externa, essas dependências são declaradas aqui como interfaces. O Service nunca sabe _como_ elas são implementadas.

```java
// domain/port/out/BookRepositoryPort.java
public interface BookRepositoryPort {
    Optional<Book> findByIsbn(String isbn);
    Optional<Book> findById(Long id);
    List<Book> saveAll(List<Book> books);
    long count();
    List<Book> findAll();
}

// domain/port/out/BookSearchPort.java
public interface BookSearchPort {
    List<Book> search(String query);
    List<Book> suggest(String query);
    void index(Book book);
    void indexAll(List<Book> books);
    long count();
}

// domain/port/out/ExternalBookProviderPort.java
public interface ExternalBookProviderPort {
    List<Book> search(String query);
}
```

**Regra de granularidade:** Uma port por responsabilidade. Não misture operações de persistência com operações de busca em uma mesma interface. Se a implementação precisar ser trocada de forma independente, ela precisa de uma porta própria.

---

## 6. Service — o orquestrador puro

O Service implementa o UseCase e usa somente as ports de saída. Ele contém toda a regra de negócio. Não tem anotação de framework que implique tecnologia. Não sabe nada sobre HTTP, JSON, banco de dados ou mensageria.

```java
// domain/service/BookService.java
public class BookService implements BookUseCase {

    private final BookRepositoryPort repository;
    private final BookSearchPort search;
    private final ExternalBookProviderPort external;

    // injeção via construtor — sem @Autowired no domínio
    public BookService(
        BookRepositoryPort repository,
        BookSearchPort search,
        ExternalBookProviderPort external
    ) {
        this.repository = repository;
        this.search     = search;
        this.external   = external;
    }

    @Override
    public List<Book> search(String query) {
        var local = search.search(query);

        if (isLowQuality(local)) {
            var externalBooks = external.search(query);
            var newBooks = filterNew(externalBooks);
            repository.saveAll(newBooks);
            newBooks.forEach(search::index);
            return merge(local, externalBooks);
        }

        return local;
    }

    private boolean isLowQuality(List<Book> results) {
        return results.isEmpty() || results.size() < 3;
    }

    // ...
}
```

**✗ Erros graves a evitar no Service:**

- `@Service` não é proibida, mas `@Repository`, `@FeignClient`, `@RestController` são proibidas aqui.
- Nunca use `new` para instanciar um adaptador de infraestrutura dentro do service.
- Nunca trate `HttpStatus`, `ResponseEntity` ou qualquer conceito HTTP dentro do service.
- Nunca chame `userService.getUser()` de outro módulo diretamente. Use uma `Port`.

---

## 7. Infraestrutura — onde o mundo externo entra

Cada tecnologia externa tem seu próprio adapter, que implementa exatamente uma porta de saída do domínio. Adapters podem usar qualquer framework ou biblioteca necessária — é a única camada onde isso é permitido.

### persistence/ — adapter de banco

```java
// infrastructure/persistence/MySqlBookRepositoryAdapter.java
@Component
public class MySqlBookRepositoryAdapter implements BookRepositoryPort {

    private final BookJpaRepository jpa; // interface Spring Data

    public MySqlBookRepositoryAdapter(BookJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Optional<Book> findByIsbn(String isbn) {
        return jpa.findByIsbn(isbn);
    }

    @Override
    public List<Book> saveAll(List<Book> books) {
        return jpa.saveAll(books);
    }

    @Override
    public long count() { return jpa.count(); }

    @Override
    public List<Book> findAll() { return jpa.findAll(); }
}
```

### search/ — adapter de busca

```java
// infrastructure/search/OpenSearchBookAdapter.java
@Component
public class OpenSearchBookAdapter implements BookSearchPort {

    private final OpenSearchClient client;

    @Override
    public List<Book> search(String query) {
        // monta query OpenSearch, retorna List<Book>
    }

    @Override
    public void index(Book book) {
        // converte Book → documento e indexa
    }
}
```

### external/ — adapter de API externa

```java
// infrastructure/external/GoogleBooksAdapter.java
@Component
public class GoogleBooksAdapter implements ExternalBookProviderPort {

    private final RestTemplate http;

    @Override
    public List<Book> search(String query) {
        // chama API do Google, mapeia resposta → List<Book>
    }
}
```

**Responsabilidade de mapeamento:** O adapter recebe dados brutos da tecnologia (row SQL, documento JSON, resposta HTTP) e retorna objetos do domínio (`Book`, etc.). O mapeamento reverso também é responsabilidade do adapter. O domínio nunca conhece formatos externos.

### config/ — wiring Spring

```java
// infrastructure/config/BookConfig.java
@Configuration
public class BookConfig {

    @Bean
    public BookUseCase bookUseCase(
        BookRepositoryPort repository,
        BookSearchPort search,
        ExternalBookProviderPort external
    ) {
        return new BookService(repository, search, external);
    }
}
```

---

## 8. Controller — a borda HTTP

O controller fica em `infrastructure/web/`. Ele traduz requisição HTTP → UseCase → resposta HTTP. Não contém regra de negócio. Não injeta repository. Não injeta service concreto.

```java
// infrastructure/web/BookController.java
@RestController
@RequestMapping("/v1/books")
public class BookController {

    private final BookUseCase bookUseCase; // ← interface, nunca o Service concreto

    public BookController(BookUseCase bookUseCase) {
        this.bookUseCase = bookUseCase;
    }

    @GetMapping("/search")
    public ResponseEntity<List<BookResponse>> search(
        @RequestParam @NotBlank @Size(min = 2, max = 100) String q
    ) {
        var books = bookUseCase.search(q);
        return ResponseEntity.ok(books.stream()
            .map(BookMapper::toResponse)
            .toList());
    }

    @GetMapping("/suggest")
    public ResponseEntity<List<BookSuggestResponse>> suggest(
        @RequestParam @NotBlank @Size(min = 2) String q
    ) {
        var books = bookUseCase.suggest(q);
        return ResponseEntity.ok(books.stream()
            .map(BookMapper::toSuggestResponse)
            .toList());
    }
}
```

### DTOs ficam em `infrastructure/web/dto/`

```java
// BookResponse.java — DTO de saída
public record BookResponse(
    Long         id,
    String       isbn,
    String       title,
    List<String> authors,
    String       coverUrl,
    Integer      pageCount,
    String       publishedAt
) {}

// BookMapper.java — conversão entidade → DTO
public class BookMapper {
    public static BookResponse toResponse(Book book) {
        return new BookResponse(
            book.getId(), book.getIsbn(), book.getTitle(),
            book.getAuthors(), book.getCoverUrl(),
            book.getPageCount(),
            book.getPublishedAt() != null
                ? book.getPublishedAt().toString() : null
        );
    }
}
```

**✗ Proibido no Controller:**

- Retornar a entidade de domínio diretamente na resposta HTTP.
- Implementar qualquer lógica de negócio (cálculos, validações de regra, decisões condicionais baseadas em estado).
- Injetar qualquer coisa que não seja um UseCase ou um componente de infraestrutura web (ex: cookie handler, auth context).

---

## 9. Comunicação entre módulos

Módulos se comunicam exclusivamente por contrato. Nunca importando entidades uns dos outros. A dependência vai sempre de nível alto para nível baixo.

| Nível | Módulo  | Depende de                                              |
|-------|---------|--------------------------------------------------------|
| 0     | `books` | Nenhum módulo de negócio                               |
| 0     | `auth`  | Nenhum módulo de negócio                               |
| 2     | `shelf` | `books` (via BookDataPort) · `auth` (via JWT)          |

### Referência por ID

Se uma entidade precisa de referência a algo de outro módulo, usa apenas o ID. Nunca o objeto completo.

```java
// domain/model/ShelfItem.java — referência a Book via ID apenas
public class ShelfItem {
    private Long id;
    private Long userId;   // referência ao módulo AUTH — só o ID
    private Long bookId;   // referência ao módulo BOOKS — só o ID
    // ...
}
```

### Dados de outro módulo via Port

Quando um service precisa de um campo de outro módulo, declara uma port de saída que retorna um DTO mínimo com só o necessário.

```java
// domain/port/out/BookDataPort.java (declarado no módulo SHELF)
public interface BookDataPort {
    BookData getById(Long bookId);
    boolean existsById(Long bookId);
}

// DTO mínimo — só o necessário para SHELF
public record BookData(Long id, String title, Integer pageCount) {}

// infrastructure/persistence/BookDataAdapter.java
@Component
public class BookDataAdapter implements BookDataPort {

    private final BookJpaRepository bookRepo;

    @Override
    public BookData getById(Long bookId) {
        return bookRepo.findById(bookId)
            .map(b -> new BookData(b.getId(), b.getTitle(), b.getPageCount()))
            .orElseThrow(() -> new BookNotFoundException(bookId));
    }

    @Override
    public boolean existsById(Long bookId) {
        return bookRepo.existsById(bookId);
    }
}
```

**✗ Nunca fazer entre módulos:**

- `import com.biblioo.books.domain.model.Book` dentro do módulo `shelf`.
- `@ManyToOne User user` dentro de uma entidade de outro módulo.
- Chamar diretamente `bookService.getBook()` de outro módulo — use uma Port.

---

## 10. Checklist antes de commitar

| Verificação | Esperado |
|---|---|
| Imports no Service | Apenas `domain.model`, `domain.port` e `java.*` |
| Imports no Controller | Apenas `port/in` (UseCase), DTOs e Spring MVC |
| Imports nos Adapters | `port/out` + biblioteca da tecnologia. Nenhum import entre módulos de negócio |
| Entidade retornada no endpoint | Nunca — sempre via DTO |
| Referência entre módulos | Apenas por ID (`Long bookId`, nunca `Book book`) |
| Tecnologia citada no domínio | Nenhuma. Nenhum import de JPA, HTTP client, OpenSearch dentro de `service/` |
| Nova funcionalidade pública | Declarada primeiro em `port/in`, depois implementada no Service |
| Nova dependência externa | Declarada primeiro em `port/out`, depois implementada em `infrastructure/` |

> **Teste rápido de acoplamento:** Se você deletar toda a pasta `infrastructure/` e o código ainda compilar (com erros de "interface não implementada", mas sem erros de "classe não encontrada"), a arquitetura está correta. O domínio não depende de nenhuma implementação concreta.

---

*Biblioo · Documentação Interna · v1.0 · Confidencial*
