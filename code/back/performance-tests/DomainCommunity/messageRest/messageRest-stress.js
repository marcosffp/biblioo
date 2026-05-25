// Stress sobre CommunityMessageRestController — apenas GETs (sem /media, ver
// nota no messageRest-load.js).

import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:              'http://localhost:8080',
  password:          'Senha@12345',
  prefix:            'stmr',
  userPoolSize:      800,
  communityPoolSize: 10,
  bookId:            1,

  stress: {
    stageDuration: '30s',
    stages:        [20, 50, 100, 200, 300, 400, 600],
  },

  thresholds: {
    p95General: 2500,
    failRate:   0.05,
  },

  sleep: {
    betweenSteps:   0.2,
    afterIteration: 0.5,
  },
};

export function setup() {
  const jsonH = { 'Content-Type': 'application/json' };

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
  const ownerH = { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` };

  const commIds = [];
  for (let i = 0; i < CONFIG.communityPoolSize; i++) {
    const res = http.post(
      `${CONFIG.base}/communities`,
      JSON.stringify({
        name: `MsgRest Stress ${ownerTs}_${i}`, description: 'Setup stress',
        type: 'PUBLIC', bookId: CONFIG.bookId,
      }),
      { headers: ownerH }
    );
    if (res.status === 201) commIds.push(JSON.parse(res.body).id);
  }
  if (commIds.length === 0) throw new Error('Nenhuma comunidade criada.');

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
  return { users, commIds };
}

export const options = {
  setupTimeout: '1200s',  // ~800 users × 10 comunidades de join no setup
  stages: [
    ...CONFIG.stress.stages.map((vus) => ({ duration: CONFIG.stress.stageDuration, target: vus })),
    { duration: CONFIG.stress.stageDuration, target: 0 },
  ],
  thresholds: {
    http_req_duration: [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:   [`rate<${CONFIG.thresholds.failRate}`],
  },
};

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function (data) {
  const user = data.users[(__VU - 1) % data.users.length];
  if (!user) return;
  const headers = { Authorization: `Bearer ${user.accessToken}` };
  const commId  = randomItem(data.commIds);

  const listRes = http.get(
    `${CONFIG.base}/communities/${commId}/messages?limit=50`,
    { headers }
  );
  check(listRes, { 'list 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.betweenSteps);

  const beforeRes = http.get(
    `${CONFIG.base}/communities/${commId}/messages?before=${Date.now()}&limit=20`,
    { headers }
  );
  check(beforeRes, { 'before 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.betweenSteps);

  const syncRes = http.get(
    `${CONFIG.base}/communities/${commId}/messages/sync?after=${Date.now() - 60_000}`,
    { headers }
  );
  check(syncRes, { 'sync 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.afterIteration);
}
