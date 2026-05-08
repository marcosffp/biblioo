import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:              'http://localhost:8080',
  password:          'Senha@12345',
  prefix:            'sreqcomm',
  requesterPoolSize: 800,
  communityPoolSize: 50,  // mais comunidades = menos VUs por comunidade = menos conflitos
  bookId:            1,

  stress: {
    stageDuration: '30s',
    stages: [10, 20, 50, 100, 150, 200, 600],
  },

  thresholds: {
    p95General: 5000,
    failRate:   0.40,  // conflitos de estado são esperados — múltiplos VUs por comunidade
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

  // Cria N pares owner+comunidade
  const communities = [];
  for (let i = 0; i < CONFIG.communityPoolSize; i++) {
    const ts    = Date.now() + i;
    const email = `${CONFIG.prefix}_o${i}_${ts}@test.com`;

    const reg = http.post(
      `${CONFIG.base}/auth/register`,
      JSON.stringify({ username: `${CONFIG.prefix}_o${i}_${ts}`, email, password: CONFIG.password }),
      { headers: jsonHeaders }
    );
    check(reg, { 'owner register 201': (r) => r.status === 201 });

    const login = http.post(
      `${CONFIG.base}/auth/login`,
      JSON.stringify({ email, password: CONFIG.password }),
      { headers: jsonHeaders }
    );
    check(login, { 'owner login 200': (r) => r.status === 200 });

    const ownerToken   = JSON.parse(login.body).accessToken;
    const ownerHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` };

    const commRes = http.post(
      `${CONFIG.base}/communities`,
      JSON.stringify({
        name:        `JR Stress ${i} ${ts}`,
        description: 'Comunidade privada para stress de join-requests',
        type:        'PRIVATE',
        bookId:      CONFIG.bookId,
      }),
      { headers: ownerHeaders }
    );
    check(commRes, { 'create community 201': (r) => r.status === 201 });

    if (commRes.status === 201) {
      communities.push({ ownerToken, communityId: JSON.parse(commRes.body).id });
    }
  }

  if (communities.length === 0) {
    console.error('Nenhuma comunidade criada — verifique CONFIG.bookId');
    return { communities: [], requesters: [] };
  }

  // Cria pool de requesters
  const requesters = [];
  for (let i = 0; i < CONFIG.requesterPoolSize; i++) {
    const ts    = Date.now() + i;
    const email = `${CONFIG.prefix}_r${i}_${ts}@test.com`;

    const reg = http.post(
      `${CONFIG.base}/auth/register`,
      JSON.stringify({ username: `${CONFIG.prefix}_r${i}_${ts}`, email, password: CONFIG.password }),
      { headers: jsonHeaders }
    );
    check(reg, { 'requester register 201': (r) => r.status === 201 });

    const login = http.post(
      `${CONFIG.base}/auth/login`,
      JSON.stringify({ email, password: CONFIG.password }),
      { headers: jsonHeaders }
    );
    check(login, { 'requester login 200': (r) => r.status === 200 });

    const { accessToken } = JSON.parse(login.body);
    requesters.push({ accessToken });
  }

  return { communities, requesters };
}

// Fluxo completo: requester solicita → owner lista → owner rejeita
// Cada VU opera na sua própria comunidade via __VU % communities.length
export default function (data) {
  if (!data.communities || data.communities.length === 0) return;

  const comm             = data.communities[__VU % data.communities.length];
  const requester        = randomItem(data.requesters);
  const requesterHeaders = { Authorization: `Bearer ${requester.accessToken}` };
  const ownerHeaders     = { Authorization: `Bearer ${comm.ownerToken}` };

  // 1. Requester solicita entrada
  const reqRes = http.post(
    `${CONFIG.base}/communities/${comm.communityId}/join-requests`,
    null,
    { headers: requesterHeaders }
  );
  check(reqRes, {
    'request 201 ou conflito': (r) => r.status === 201 || (r.status >= 400 && r.status < 500),
  });

  sleep(CONFIG.sleep.betweenSteps);

  // 2. Owner lista pendentes da sua comunidade
  const pendingRes = http.get(
    `${CONFIG.base}/communities/${comm.communityId}/join-requests?page=0&size=10`,
    { headers: ownerHeaders }
  );
  check(pendingRes, { 'GET /join-requests 200': (r) => r.status === 200 });

  // 3. Owner rejeita o primeiro
  if (pendingRes.status === 200) {
    try {
      const page = JSON.parse(pendingRes.body);
      if (page.content && page.content.length > 0) {
        sleep(CONFIG.sleep.betweenSteps);
        const rejectRes = http.post(
          `${CONFIG.base}/communities/join-requests/${page.content[0].id}/reject`,
          null,
          { headers: ownerHeaders }
        );
        check(rejectRes, { 'reject 204 ou conflito': (r) => r.status === 204 || (r.status >= 400 && r.status < 500) });
      }
    } catch (_) {}
  }

  sleep(CONFIG.sleep.afterIteration);
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
