import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 100,
  password:     'Senha@12345',
  prefix:       'loadfeed',

  load: {
    feedVus:  60,
    countVus: 20,
    duration: '2m',
  },

  thresholds: {
    p95General:  800,
    p95Feed:     800,
    p95Count:    400,
    failRate:    0.01,
  },

  sleep: {
    afterFeed:  1,
    afterCount: 0.5,
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
    const userId = parseUserId(accessToken);
    users.push({ userId });
  }

  return { users };
}

export const options = {
  scenarios: {
    feedQuery: {
      executor: 'constant-vus',
      vus:      CONFIG.load.feedVus,
      duration: CONFIG.load.duration,
      exec:     'queryFeed',
    },
    countQuery: {
      executor: 'constant-vus',
      vus:      CONFIG.load.countVus,
      duration: CONFIG.load.duration,
      exec:     'queryCount',
    },
  },
  thresholds: {
    http_req_duration:                          [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:                            [`rate<${CONFIG.thresholds.failRate}`],
    'http_req_duration{scenario:feedQuery}':    [`p(95)<${CONFIG.thresholds.p95Feed}`],
    'http_req_duration{scenario:countQuery}':   [`p(95)<${CONFIG.thresholds.p95Count}`],
  },
};

export function queryFeed(data) {
  const { userId } = data.users[__VU % data.users.length];

  const res = http.get(`${CONFIG.base}/feed?userId=${userId}&size=20`);
  check(res, {
    'feed 200': (r) => r.status === 200,
    'feed tem items': (r) => {
      try { return JSON.parse(r.body).items != null; }
      catch { return false; }
    },
  });

  sleep(CONFIG.sleep.afterFeed);
}

export function queryCount(data) {
  const { userId } = data.users[__VU % data.users.length];

  const res = http.get(`${CONFIG.base}/feed/new-count?userId=${userId}&sinceScore=0`);
  check(res, {
    'count 200': (r) => r.status === 200,
    'count tem newItems': (r) => {
      try { return JSON.parse(r.body).newItems !== undefined; }
      catch { return false; }
    },
  });

  sleep(CONFIG.sleep.afterCount);
}
