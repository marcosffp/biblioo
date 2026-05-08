import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:            'http://localhost:8080',
  password:        'Senha@12345',
  prefix:          'sinvcomm',
  inviteePoolSize: 800,
  bookId:          1,

  stress: {
    stageDuration: '30s',
    stages: [10, 20, 50, 100, 150, 200, 600],  // VUs por estágio (rampa crescente)
  },

  thresholds: {
    p95General: 5000,
    failRate:   0.30,  // conflitos de estado são esperados em stress de invites
  },

  sleep: {
    betweenSteps:   0.1,
    afterIteration: 0.2,
  },
};

export const options = {
  setupTimeout: '8m',

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

  const ownerTs    = Date.now();
  const ownerEmail = `${CONFIG.prefix}_owner_${ownerTs}@test.com`;

  const ownerReg = http.post(
    `${CONFIG.base}/auth/register`,
    JSON.stringify({ username: `${CONFIG.prefix}_o_${ownerTs}`, email: ownerEmail, password: CONFIG.password }),
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
  const ownerHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` };

  const commRes = http.post(
    `${CONFIG.base}/communities`,
    JSON.stringify({
      name:        `Invites Stress ${ownerTs}`,
      description: 'Comunidade privada para stress test de convites',
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
    invitees.push({ userId: body.user.id, accessToken: body.accessToken });
  }

  return { ownerToken, communityId, invitees };
}

// Fluxo completo: owner convida → invitee lista pendentes → invitee declina
export default function (data) {
  if (!data.invitees || data.invitees.length === 0) return;

  const ownerHeaders = {
    'Content-Type': 'application/json',
    Authorization:  `Bearer ${data.ownerToken}`,
  };

  const invitee        = randomItem(data.invitees);
  const inviteeHeaders = { Authorization: `Bearer ${invitee.accessToken}` };

  // 1. Owner convida
  const inviteRes = http.post(
    `${CONFIG.base}/communities/${data.communityId}/invites`,
    JSON.stringify({ inviteeId: invitee.userId }),
    { headers: ownerHeaders }
  );
  check(inviteRes, {
    'invite 201 ou conflito': (r) => r.status === 201 || (r.status >= 400 && r.status < 500),
  });

  sleep(CONFIG.sleep.betweenSteps);

  // 2. Invitee lista pendentes e declina o primeiro
  const pendingRes = http.get(
    `${CONFIG.base}/communities/invites/pending?page=0&size=10`,
    { headers: inviteeHeaders }
  );
  check(pendingRes, { 'GET /invites/pending 200': (r) => r.status === 200 });

  if (pendingRes.status === 200) {
    try {
      const page = JSON.parse(pendingRes.body);
      if (page.content && page.content.length > 0) {
        sleep(CONFIG.sleep.betweenSteps);
        const declineRes = http.post(
          `${CONFIG.base}/communities/invites/${page.content[0].id}/decline`,
          null,
          { headers: inviteeHeaders }
        );
        check(declineRes, { 'decline 204 ou conflito': (r) => r.status === 204 || (r.status >= 400 && r.status < 500) });
      }
    } catch (_) {}
  }

  sleep(CONFIG.sleep.afterIteration);
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
