# DNA Literário

Perfil de leitura calculado automaticamente a partir do histórico do usuário. Requer mínimo de **5 livros concluídos** para ser gerado.

---

## Status

| Status | Significado |
|---|---|
| `IN_FORMATION` | Menos de 5 livros concluídos |
| `COMPUTING` | Recalculando após novo evento |
| `COMPUTED` | Perfil disponível |

---

## Entidades

### `LiteraryDna` — Perfil principal

| Campo | Tipo | Descrição |
|---|---|---|
| `userId` | Long | Identificador do usuário (único) |
| `status` | DnaStatus | IN_FORMATION / COMPUTING / COMPUTED |
| `booksReadCount` | Integer | Total de livros concluídos |
| `complexityScore` | Double | Pontuação de complexidade (0–100) |
| `complexityLabel` | String | Rótulo textual do complexityScore |
| `avgDaysPerBook` | Double | Média de dias por livro |
| `rereadRate` | Double | Taxa de releitura (0–100%) |
| `rereadCount` | Integer | Total de releituras |
| `abandonedCount` | Integer | Total de livros abandonados |
| `centralThemesJson` | JSON Array | Top 7 temas — `[{ theme, percentage }]` |
| `dominantArchetype` | Enum | Arquétipo principal |
| `secondaryArchetypesJson` | JSON Array | Até 2 arquétipos secundários |
| `mostAbandonedGenre` | String | Gênero mais abandonado (mín. 3 abandonos) |
| `avgTimePerBookDays` | Double | Alias de `avgDaysPerBook` |
| `pendingArchetype` | Enum | Arquétipo candidato a nova fase |
| `pendingArchetypeMonthsCount` | Integer | Meses consecutivos com esse arquétipo |
| `calculatedAt` | LocalDateTime | Última vez que foi calculado |

### `DnaSnapshot` — Registro mensal

| Campo | Tipo |
|---|---|
| `userId` | Long |
| `snapshotYear` / `snapshotMonth` | Integer |
| `dominantArchetype` | LiteraryArchetype |
| `complexityScore` | Double |
| `booksReadCount` | Integer |
| `snapshotDataJson` | JSON (DNA completo serializado) |

### `LiteraryPhase` — Período de leitura

| Campo | Tipo |
|---|---|
| `userId` | Long |
| `generatedName` | String (ex: "Releitor 2024") |
| `customName` | String (nome definido pelo usuário) |
| `dominantArchetype` | LiteraryArchetype |
| `startYear` / `startMonth` | Integer |
| `endYear` / `endMonth` | Integer (null = fase ativa) |

---

## Arquétipos

| Enum | Label |
|---|---|
| `DISCOVERY_READER` | Leitor em Descoberta (fallback) |
| `GENRE_DEVOTEE` | Devoto do Gênero |
| `CLASSICS_SCHOLAR` | Erudito Clássico |
| `COMPULSIVE_READER` | Leitor Compulsivo |
| `ECLECTIC_READER` | Leitor Eclético |
| `RE_READER` | Releitor |
| `EMOTIONAL_READER` | Leitor Emocional |
| `EXPLORER` | Explorador |

---

## Cálculos (`DnaCalculationService`)

Fonte de dados: `BookReadingRecord` (módulo books) + `ReviewRecord` (módulo feed).

### Complexidade
- Média ponderada dos `complexityScore` dos livros.
- Livros dos últimos 6 meses têm peso 1.5×.
- Label: `≤25` → leitura leve · `≤50` → popular · `≤75` → literário moderado · `>75` → denso/experimental.

### Temas Centrais
- Considera apenas categorias presentes em ≥ 3 livros.
- Peso por categoria = maior rating de um livro com essa categoria.
- Ordenação: frequência DESC, depois rating DESC.
- Limita a top 7; retorna percentual em relação ao total de livros.

### Ritmo de Leitura
- `avgDaysPerBook` = média de dias entre `startedAt` e `finishedAt`.
- `rereadRate` = (total de releituras / livros concluídos) × 100.
- `mostAbandonedGenre` = categoria mais frequente entre abandonados (mín. 3 abandonos).

### Arquétipo Dominante (ordem de prioridade)
1. `RE_READER` — rereadRate ≥ 30%
2. `GENRE_DEVOTEE` — tema dominante > 50%
3. `ECLECTIC_READER` — tema dominante < 20% E ≥ 5 temas distintos
4. `CLASSICS_SCHOLAR` — complexityScore > 70
5. `COMPULSIVE_READER` — avgDays < 5 E totalBooks ≥ 10
6. `DISCOVERY_READER` (fallback)

### Arquétipos Secundários (até 2, excluindo o dominante)
| Arquétipo | Condição |
|---|---|
| `RE_READER` | rereadRate ≥ 15% |
| `CLASSICS_SCHOLAR` | complexity > 60 |
| `COMPULSIVE_READER` | avgDays < 7 E totalBooks ≥ 5 |
| `GENRE_DEVOTEE` | tema dominante > 35% |

---

## Gatilhos de Recálculo (RabbitMQ)

Fila: `biblioo.dna.recalculation` — vinculada a:
- `shelf.reading.completed`
- `shelf.reading.abandoned`
- `feed.review.rating.updated`

Todos os eventos são deduplicados via `DnaEventLogRepository` (INSERT IGNORE por `event_id`).

---

## Snapshots e Fases (Scheduler)

Cron: `0 0 1 1 * *` — executa no dia 1 de cada mês.

- Cria snapshot do mês anterior para todo DNA com status `COMPUTED`.
- **Nova fase** criada se o mesmo arquétipo dominar por 3 meses consecutivos.
- **Fase encerrada** se o arquétipo mudar e o novo dominar 2 meses consecutivos.

---

## Endpoints

### `GET /dna`
Retorna o perfil do usuário autenticado.

**Se IN\_FORMATION / COMPUTING → `DnaProgressResponse`:**
```json
{
  "booksRead": 3,
  "booksRequired": 5,
  "message": "Você precisa de 2 livros para gerar seu DNA Literário."
}
```

**Se COMPUTED → `DnaResponse`:**
```json
{
  "userId": 1,
  "status": "COMPUTED",
  "booksReadCount": 12,
  "complexityScore": 68.4,
  "complexityLabel": "literário moderado",
  "avgDaysPerBook": 8.3,
  "rereadRate": 16.7,
  "rereadCount": 2,
  "abandonedCount": 1,
  "centralThemes": [{ "theme": "fantasia", "percentage": 41.7 }],
  "dominantArchetype": "RE_READER",
  "dominantArchetypeLabel": "Releitor",
  "secondaryArchetypes": ["CLASSICS_SCHOLAR"],
  "mostAbandonedGenre": "romance",
  "calculatedAt": "2026-05-01T00:00:00"
}
```

---

### `GET /dna/snapshots`
Lista snapshots mensais do usuário, ordenados por data DESC.

```json
[
  {
    "id": 1,
    "snapshotYear": 2026,
    "snapshotMonth": 4,
    "dominantArchetype": "RE_READER",
    "dominantArchetypeLabel": "Releitor",
    "complexityScore": 68.4,
    "booksReadCount": 12,
    "createdAt": "2026-05-01T00:00:00"
  }
]
```

---

### `GET /dna/phases`
Lista fases literárias do usuário, ordenadas por data DESC.

```json
[
  {
    "id": 1,
    "displayName": "Minha fase clássica",
    "generatedName": "Erudito Clássico 2025",
    "customName": "Minha fase clássica",
    "dominantArchetype": "CLASSICS_SCHOLAR",
    "dominantArchetypeLabel": "Erudito Clássico",
    "startYear": 2025, "startMonth": 3,
    "endYear": 2025, "endMonth": 11,
    "isOngoing": false,
    "createdAt": "2025-12-01T00:00:00"
  }
]
```

---

### `PATCH /dna/phases/{phaseId}/name`
Renomeia uma fase literária.

**Request:**
```json
{ "customName": "Minha fase de descoberta" }
```

**Response:** mesmo formato de `LiteraryPhaseResponse` acima.
