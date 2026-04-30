import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 400,
  password:     'Senha@12345',
  prefix:       'spikereview',
  minBookId:    1,
  maxBookId:    20,

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
  const users       = [];
  const headers     = { 'Content-Type': 'application/json' };
  const totalBooks  = CONFIG.maxBookId - CONFIG.minBookId + 1;

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
      JSON.stringify({ name: `Estante ${ts}`, description: 'spike test' }),
      { headers: authH }
    );

    let shelfId = null;
    try { shelfId = JSON.parse(shelfRes.body).id; } catch (e) {}

    // Adicionar todos os livros com COMPLETED
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
  const { accessToken, userId } = data.users[__VU % data.users.length];

  // Rotaciona bookId por VU + iteração para nunca repetir userId+bookId
  const totalBooks = CONFIG.maxBookId - CONFIG.minBookId + 1;
  const bookId     = CONFIG.minBookId + ((__VU * 37 + __ITER) % totalBooks);

  const listRes = http.get(
    `${CONFIG.base}/feed/reviews/user/${userId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  check(listRes, {
    'list 200': (r) => r.status === 200,
    'list content presente': (r) => {
      try { return JSON.parse(r.body).content != null; }
      catch { return false; }
    },
  });
  sleep(CONFIG.sleep.betweenOps);

  const mp = multipart({
    bookId:  String(bookId),
    rating:  '3',
    text:    `Spike review VU${__VU} iter${__ITER}`,
    publish: 'false',
  });
  const createRes = http.post(
    `${CONFIG.base}/feed/reviews`,
    mp.body,
    { headers: { 'Content-Type': mp.contentType, Authorization: `Bearer ${accessToken}` } }
  );
  check(createRes, { 'create 201 ou 429': (r) => r.status === 201 || r.status === 429 });

  if (createRes.status === 201) {
    const reviewId = JSON.parse(createRes.body).id;
    http.del(
      `${CONFIG.base}/feed/reviews/${reviewId}`,
      null,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  }

  sleep(CONFIG.sleep.afterIteration);
}