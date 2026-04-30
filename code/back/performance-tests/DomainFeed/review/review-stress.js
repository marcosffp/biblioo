import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 500,
  password:     'Senha@12345',
  prefix:       'stressreview',
  minBookId:    1,
  maxBookId:    20,

  stress: {
    stageDuration: '30s',
    stages:        [20, 50, 100, 200, 300, 400],
  },

  thresholds: {
    p95General: 1000,
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

function multipart(fields) {
  const boundary = 'K6FormBoundary';
  let body = '';
  for (const [name, value] of Object.entries(fields)) {
    body += `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`;
  }
  body += `--${boundary}--\r\n`;
  return { body, contentType: `multipart/form-data; boundary=${boundary}` };
}

export function setup() {
  const users      = [];
  const headers    = { 'Content-Type': 'application/json' };
  const totalBooks = CONFIG.maxBookId - CONFIG.minBookId + 1;

  for (let i = 0; i < CONFIG.userPoolSize; i++) {
    const ts    = Date.now() + i;
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
    const userId  = parseUserId(accessToken);
    const authH   = { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` };

    // Criar estante
    const shelfRes = http.post(
      `${CONFIG.base}/shelves`,
      JSON.stringify({ name: `Estante ${ts}`, description: 'stress test' }),
      { headers: authH }
    );

    let shelfId = null;
    try { shelfId = JSON.parse(shelfRes.body).id; } catch (e) {}

    if (shelfId) {
      for (let b = CONFIG.minBookId; b <= CONFIG.maxBookId; b++) {
        http.post(
          `${CONFIG.base}/shelves/${shelfId}/items`,
          JSON.stringify({ bookId: b, initialStatus: 'COMPLETED' }),
          { headers: authH }
        );
      }
    }

    users.push({ accessToken, userId });
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
  const { accessToken, userId } = data.users[__VU % data.users.length];

  // Rotaciona bookId por VU + iteração para nunca repetir userId+bookId
  const totalBooks = CONFIG.maxBookId - CONFIG.minBookId + 1;
  const bookId     = CONFIG.minBookId + ((__VU * 37 + __ITER) % totalBooks);

  const listRes = http.get(
    `${CONFIG.base}/feed/reviews/user/${userId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  check(listRes, { 'list 200': (r) => r.status === 200 });
  sleep(CONFIG.sleep.betweenSteps);

  const mp = multipart({
    bookId:  String(bookId),
    rating:  '4',
    text:    `Stress review VU${__VU} iter${__ITER}`,
    publish: 'false',
  });
  const createRes = http.post(
    `${CONFIG.base}/feed/reviews`,
    mp.body,
    { headers: { 'Content-Type': mp.contentType, Authorization: `Bearer ${accessToken}` } }
  );
  check(createRes, { 'create 201': (r) => r.status === 201 });

  if (createRes.status === 201) {
    const reviewId = JSON.parse(createRes.body).id;
    sleep(CONFIG.sleep.betweenSteps);

    const getRes = http.get(
      `${CONFIG.base}/feed/reviews/${reviewId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    check(getRes, { 'get 200': (r) => r.status === 200 });
    sleep(CONFIG.sleep.betweenSteps);

    const delRes = http.del(
      `${CONFIG.base}/feed/reviews/${reviewId}`,
      null,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    check(delRes, { 'delete 204': (r) => r.status === 204 });
  }

  sleep(CONFIG.sleep.afterIteration);
}