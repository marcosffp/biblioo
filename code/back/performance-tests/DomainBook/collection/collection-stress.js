import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 50,
  password:     'senha12345',
  prefix:       'stresscollection',

  stress: {
    stageDuration: '30s',
    stages:        [20, 50, 100, 200, 300],  // VUs por estágio (rampa crescente)
  },

  thresholds: {
    p95General: 1000,  // ms
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
    const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` };

    // Cria uma estante própria para usar nos testes de add/remove shelf
    const shelfRes = http.post(
      `${CONFIG.base}/shelves`,
      JSON.stringify({ name: `Estante setup ${ts}`, description: 'Criada pelo setup do stress test' }),
      { headers: authHeaders }
    );

    const shelfId = JSON.parse(shelfRes.body).id;
    users.push({ accessToken, shelfId });
  }

  return { users };
}

export const options = {
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
  const user    = data.users[__VU % data.users.length];
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${user.accessToken}`,
  };

  // LIST
  const listRes = http.get(`${CONFIG.base}/collections`, { headers });
  check(listRes, {
    'list 200': (r) => r.status === 200,
    'list array': (r) => {
      try { return Array.isArray(JSON.parse(r.body)); }
      catch { return false; }
    },
  });

  sleep(CONFIG.sleep.betweenSteps);

  // CREATE
  const createRes = http.post(
    `${CONFIG.base}/collections`,
    JSON.stringify({
      name:        `Stress VU${__VU} iter${__ITER}`,
      description: 'Stress test collection',
    }),
    { headers }
  );
  check(createRes, { 'create 201': (r) => r.status === 201 });

  if (createRes.status === 201) {
    const collectionId = JSON.parse(createRes.body).id;

    sleep(CONFIG.sleep.betweenSteps);

    // GET (detalhe)
    const getRes = http.get(`${CONFIG.base}/collections/${collectionId}`, { headers });
    check(getRes, { 'get 200': (r) => r.status === 200 });

    sleep(CONFIG.sleep.betweenSteps);

    // ADD SHELF (estante criada no setup, pertence ao mesmo usuário)
    const addShelfRes = http.patch(
      `${CONFIG.base}/collections/${collectionId}/shelves`,
      JSON.stringify({ shelfId: user.shelfId }),
      { headers }
    );
    check(addShelfRes, { 'add shelf 200': (r) => r.status === 200 });

    sleep(CONFIG.sleep.betweenSteps);

    // REMOVE SHELF
    const removeShelfRes = http.del(
      `${CONFIG.base}/collections/${collectionId}/shelves/${user.shelfId}`,
      null,
      { headers }
    );
    check(removeShelfRes, { 'remove shelf 200': (r) => r.status === 200 });

    sleep(CONFIG.sleep.betweenSteps);

    // UPDATE
    const updateRes = http.put(
      `${CONFIG.base}/collections/${collectionId}`,
      JSON.stringify({
        name:        `Stress atualizada VU${__VU} iter${__ITER}`,
        description: 'Atualizada no stress test',
      }),
      { headers }
    );
    check(updateRes, { 'update 200': (r) => r.status === 200 });

    sleep(CONFIG.sleep.betweenSteps);

    // DELETE
    const delRes = http.del(`${CONFIG.base}/collections/${collectionId}`, null, { headers });
    check(delRes, { 'delete 204': (r) => r.status === 204 });
  }

  sleep(CONFIG.sleep.afterIteration);
}