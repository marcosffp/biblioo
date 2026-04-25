import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  password:     'Senha@12345',
  prefix:       'managecomm',
  userPoolSize: 100,

  // ID de um livro que existe no banco — necessário para criar comunidade
  bookId: 1,

  stress: {
    stageDuration: '30s',
    stages: [10, 20, 50, 100, 150, 200],  // VUs por estágio (rampa crescente)
  },

  thresholds: {
    p95General: 5000,  // ms
    failRate:   0.10,  // 10%
  },

  sleep: {
    betweenSteps:   0.1,  // s
    afterIteration: 0.2,  // s
  },
};

// ── Setup ─────────────────────────────────────────────────────────────────────
// Apenas cria o pool de usuários autenticados — cada VU vai criar/atualizar/
// deletar suas próprias comunidades durante o teste, isolando a pressão do CRUD.

export const options = {
  setupTimeout: '5m',

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
  const users   = [];
  const headers = { 'Content-Type': 'application/json' };

  for (let i = 0; i < CONFIG.userPoolSize; i++) {
    const ts    = Date.now() + i;
    const email = `${CONFIG.prefix}_${ts}@test.com`;

    const reg = http.post(
      `${CONFIG.base}/auth/register`,
      JSON.stringify({ username: `${CONFIG.prefix}_${ts}`, email, password: CONFIG.password }),
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
    users.push({ accessToken });
  }

  return { users };
}

export default function (data) {
  if (!data.users || data.users.length === 0) return;

  const user    = data.users[__VU % data.users.length];
  const headers = {
    'Content-Type': 'application/json',
    Authorization:  `Bearer ${user.accessToken}`,
  };

  // ── CREATE ──────────────────────────────────────────────────────────────────
  const ts        = Date.now();
  const createRes = http.post(
    `${CONFIG.base}/communities`,
    JSON.stringify({
      name:        `Manage Stress VU${__VU} ${ts}`,
      description: 'Criada pelo manage stress test',
      type:        'PUBLIC',
      bookId:      CONFIG.bookId,
    }),
    { headers }
  );
  check(createRes, {
    'create 201': (r) => r.status === 201,
    'create retorna id': (r) => {
      try { return JSON.parse(r.body).id != null; }
      catch { return false; }
    },
  });

  if (createRes.status !== 201) {
    sleep(CONFIG.sleep.afterIteration);
    return;
  }

  const commId = JSON.parse(createRes.body).id;
  sleep(CONFIG.sleep.betweenSteps);

  // ── UPDATE ──────────────────────────────────────────────────────────────────
  const updateRes = http.put(
    `${CONFIG.base}/communities/${commId}`,
    JSON.stringify({
      name:        `Manage Stress VU${__VU} ${ts} atualizada`,
      description: 'Atualizada pelo manage stress test',
    }),
    { headers }
  );
  check(updateRes, { 'update 200': (r) => r.status === 200 });
  sleep(CONFIG.sleep.betweenSteps);

  // ── DELETE ──────────────────────────────────────────────────────────────────
  const deleteRes = http.del(`${CONFIG.base}/communities/${commId}`, null, { headers });
  check(deleteRes, { 'delete 204': (r) => r.status === 204 });

  sleep(CONFIG.sleep.afterIteration);
}
