import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 50,
  password:     'senha12345',
  prefix:       'loadcollection',

  load: {
    crudVus:    40,
    listingVus: 10,
    duration:   '2m',
  },

  thresholds: {
    p95General:  1000,  // ms
    p95Crud:     1500,  // ms
    p95Listing:   500,  // ms
    failRate:    0.01,  // 1%
  },

  sleep: {
    betweenSteps:   0.3,  // s
    afterIteration: 1,    // s
    listing:        0.5,  // s
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

    // Cria uma estante própria para usar nos testes de add/remove shelf
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
      exec:     'crudCollections',
    },
    listing: {
      executor: 'constant-vus',
      vus:      CONFIG.load.listingVus,
      duration: CONFIG.load.duration,
      exec:     'listCollections',
    },
  },
  thresholds: {
    http_req_duration:                      [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:                        [`rate<${CONFIG.thresholds.failRate}`],
    'http_req_duration{scenario:crud}':     [`p(95)<${CONFIG.thresholds.p95Crud}`],
    'http_req_duration{scenario:listing}':  [`p(95)<${CONFIG.thresholds.p95Listing}`],
  },
};

export function crudCollections(data) {
  const user    = data.users[__VU % data.users.length];
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${user.accessToken}`,
  };

  // CREATE
  const createRes = http.post(
    `${CONFIG.base}/collections`,
    JSON.stringify({
      name:        `Coleção VU${__VU} iter${__ITER}`,
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

  const collectionId = JSON.parse(createRes.body).id;
  sleep(CONFIG.sleep.betweenSteps);

  // GET (detalhe)
  const getRes = http.get(`${CONFIG.base}/collections/${collectionId}`, { headers });
  check(getRes, { 'get collection 200': (r) => r.status === 200 });
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
      name:        `Coleção atualizada VU${__VU} iter${__ITER}`,
      description: 'Atualizada no load test',
    }),
    { headers }
  );
  check(updateRes, { 'update 200': (r) => r.status === 200 });
  sleep(CONFIG.sleep.betweenSteps);

  // DELETE
  const deleteRes = http.del(`${CONFIG.base}/collections/${collectionId}`, null, { headers });
  check(deleteRes, { 'delete 204': (r) => r.status === 204 });

  sleep(CONFIG.sleep.afterIteration);
}

export function listCollections(data) {
  const user    = data.users[__VU % data.users.length];
  const headers = { Authorization: `Bearer ${user.accessToken}` };

  const res = http.get(`${CONFIG.base}/collections`, { headers });
  check(res, {
    'list 200': (r) => r.status === 200,
    'list é array JSON': (r) => {
      try { return Array.isArray(JSON.parse(r.body)); }
      catch { return false; }
    },
  });

  sleep(CONFIG.sleep.listing);
}