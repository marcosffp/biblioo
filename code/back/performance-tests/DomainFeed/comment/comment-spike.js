import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 400,
  password:     'Senha@12345',
  prefix:       'spikecomment',
  bookId:       1,

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
    p95General: 1000,
    failRate:   0.05,
  },

  sleep: {
    betweenOps:     0.2,
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
      text:    `Review base spike ${i}`,
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
    { duration: CONFIG.spike.rampUpBase, target: CONFIG.spike.baseVus },
    { duration: CONFIG.spike.rampToPeak, target: CONFIG.spike.peakVus },
    { duration: CONFIG.spike.holdPeak,   target: CONFIG.spike.peakVus },
    { duration: CONFIG.spike.rampDown,   target: CONFIG.spike.baseVus },
    { duration: CONFIG.spike.cooldown,   target: 0 },
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
  check(listRes, {
    'list 200': (r) => r.status === 200,
    'list tem content': (r) => {
      try { return JSON.parse(r.body).content != null; }
      catch { return false; }
    },
  });
  sleep(CONFIG.sleep.betweenOps);

  const mp = multipart({ text: `Spike comment VU${__VU} iter${__ITER}` });
  const createRes = http.post(
    `${CONFIG.base}/feed/reviews/${reviewId}/comments`,
    mp.body,
    { headers: { 'Content-Type': mp.contentType, Authorization: `Bearer ${accessToken}` } }
  );
  check(createRes, { 'create 201 ou 429': (r) => r.status === 201 || r.status === 429 });

  if (createRes.status === 201) {
    const commentId = JSON.parse(createRes.body).id;
    http.del(
      `${CONFIG.base}/feed/reviews/${reviewId}/comments/${commentId}`,
      null,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  }

  sleep(CONFIG.sleep.afterIteration);
}
