import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:              'http://localhost:8080',
  password:          'Senha@12345',
  prefix:            'stresscomm',
  userPoolSize:      100,
  communityPoolSize: 15,

  bookId: 1,

  stress: {
    stageDuration: '30s',
    stages: [20, 50, 100, 200, 300, 500],
  },

  thresholds: {
    p95General: 5000,
    failRate:   0.10,
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

  const commIds = [];
  for (let i = 0; i < CONFIG.communityPoolSize; i++) {
    const commRes = http.post(
      `${CONFIG.base}/communities`,
      JSON.stringify({
        name:        `Comm Stress ${ownerTs}_${i}`,
        description: 'Criada pelo setup do stress test',
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
    users.push({ accessToken });
  }

  return { users, commIds };
}

export default function (data) {
  if (!data.commIds || data.commIds.length === 0) return;

  const user    = data.users[__VU % data.users.length];
  const headers = { Authorization: `Bearer ${user.accessToken}` };

  const listRes = http.get(`${CONFIG.base}/communities`, { headers });
  check(listRes, { 'GET /communities 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.betweenSteps);

  const commId = randomItem(data.commIds);
  const getRes = http.get(`${CONFIG.base}/communities/${commId}`, { headers });
  check(getRes, { 'GET /communities/{id} 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.afterIteration);
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
