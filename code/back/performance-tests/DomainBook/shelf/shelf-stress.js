import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 800,
  password:     'Senha@12345',
  prefix:       'stressshelf',

  stress: {
    stageDuration: '30s',
    stages:        [20, 50, 100, 200, 300, 400, 600],  // VUs por estágio (rampa crescente)
  },

  thresholds: {
    p95General: 2500,  // ms
    failRate:   0.05,  // 5% — stress tolera mais erros
  },

  sleep: {
    betweenSteps:   0.2,  // s
    afterIteration: 0.5,  // s
  },
};

export function setup() {
  const users = [];
  const headers = { 'Content-Type': 'application/json' };

  for (let i = 0; i < CONFIG.userPoolSize; i++) {
    const ts = Date.now() + i;
    const email = `${CONFIG.prefix}_${ts}@test.com`;

    http.post(
      `${CONFIG.base}/auth/register`,
      JSON.stringify({ username: `${CONFIG.prefix}_${ts}`, email, password: CONFIG.password }),
      { headers }
    );

    const login = http.post(
      `${CONFIG.base}/auth/login`,
      JSON.stringify({ email, password: CONFIG.password }),
      { headers }
    );

    const { accessToken } = JSON.parse(login.body);
    users.push({ accessToken });
  }

  return { users };
}

export const options = {
  setupTimeout: '300s', // setup cria 500 usuários, aumentado para suportar máquina local
  stages: [
    ...CONFIG.stress.stages.map((vus) => ({ duration: CONFIG.stress.stageDuration, target: vus })),
    { duration: CONFIG.stress.stageDuration, target: 0 },  // rampa de descida
  ],
  thresholds: {
    http_req_duration: [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:   [`rate<${CONFIG.thresholds.failRate}`],
  },
};

export default function (data) {
  const token = data.users[__VU % data.users.length].accessToken;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const listRes = http.get(`${CONFIG.base}/shelves`, { headers });
  check(listRes, {
    'list 200': (r) => r.status === 200,
    'list array': (r) => {
      try { return Array.isArray(JSON.parse(r.body)); }
      catch { return false; }
    },
  });

  sleep(CONFIG.sleep.betweenSteps);

  const createRes = http.post(
    `${CONFIG.base}/shelves`,
    JSON.stringify({
      name: `Stress VU${__VU} iter${__ITER}`,
      description: 'Stress test shelf',
    }),
    { headers }
  );
  check(createRes, { 'create 201': (r) => r.status === 201 });

  if (createRes.status === 201) {
    const shelfId = JSON.parse(createRes.body).id;

    sleep(CONFIG.sleep.betweenSteps);

    const getRes = http.get(`${CONFIG.base}/shelves/${shelfId}`, { headers });
    check(getRes, { 'get 200': (r) => r.status === 200 });

    sleep(CONFIG.sleep.betweenSteps);

    const delRes = http.del(`${CONFIG.base}/shelves/${shelfId}`, null, { headers });
    check(delRes, { 'delete 204': (r) => r.status === 204 });
  }

  sleep(CONFIG.sleep.afterIteration);
}
