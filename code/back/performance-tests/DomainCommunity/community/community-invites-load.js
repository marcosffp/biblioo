import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:            'http://localhost:8080',
  password:        'Senha@12345',
  prefix:          'invcomm',
  inviteePoolSize: 100,

  // ID de um livro que existe no banco
  bookId: 1,

  load: {
    inviteVus: 20,  // owner manda convites para usuários aleatórios
    listVus:   20,  // invitees consultam seus convites pendentes
    duration:  '2m',
  },

  thresholds: {
    p95General: 1500,  // ms
    p95Invite: 2000,   // ms — write
    p95List:    500,   // ms — read paginado
    failRate:   0.05,  // 5% — esperam-se conflitos de "já convidado"
  },

  sleep: {
    betweenSteps:   0.3,
    afterIteration: 0.5,
  },
};

// ── Setup ─────────────────────────────────────────────────────────────────────
// 1. Cria owner + 1 comunidade PRIVATE (invites só fazem sentido em PRIVATE).
// 2. Cria 100 invitees, captura userId e token de cada um.

export const options = {
  setupTimeout: '5m',

  scenarios: {
    invite: {
      executor: 'constant-vus',
      vus:      CONFIG.load.inviteVus,
      duration: CONFIG.load.duration,
      exec:     'inviteFlow',
    },
    listPending: {
      executor: 'constant-vus',
      vus:      CONFIG.load.listVus,
      duration: CONFIG.load.duration,
      exec:     'listPending',
    },
  },

  thresholds: {
    http_req_duration:                      [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:                        [`rate<${CONFIG.thresholds.failRate}`],
    'http_req_duration{scenario:invite}':   [`p(95)<${CONFIG.thresholds.p95Invite}`],
    'http_req_duration{scenario:listPending}': [`p(95)<${CONFIG.thresholds.p95List}`],
  },
};

export function setup() {
  const jsonHeaders = { 'Content-Type': 'application/json' };

  // ── 1. Owner ────────────────────────────────────────────────────────────────
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

  // ── 2. Comunidade privada ───────────────────────────────────────────────────
  const commRes = http.post(
    `${CONFIG.base}/communities`,
    JSON.stringify({
      name:        `Invites Test ${ownerTs}`,
      description: 'Comunidade privada para testar fluxo de convites',
      type:        'PRIVATE',
      bookId:      CONFIG.bookId,
    }),
    { headers: ownerHeaders }
  );
  check(commRes, { 'create community 201': (r) => r.status === 201 });

  if (commRes.status !== 201) {
    console.error('Falha ao criar comunidade — verifique CONFIG.bookId');
    return { ownerToken: null, communityId: null, invitees: [] };
  }

  const communityId = JSON.parse(commRes.body).id;

  // ── 3. Invitees ─────────────────────────────────────────────────────────────
  const invitees = [];
  for (let i = 0; i < CONFIG.inviteePoolSize; i++) {
    const ts    = Date.now() + i;
    const email = `${CONFIG.prefix}_${ts}@test.com`;

    const reg = http.post(
      `${CONFIG.base}/auth/register`,
      JSON.stringify({ username: `${CONFIG.prefix}_${ts}`, email, password: CONFIG.password }),
      { headers: jsonHeaders }
    );
    check(reg, { 'invitee register 201': (r) => r.status === 201 });

    const login = http.post(
      `${CONFIG.base}/auth/login`,
      JSON.stringify({ email, password: CONFIG.password }),
      { headers: jsonHeaders }
    );
    check(login, { 'invitee login 200': (r) => r.status === 200 });

    const body = JSON.parse(login.body);
    invitees.push({
      userId:      body.user.id,
      accessToken: body.accessToken,
    });
  }

  return { ownerToken, communityId, invitees };
}

// ── Cenário 1: owner manda convite + invitee declina ─────────────────────────
// Cada VU age como o owner. O fluxo completo:
//   1. POST /communities/{id}/invites (owner)
//   2. GET /communities/invites/pending (invitee) — pega o inviteId
//   3. POST /communities/invites/{inviteId}/decline (invitee)
// Decline em vez de accept: mantém o invitee elegível para novos convites.

export function inviteFlow(data) {
  if (!data.invitees || data.invitees.length === 0) return;

  const ownerHeaders = {
    'Content-Type': 'application/json',
    Authorization:  `Bearer ${data.ownerToken}`,
  };

  const invitee        = randomItem(data.invitees);
  const inviteeHeaders = { Authorization: `Bearer ${invitee.accessToken}` };

  // 1. Owner convida — 201 esperado, 4xx aceito (pode já ter convite pendente)
  const inviteRes = http.post(
    `${CONFIG.base}/communities/${data.communityId}/invites`,
    JSON.stringify({ inviteeId: invitee.userId }),
    { headers: ownerHeaders }
  );
  check(inviteRes, {
    'invite 201 ou conflito': (r) => r.status === 201 || (r.status >= 400 && r.status < 500),
  });

  sleep(CONFIG.sleep.betweenSteps);

  // 2. Invitee lista os próprios convites pendentes
  const pendingRes = http.get(
    `${CONFIG.base}/communities/invites/pending?page=0&size=10`,
    { headers: inviteeHeaders }
  );
  check(pendingRes, { 'GET /invites/pending 200': (r) => r.status === 200 });

  // 3. Se houver convite pendente, declina o primeiro
  if (pendingRes.status === 200) {
    try {
      const page = JSON.parse(pendingRes.body);
      if (page.content && page.content.length > 0) {
        const inviteId = page.content[0].id;
        sleep(CONFIG.sleep.betweenSteps);

        const declineRes = http.post(
          `${CONFIG.base}/communities/invites/${inviteId}/decline`,
          null,
          { headers: inviteeHeaders }
        );
        check(declineRes, { 'decline 204': (r) => r.status === 204 });
      }
    } catch (_) { /* corpo inesperado */ }
  }

  sleep(CONFIG.sleep.afterIteration);
}

// ── Cenário 2: leitura pura de convites pendentes ────────────────────────────
// Pressiona apenas GET /communities/invites/pending isoladamente.

export function listPending(data) {
  if (!data.invitees || data.invitees.length === 0) return;

  const invitee = randomItem(data.invitees);
  const headers = { Authorization: `Bearer ${invitee.accessToken}` };

  const res = http.get(
    `${CONFIG.base}/communities/invites/pending?page=0&size=10`,
    { headers }
  );
  check(res, { 'GET /invites/pending 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.afterIteration);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
