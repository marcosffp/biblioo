# ShelfItem — Documentação de Domínio

## 1. Entidade (Visão de Domínio)

`ShelfItem` é o **agregado central de leitura** do Biblioo. Representa o vínculo entre um `User`, um `Book` e uma `Shelf`, carregando todo o ciclo de vida de uma leitura: desde a intenção até a conclusão e avaliação.

**Problemas que resolve:**
- Rastrear progresso de leitura por livro/usuário sem poluir as entidades `Book` ou `User`
- Ser a fonte de verdade para o DNA Literário e o módulo de Recomendação
- Preservar histórico mesmo após remoção lógica

**Campos e responsabilidades:**

| Campo | Responsabilidade |
|---|---|
| `shelfId / bookId` | Chaves de relacionamento — definem o contexto da leitura |
| `status` | Governa o ciclo de vida; determina quais campos são válidos |
| `currentPage / progressPercent` | Progresso atual; `progressPercent` é derivado, nunca editado diretamente |
| `totalPages` | Snapshot do livro no momento da adição — independe de edições futuras no catálogo |
| `startedAt / finishedAt` | Marcadores temporais do ciclo; usados pelo DNA Literário para calcular ritmo |
| `rating / reviewText` | Avaliação pessoal — só válida após `COMPLETED` |
| `deletedAt` | Soft delete; preserva histórico para Identity e Recommendation |

---

## 2. Estados — Semântica e Invariantes

### `WANT_TO_READ`
Intenção registrada, leitura não iniciada.
- `startedAt = null`, `currentPage = 0`, `progressPercent = 0`
- `finishedAt` proibido
- Não alimenta DNA Literário, não gera evento de leitura
- Pode ser fonte da trilha `PENDING_READS` no módulo de Recomendação

### `READING`
Leitura em andamento.
- `startedAt` obrigatório (preenchido na transição)
- `updateProgress()` habilitado
- Gera evento `BOOK_STARTED` em `reader_identity_events`
- `finishedAt` proibido

### `REREADING`
Segunda leitura ou mais de um livro já `COMPLETED`.
- Transição válida **somente a partir de `COMPLETED`**
- `startedAt` é atualizado para o início da nova leitura
- Histórico anterior preservado — o DNA Literário usa múltiplos ciclos para calcular livros favoritos
- Comportamento de progresso idêntico ao `READING`

### `COMPLETED`
Leitura finalizada.
- `finishedAt` obrigatório (preenchido na transição)
- `progressPercent = 100`, `currentPage = totalPages`
- Gera evento `BOOK_FINISHED` — dispara recálculo no Identity e Recommendation
- Habilita `reviewRating()` — única operação que escreve em `rating` e `reviewText`
- Trigger no banco incrementa `reader_count` e recalcula `average_rating` em `books`

### `ABANDONED`
Leitura interrompida sem conclusão.
- `finishedAt` não é preenchido — distingue de `COMPLETED`
- Progresso congela no último valor registrado
- Gera evento próprio no Identity; influencia detecção de padrões negativos (gêneros/autores abandonados)
- Não habilita `reviewRating()`

---

## 3. Máquina de Estados

```
WANT_TO_READ ──► READING ──► COMPLETED ──► REREADING
                    │              │              │
                    └──► ABANDONED │              └──► COMPLETED
                                   └──► ABANDONED
```

**Transições válidas:**

| De → Para | Permitido | Observação |
|---|---|---|
| `WANT_TO_READ` → `READING` | ✅ | Preenche `startedAt` |
| `READING` → `COMPLETED` | ✅ | Preenche `finishedAt`, zera progresso para 100% |
| `READING` → `ABANDONED` | ✅ | Progresso congelado |
| `COMPLETED` → `REREADING` | ✅ | Novo `startedAt`, histórico preservado |
| `ABANDONED` → `READING` | ✅ | Retomada; `startedAt` atualizado |
| `COMPLETED` → `READING` | ❌ | Use `REREADING` — semântica diferente |
| `WANT_TO_READ` → `COMPLETED` | ❌ | Sem `startedAt` — inválido |
| `REREADING` → `WANT_TO_READ` | ❌ | Retrocesso sem significado de negócio |

**Invariante crítica:** nenhuma transição para `COMPLETED` ou `REREADING` é válida sem `startedAt` preenchido.

---

## 4. Operações e Regras de Negócio

### Criar Item
- INSERT único com todos os campos do status inicial já resolvidos
- Se `status = READING`: `startedAt = NOW()` no próprio INSERT
- Validação: `bookId` deve existir em `books`; `shelfId` deve pertencer ao usuário autenticado

### Atualizar Página
- UPDATE cirúrgico — cálculo feito no banco:
```sql
UPDATE shelf_items
SET current_page = :page,
    progress_percent = ROUND((:page / total_pages) * 100)
WHERE id = :id AND status IN ('READING', 'REREADING')
```
- **Edge case:** `total_pages = null` → `progressPercent = null`; frontend exibe barra indeterminada
- **Concorrência:** última escrita vence (last-write-wins); dado o contexto (um usuário, um dispositivo), sem risco real
- **Frontend:** debounce de ~800ms no slider para evitar spam de requests

### Mudar Status
- UPDATE parcial — só os campos do novo status:
```sql
-- Para COMPLETED:
SET status='COMPLETED', finished_at=NOW(), progress_percent=100, current_page=total_pages
```
- Após commit: publica evento assíncrono no RabbitMQ (Identity + Recommendation processam em background)
- **Edge case:** usuário marca `COMPLETED` sem ter atualizado a página — sistema força `current_page = total_pages` na transição

### Avaliar (`reviewRating`)
- Só executável se `status = COMPLETED`
- UPDATE em `rating` e `review_text` — trigger recalcula `average_rating` em `books`
- Idempotente: segunda chamada sobrescreve a avaliação anterior

### Remover (Soft Delete)
- `UPDATE shelf_items SET deleted_at = NOW() WHERE id = :id`
- Item não aparece em queries de listagem (`WHERE deleted_at IS NULL`)
- Registro permanece visível para Identity e Recommendation via queries sem o filtro

---

## 5. Decisões Técnicas

| Decisão | Motivação |
|---|---|
| **Cálculo de progresso no banco** | Elimina roundtrip de leitura; `total_pages` já está na linha; sem risco de divergência entre camadas |
| **Debounce no frontend** | Atualização de página é a operação mais frequente; sem debounce, um slider gera dezenas de requests por segundo |
| **Eventos via RabbitMQ** | DNA Literário e Recomendação são processamentos pesados; desacoplar garante que a latência da escrita não dependa deles |
| **Soft delete** | `deletedAt` preserva histórico para Identity sem complexidade de auditoria externa; queries simples com filtro `IS NULL` |
| **Triggers para `reader_count` / `average_rating`** | Evita agregações `COUNT`/`AVG` em tempo de leitura; incremento atômico garante consistência sem locks na aplicação |

---

## 6. Edge Cases e Consistência

| Cenário | Comportamento esperado |
|---|---|
| `total_pages = null` | `progressPercent = null`; atualização de página ainda permitida; DNA Literário ignora ritmo para este item |
| `COMPLETED` sem atualizar página | Transição força `current_page = total_pages` e `progress_percent = 100` |
| Releitura (`REREADING`) | Novo ciclo `startedAt/finishedAt` não sobrescreve o anterior — Identity lê todos os eventos de `reader_identity_events` |
| Reversão `COMPLETED → READING` | Bloqueada; o caminho correto é `COMPLETED → REREADING` para preservar semântica e histórico |
| Atualização concorrente de página | Last-write-wins; contexto single-user torna conflito improvável; sem necessidade de locking otimista |
| Item removido e recomendado | Recommendation filtra `deleted_at IS NULL` ao exibir; Identity mantém o histórico independente do soft delete |