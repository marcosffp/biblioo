import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 400,
  password:     'Senha@12345',
  prefix:       'spikerecommendation',

  spike: {
    baseVus:    50,
    rampUpBase: '10s',
    rampUpPeak: '10s',
    peakVus:    300,
    peakDuration: '30s',
    rampDownBase: '10s',
    cooldown:   '10s',
  },

  thresholds: {
    p95General: 1000,
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
    const body = JSON.stringify({
      username: `${CONFIG.prefix}_${ts}_${i}`,
      email: `${CONFIG.prefix}_${ts}_${i}@test.com`,
      password: CONFIG.password,
      name: `User ${i}`,
    });

    http.post(`${CONFIG.base}/auth/register`, body, { headers });
    const loginRes = http.post(
      `${CONFIG.base}/auth/login`,
      JSON.stringify({ email: `${CONFIG.prefix}_${ts}_${i}@test.com`, password: CONFIG.password }),
      { headers }
    );

    const accessToken = JSON.parse(loginRes.body).token;
    users.push({ accessToken });
  }

  return { users };
}

export const options = {
  setupTimeout: '300s',
  stages: [
    { duration: CONFIG.spike.rampUpBase, target: CONFIG.spike.baseVus },
    { duration: CONFIG.spike.rampUpPeak, target: CONFIG.spike.peakVus },
    { duration: CONFIG.spike.peakDuration, target: CONFIG.spike.peakVus },
    { duration: CONFIG.spike.rampDownBase, target: CONFIG.spike.baseVus },
    { duration: CONFIG.spike.cooldown,   target: 0 },
  ],
  thresholds: {
    http_req_duration: [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:   [`rate<${CONFIG.thresholds.failRate}`],
  },
};

export default function (data) {
  const token = data.users[__VU % data.users.length].accessToken;
  const headers = { Authorization: `Bearer ${token}` };

  const byrRes = http.get(`${CONFIG.base}/recommendations/because-you-read`, { headers });
  check(byrRes, {
    'because you read 200': (r) => r.status === 200,
    'has books array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.books);
      } catch (e) {
        return false;
      }
    },
  });

  sleep(CONFIG.sleep.betweenOps);

  const fgnRes = http.get(`${CONFIG.base}/recommendations/favorite-genre-now`, { headers });
  check(fgnRes, {
    'favorite genre now 200': (r) => r.status === 200,
    'has topGenres array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.topGenres);
      } catch (e) {
        return false;
      }
    },
  });

  sleep(CONFIG.sleep.betweenOps);

  const ticRes = http.get(`${CONFIG.base}/recommendations/trending-in-communities`, { headers });
  check(ticRes, {
    'trending in communities 200': (r) => r.status === 200,
    'has books array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.books);
      } catch (e) {
        return false;
      }
    },
  });

  sleep(CONFIG.sleep.afterIteration);
}
