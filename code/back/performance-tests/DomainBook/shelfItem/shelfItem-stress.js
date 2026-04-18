import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 300,  // deve ser >= ao número máximo de VUs para evitar que VUs compartilhem usuário/estante
  password:     'senha12345',
  prefix:       'stressshelfitem',

  bookId: 1,  // ID de um livro existente no banco para usar nos testes

  stress: {
    stageDuration: '30s',
    stages:        [20, 50, 100, 200, 300, 400],  // VUs por estágio (rampa crescente)
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

    // Cria uma estante própria para usar nos testes de shelf items
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
  setupTimeout: '120s',  // setup cria 300 usuários; timeout padrão de 60s pode não ser suficiente
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
  const user = data.users[__VU % data.users.length];
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${user.accessToken}`,
  };

  // LIST ITEMS
  const listRes = http.get(`${CONFIG.base}/shelves/${user.shelfId}/items`, { headers });
  check(listRes, {
    'list items 200': (r) => r.status === 200,
    'list array': (r) => {
      try { return Array.isArray(JSON.parse(r.body)); }
      catch { return false; }
    },
  });

  sleep(CONFIG.sleep.betweenSteps);

  // ADD ITEM
  const addRes = http.post(
    `${CONFIG.base}/shelves/${user.shelfId}/items`,
    JSON.stringify({ bookId: CONFIG.bookId, initialStatus: 'READING' }),
    { headers }
  );
  check(addRes, { 'add item 201': (r) => r.status === 201 });

  if (addRes.status === 201) {
    const itemId = JSON.parse(addRes.body).id;

    sleep(CONFIG.sleep.betweenSteps);

    // GET ITEM
    const getRes = http.get(`${CONFIG.base}/shelves/${user.shelfId}/items/${itemId}`, { headers });
    check(getRes, { 'get item 200': (r) => r.status === 200 });

    sleep(CONFIG.sleep.betweenSteps);

    // UPDATE PROGRESS
    const progressRes = http.patch(
      `${CONFIG.base}/shelves/${user.shelfId}/items/${itemId}/progress`,
      JSON.stringify({ currentPage: 42 }),
      { headers }
    );
    check(progressRes, { 'update progress 200': (r) => r.status === 200 });

    sleep(CONFIG.sleep.betweenSteps);

    // CHANGE STATUS
    const statusRes = http.patch(
      `${CONFIG.base}/shelves/${user.shelfId}/items/${itemId}/status`,
      JSON.stringify({ newStatus: 'COMPLETED' }),
      { headers }
    );
    check(statusRes, { 'change status 200': (r) => r.status === 200 });

    sleep(CONFIG.sleep.betweenSteps);

    // REMOVE ITEM
    const removeRes = http.del(
      `${CONFIG.base}/shelves/${user.shelfId}/items/${itemId}`,
      null,
      { headers }
    );
    check(removeRes, { 'remove item 204': (r) => r.status === 204 });
  }

  sleep(CONFIG.sleep.afterIteration);
}