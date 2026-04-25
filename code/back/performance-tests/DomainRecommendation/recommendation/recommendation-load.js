import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 100,
  password:     'senha12345',
  prefix:       'loadrecommendation',

  load: {
    queryVus:    60,
    duration:   '2m',
  },

  thresholds: {
    p95General: 1000,
    failRate:   0.01,
  },

  sleep: {
    betweenSteps:   0.3,
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
  scenarios: {
    query: {
      executor: 'constant-vus',
      vus: CONFIG.load.queryVus,
      duration: CONFIG.load.duration,
      exec: 'queryRecommendation',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed:   ['rate<0.01'],
  },
};

export function queryRecommendation(data) {
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

  sleep(CONFIG.sleep.betweenSteps);

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

  sleep(CONFIG.sleep.afterIteration);
}
