# Criar testes de performance para um controller

Gera os 3 arquivos K6 padrão (`load`, `spike`, `stress`) para um controller REST, seguindo exatamente a estrutura dos testes existentes em `performance-tests/`.

**Argumento obrigatório:** `{DomainName}/{resourceName}` (ex.: `DomainBook/shelfItem`, `DomainFeed/review`, `DomainRecommendation/recommendation`)

---

## Contexto dos testes existentes

- **Framework:** K6 (JavaScript) — não JMeter, não Jest
- **Diretório raiz:** `performance-tests/`
- **Estrutura:** `performance-tests/{DomainName}/{resource}/{resource}-{tipo}.js`
- **Tipos criados sempre:** `load`, `spike`, `stress`
- **Tipo opcional:** `concurrency` — apenas para endpoints com WebSocket/STOMP em tempo real
- **Base URL hardcoded:** `http://localhost:8080`
- **Senha fixa:** `'senha12345'`
- **Autenticação:** JWT Bearer obtido via `POST /auth/register` + `POST /auth/login` no `setup()`

---

## Passos

### 0. Capturar o argumento e levantar informações

Derivar de `$ARGUMENTS`:
- `DOMAIN_NAME` = parte antes da `/` (ex.: `DomainRecommendation`)
- `RESOURCE` = parte após a `/` em kebab-case (ex.: `recommendation`)
- `PREFIX_LOAD` = `load{resource}` (ex.: `loadrecommendation`)
- `PREFIX_SPIKE` = `spike{resource}`
- `PREFIX_STRESS` = `stress{resource}`

**Perguntar ao usuário antes de criar qualquer arquivo:**

1. Quais endpoints HTTP o controller expõe? (método + path + corpo da requisição + status de sucesso)
   - Ex.: `POST /recommendations/because-you-read → 200, body: {seedBookTitle, books[]}`
2. Os endpoints exigem autenticação JWT? (quase sempre sim — confirmar se há exceção)
3. O recurso exige setup de dados além de autenticação? (ex.: criar comunidade antes de testar mensagens, criar estante antes de testar itens)
   - Se sim: quais endpoints e em que ordem?
4. O recurso tem endpoint WebSocket/STOMP? (se sim, criar também `{resource}-concurrency.js`)
5. Qual é a natureza dos endpoints?
   - **CRUD completo** (POST + GET + PUT/PATCH + DELETE) → cenários `crud` + `listing`
   - **Somente leitura** (GET/search) → cenários separados por tipo de query
   - **Misto** → ajustar conforme o caso

---

### 1. Criar `{resource}-load.js`

**Localização:** `performance-tests/{DomainName}/{resource}/{resource}-load.js`

**Estrutura obrigatória:**

```javascript
import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 100,                    // ajustar: 100 para a maioria; 50 para setups pesados
  password:     'senha12345',
  prefix:       '{PREFIX_LOAD}',

  load: {
    crudVus:    60,    // VUs para operações de escrita/CRUD
    listingVus: 20,    // VUs para operações de leitura/listagem
    duration:   '2m',
  },

  thresholds: {
    p95General: 1000,  // ms — geral
    p95Crud:    1500,  // ms — escrita (mais lenta)
    p95Listing:  500,  // ms — leitura (deve ser rápida)
    failRate:   0.01,  // 1% máximo de erros
  },

  sleep: {
    betweenSteps:   0.3,  // s
    afterIteration: 1,    // s
    listing:        0.5,  // s
  },
};

// setup() roda UMA VEZ antes dos VUs iniciarem
export function setup() {
  const users = [];
  const headers = { 'Content-Type': 'application/json' };

  for (let i = 0; i < CONFIG.userPoolSize; i++) {
    const ts = Date.now() + i;
    const email = `${CONFIG.prefix}_${ts}@test.com`;

    const reg = http.post(
      `${CONFIG.base}/auth/register`,
      JSON.stringify({ username: `${CONFIG.prefix}_${ts}`, email, password: CONFIG.password }),
      { headers }
    );
    check(reg, { 'register 201': (r) => r.status === 201 });

    const login = http.post(
      `${CONFIG.base}/auth/login`,
      JSON.stringify({ email, password: CONFIG.password }),
      { headers }
    );
    check(login, { 'login 200': (r) => r.status === 200 });

    const { accessToken } = JSON.parse(login.body);
    users.push({ accessToken });

    // SE o recurso precisar de setup de dados (ex.: criar comunidade, estante):
    // const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` };
    // const setupRes = http.post(`${CONFIG.base}/...`, JSON.stringify({...}), { headers: authHeaders });
    // users.push({ accessToken, setupEntityId: JSON.parse(setupRes.body).id });
  }

  return { users };
}

// Dois cenários: crud (escrita) e listing (leitura)
export const options = {
  scenarios: {
    crud: {
      executor: 'constant-vus',
      vus:      CONFIG.load.crudVus,
      duration: CONFIG.load.duration,
      exec:     'crud{ResourcePascal}',  // substituir pelo nome real da função
    },
    listing: {
      executor: 'constant-vus',
      vus:      CONFIG.load.listingVus,
      duration: CONFIG.load.duration,
      exec:     'list{ResourcePascal}',  // substituir pelo nome real da função
    },
  },
  thresholds: {
    http_req_duration:                      [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:                        [`rate<${CONFIG.thresholds.failRate}`],
    'http_req_duration{scenario:crud}':     [`p(95)<${CONFIG.thresholds.p95Crud}`],
    'http_req_duration{scenario:listing}':  [`p(95)<${CONFIG.thresholds.p95Listing}`],
  },
};

// VU function para CRUD — implementar conforme os endpoints do controller
export function crud{ResourcePascal}(data) {
  const token = data.users[__VU % data.users.length].accessToken;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // POST — criar recurso
  const createRes = http.post(
    `${CONFIG.base}/{endpoint}`,
    JSON.stringify({ /* campos do request body */ }),
    { headers }
  );
  check(createRes, {
    'create 201': (r) => r.status === 201,
    'create retorna id': (r) => {
      try { return JSON.parse(r.body).id != null; }
      catch { return false; }
    },
  });

  if (createRes.status !== 201) {
    sleep(CONFIG.sleep.afterIteration);
    return;  // short-circuit — não tenta operar sem o recurso criado
  }

  const id = JSON.parse(createRes.body).id;
  sleep(CONFIG.sleep.betweenSteps);

  // GET — buscar por ID
  const getRes = http.get(`${CONFIG.base}/{endpoint}/${id}`, { headers });
  check(getRes, { 'get 200': (r) => r.status === 200 });
  sleep(CONFIG.sleep.betweenSteps);

  // PUT/PATCH — atualizar
  const updateRes = http.put(
    `${CONFIG.base}/{endpoint}/${id}`,
    JSON.stringify({ /* campos atualizados */ }),
    { headers }
  );
  check(updateRes, { 'update 200': (r) => r.status === 200 });
  sleep(CONFIG.sleep.betweenSteps);

  // DELETE — remover
  const deleteRes = http.del(`${CONFIG.base}/{endpoint}/${id}`, null, { headers });
  check(deleteRes, { 'delete 204': (r) => r.status === 204 });

  sleep(CONFIG.sleep.afterIteration);
}

// VU function para listagem/leitura
export function list{ResourcePascal}(data) {
  const token = data.users[__VU % data.users.length].accessToken;
  const headers = { Authorization: `Bearer ${token}` };

  const res = http.get(`${CONFIG.base}/{endpoint}`, { headers });
  check(res, {
    'list 200': (r) => r.status === 200,
    'list é array JSON': (r) => {
      try { return Array.isArray(JSON.parse(r.body)); }
      catch { return false; }
    },
  });

  sleep(CONFIG.sleep.listing);
}
```

**Adaptações por tipo de controller:**
- **Apenas leitura (ex.: recommendations):** substituir os dois cenários por `query` e `detail` com `crudVus → queryVus`, sem POST/PUT/DELETE
- **Resposta não é array:** trocar `Array.isArray(...)` por `JSON.parse(r.body).{campo} != null`
- **Endpoint com `@PathVariable` extra (ex.: `/shelves/{shelfId}/items`):** armazenar `shelfId` no `users[i]` durante o `setup()`

---

### 2. Criar `{resource}-spike.js`

**Localização:** `performance-tests/{DomainName}/{resource}/{resource}-spike.js`

**Estrutura obrigatória:**

```javascript
import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 400,         // pool maior que peakVus para cobertura
  password:     'senha12345',
  prefix:       '{PREFIX_SPIKE}',

  spike: {
    baseVus:    50,
    peakVus:    300,
    rampUpBase: '10s',  // sobe devagar até base
    rampToPeak: '5s',   // spike BRUSCO
    holdPeak:   '20s',  // mantém pressão máxima
    rampDown:   '5s',   // queda brusca
    cooldown:   '10s',  // recuperação até 0
  },

  thresholds: {
    p95General: 1000,  // ms
    failRate:   0.05,  // 5% — spike tolera mais erros que load
  },

  sleep: {
    betweenOps:     0.2,
    afterIteration: 0.5,
  },
};

export function setup() {
  const users = [];
  const headers = { 'Content-Type': 'application/json' };

  for (let i = 0; i < CONFIG.userPoolSize; i++) {
    const ts = Date.now() + i;
    const email = `${CONFIG.prefix}_${ts}@test.com`;
    http.post(`${CONFIG.base}/auth/register`,
      JSON.stringify({ username: `${CONFIG.prefix}_${ts}`, email, password: CONFIG.password }),
      { headers });
    const login = http.post(`${CONFIG.base}/auth/login`,
      JSON.stringify({ email, password: CONFIG.password }),
      { headers });
    const { accessToken } = JSON.parse(login.body);
    users.push({ accessToken });
  }

  return { users };
}

// Spike usa stages (não scenarios) — UMA função default
export const options = {
  setupTimeout: '300s',
  stages: [
    { duration: CONFIG.spike.rampUpBase, target: CONFIG.spike.baseVus },
    { duration: CONFIG.spike.rampToPeak, target: CONFIG.spike.peakVus },
    { duration: CONFIG.spike.holdPeak,   target: CONFIG.spike.peakVus },
    { duration: CONFIG.spike.rampDown,   target: CONFIG.spike.baseVus },
    { duration: CONFIG.spike.cooldown,   target: 0 },
  ],
  thresholds: {
    http_req_duration: [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:   [`rate<${CONFIG.thresholds.failRate}`],
  },
};

// Função default — mix das operações principais (leitura + uma escrita)
export default function (data) {
  const token = data.users[__VU % data.users.length].accessToken;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // Leitura primeiro (mais rápida, valida que o sistema responde)
  const listRes = http.get(`${CONFIG.base}/{endpoint}`, { headers });
  check(listRes, {
    'list 200': (r) => r.status === 200,
    'list array': (r) => {
      try { return Array.isArray(JSON.parse(r.body)); }
      catch { return false; }
    },
  });
  sleep(CONFIG.sleep.betweenOps);

  // Escrita — aceita 429 (rate limit) durante spike
  const createRes = http.post(
    `${CONFIG.base}/{endpoint}`,
    JSON.stringify({ /* campos */ }),
    { headers }
  );
  check(createRes, { 'create 201 ou 429': (r) => r.status === 201 || r.status === 429 });

  if (createRes.status === 201) {
    const id = JSON.parse(createRes.body).id;
    http.del(`${CONFIG.base}/{endpoint}/${id}`, null, { headers });
  }

  sleep(CONFIG.sleep.afterIteration);
}
```

---

### 3. Criar `{resource}-stress.js`

**Localização:** `performance-tests/{DomainName}/{resource}/{resource}-stress.js`

**Estrutura obrigatória:**

```javascript
import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 500,         // pool grande para suportar estágio máximo (400 VUs)
  password:     'senha12345',
  prefix:       '{PREFIX_STRESS}',

  stress: {
    stageDuration: '30s',
    stages:        [20, 50, 100, 200, 300, 400],  // VUs por estágio — rampa crescente
  },

  thresholds: {
    p95General: 1000,  // ms
    failRate:   0.05,  // 5% — stress tolera degradação
  },

  sleep: {
    betweenSteps:   0.2,
    afterIteration: 0.5,
  },
};

export function setup() {
  const users = [];
  const headers = { 'Content-Type': 'application/json' };

  for (let i = 0; i < CONFIG.userPoolSize; i++) {
    const ts = Date.now() + i;
    const email = `${CONFIG.prefix}_${ts}@test.com`;
    http.post(`${CONFIG.base}/auth/register`,
      JSON.stringify({ username: `${CONFIG.prefix}_${ts}`, email, password: CONFIG.password }),
      { headers });
    const login = http.post(`${CONFIG.base}/auth/login`,
      JSON.stringify({ email, password: CONFIG.password }),
      { headers });
    const { accessToken } = JSON.parse(login.body);
    users.push({ accessToken });
  }

  return { users };
}

// Stress usa stages com rampa crescente até encontrar o ponto de quebra
export const options = {
  setupTimeout: '300s',
  stages: [
    ...CONFIG.stress.stages.map((vus) => ({ duration: CONFIG.stress.stageDuration, target: vus })),
    { duration: CONFIG.stress.stageDuration, target: 0 },  // rampa de descida
  ],
  thresholds: {
    http_req_duration: [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:   [`rate<${CONFIG.thresholds.failRate}`],
  },
};

// Função default — operação que exercita criação + leitura + deleção
export default function (data) {
  const token = data.users[__VU % data.users.length].accessToken;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const listRes = http.get(`${CONFIG.base}/{endpoint}`, { headers });
  check(listRes, { 'list 200': (r) => r.status === 200 });
  sleep(CONFIG.sleep.betweenSteps);

  const createRes = http.post(
    `${CONFIG.base}/{endpoint}`,
    JSON.stringify({ /* campos */ }),
    { headers }
  );
  check(createRes, { 'create 201': (r) => r.status === 201 });

  if (createRes.status === 201) {
    const id = JSON.parse(createRes.body).id;
    sleep(CONFIG.sleep.betweenSteps);

    const getRes = http.get(`${CONFIG.base}/{endpoint}/${id}`, { headers });
    check(getRes, { 'get 200': (r) => r.status === 200 });
    sleep(CONFIG.sleep.betweenSteps);

    const delRes = http.del(`${CONFIG.base}/{endpoint}/${id}`, null, { headers });
    check(delRes, { 'delete 204': (r) => r.status === 204 });
  }

  sleep(CONFIG.sleep.afterIteration);
}
```

---

### 4. (Opcional) Criar `{resource}-concurrency.js`

Criar **somente se** o controller tiver endpoint WebSocket/STOMP. Seguir o padrão de `DomainCommunity/message/message-concurrency.js`:

- Importar também `{ Counter, Rate, Trend } from 'k6/metrics'` e `{ WebSocket } from 'k6/ws'`
- Definir métricas customizadas: `stompConnectErrors`, `stompMessagesSent`, `stompMessagesRecv`, `msgDeliveryLatency`, `msgDeliverySuccess`, `concurrencyViolation`
- Implementar `stompFrame(command, headers, body)` e `parseStompFrame(raw)`
- Threshold de **zero tolerância** para `concurrency_violation_rate`
- Dois cenários: `concurrentSend` (carga normal) e `burstSend` (rajada)

---

### 5. Checklist final

Antes de considerar os arquivos prontos:

- [ ] Prefixo de usuário único por tipo de teste (`load{resource}`, `spike{resource}`, `stress{resource}`)
- [ ] `userPoolSize` ≥ pico de VUs do teste (`peakVus=300` → pool ≥ 300; usar 400 por margem)
- [ ] `setupTimeout: '300s'` presente em spike e stress (setup com 400-500 usuários demora)
- [ ] Short-circuit após falha de criação (`if (createRes.status !== 201) { sleep; return; }`)
- [ ] Spike aceita status 429 em operações de escrita (`r.status === 201 || r.status === 429`)
- [ ] `http.del` (não `http.delete`) para requisições DELETE
- [ ] Checks com `try/catch` ao fazer `JSON.parse` em qualquer body
- [ ] Todos os campos do request body cobertos conforme DTOs do controller
- [ ] Arquivos criados em `performance-tests/{DomainName}/{resource}/` (criar pasta se não existir)

---

## Referências dos testes existentes

| Arquivo | Tipo | VUs load | VUs spike/peak | VUs stress/max |
|---|---|---|---|---|
| `DomainBook/shelf/shelf-load.js` | CRUD | 60 crud / 20 listing | — | — |
| `DomainBook/shelf/shelf-spike.js` | Spike | — | base 50 / peak 300 | — |
| `DomainBook/shelf/shelf-stress.js` | Stress | — | — | até 400 |
| `DomainBook/book/books-load.js` | Read-only | 80 search / 20 detail | — | — |
| `DomainCommunity/message/message-concurrency.js` | Concurrency WS | — | — | 30 VUs |
