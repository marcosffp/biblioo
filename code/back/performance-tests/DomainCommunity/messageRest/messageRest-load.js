// Cobre CommunityMessageRestController (endpoints REST de mensagens).
//
// ESCOPO: GET /communities/{id}/messages e GET /communities/{id}/messages/sync.
// O endpoint POST /media (upload Cloudinary) foi deixado FORA dos testes de
// carga propositalmente — disparar Cloudinary com muitos VUs gera custo real
// ou estoura limites de free tier. Para testar /media, use cenário dedicado
// com VU baixo e Cloudinary mockado em profile separado.

import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:              'http://localhost:8080',
  password:          'Senha@12345',
  prefix:            'lmr',
  userPoolSize:      230,
  communityPoolSize: 10,
  bookId:            1,

  load: {
    listingVus: 80,
    syncVus:    40,
    duration:   '2m',
  },

  thresholds: {
    p95General: 1000,
    p95Listing:  800,
    p95Sync:     500,
    failRate:   0.01,
  },

  sleep: {
    betweenSteps:   0.3,
    afterIteration: 1,
    listing:        0.5,
  },
};

export function setup() {
  const jsonH = { 'Content-Type': 'application/json' };

  // owner
  const ownerTs    = Date.now();
  const ownerEmail = `${CONFIG.prefix}_owner_${ownerTs}@test.com`;
  http.post(
    `${CONFIG.base}/auth/register`,
    JSON.stringify({ username: `${CONFIG.prefix}_owner_${ownerTs}`, email: ownerEmail, password: CONFIG.password }),
    { headers: jsonH }
  );
  const ownerLogin = http.post(
    `${CONFIG.base}/auth/login`,
    JSON.stringify({ email: ownerEmail, password: CONFIG.password }),
    { headers: jsonH }
  );
  const ownerToken = JSON.parse(ownerLogin.body).accessToken;
  const ownerH    = { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` };

  // pool de comunidades PUBLIC
  const commIds = [];
  for (let i = 0; i < CONFIG.communityPoolSize; i++) {
    const res = http.post(
      `${CONFIG.base}/communities`,
      JSON.stringify({
        name:        `MsgRest Load ${ownerTs}_${i}`,
        description: 'Setup load test',
        type:        'PUBLIC',
        bookId:      CONFIG.bookId,
      }),
      { headers: ownerH }
    );
    if (res.status === 201) commIds.push(JSON.parse(res.body).id);
  }
  if (commIds.length === 0) throw new Error('Nenhuma comunidade criada — verifique bookId.');

  // usuários entram em todas as comunidades
  const users = [];
  for (let i = 0; i < CONFIG.userPoolSize; i++) {
    const ts    = Date.now() + i;
    const email = `${CONFIG.prefix}_${ts}@test.com`;
    http.post(
      `${CONFIG.base}/auth/register`,
      JSON.stringify({ username: `${CONFIG.prefix}_${ts}`, email, password: CONFIG.password }),
      { headers: jsonH }
    );
    const login = http.post(
      `${CONFIG.base}/auth/login`,
      JSON.stringify({ email, password: CONFIG.password }),
      { headers: jsonH }
    );
    if (login.status !== 200) continue;
    const accessToken = JSON.parse(login.body).accessToken;
    const authH = { Authorization: `Bearer ${accessToken}` };

    for (const commId of commIds) {
      http.post(`${CONFIG.base}/communities/${commId}/join`, null, { headers: authH });
    }

    users.push({ accessToken });
  }

  if (users.length === 0) throw new Error('Nenhum usuário preparado.');
  return { users, commIds, setupTs: ownerTs };
}

export const options = {
  setupTimeout: '600s',  // ~230 users × 10 comunidades de join no setup
  scenarios: {
    listing: {
      executor: 'constant-vus',
      vus:      CONFIG.load.listingVus,
      duration: CONFIG.load.duration,
      exec:     'listMessages',
    },
    sync: {
      executor: 'constant-vus',
      vus:      CONFIG.load.syncVus,
      duration: CONFIG.load.duration,
      exec:     'syncMessages',
    },
  },
  thresholds: {
    http_req_duration:                     [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:                       [`rate<${CONFIG.thresholds.failRate}`],
    'http_req_duration{scenario:listing}': [`p(95)<${CONFIG.thresholds.p95Listing}`],
    'http_req_duration{scenario:sync}':    [`p(95)<${CONFIG.thresholds.p95Sync}`],
  },
};

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function listMessages(data) {
  const user   = data.users[(__VU - 1) % data.users.length];
  const headers = { Authorization: `Bearer ${user.accessToken}` };
  const commId = randomItem(data.commIds);

  // GET histórico sem cursor (mensagens recentes)
  const recentRes = http.get(
    `${CONFIG.base}/communities/${commId}/messages?limit=50`,
    { headers }
  );
  check(recentRes, {
    'recent 200':    (r) => r.status === 200,
    'recent array':  (r) => {
      try { return Array.isArray(JSON.parse(r.body)); }
      catch { return false; }
    },
  });

  sleep(CONFIG.sleep.betweenSteps);

  // GET com cursor `before` (mesmo que vazio, exercita o branch do método)
  const beforeRes = http.get(
    `${CONFIG.base}/communities/${commId}/messages?before=${Date.now()}&limit=20`,
    { headers }
  );
  check(beforeRes, { 'before 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.listing);
}

export function syncMessages(data) {
  const user   = data.users[(__VU - 1) % data.users.length];
  const headers = { Authorization: `Bearer ${user.accessToken}` };
  const commId = randomItem(data.commIds);

  // sync com cursor de ~1 minuto atrás
  const after = Date.now() - 60_000;
  const res = http.get(
    `${CONFIG.base}/communities/${commId}/messages/sync?after=${after}`,
    { headers }
  );
  check(res, {
    'sync 200':   (r) => r.status === 200,
    'sync array': (r) => {
      try { return Array.isArray(JSON.parse(r.body)); }
      catch { return false; }
    },
  });

  sleep(CONFIG.sleep.afterIteration);
}
