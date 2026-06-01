import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  password:     'Senha@12345',
  prefix:       'spikeuser',
  userPoolSize: 500,

  spike: {
    baseVus:    70,
    peakVus:    500,
    rampUpBase: '10s',
    rampToPeak:  '5s',
    holdPeak:   '20s',
    rampDown:    '5s',
    cooldown:   '10s',
  },

  thresholds: {
    p95General: 2000,  // ms
    failRate:   0.05,  // 5%
  },

  sleep: {
    betweenSteps:   0.3,  // s
    afterIteration: 0.5,  // s
  },
};

export const options = {
  setupTimeout: '3m',

  stages: [
    { duration: CONFIG.spike.rampUpBase, target: CONFIG.spike.baseVus  },  // aquece na carga base
    { duration: CONFIG.spike.rampToPeak, target: CONFIG.spike.peakVus  },  // spike brusco
    { duration: CONFIG.spike.holdPeak,   target: CONFIG.spike.peakVus  },  // mantém pico
    { duration: CONFIG.spike.rampDown,   target: CONFIG.spike.baseVus  },  // queda brusca
    { duration: CONFIG.spike.cooldown,   target: 0                     },  // recuperação
  ],

  thresholds: {
    http_req_duration: [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:   [`rate<${CONFIG.thresholds.failRate}`],
  },
};

export function setup() {
  const users   = [];
  const headers = { 'Content-Type': 'application/json' };

  for (let i = 0; i < CONFIG.userPoolSize; i++) {
    const ts       = Date.now() + i;
    const email    = `${CONFIG.prefix}_${ts}@test.com`;
    const username = `${CONFIG.prefix}_${ts}`;

    const reg = http.post(
      `${CONFIG.base}/auth/register`,
      JSON.stringify({ username, email, password: CONFIG.password }),
      { headers }
    );
    check(reg, { 'register 201': (r) => r.status === 201 });

    const login = http.post(
      `${CONFIG.base}/auth/login`,
      JSON.stringify({ email, password: CONFIG.password }),
      { headers }
    );
    check(login, { 'login 200': (r) => r.status === 200 });

    const { accessToken } = JSON.parse(login.body);
    users.push({ accessToken, username });
  }

  return { users };
}

export default function (data) {
  if (!data.users || data.users.length === 0) return;

  const user    = data.users[__VU % data.users.length];
  const headers = { Authorization: `Bearer ${user.accessToken}` };

  // Perfil próprio — hit de cache mais provável durante o pico
  const meRes = http.get(`${CONFIG.base}/users/me`, { headers });
  check(meRes, { 'GET /me 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.betweenSteps);

  // Perfil alheio — varia o alvo para pressionar o banco/cache durante o spike
  const target     = randomItem(data.users);
  const profileRes = http.get(`${CONFIG.base}/users/${target.username}`, { headers });
  check(profileRes, { 'GET /{username} 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.afterIteration);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
