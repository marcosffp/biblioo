import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 50,
  password:     'senha12345',
  prefix:       'spikecollection',

  spike: {
    baseVus:    50,
    peakVus:    300,
    rampUpBase: '10s',
    rampToPeak: '5s',
    holdPeak:   '20s',
    rampDown:   '5s',
    cooldown:   '10s',
  },

  thresholds: {
    p95General: 1000,  // ms
    failRate:   0.05,  // 5% — spike tolera mais erros
  },

  sleep: {
    betweenOps:     0.2,  // s
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

    // Cria uma estante própria para usar nos testes de add shelf
    const shelfRes = http.post(
      `${CONFIG.base}/shelves`,
      JSON.stringify({ name: `Estante setup ${ts}`, description: 'Criada pelo setup do spike test' }),
      { headers: authHeaders }
    );

    const shelfId = JSON.parse(shelfRes.body).id;
    users.push({ accessToken, shelfId });
  }

  return { users };
}

export const options = {
  stages: [
    { duration: CONFIG.spike.rampUpBase, target: CONFIG.spike.baseVus  },  // base normal
    { duration: CONFIG.spike.rampToPeak, target: CONFIG.spike.peakVus  },  // spike brusco
    { duration: CONFIG.spike.holdPeak,   target: CONFIG.spike.peakVus  },  // mantém carga alta
    { duration: CONFIG.spike.rampDown,   target: CONFIG.spike.baseVus  },  // queda brusca
    { duration: CONFIG.spike.cooldown,   target: 0                     },  // recuperação
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

  sleep(CONFIG.sleep.betweenOps);

  // CREATE
  const createRes = http.post(
    `${CONFIG.base}/collections`,
    JSON.stringify({
      name:        `Spike VU${__VU} iter${__ITER}`,
      description: 'Spike test',
    }),
    { headers }
  );
  check(createRes, { 'create 201 ou 429': (r) => r.status === 201 || r.status === 429 });

  if (createRes.status === 201) {
    const collectionId = JSON.parse(createRes.body).id;

    sleep(CONFIG.sleep.betweenOps);

    // ADD SHELF (estante criada no setup, pertence ao mesmo usuário)
    const addShelfRes = http.patch(
      `${CONFIG.base}/collections/${collectionId}/shelves`,
      JSON.stringify({ shelfId: user.shelfId }),
      { headers }
    );
    check(addShelfRes, { 'add shelf 200 ou 429': (r) => r.status === 200 || r.status === 429 });

    sleep(CONFIG.sleep.betweenOps);

    // DELETE
    http.del(`${CONFIG.base}/collections/${collectionId}`, null, { headers });
  }

  sleep(CONFIG.sleep.afterIteration);
}