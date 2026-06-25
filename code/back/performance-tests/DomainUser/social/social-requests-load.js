import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:     'http://localhost:8080',
  password: 'Senha@12345',
  prefix:   'socialreq',

  requestVus: 100,
  duration:  '2m',

  thresholds: {
    p95General: 1500,
    failRate:   0.01,
  },

  sleep: {
    betweenSteps:   0.3,
    afterIteration: 0.5,
  },
};

export const options = {
  setupTimeout: '3m',

  scenarios: {
    requests: {
      executor: 'constant-vus',
      vus:      CONFIG.requestVus,
      duration: CONFIG.duration,
      exec:     'requestFlow',
    },
  },

  thresholds: {
    http_req_duration: [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:   [`rate<${CONFIG.thresholds.failRate}`],
  },
};

function registerAndLogin(username, headers) {
  const reg = http.post(
    `${CONFIG.base}/auth/register`,
    JSON.stringify({ username, email: `${username}@test.com`, password: CONFIG.password }),
    { headers }
  );
  check(reg, { 'register 201': (r) => r.status === 201 });
  if (reg.status !== 201) return null;

  const login = http.post(
    `${CONFIG.base}/auth/login`,
    JSON.stringify({ email: `${username}@test.com`, password: CONFIG.password }),
    { headers }
  );
  check(login, { 'login 200': (r) => r.status === 200 });
  if (login.status !== 200) return null;

  try {
    return { username, accessToken: JSON.parse(login.body).accessToken };
  } catch {
    return null;
  }
}

export function setup() {
  const headers = { 'Content-Type': 'application/json' };
  const pairs = [];

  for (let i = 0; i < CONFIG.requestVus; i++) {
    const ts        = Date.now() + i;
    const owner     = registerAndLogin(`${CONFIG.prefix}_owner_${ts}`, headers);
    const requester = registerAndLogin(`${CONFIG.prefix}_req_${ts}`, headers);
    if (!owner || !requester) continue;

    const visRes = http.put(
      `${CONFIG.base}/users/me/visibility`,
      JSON.stringify({ isPrivate: true }),
      { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${owner.accessToken}` } }
    );
    check(visRes, { 'visibility 200': (r) => r.status === 200 });
    if (visRes.status !== 200) continue;

    pairs.push({ owner, requester });
  }

  if (pairs.length === 0) {
    throw new Error('Setup falhou: nenhum par owner/requester criado.');
  }

  console.log(`Setup concluído: ${pairs.length} pares owner(privado)/requester.`);
  return { pairs };
}


export function requestFlow(data) {
  const pair = data.pairs[(__VU - 1) % data.pairs.length];
  if (!pair) return;

  const { owner, requester } = pair;
  const ownerH = { Authorization: `Bearer ${owner.accessToken}` };
  const reqH   = { Authorization: `Bearer ${requester.accessToken}` };

  const followRes = http.post(`${CONFIG.base}/users/${owner.username}/follow`, null, { headers: reqH });
  check(followRes, { 'follow privado 202': (r) => r.status === 202 });

  sleep(CONFIG.sleep.betweenSteps);

  const listRes = http.get(
    `${CONFIG.base}/users/me/follow-requests?page=0&size=20`,
    { headers: ownerH }
  );
  check(listRes, { 'GET /follow-requests 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.betweenSteps);

  if (__ITER % 2 === 0) {
    const acceptRes = http.post(
      `${CONFIG.base}/users/me/follow-requests/${requester.username}/accept`,
      null,
      { headers: ownerH }
    );
    check(acceptRes, { 'accept 204': (r) => r.status === 204 });

    sleep(CONFIG.sleep.betweenSteps);

    const unfollowRes = http.del(`${CONFIG.base}/users/${owner.username}/follow`, null, { headers: reqH });
    check(unfollowRes, { 'unfollow reset 204': (r) => r.status === 204 });
  } else {
    const rejectRes = http.del(
      `${CONFIG.base}/users/me/follow-requests/${requester.username}`,
      null,
      { headers: ownerH }
    );
    check(rejectRes, { 'reject 204': (r) => r.status === 204 });
  }

  sleep(CONFIG.sleep.afterIteration);
}
