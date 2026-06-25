import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:     'http://localhost:8080',
  password: 'Senha@12345',
  prefix:   'sstr',

  celebPoolSize:    20,
  followerPoolSize: 400,

  stress: {
    stageDuration: '30s',
    stages: [20, 50, 100, 200],
  },

  thresholds: {
    p95General: 2500,
    failRate:   0.05,
  },

  sleep: { afterIteration: 0.3 },
};

export const options = {
  setupTimeout: '6m',
  stages: [
    ...CONFIG.stress.stages.map((vus) => ({ duration: CONFIG.stress.stageDuration, target: vus })),
    { duration: CONFIG.stress.stageDuration, target: 0 },
  ],
  thresholds: {
    http_req_duration: [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:   [`rate<${CONFIG.thresholds.failRate}`],
  },
};

function registerAndLogin(prefix, i, headers) {
  const ts       = Date.now() + i;
  const username = `${prefix}_${ts}`;
  const reg = http.post(`${CONFIG.base}/auth/register`,
    JSON.stringify({ username, email: `${username}@test.com`, password: CONFIG.password }), { headers });
  if (reg.status !== 201) return null;
  const login = http.post(`${CONFIG.base}/auth/login`,
    JSON.stringify({ email: `${username}@test.com`, password: CONFIG.password }), { headers });
  if (login.status !== 200) return null;
  try { return { username, accessToken: JSON.parse(login.body).accessToken }; } catch { return null; }
}

export function setup() {
  const headers = { 'Content-Type': 'application/json' };
  const celebs = [];
  for (let i = 0; i < CONFIG.celebPoolSize; i++) {
    const u = registerAndLogin(`${CONFIG.prefix}_celeb`, i, headers);
    if (u) celebs.push(u);
  }
  const followers = [];
  for (let i = 0; i < CONFIG.followerPoolSize; i++) {
    const u = registerAndLogin(`${CONFIG.prefix}_f`, i, headers);
    if (u) followers.push(u);
  }
  if (celebs.length === 0 || followers.length === 0) throw new Error('Setup falhou: pools vazios.');
  console.log(`Setup: ${celebs.length} celebs + ${followers.length} followers.`);
  return { celebs, followers };
}

export default function (data) {
  const follower = data.followers[(__VU - 1) % data.followers.length];
  const celeb    = data.celebs[(__VU - 1) % data.celebs.length];
  const headers  = { Authorization: `Bearer ${follower.accessToken}` };

  const followRes = http.post(`${CONFIG.base}/users/${celeb.username}/follow`, null, { headers });
  check(followRes, { 'follow 204 ou conflito': (r) => r.status === 204 || (r.status >= 400 && r.status < 500) });

  const followingRes = http.get(`${CONFIG.base}/users/${follower.username}/following?page=0&size=20`, { headers });
  check(followingRes, { 'GET /following 200': (r) => r.status === 200 });

  const unfollowRes = http.del(`${CONFIG.base}/users/${celeb.username}/follow`, null, { headers });
  check(unfollowRes, { 'unfollow 204': (r) => r.status === 204 });

  sleep(CONFIG.sleep.afterIteration);
}
