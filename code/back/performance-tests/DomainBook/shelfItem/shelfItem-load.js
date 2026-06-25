import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 230,
  password:     'Senha@12345',
  prefix:       'loadshelfitem',

  bookId: 1,

  load: {
    crudVus:    150,
    listingVus: 60,
    duration:   '2m',
  },

  thresholds: {
    p95General:  1000,
    p95Crud:     1500,
    p95Listing:   1500,
    failRate:    0.01,
  },

  sleep: {
    betweenSteps:   0.3,
    afterIteration: 1,
    listing:        0.5,
  },
};

export function setup() {
  const users = [];
  const headers = { 'Content-Type': 'application/json' };

  for (let i = 0; i < CONFIG.userPoolSize; i++) {
    const ts = Date.now() + i;
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
    const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` };
    const shelfRes = http.post(
      `${CONFIG.base}/shelves`,
      JSON.stringify({ name: `Estante setup ${ts}`, description: 'Criada pelo setup do load test' }),
      { headers: authHeaders }
    );
    check(shelfRes, { 'setup shelf 201': (r) => r.status === 201 });

    const shelfId = JSON.parse(shelfRes.body).id;
    users.push({ accessToken, shelfId });
  }

  return { users };
}

export const options = {
  scenarios: {
    crud: {
      executor: 'constant-vus',
      vus:      CONFIG.load.crudVus,
      duration: CONFIG.load.duration,
      exec:     'crudShelfItems',
    },
    listing: {
      executor: 'constant-vus',
      vus:      CONFIG.load.listingVus,
      duration: CONFIG.load.duration,
      exec:     'listShelfItems',
    },
  },
  thresholds: {
    http_req_duration:                      [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:                        [`rate<${CONFIG.thresholds.failRate}`],
    'http_req_duration{scenario:crud}':     [`p(95)<${CONFIG.thresholds.p95Crud}`],
    'http_req_duration{scenario:listing}':  [`p(95)<${CONFIG.thresholds.p95Listing}`],
  },
};

export function crudShelfItems(data) {
  const user = data.users[__VU % data.users.length];
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${user.accessToken}`,
  };

  const addRes = http.post(
    `${CONFIG.base}/shelves/${user.shelfId}/items`,
    JSON.stringify({ bookId: CONFIG.bookId, initialStatus: 'READING' }),
    { headers }
  );
  check(addRes, {
    'add item 201': (r) => r.status === 201,
    'add item retorna id': (r) => {
      try { return JSON.parse(r.body).id != null; }
      catch { return false; }
    },
  });

  if (addRes.status !== 201) {
    sleep(CONFIG.sleep.afterIteration);
    return;
  }

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

  sleep(CONFIG.sleep.afterIteration);
}

export function listShelfItems(data) {
  const user = data.users[__VU % data.users.length];
  const headers = { Authorization: `Bearer ${user.accessToken}` };

  const res = http.get(`${CONFIG.base}/shelves/${user.shelfId}/items`, { headers });

  check(res, {
    'list items 200': (r) => r.status === 200,
    'list é array JSON': (r) => {
      try { return Array.isArray(JSON.parse(r.body)); }
      catch { return false; }
    },
  });

  sleep(CONFIG.sleep.listing);
}
