import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:              'http://localhost:8080',
  password:          'Senha@12345',
  prefix:            'sreqsocial',
  ownerPoolSize:     50, 
  requesterPoolSize: 400,

  stress: {
    stageDuration: '30s',
    stages: [10, 20, 50, 100, 150, 200, 250],
  },

  thresholds: {
    p95General: 5000,
    failRate:   0.40,
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


export default function (data) {
  if (!data.owners || data.owners.length === 0) return;

  const owner            = data.owners[__VU % data.owners.length];
  const requester        = randomItem(data.requesters);
  const requesterHeaders = { Authorization: `Bearer ${requester.accessToken}` };
  const ownerHeaders     = { Authorization: `Bearer ${owner.ownerToken}` };

  const followRes = http.post(
    `${CONFIG.base}/users/${owner.username}/follow`,
    null,
    { headers: requesterHeaders }
  );
  check(followRes, {
    'follow: servidor respondeu': (r) => r.status >= 200,
  });

  sleep(CONFIG.sleep.betweenSteps);

  const pendingRes = http.get(
    `${CONFIG.base}/users/me/follow-requests?page=0&size=10`,
    { headers: ownerHeaders }
  );
  check(pendingRes, { 'GET /follow-requests 200': (r) => r.status === 200 });

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
