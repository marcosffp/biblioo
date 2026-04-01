# ARCHITECTURE.md — Guia de Organização do Projeto Biblioo

> Este documento define a estrutura de pastas, convenções e contratos arquiteturais que **toda IA e todo desenvolvedor** deve seguir ao criar, modificar ou remover módulos do projeto.

---

## Visão Geral

O projeto adota uma **arquitetura modular por domínio** inspirada em Ports & Adapters (Hexagonal Architecture). Cada domínio funcional (ex.: `books`, `users`, `recommendations`) vive de forma **isolada e independente**: pode ser adicionado, modificado ou removido sem impactar os demais, desde que os contratos de porta sejam respeitados.

```
src/
└── main/
    └── java/com/biblioo/
        ├── books/
        ├── users/
        ├── recommendations/
        └── <novo-domínio>/
```

Cada módulo segue **exatamente a mesma estrutura interna** descrita abaixo.

---

## Estrutura Interna de um Módulo

```
<módulo>/
├── domain/
│   ├── model/
│   ├── exception/
│   ├── service/
│   └── port/
│       ├── in/          ← Contratos de ENTRADA (o que o módulo PRECISA receber)
│       └── out/         ← Contratos de SAÍDA (o que o módulo OFERECE a outros)
└── infrastructure/
    ├── config/
    ├── dto/
    │   └── mapper/
    ├── external/
    ├── persistence/
    ├── search/
    └── web/
```

---

## Detalhamento de Cada Camada

### `domain/model/`
Entidades e value objects do domínio. Sem dependências de frameworks externos.

```
domain/model/
├── Book.java        ← @Entity JPA com índices, @PrePersist, relacionamentos
└── Category.java    ← @Entity com relacionamento @ManyToMany bidirecional
```

**Regras:**
- Classes anotadas com `@Entity` vivem aqui.
- Nenhuma lógica de negócio complexa — apenas estrutura de dados e hooks de ciclo de vida (`@PrePersist`).
- Sem imports de `infrastructure.*`.

---

### `domain/exception/`
Exceções de negócio do módulo, sempre `RuntimeException`.

```
domain/exception/
└── BookNotFoundException.java   ← throw quando o recurso não é encontrado
```

**Regras:**
- Uma classe por tipo de erro de negócio.
- Mensagens em português (padrão do projeto).
- Nunca lançar exceções genéricas (`RuntimeException` pura) nos services — crie uma exception específica aqui.

---

### `domain/service/`
Lógica de negócio orquestrada. Implementa as interfaces de `port/in/`.

```
domain/service/
├── BookService.java         ← Implementa BookUseCase; orquestra busca em camadas
└── BookEnrichService.java   ← Separado para suportar @Async (evita self-invocation do Spring AOP)
```

**Regras:**
- Depende apenas de `port/in/` e `port/out/` — **nunca** importa classes de `infrastructure/` diretamente.
- Se um método precisa ser `@Async`, ele **deve** estar em um bean separado (ver `BookEnrichService`).
- `@Transactional` fica nos services, nunca nos controllers.
- Cache (`@Cacheable`) fica nos use cases dos services, não nos controllers.

---

### `domain/port/in/` — Contratos de Entrada

> **"O que este módulo precisa receber / expõe para ser usado."**

```
domain/port/in/
└── BookUseCase.java    ← Interface com search(), suggest(), getById()
```

**Regras:**
- Sempre uma **interface Java**.
- Define o contrato público do módulo para o mundo externo (controllers, outros módulos).
- Parâmetros e retornos usam **tipos do domínio** (`Book`, `List<Book>`), nunca DTOs de infraestrutura.
- Nenhuma anotação de framework aqui.

```java
// Exemplo correto
public interface BookUseCase {
    List<Book> search(String query);
    List<Book> suggest(String query);
    Book getById(Long id);
}
```

---

### `domain/port/out/` — Contratos de Saída

> **"O que este módulo oferece / precisa de outros módulos ou sistemas externos."**

```
domain/port/out/
├── BookRepositoryPort.java      ← Contrato para persistência (implementado por BookRepository)
├── BookSearchPort.java          ← Contrato para busca full-text (implementado por OpenSearchBookAdapter)
└── ExternalBookProviderPort.java ← Contrato para API externa (implementado por GoogleBooksAdapter)
```

**Regras:**
- Sempre uma **interface Java**.
- O domínio **nunca** depende das implementações — apenas das interfaces `out`.
- As implementações vivem em `infrastructure/`.
- Permite trocar o banco, o mecanismo de busca ou a API externa **sem tocar no domínio**.

```java
// Exemplo correto
public interface BookSearchPort {
    List<Book> search(String query);
    List<Book> suggest(String query);
    void indexAll(List<Book> books);
}
```

---

### `infrastructure/config/`
Configurações técnicas do Spring e bibliotecas.

```
infrastructure/config/
├── AsyncConfig.java        ← ThreadPoolTaskExecutor dedicado (bookEnrichExecutor)
├── CacheConfig.java        ← RedisCacheManager com TTL por cache + CacheErrorHandler resiliente
└── OpenSearchConfig.java   ← OpenSearchClient com timeouts e keep-alive configurados
```

**Regras:**
- Apenas `@Configuration`, `@Bean`, `@Value` — sem lógica de negócio.
- Cada tecnologia tem seu próprio arquivo de config.
- Timeouts e pool sizes como constantes nomeadas, nunca magic numbers inline.

---

### `infrastructure/persistence/`
Acesso ao banco de dados relacional.

```
infrastructure/persistence/
└── BookRepository.java    ← JpaRepository + queries customizadas com @Query
```

**Regras:**
- Implementa a interface `port/out/BookRepositoryPort` (ou equivalente do módulo).
- Queries JPQL com `@Query` para operações não triviais.
- Retorne `Set<String>` para checagens de existência em lote (O(1) contains).
- `findByTitleContainingIgnoreCase` para fallback de busca quando OpenSearch está indisponível.

---

### `infrastructure/search/`
Adaptadores para motores de busca (ex.: OpenSearch, Elasticsearch).

```
infrastructure/search/
└── OpenSearchBookAdapter.java    ← Implementa BookSearchPort; indexação e busca full-text
```

**Regras:**
- Implementa a interface `port/out/BookSearchPort`.
- Trata erros de conectividade com fallback silencioso (nunca lança para o domínio sem tratamento).
- Separado de `persistence/` pois representa um sistema de busca, não de persistência primária.

---

### `infrastructure/external/`
Adaptadores para APIs e serviços externos.

```
infrastructure/external/
└── GoogleBooksAdapter.java    ← Implementa ExternalBookProviderPort; busca na API do Google Books
```

**Regras:**
- Implementa a interface `port/out/ExternalBookProviderPort`.
- Usa `RetryTemplate` para resiliência em chamadas HTTP.
- Cache com `@Cacheable("google-books")` para evitar chamadas duplicadas.
- Nunca retorna exceções HTTP para o domínio — converte para tipos do domínio ou retorna lista vazia.

---

### `infrastructure/web/`
Controllers REST. Ponto de entrada HTTP do módulo.

```
infrastructure/web/
└── BookController.java    ← @RestController; delega para BookUseCase (port/in)
```

**Regras:**
- Depende **apenas** de `port/in/` — nunca dos services diretamente.
- Validações simples de entrada (null, blank) ficam aqui; validações de negócio ficam nos services.
- Retorna `ResponseEntity<DTO>` — nunca entidades do domínio diretamente.
- Sem `@Transactional` nos controllers.

---

### `infrastructure/dto/` e `infrastructure/dto/mapper/`
Objetos de transferência de dados e seus mapeadores.

```
infrastructure/dto/
├── BookResponse.java           ← DTO de saída para o cliente
├── BookSuggestResponse.java    ← DTO de autocomplete (mais leve)
└── mapper/
    └── BookMapper.java         ← Mapeia Book → BookResponse / BookSuggestResponse
```

**Regras:**
- DTOs são imutáveis (records ou classes com final fields).
- Mappers com MapStruct ou método manual — sem lógica de negócio.
- Nunca exponha entidades JPA diretamente na API.

---

## Fluxo de Dependências (Regra de Ouro)

```
web → port/in ← service → port/out ← infrastructure (persistence / search / external)
```

Ou seja:

- `web` conhece `port/in` ✅
- `service` conhece `port/in` e `port/out` ✅
- `infrastructure` implementa `port/out` ✅
- **Ninguém** do domínio conhece `infrastructure` diretamente ❌

---

## Como Adicionar um Novo Módulo

Exemplo: módulo `users`.

```bash
mkdir -p src/main/java/com/biblioo/users/{domain/{model,exception,service,port/{in,out}},infrastructure/{config,dto/mapper,external,persistence,search,web}}
```

Passos obrigatórios:

1. Criar a entidade em `domain/model/`.
2. Criar a(s) interface(s) em `domain/port/in/` (o que o módulo expõe).
3. Criar a(s) interface(s) em `domain/port/out/` (o que o módulo precisa de infraestrutura).
4. Implementar o service em `domain/service/` implementando `port/in/`.
5. Implementar os adaptadores em `infrastructure/` implementando `port/out/`.
6. Criar DTOs em `infrastructure/dto/` e mapper em `dto/mapper/`.
7. Criar o controller em `infrastructure/web/` dependendo apenas de `port/in/`.
8. Registrar configurações técnicas em `infrastructure/config/` se necessário.

---

## Como Remover um Módulo

Como cada módulo é isolado, a remoção é segura se:

1. Nenhum outro módulo importa classes deste módulo diretamente (apenas via `port/out` dele).
2. As referências em `port/out` de outros módulos que dependiam deste são removidas ou substituídas.
3. O módulo não compartilha tabelas JPA com outros módulos (verificar `@JoinTable`).

**Checklist de remoção:**
- [ ] Remover a pasta do módulo inteira.
- [ ] Remover beans do módulo em arquivos de config globais (se existirem).
- [ ] Remover referências de cache no `CacheConfig` global.
- [ ] Remover migrations de banco relacionadas ao módulo.
- [ ] Verificar se algum `port/out` de outro módulo referenciava tipos deste.

---

## Convenções de Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Entidade | `<Domínio>.java` | `Book.java` |
| Exceção | `<Domínio>NotFoundException.java` | `BookNotFoundException.java` |
| Use Case (port/in) | `<Domínio>UseCase.java` | `BookUseCase.java` |
| Port de saída | `<Domínio><Recurso>Port.java` | `BookSearchPort.java` |
| Service | `<Domínio>Service.java` | `BookService.java` |
| Service auxiliar | `<Domínio><Função>Service.java` | `BookEnrichService.java` |
| Repository | `<Domínio>Repository.java` | `BookRepository.java` |
| Adapter externo | `<Provedor>Adapter.java` | `GoogleBooksAdapter.java` |
| Adapter de busca | `<Motor><Domínio>Adapter.java` | `OpenSearchBookAdapter.java` |
| Controller | `<Domínio>Controller.java` | `BookController.java` |
| DTO de resposta | `<Domínio>Response.java` | `BookResponse.java` |
| DTO específico | `<Domínio><Função>Response.java` | `BookSuggestResponse.java` |
| Mapper | `<Domínio>Mapper.java` | `BookMapper.java` |
| Config | `<Tecnologia>Config.java` | `CacheConfig.java` |

---

## Configurações Globais de Infraestrutura

Algumas configurações são **transversais** a todos os módulos e vivem fora de qualquer módulo específico:

```
infrastructure/config/
├── AsyncConfig.java       ← Executors assíncronos por módulo
├── CacheConfig.java       ← Redis com TTL por cache, error handler resiliente, RetryTemplate
└── OpenSearchConfig.java  ← Cliente OpenSearch com timeouts
```

**Regra:** Se a configuração serve a mais de um módulo, ela fica no `config/` global. Se é específica de um módulo, fica no `config/` interno daquele módulo.

---

## Estratégias de Resiliência (Padrão do Projeto)

Todos os módulos devem seguir as estratégias já estabelecidas:

| Camada | Estratégia | Implementação |
|--------|-----------|---------------|
| Cache | Fail-silent com evict de chave corrompida | `CacheConfig.errorHandler()` |
| Cache | TTL diferente por tipo de dado | `CacheConfig.cacheManager()` |
| HTTP externo | Retry com backoff exponencial (3x: 300ms→600ms→1200ms) | `CacheConfig.retryTemplate()` |
| Async | CallerRunsPolicy quando fila cheia | `AsyncConfig.bookEnrichExecutor()` |
| Busca | Fallback OpenSearch → DB → API externa | `BookService.search()` |
| Persistência | Deduplicação por ISBN antes de salvar em lote | `BookEnrichService.filterExisting()` |

---

## Caches Disponíveis

| Cache | TTL | Propósito |
|-------|-----|-----------|
| `book-search` | 5 min | Resultados de busca (OpenSearch / Google Books) |
| `book-suggest` | 10 min | Autocomplete (muda pouco entre requisições) |
| `google-books` | 10 min | Evita chamadas duplicadas à API externa |

Ao criar caches para novos módulos, registrá-los no `CacheConfig.cacheManager()` com TTL adequado ao padrão de atualização dos dados.

---

## Índices de Banco Obrigatórios

Toda entidade deve declarar explicitamente seus índices no `@Table`:

```java
@Table(
    name = "books",
    indexes = {
        @Index(name = "idx_isbn",         columnList = "isbn"),
        @Index(name = "idx_title",        columnList = "title"),
        @Index(name = "idx_created_at",   columnList = "created_at")
        // Adicionar índices para colunas usadas em WHERE, ORDER BY ou JOIN
    }
)
```

**Regra:** Toda coluna usada em `findBy*`, `@Query WHERE`, ou `ORDER BY` deve ter índice declarado.

---

*Última atualização: gerado automaticamente com base na estrutura do módulo `books` como módulo de referência