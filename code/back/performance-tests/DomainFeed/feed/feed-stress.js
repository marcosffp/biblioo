import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 500,
  password:     'Senha@12345',
  prefix:       'stressfeed',

  stress: {
    stageDuration: '30s',
    stages:        [20, 50, 100, 200, 300, 400],
  },

  thresholds: {
    p95General: 800,
    failRate:   0.05,
  },

  sleep: {
    betweenSteps:   0.2,
    afterIteration: 0.5,
  },
};

function parseUserId(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
  } catch { return null; }
}

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
    const userId = parseUserId(accessToken);
    users.push({ userId });
  }

  return { users };
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
  const { userId } = data.users[__VU % data.users.length];

  const feedRes = http.get(`${CONFIG.base}/feed?userId=${userId}&size=20`);
  check(feedRes, {
    'feed 200': (r) => r.status === 200,
    'feed tem items': (r) => {
      try { return JSON.parse(r.body).items != null; }
      catch { return false; }
    },
  });
  sleep(CONFIG.sleep.betweenSteps);

  const countRes = http.get(`${CONFIG.base}/feed/new-count?userId=${userId}&sinceScore=0`);
  check(countRes, {
    'count 200': (r) => r.status === 200,
    'count tem newItems': (r) => {
      try { return JSON.parse(r.body).newItems !== undefined; }
      catch { return false; }
    },
  });

  sleep(CONFIG.sleep.afterIteration);
}
