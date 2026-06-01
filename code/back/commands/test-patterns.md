---
name: test-patterns
description: "Use quando fornecer um controller e pedir testes; criar arquivo de teste do zero; ou mencionar 'testes', 'specs', 'cobertura', 'como testamos'. NÃO use para perguntas conceituais ou correções pontuais em testes existentes."
---

## Estado atual

**45 testes K6** em `performance-tests/`

---

## 1. Stack

**K6 (padrão existente — performance):** `http`, `check`, `sleep`, `SharedArray`, `uuidv4`, `Trend`, `Rate`. Executors: `constant-vus` (load), `stages` (spike/stress).

---

## 2. K6 — Estrutura de arquivo

Ordem canônica obrigatória:
1. `import` de libs K6
2. `const CONFIG = { baseUrl, poolSize, password, ...vus, duração, thresholds, resourceIds }`
3. Funções helper (`parseUserId`, `multipart`, `randomItem`, `logWarn`, `logError`)
4. `export function setup()` — auth + criação de pré-estado → retorna `data`
5. `export const options = { scenarios, thresholds }` — SLOs por cenário
6. `export default function(data)` — lógica de VU com `check()` + `sleep(1)`
7. `export function teardown(data)` — limpeza opcional

Nomenclatura: `{resource}-{load|spike|stress}.js` em `performance-tests/{DomainName}/{resource}/`

---

## 3. K6 — Como vasculhar regras de domínio para o setup

Antes de escrever `setup()`, ler nesta ordem:

1. **Controller** → campos obrigatórios, status 2xx esperado por operação
2. **Service/UseCase** → pré-condições de negócio (ex.: `ShelfService` valida ownership; `ReviewService` exige livro na estante)
3. **GlobalExceptionHandler** → qual exceção vira qual status HTTP

**Mapa de pré-estado por recurso (extraído dos services):**

| Recurso | Sequência obrigatória no `setup()` |
|---|---|
| Review | register → login → POST /shelves → POST /shelves/{id}/items (COMPLETED) → pode criar review |
| ShelfItem | register → login → POST /shelves |
| Shelf | register → login |
| Collection | register → login |
| Community | register owner → POST /communities → register members → POST /communities/{id}/join |
| Recommendation | register → login (grafo Neo4j deve ter dados de leitura pré-existentes) |
| DiceRoll | register → login (usuário novo cai no fallback de livros populares) |
| User profile | register → login (público por padrão) |
| DNA Literário | register → login → POST /shelves → POST /shelves/{id}/items ×5 (COMPLETED) → recálculo async via RabbitMQ (GET /dna retorna 200 mesmo em IN_FORMATION) |

**Regras de negócio críticas para o setup:**
- Review: 1 por usuário por livro; livro deve existir na estante com qualquer status; rating 1-5; text ≤ 2000 chars
- Shelf: nome único por usuário; ownership validada antes de qualquer operação
- Follow: perfil público → 204 imediato; perfil privado → 202 (request pendente)
- Auth: `principal.getUsername()` retorna o `userId` como String em todos os controllers autenticados

---

## 4. K6 — Helpers canônicos (extraídos dos testes existentes)

```js
function parseUserId(token) {
  const p = token.split('.')[1];
  const pad = p + '=='.slice((p.length + 2) % 4 || 4);
  const obj = JSON.parse(atob(pad));
  return String(obj.sub || obj.userId || obj.id || obj.user_id);
}

function multipart(fields, boundary = 'Boundary123') {
  let body = '';
  for (const [k, v] of Object.entries(fields))
    body += `\r\n--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}`;
  return { body: body + `\r\n--${boundary}--`, type: `multipart/form-data; boundary=${boundary}` };
}

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function logWarn(msg, x={}) { console.warn(JSON.stringify({level:'WARN',msg,vu:__VU,iter:__ITER,...x})); }
function logError(msg, x={}) { console.error(JSON.stringify({level:'ERROR',msg,vu:__VU,iter:__ITER,...x})); }
```

Usar `multipart()` sempre que o endpoint Spring usa `@RequestParam` (reviews, posts, comentários, uploads). **Nunca** usar `FormData` nativo do K6 com Spring.

---

## 5. K6 — Thresholds e checks obrigatórios

| Tipo | Executor | VUs | Duração | P95 | Falha |
|---|---|---|---|---|---|
| `load` | `constant-vus` | 60 crud + 20 listing | 2 min | 1500ms / 500ms listing | 2% |
| `spike` | `stages` | 50 → 300 → 50 | ~50s | 1000ms | 5% |
| `stress` | `stages` | 20 → 400 gradual | ~4 min | 2000ms | 5% |

Checks por operação: criar (`status === 201` + campo `id` presente), ler (`200`), atualizar (`200`), deletar (`204`), listar (`200` + array). Spike: `|| r.status === 429` nos checks de escrita. Guard no `setup()`: se `users.length < poolSize * 0.5` lançar erro.

---

## 6. K6 — Exemplo canônico (review — recurso com mais pré-condições)

```js
export function setup() {
  const users = [];
  for (let i = 0; i < CONFIG.poolSize; i++) {
    const email = `perf_${uuidv4()}@test.com`;
    const headers = { 'Content-Type': 'application/json' };

    const r1 = http.post(`${CONFIG.baseUrl}/auth/register`,
      JSON.stringify({ username: email.split('@')[0], email, password: CONFIG.password }), { headers });
    if (!check(r1, { 'register 201': r => r.status === 201 })) { logWarn('register falhou', { email }); continue; }

    const r2 = http.post(`${CONFIG.baseUrl}/auth/login`,
      JSON.stringify({ email, password: CONFIG.password }), { headers });
    if (!check(r2, { 'login 200': r => r.status === 200 })) continue;

    const { accessToken } = r2.json();
    const userId = parseUserId(accessToken);
    const auth = { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } };

    // pré-estado obrigatório: shelf + livros com COMPLETED (ReviewService valida)
    const shelf = http.post(`${CONFIG.baseUrl}/shelves`, JSON.stringify({ name: 'Lidos' }), auth);
    const shelfId = shelf.json('id');
    for (const bookId of CONFIG.bookIds)
      http.post(`${CONFIG.baseUrl}/shelves/${shelfId}/items`,
        JSON.stringify({ bookId, initialStatus: 'COMPLETED' }), auth);

    users.push({ accessToken, userId, shelfId });
  }
  if (users.length < CONFIG.poolSize * 0.5) throw new Error(`Setup insuficiente: ${users.length}/${CONFIG.poolSize}`);
  return { users };
}
```

---

> **Atualização:** ao criar novos testes K6, atualizar a tabela de pré-estado (seção 3) com os recursos necessários para o novo domínio.
