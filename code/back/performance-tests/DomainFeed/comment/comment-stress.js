import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 500,
  password:     'Senha@12345',
  prefix:       'stresscomment',
  bookId:       1,

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

    const mp = multipart({
      bookId:  String(CONFIG.bookId),
      rating:  '4',
      text:    `Review base stress ${i}`,
      publish: 'false',
    });
    const reviewRes = http.post(
      `${CONFIG.base}/feed/reviews`,
      mp.body,
      { headers: { 'Content-Type': mp.contentType, Authorization: `Bearer ${accessToken}` } }
    );
    const reviewId = reviewRes.status === 201
      ? JSON.parse(reviewRes.body).id
      : null;

    users.push({ accessToken, userId, reviewId });
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
  const { accessToken, reviewId } = data.users[__VU % data.users.length];
  if (!reviewId) { sleep(CONFIG.sleep.afterIteration); return; }

  const listRes = http.get(
    `${CONFIG.base}/feed/reviews/${reviewId}/comments`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  check(listRes, { 'list 200': (r) => r.status === 200 });
  sleep(CONFIG.sleep.betweenSteps);

  const mp = multipart({ text: `Stress comment VU${__VU} iter${__ITER}` });
  const createRes = http.post(
    `${CONFIG.base}/feed/reviews/${reviewId}/comments`,
    mp.body,
    { headers: { 'Content-Type': mp.contentType, Authorization: `Bearer ${accessToken}` } }
  );
  check(createRes, { 'create 201': (r) => r.status === 201 });

  if (createRes.status === 201) {
    const commentId = JSON.parse(createRes.body).id;
    sleep(CONFIG.sleep.betweenSteps);

    const getRes = http.get(
      `${CONFIG.base}/feed/reviews/${reviewId}/comments/${commentId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    check(getRes, { 'get 200': (r) => r.status === 200 });
    sleep(CONFIG.sleep.betweenSteps);

    const delRes = http.del(
      `${CONFIG.base}/feed/reviews/${reviewId}/comments/${commentId}`,
      null,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    check(delRes, { 'delete 204': (r) => r.status === 204 });
  }

  sleep(CONFIG.sleep.afterIteration);
}
