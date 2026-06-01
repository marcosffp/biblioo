import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  password:     'Senha@12345',
  prefix:       'loaduser',
  userPoolSize: 230,

  // Ajuste para um bookId válido no seu ambiente (usado indiretamente via setup)
  load: {
    authVus:    84,
    profileVus: 126,
    duration:   '2m',
  },

  thresholds: {
    p95General: 1000,  // ms
    p95Auth:    2000,  // ms — register + login é mais lento
    p95Profile:  500,  // ms — leitura cacheada pelo Redis
    failRate:   0.01,  // 1%
  },

  sleep: {
    betweenSteps:   0.3,  // s
    afterIteration: 1,    // s
    profile:        0.5,  // s
  },
};

// ── Setup ─────────────────────────────────────────────────────────────────────
// Cria um pool de usuários reais para o cenário de leitura de perfil.
// O cenário authFlow cria novos usuários durante o teste (sem depender do pool).

export const options = {
  setupTimeout: '3m',

  scenarios: {
    auth: {
      executor: 'constant-vus',
      vus:      CONFIG.load.authVus,
      duration: CONFIG.load.duration,
      exec:     'authFlow',
    },
    profile: {
      executor: 'constant-vus',
      vus:      CONFIG.load.profileVus,
      duration: CONFIG.load.duration,
      exec:     'profileRead',
    },
  },

  thresholds: {
    http_req_duration:                        [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:                          [`rate<${CONFIG.thresholds.failRate}`],
    'http_req_duration{scenario:auth}':       [`p(95)<${CONFIG.thresholds.p95Auth}`],
    'http_req_duration{scenario:profile}':    [`p(95)<${CONFIG.thresholds.p95Profile}`],
  },
};

export function setup() {
  const users = [];
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

// ── Cenário 1: fluxo de autenticação (register → login) ──────────────────────

export function authFlow() {
  const headers = { 'Content-Type': 'application/json' };
  const ts       = Date.now();
  const email    = `${CONFIG.prefix}_vu${__VU}_${ts}@test.com`;
  const username = `${CONFIG.prefix}_vu${__VU}_${ts}`;

  const regRes = http.post(
    `${CONFIG.base}/auth/register`,
    JSON.stringify({ username, email, password: CONFIG.password }),
    { headers }
  );
  check(regRes, { 'register 201': (r) => r.status === 201 });

  if (regRes.status !== 201) {
    sleep(CONFIG.sleep.afterIteration);
    return;
  }

  sleep(CONFIG.sleep.betweenSteps);

  const loginRes = http.post(
    `${CONFIG.base}/auth/login`,
    JSON.stringify({ email, password: CONFIG.password }),
    { headers }
  );
  check(loginRes, {
    'login 200':          (r) => r.status === 200,
    'login retorna token': (r) => {
      try { return JSON.parse(r.body).accessToken != null; }
      catch { return false; }
    },
  });

  sleep(CONFIG.sleep.afterIteration);
}

// ── Cenário 2: leitura de perfil (GET /me + GET /{username}) ──────────────────

export function profileRead(data) {
  if (!data.users || data.users.length === 0) return;

  const user    = data.users[__VU % data.users.length];
  const headers = { Authorization: `Bearer ${user.accessToken}` };

  const meRes = http.get(`${CONFIG.base}/users/me`, { headers });
  check(meRes, { 'GET /me 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.betweenSteps);

  const target      = randomItem(data.users);
  const profileRes  = http.get(`${CONFIG.base}/users/${target.username}`, { headers });
  check(profileRes, { 'GET /{username} 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.profile);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
