import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 230,
  password:     'Senha@12345',
  prefix:       'loadshelf',

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
    betweenSteps: 0.3,
    afterIteration: 1,
    listing: 0.5,
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
    users.push({ accessToken });
  }

  return { users };
}

export const options = {
  scenarios: {
    crud: {
      executor: 'constant-vus',
      vus:      CONFIG.load.crudVus,
      duration: CONFIG.load.duration,
      exec:     'crudShelves',
    },
    listing: {
      executor: 'constant-vus',
      vus:      CONFIG.load.listingVus,
      duration: CONFIG.load.duration,
      exec:     'listShelves',
    },
  },
  thresholds: {
    http_req_duration:                    [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:                      [`rate<${CONFIG.thresholds.failRate}`],
    'http_req_duration{scenario:crud}':   [`p(95)<${CONFIG.thresholds.p95Crud}`],
    'http_req_duration{scenario:listing}':[`p(95)<${CONFIG.thresholds.p95Listing}`],
  },
};

export function crudShelves(data) {
  const token = data.users[__VU % data.users.length].accessToken;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const createRes = http.post(
    `${CONFIG.base}/shelves`,
    JSON.stringify({
      name: `Estante VU${__VU} iter${__ITER}`,
      description: 'Criada pelo teste de carga',
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

  const shelfId = JSON.parse(createRes.body).id;
  sleep(CONFIG.sleep.betweenSteps);

  const getRes = http.get(`${CONFIG.base}/shelves/${shelfId}`, { headers });
  check(getRes, { 'get shelf 200': (r) => r.status === 200 });
  sleep(CONFIG.sleep.betweenSteps);

  const updateRes = http.put(
    `${CONFIG.base}/shelves/${shelfId}`,
    JSON.stringify({
      name: `Estante atualizada VU${__VU} iter${__ITER}`,
      description: 'Atualizada no load test',
    }),
    { headers }
  );
  check(updateRes, { 'update 200': (r) => r.status === 200 });
  sleep(CONFIG.sleep.betweenSteps);

  const deleteRes = http.del(`${CONFIG.base}/shelves/${shelfId}`, null, { headers });
  check(deleteRes, { 'delete 204': (r) => r.status === 204 });

  sleep(CONFIG.sleep.afterIteration);
}

export function listShelves(data) {
  const token = data.users[__VU % data.users.length].accessToken;
  const headers = { Authorization: `Bearer ${token}` };

  const res = http.get(`${CONFIG.base}/shelves`, { headers });

  check(res, {
    'list 200': (r) => r.status === 200,
    'list é array JSON': (r) => {
      try { return Array.isArray(JSON.parse(r.body)); }
      catch { return false; }
    },
  });

  sleep(CONFIG.sleep.listing);
}
