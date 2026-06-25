import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 500,
  password:     'Senha@12345',
  prefix:       'spikeshelf',

  spike: {
    baseVus:       70,
    peakVus:       500,
    rampUpBase:    '10s',
    rampToPeak:    '5s',
    holdPeak:      '20s',
    rampDown:      '5s',
    cooldown:      '10s',
  },

  thresholds: {
    p95General: 2500,
    failRate:   0.05,
  },

  sleep: {
    betweenOps:     0.2,
    afterIteration: 0.5,
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
  stages: [
    { duration: CONFIG.spike.rampUpBase, target: CONFIG.spike.baseVus  },
    { duration: CONFIG.spike.rampToPeak, target: CONFIG.spike.peakVus  },
    { duration: CONFIG.spike.holdPeak,   target: CONFIG.spike.peakVus  },
    { duration: CONFIG.spike.rampDown,   target: CONFIG.spike.baseVus  },
    { duration: CONFIG.spike.cooldown,   target: 0                     },
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

  sleep(CONFIG.sleep.betweenOps);

  const createRes = http.post(
    `${CONFIG.base}/shelves`,
    JSON.stringify({
      name: `Spike VU${__VU} iter${__ITER}`,
      description: 'Spike test',
    }),
    { headers }
  );
  check(createRes, { 'create 201 ou 429': (r) => r.status === 201 || r.status === 429 });

  if (createRes.status === 201) {
    const shelfId = JSON.parse(createRes.body).id;
    http.del(`${CONFIG.base}/shelves/${shelfId}`, null, { headers });
  }

  sleep(CONFIG.sleep.afterIteration);
}
