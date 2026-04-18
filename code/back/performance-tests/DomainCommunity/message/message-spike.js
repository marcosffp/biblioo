import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:     'http://localhost:8080',
  password: 'senha12345',
  prefix:   'msgspike',

  // userPoolSize >= peakVus para evitar reuso de token sob carga máxima
  userPoolSize:      300,
  communityPoolSize: 5,
  bookId:            1,  // ajuste para um bookId válido no seu banco

  spike: {
    baseVus:    50,
    peakVus:    300,
    rampUpBase: '10s',
    rampToPeak: '5s',
    holdPeak:   '20s',
    rampDown:   '5s',
    cooldown:   '10s',
  },

  thresholds: {
    p95General: 1000,  // ms
    failRate:   0.05,  // 5% — spike tolera mais erros
  },

  sleep: {
    betweenOps:     0.2,  // s
    afterIteration: 0.5,  // s
  },
};

// ── Setup ─────────────────────────────────────────────────────────────────────
// Estratégia (idêntica ao load test):
//   1. Registra um "owner" que cria todas as comunidades
//   2. Registra os demais usuários e os faz entrar em todas as comunidades
//   3. Retorna { users, commIds } para o cenário default

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
        name:        `Spike Comm ${ownerTs}_${i}`,
        description: 'Criada pelo setup do spike test de mensagens',
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

// ── Opções ────────────────────────────────────────────────────────────────────

export const options = {
  // 300 usuários × (register + login + 5 joins) = ~2100 req sequenciais
  setupTimeout: '10m',

  stages: [
    { duration: CONFIG.spike.rampUpBase, target: CONFIG.spike.baseVus  },  // base normal
    { duration: CONFIG.spike.rampToPeak, target: CONFIG.spike.peakVus  },  // spike brusco
    { duration: CONFIG.spike.holdPeak,   target: CONFIG.spike.peakVus  },  // mantém carga alta
    { duration: CONFIG.spike.rampDown,   target: CONFIG.spike.baseVus  },  // queda brusca
    { duration: CONFIG.spike.cooldown,   target: 0                     },  // recuperação
  ],

  thresholds: {
    http_req_duration: [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:   [`rate<${CONFIG.thresholds.failRate}`],
  },
};

// ── Cenário default: list + sync + upload sob spike ───────────────────────────

export default function (data) {
  if (!data.commIds || data.commIds.length === 0) return;

  const user    = data.users[__VU % data.users.length];
  const headers = { Authorization: `Bearer ${user.accessToken}` };
  const commId  = randomItem(data.commIds);

  // LIST — endpoint mais chamado; spike aceita 429 como resposta válida
  const listRes = http.get(
    `${CONFIG.base}/communities/${commId}/messages?limit=50`,
    { headers }
  );
  check(listRes, {
    'GET messages 200 ou 429': (r) => r.status === 200 || r.status === 429,
    'GET messages é lista': (r) => {
      if (r.status !== 200) return true;
      try { return Array.isArray(JSON.parse(r.body)); }
      catch { return false; }
    },
  });

  sleep(CONFIG.sleep.betweenOps);

  // SYNC — simula reconexão em massa após queda (cenário realista de spike)
  const afterId = Math.floor(Math.random() * 100) + 1;
  const syncRes = http.get(
    `${CONFIG.base}/communities/${commId}/messages/sync?after=${afterId}`,
    { headers }
  );
  check(syncRes, {
    'GET sync 200 ou 429': (r) => r.status === 200 || r.status === 429,
    'GET sync é lista': (r) => {
      if (r.status !== 200) return true;
      try { return Array.isArray(JSON.parse(r.body)); }
      catch { return false; }
    },
  });

  sleep(CONFIG.sleep.betweenOps);

  // UPLOAD DE MÍDIA — PNG mínimo válido 1x1 px (Tika detecta como image/png)
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
  check(uploadRes, { 'POST media 200 ou 429': (r) => r.status === 200 || r.status === 429 });

  sleep(CONFIG.sleep.afterIteration);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}