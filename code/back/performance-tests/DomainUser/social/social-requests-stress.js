import http from 'k6/http';
import { sleep, check } from 'k6';

// Stress / concorrência do follow-request (caminho privado do grafo social).
//
// ⚠️ NÃO RODAR LOCALMENTE. Executado em 2026-05-30 numa máquina única: colapsou
// por exaustão de conexão do SO (EOF/reset, ~2h47 de relógio), o MESMO confounder
// do message-concurrency — não mede o backend. O reject não mostrou race (99% ok)
// e a listagem é rápida (probe: p95 7.5ms com 1.500 pendentes). Rodar apenas no
// ambiente HOSPEDADO (GCloud) com k6 em máquina separada. Ver RELATORIO-DOMAINUSER 2.3.
//
// AO CONTRÁRIO de social-requests-load.js (particionado, race-free), este teste
// FORÇA contenção: muitos VUs compartilham um pool pequeno de owners privados e
// rejeitam o MESMO users[0] da fila concorrentemente — exatamente o padrão que
// expôs a race condition em community-join-requests. Objetivo: verificar se o
// follow-request (mesma classe de operação de estado compartilhado) sofre do
// mesmo problema. Os 4xx tolerados nos checks SÃO a medição (ver http_req_failed).
const CONFIG = {
  base:              'http://localhost:8080',
  password:          'Senha@12345',
  prefix:            'sreqsocial',
  ownerPoolSize:     50,   // poucos owners privados ⇒ muitos VUs por owner ⇒ mais conflito
  requesterPoolSize: 800,

  stress: {
    stageDuration: '30s',
    stages: [10, 20, 50, 100, 150, 200, 600],
  },

  thresholds: {
    p95General: 5000,
    failRate:   0.40,  // conflitos de estado são esperados sob contenção (igual a join-requests)
  },

  sleep: {
    betweenSteps:   0.1,
    afterIteration: 0.2,
  },
};

export const options = {
  setupTimeout: '10m',

  stages: [
    ...CONFIG.stress.stages.map((vus) => ({ duration: CONFIG.stress.stageDuration, target: vus })),
    { duration: CONFIG.stress.stageDuration, target: 0 },
  ],

  thresholds: {
    http_req_duration: [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:   [`rate<${CONFIG.thresholds.failRate}`],
  },
};

export function setup() {
  const jsonHeaders = { 'Content-Type': 'application/json' };

  // Owners PRIVADOS (follow vira solicitação).
  const owners = [];
  for (let i = 0; i < CONFIG.ownerPoolSize; i++) {
    const ts       = Date.now() + i;
    const username = `${CONFIG.prefix}_o${i}_${ts}`;
    const email    = `${username}@test.com`;

    const reg = http.post(
      `${CONFIG.base}/auth/register`,
      JSON.stringify({ username, email, password: CONFIG.password }),
      { headers: jsonHeaders }
    );
    check(reg, { 'owner register 201': (r) => r.status === 201 });
    if (reg.status !== 201) continue;

    const login = http.post(
      `${CONFIG.base}/auth/login`,
      JSON.stringify({ email, password: CONFIG.password }),
      { headers: jsonHeaders }
    );
    check(login, { 'owner login 200': (r) => r.status === 200 });
    if (login.status !== 200) continue;

    const ownerToken   = JSON.parse(login.body).accessToken;
    const ownerHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` };

    const visRes = http.put(
      `${CONFIG.base}/users/me/visibility`,
      JSON.stringify({ isPrivate: true }),
      { headers: ownerHeaders }
    );
    check(visRes, { 'owner private 200': (r) => r.status === 200 });
    if (visRes.status !== 200) continue;

    owners.push({ ownerToken, username });
  }

  if (owners.length === 0) {
    console.error('Nenhum owner privado criado.');
    return { owners: [], requesters: [] };
  }

  // Pool de requesters.
  const requesters = [];
  for (let i = 0; i < CONFIG.requesterPoolSize; i++) {
    const ts       = Date.now() + i;
    const username = `${CONFIG.prefix}_r${i}_${ts}`;
    const email    = `${username}@test.com`;

    const reg = http.post(
      `${CONFIG.base}/auth/register`,
      JSON.stringify({ username, email, password: CONFIG.password }),
      { headers: jsonHeaders }
    );
    check(reg, { 'requester register 201': (r) => r.status === 201 });
    if (reg.status !== 201) continue;

    const login = http.post(
      `${CONFIG.base}/auth/login`,
      JSON.stringify({ email, password: CONFIG.password }),
      { headers: jsonHeaders }
    );
    check(login, { 'requester login 200': (r) => r.status === 200 });
    if (login.status !== 200) continue;

    requesters.push({ username, accessToken: JSON.parse(login.body).accessToken });
  }

  return { owners, requesters };
}

// Fluxo: requester solicita seguir → owner lista → owner rejeita o primeiro.
// Cada VU opera no seu owner via __VU % owners.length; com poucos owners,
// múltiplos VUs caem no MESMO owner e disputam a mesma solicitação (users[0]).
export default function (data) {
  if (!data.owners || data.owners.length === 0) return;

  const owner            = data.owners[__VU % data.owners.length];
  const requester        = randomItem(data.requesters);
  const requesterHeaders = { Authorization: `Bearer ${requester.accessToken}` };
  const ownerHeaders     = { Authorization: `Bearer ${owner.ownerToken}` };

  // 1. Requester solicita seguir (202 esperado; 4xx aceito — já pendente / já segue)
  const followRes = http.post(
    `${CONFIG.base}/users/${owner.username}/follow`,
    null,
    { headers: requesterHeaders }
  );
  check(followRes, {
    'follow 202 ou conflito': (r) => r.status === 202 || (r.status >= 400 && r.status < 500),
  });

  sleep(CONFIG.sleep.betweenSteps);

  // 2. Owner lista as solicitações pendentes
  const pendingRes = http.get(
    `${CONFIG.base}/users/me/follow-requests?page=0&size=10`,
    { headers: ownerHeaders }
  );
  check(pendingRes, { 'GET /follow-requests 200': (r) => r.status === 200 });

  // 3. Owner rejeita o primeiro requester pendente — ponto de corrida
  if (pendingRes.status === 200) {
    try {
      const page = JSON.parse(pendingRes.body);
      if (page.users && page.users.length > 0) {
        sleep(CONFIG.sleep.betweenSteps);
        const rejectRes = http.del(
          `${CONFIG.base}/users/me/follow-requests/${page.users[0].username}`,
          null,
          { headers: ownerHeaders }
        );
        check(rejectRes, {
          'reject 204 ou conflito': (r) => r.status === 204 || (r.status >= 400 && r.status < 500),
        });
      }
    } catch (_) {}
  }

  sleep(CONFIG.sleep.afterIteration);
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
