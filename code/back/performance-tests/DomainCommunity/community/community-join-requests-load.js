import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:              'http://localhost:8080',
  password:          'Senha@12345',
  prefix:            'reqcomm',
  requesterPoolSize: 300,
  communityPoolSize: 150,

  bookId: 1,

  load: {
    requestVus: 150,
    listVus:    60,
    duration:   '2m',
  },

  thresholds: {
    p95General: 1500,
    p95Request: 2000,
    p95List:     800,
    failRate:   0.05,
  },

  sleep: {
    betweenSteps:   0.3,
    afterIteration: 0.5,
  },
};

export const options = {
  setupTimeout: '15m',

  scenarios: {
    request: {
      executor: 'constant-vus',
      vus:      CONFIG.load.requestVus,
      duration: CONFIG.load.duration,
      exec:     'requestFlow',
    },
    listPending: {
      executor: 'constant-vus',
      vus:      CONFIG.load.listVus,
      duration: CONFIG.load.duration,
      exec:     'listPending',
    },
  },

  thresholds: {
    http_req_duration:                          [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:                            [`rate<${CONFIG.thresholds.failRate}`],
    'http_req_duration{scenario:request}':      [`p(95)<${CONFIG.thresholds.p95Request}`],
    'http_req_duration{scenario:listPending}':  [`p(95)<${CONFIG.thresholds.p95List}`],
  },
};

export function setup() {
  const jsonHeaders = { 'Content-Type': 'application/json' };

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
    const ownerHeaders = {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${ownerToken}`,
    };

    const commRes = http.post(
      `${CONFIG.base}/communities`,
      JSON.stringify({
        name:        `JR Test ${i} ${ts}`,
        description: 'Comunidade privada para testar join-requests',
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

export function requestFlow(data) {
  if (!data.communities || data.communities.length === 0) return;

  const comm             = data.communities[__VU % data.communities.length];
  const requester        = randomItem(data.requesters);
  const requesterHeaders = { Authorization: `Bearer ${requester.accessToken}` };
  const ownerHeaders     = { Authorization: `Bearer ${comm.ownerToken}` };

  const reqRes = http.post(
    `${CONFIG.base}/communities/${comm.communityId}/join-requests`,
    null,
    {
      headers:          requesterHeaders,
      responseCallback: http.expectedStatuses({ min: 200, max: 299 }, { min: 400, max: 499 }),
    }
  );
  check(reqRes, {
    'request 201 ou conflito': (r) => r.status === 201 || (r.status >= 400 && r.status < 500),
  });

  sleep(CONFIG.sleep.betweenSteps);

  const pendingRes = http.get(
    `${CONFIG.base}/communities/${comm.communityId}/join-requests?page=0&size=10`,
    { headers: ownerHeaders }
  );
  check(pendingRes, { 'GET /join-requests 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.afterIteration);
}

export function listPending(data) {
  if (!data.communities || data.communities.length === 0) return;

  const comm    = data.communities[__VU % data.communities.length];
  const headers = { Authorization: `Bearer ${comm.ownerToken}` };

  const res = http.get(
    `${CONFIG.base}/communities/${comm.communityId}/join-requests?page=0&size=10`,
    { headers }
  );
  check(res, { 'GET /join-requests 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.afterIteration);
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
