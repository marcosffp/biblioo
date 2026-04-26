import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  password:     'Senha@12345',
  prefix:       'stressuser',
  userPoolSize: 500,

  stress: {
    stageDuration: '30s',
    stages: [50, 100, 200, 300, 500, 700, 1000],  // VUs por estágio (rampa crescente)
  },

  thresholds: {
    p95General: 5000,  // ms — limite relaxado para encontrar o ponto de quebra
    failRate:   0.10,  // 10%
  },

  sleep: {
    betweenSteps:   0.05,  // s
    afterIteration: 0.1,   // s
  },
};

export const options = {
  setupTimeout: '8m',

  stages: [
    ...CONFIG.stress.stages.map((vus) => ({ duration: CONFIG.stress.stageDuration, target: vus })),
    { duration: CONFIG.stress.stageDuration, target: 0 },  // rampa de descida
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

  // Leitura do próprio perfil — exercita cache Redis
  const meRes = http.get(`${CONFIG.base}/users/me`, { headers });
  check(meRes, { 'GET /me 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.betweenSteps);

  // Leitura de perfil alheio — varia o username para pressionar a camada de busca
  const target     = randomItem(data.users);
  const profileRes = http.get(`${CONFIG.base}/users/${target.username}`, { headers });
  check(profileRes, { 'GET /{username} 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.afterIteration);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
