import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:     'http://localhost:8080',
  password: 'senha12345',
  prefix:   'msgload',

  // Quantos usuários e comunidades criar no setup.
  // Mantido baixo para caber no setupTimeout (5 min).
  // Cada usuário faz: register + login + createCommunity + join nas comms criadas.
  // Custo aproximado: userPoolSize * (2 req) + communityPoolSize * (1 req) + userPoolSize * communityPoolSize * (1 req join)
  // Com 20 usuários e 5 comunidades: 20*2 + 5 + 20*5 = 145 req — confortável.
  userPoolSize:      20,
  communityPoolSize: 5,

  // ID de um livro que existe no banco — necessário para criar comunidade
  // Ajuste para um bookId válido no seu ambiente
  bookId: 1,

  load: {
    listVus:  60,
    crudVus:  20,
    duration: '2m',
  },

  thresholds: {
    p95General: 1000,  // ms
    p95List:     500,  // ms
    p95Crud:    1500,  // ms
    failRate:   0.01,  // 1%
  },

  sleep: {
    list:           1,    // s
    betweenSteps:   0.3,  // s
    afterIteration: 0.5,  // s
  },
};

// ── Setup ─────────────────────────────────────────────────────────────────────
// Estratégia:
//   1. Registra um "owner" que cria todas as comunidades
//   2. Registra os demais usuários e os faz entrar em todas as comunidades
//   3. Retorna { users, commIds } para os cenários

export const options = {
  setupTimeout: '5m',  // setup cria usuários + comunidades; precisa de mais tempo

  scenarios: {
    list: {
      executor: 'constant-vus',
      vus:      CONFIG.load.listVus,
      duration: CONFIG.load.duration,
      exec:     'listMessages',
    },
    crud: {
      executor: 'constant-vus',
      vus:      CONFIG.load.crudVus,
      duration: CONFIG.load.duration,
      exec:     'crudMessages',
    },
  },

  thresholds: {
    http_req_duration:                     [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:                       [`rate<${CONFIG.thresholds.failRate}`],
    'http_req_duration{scenario:list}':    [`p(95)<${CONFIG.thresholds.p95List}`],
    'http_req_duration{scenario:crud}':    [`p(95)<${CONFIG.thresholds.p95Crud}`],
  },
};

export function setup() {
  const jsonHeaders = { 'Content-Type': 'application/json' };

  // ── 1. Cria o owner e obtém seu token ───────────────────────────────────
  const ownerTs    = Date.now();
  const ownerEmail = `${CONFIG.prefix}_owner_${ownerTs}@test.com`;

  const ownerReg = http.post(
    `${CONFIG.base}/auth/register`,
    JSON.stringify({
      username: `${CONFIG.prefix}_owner_${ownerTs}`,
      email:    ownerEmail,
      password: CONFIG.password,
    }),
    { headers: jsonHeaders }
  );
  check(ownerReg, { 'owner register 201': (r) => r.status === 201 });

  const ownerLogin = http.post(
    `${CONFIG.base}/auth/login`,
    JSON.stringify({ email: ownerEmail, password: CONFIG.password }),
    { headers: jsonHeaders }
  );
  check(ownerLogin, { 'owner login 200': (r) => r.status === 200 });

  const ownerToken   = JSON.parse(ownerLogin.body).accessToken;
  const ownerHeaders = {
    'Content-Type': 'application/json',
    Authorization:  `Bearer ${ownerToken}`,
  };

  // ── 2. Cria as comunidades (tipo PUBLIC para permitir join livre) ─────────
  const commIds = [];
  for (let i = 0; i < CONFIG.communityPoolSize; i++) {
    const commRes = http.post(
      `${CONFIG.base}/communities`,
      JSON.stringify({
        name:        `Load Test Comm ${ownerTs}_${i}`,
        description: 'Criada pelo setup do load test de mensagens',
        type:        'PUBLIC',
        bookId:      CONFIG.bookId,
      }),
      { headers: ownerHeaders }
    );
    check(commRes, { 'create community 201': (r) => r.status === 201 });

    if (commRes.status === 201) {
      commIds.push(JSON.parse(commRes.body).id);
    }
  }

  if (commIds.length === 0) {
    console.error('Nenhuma comunidade criada — verifique se CONFIG.bookId existe no banco.');
    return { users: [], commIds: [] };
  }

  // ── 3. Registra usuários e os faz entrar em todas as comunidades ──────────
  const users = [];

  for (let i = 0; i < CONFIG.userPoolSize; i++) {
    const ts    = Date.now() + i;
    const email = `${CONFIG.prefix}_${ts}@test.com`;

    const reg = http.post(
      `${CONFIG.base}/auth/register`,
      JSON.stringify({ username: `${CONFIG.prefix}_${ts}`, email, password: CONFIG.password }),
      { headers: jsonHeaders }
    );
    check(reg, { 'register 201': (r) => r.status === 201 });

    const login = http.post(
      `${CONFIG.base}/auth/login`,
      JSON.stringify({ email, password: CONFIG.password }),
      { headers: jsonHeaders }
    );
    check(login, { 'login 200': (r) => r.status === 200 });

    const { accessToken } = JSON.parse(login.body);
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${accessToken}`,
    };

    // Entra em todas as comunidades criadas acima (PUBLIC → 204 garantido)
    for (const commId of commIds) {
      const joinRes = http.post(
        `${CONFIG.base}/communities/${commId}/join`,
        null,
        { headers: authHeaders }
      );
      check(joinRes, { 'join community 204': (r) => r.status === 204 });
    }

    users.push({ accessToken });
  }

  return { users, commIds };
}

// ── Cenário 1: leitura do histórico ──────────────────────────────────────────

export function listMessages(data) {
  if (!data.commIds || data.commIds.length === 0) return;

  const user    = data.users[__VU % data.users.length];
  const headers = { Authorization: `Bearer ${user.accessToken}` };
  const commId  = randomItem(data.commIds);

  const res = http.get(
    `${CONFIG.base}/communities/${commId}/messages?limit=50`,
    { headers }
  );
  check(res, {
    'GET messages 200':     (r) => r.status === 200,
    'GET messages é lista': (r) => {
      try { return Array.isArray(JSON.parse(r.body)); }
      catch { return false; }
    },
  });

  sleep(CONFIG.sleep.list);
}

// ── Cenário 2: sync + upload de mídia ────────────────────────────────────────

export function crudMessages(data) {
  if (!data.commIds || data.commIds.length === 0) return;

  const user    = data.users[__VU % data.users.length];
  const headers = { Authorization: `Bearer ${user.accessToken}` };
  const commId  = randomItem(data.commIds);

  // GET sync
  const afterId = Math.floor(Math.random() * 100) + 1;
  const syncRes = http.get(
    `${CONFIG.base}/communities/${commId}/messages/sync?after=${afterId}`,
    { headers }
  );
  check(syncRes, {
    'GET sync 200':     (r) => r.status === 200,
    'GET sync é lista': (r) => {
      try { return Array.isArray(JSON.parse(r.body)); }
      catch { return false; }
    },
  });

  sleep(CONFIG.sleep.betweenSteps);

  // POST upload de mídia — PNG mínimo válido 1x1 px (Tika detecta como image/png)
  const minimalPng = new Uint8Array([
    0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,
    0x00,0x00,0x00,0x0d,0x49,0x48,0x44,0x52,
    0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,
    0x08,0x02,0x00,0x00,0x00,0x90,0x77,0x53,
    0xde,0x00,0x00,0x00,0x0c,0x49,0x44,0x41,
    0x54,0x08,0xd7,0x63,0xf8,0xcf,0xc0,0x00,
    0x00,0x00,0x02,0x00,0x01,0xe2,0x21,0xbc,
    0x33,0x00,0x00,0x00,0x00,0x49,0x45,0x4e,
    0x44,0xae,0x42,0x60,0x82,
  ]).buffer;

  // Nao passe Content-Type manualmente; o k6 define o boundary automaticamente
  const uploadRes = http.post(
    `${CONFIG.base}/communities/${commId}/messages/media`,
    { images: http.file(minimalPng, 'test.png', 'image/png') },
    { headers }
  );
  check(uploadRes, { 'POST media 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.afterIteration);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}