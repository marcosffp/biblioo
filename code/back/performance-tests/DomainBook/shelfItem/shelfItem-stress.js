import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 800,
  password:     'Senha@12345',
  prefix:       'stressshelfitem',

  stress: {
    stageDuration: '30s',
    stages:        [20, 50, 100, 200, 300, 400, 600],
  },

  thresholds: {
    p95General: 3000,
    failRate:   0.05, 
  },

  sleep: {
    betweenSteps:   0.2,
    afterIteration: 0.5,
  },
};

export function setup() {
  const headers = { 'Content-Type': 'application/json' };

  let bookId = null;
  for (const q of ['Dom Casmurro', '1984', 'Harry Potter', 'Senhor dos Aneis']) {
    const res = http.get(`${CONFIG.base}/books/search?q=${encodeURIComponent(q)}`);
    if (res.status === 200) {
      try {
        const books = JSON.parse(res.body);
        if (Array.isArray(books) && books.length > 0) {
          bookId = books[0].id;
          break;
        }
      } catch {}
    }
  }

  if (bookId === null) {
    throw new Error(
      'Nenhum livro encontrado no catálogo. Execute uma busca manual antes de rodar este teste para popular o banco.'
    );
  }

  const users = [];

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

    const shelfRes = http.post(
      `${CONFIG.base}/shelves`,
      JSON.stringify({ name: `Estante setup ${ts}`, description: 'Criada pelo setup do stress test' }),
      { headers: authHeaders }
    );

    const shelfId = JSON.parse(shelfRes.body).id;
    users.push({ accessToken, shelfId });
  }

  return { users, bookId };
}

export const options = {
  setupTimeout: '300s',
  stages: [
    ...CONFIG.stress.stages.map((vus) => ({ duration: CONFIG.stress.stageDuration, target: vus })),
    { duration: CONFIG.stress.stageDuration, target: 0 },
  ],
  thresholds: {
    http_req_duration: [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:   [`rate<${CONFIG.thresholds.failRate}`],
  },
};

export default function (data) {
  const user   = data.users[__VU % data.users.length];
  const bookId = data.bookId;
  const headers = {
    'Content-Type': 'application/json',
    Authorization:  `Bearer ${user.accessToken}`,
  };

  const listRes = http.get(`${CONFIG.base}/shelves/${user.shelfId}/items`, { headers });
  check(listRes, {
    'list items 200': (r) => r.status === 200,
    'list array': (r) => {
      try { return Array.isArray(JSON.parse(r.body)); }
      catch { return false; }
    },
  });

  sleep(CONFIG.sleep.betweenSteps);

  let addRes = http.post(
    `${CONFIG.base}/shelves/${user.shelfId}/items`,
    JSON.stringify({ bookId, initialStatus: 'READING' }),
    { headers }
  );

  if (addRes.status === 409) {
    const recoveryList = http.get(`${CONFIG.base}/shelves/${user.shelfId}/items`, { headers });
    if (recoveryList.status === 200) {
      try {
        const items = JSON.parse(recoveryList.body);
        if (Array.isArray(items) && items.length > 0) {
          http.del(`${CONFIG.base}/shelves/${user.shelfId}/items/${items[0].id}`, null, { headers });
        }
      } catch {}
    }
    addRes = http.post(
      `${CONFIG.base}/shelves/${user.shelfId}/items`,
      JSON.stringify({ bookId, initialStatus: 'READING' }),
      { headers }
    );
  }

  check(addRes, { 'add item 201': (r) => r.status === 201 });

  if (addRes.status === 201) {
    const itemId = JSON.parse(addRes.body).id;

    sleep(CONFIG.sleep.betweenSteps);

    const getRes = http.get(`${CONFIG.base}/shelves/${user.shelfId}/items/${itemId}`, { headers });
    check(getRes, { 'get item 200': (r) => r.status === 200 });

    sleep(CONFIG.sleep.betweenSteps);

    const progressRes = http.patch(
      `${CONFIG.base}/shelves/${user.shelfId}/items/${itemId}/progress`,
      JSON.stringify({ currentPage: 42 }),
      { headers }
    );
    check(progressRes, { 'update progress 200': (r) => r.status === 200 });

    sleep(CONFIG.sleep.betweenSteps);

    const statusRes = http.patch(
      `${CONFIG.base}/shelves/${user.shelfId}/items/${itemId}/status`,
      JSON.stringify({ newStatus: 'COMPLETED' }),
      { headers }
    );
    check(statusRes, { 'change status 200': (r) => r.status === 200 });

    sleep(CONFIG.sleep.betweenSteps);

    const removeRes = http.del(
      `${CONFIG.base}/shelves/${user.shelfId}/items/${itemId}`,
      null,
      { headers }
    );
    check(removeRes, { 'remove item 204': (r) => r.status === 204 });
  }

  sleep(CONFIG.sleep.afterIteration);
}
