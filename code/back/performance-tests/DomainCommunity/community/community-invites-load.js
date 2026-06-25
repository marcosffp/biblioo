import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:            'http://localhost:8080',
  password:        'Senha@12345',
  prefix:          'invcomm',
  inviteePoolSize: 230,

  bookId: 1,

  load: {
    inviteVus: 150,
    listVus:   60,
    duration:  '2m',
  },

  thresholds: {
    p95General: 1500,
    p95Invite: 2000,
    p95List:    1500,
    failRate:   0.05,
  },

  sleep: {
    betweenSteps:   0.3,
    afterIteration: 0.5,
  },
};

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

export function inviteFlow(data) {
  if (!data.invitees || data.invitees.length === 0) return;

  const ownerHeaders = {
    'Content-Type': 'application/json',
    Authorization:  `Bearer ${data.ownerToken}`,
  };

  const invitee        = data.invitees[(__VU - 1) % data.invitees.length];
  const inviteeHeaders = { Authorization: `Bearer ${invitee.accessToken}` };

  const inviteRes = http.post(
    `${CONFIG.base}/communities/${data.communityId}/invites`,
    JSON.stringify({ inviteeId: invitee.userId }),
    { headers: ownerHeaders }
  );
  check(inviteRes, {
    'invite 201 ou conflito': (r) => r.status === 201 || (r.status >= 400 && r.status < 500),
  });

  sleep(CONFIG.sleep.betweenSteps);

  const pendingRes = http.get(
    `${CONFIG.base}/communities/invites/pending?page=0&size=10`,
    { headers: inviteeHeaders }
  );
  check(pendingRes, { 'GET /invites/pending 200': (r) => r.status === 200 });

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
    } catch (_) {}
  }

  sleep(CONFIG.sleep.afterIteration);
}


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


function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
