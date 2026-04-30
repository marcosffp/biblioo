import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 100,
  password:     'Senha@12345',
  prefix:       'loadcomment',
  bookId:       1,  // seed: banco local deve ter livro com id=1

  load: {
    crudVus:    60,
    listingVus: 20,
    duration:   '2m',
  },

  thresholds: {
    p95General:  1000,
    p95Crud:     1500,
    p95Listing:   500,
    failRate:    0.01,
  },

  sleep: {
    betweenSteps:   0.3,
    afterIteration: 1,
    listing:        0.5,
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

    // Cria review base para comentar durante o teste
    const mp = multipart({
      bookId:  String(CONFIG.bookId),
      rating:  '4',
      text:    `Review base do usuario ${i}`,
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
  scenarios: {
    crud: {
      executor: 'constant-vus',
      vus:      CONFIG.load.crudVus,
      duration: CONFIG.load.duration,
      exec:     'crudComment',
    },
    listing: {
      executor: 'constant-vus',
      vus:      CONFIG.load.listingVus,
      duration: CONFIG.load.duration,
      exec:     'listComments',
    },
  },
  thresholds: {
    http_req_duration:                      [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:                        [`rate<${CONFIG.thresholds.failRate}`],
    'http_req_duration{scenario:crud}':     [`p(95)<${CONFIG.thresholds.p95Crud}`],
    'http_req_duration{scenario:listing}':  [`p(95)<${CONFIG.thresholds.p95Listing}`],
  },
};

export function crudComment(data) {
  const { accessToken, reviewId } = data.users[__VU % data.users.length];
  if (!reviewId) { sleep(CONFIG.sleep.afterIteration); return; }

  const mp = multipart({ text: `Comentário VU${__VU} iter${__ITER}` });
  const createRes = http.post(
    `${CONFIG.base}/feed/reviews/${reviewId}/comments`,
    mp.body,
    { headers: { 'Content-Type': mp.contentType, Authorization: `Bearer ${accessToken}` } }
  );
  check(createRes, {
    'create 201': (r) => r.status === 201,
    'create retorna id': (r) => {
      try { return JSON.parse(r.body).id != null; }
      catch { return false; }
    },
  });

  if (createRes.status !== 201) {
    sleep(CONFIG.sleep.afterIteration);
    return;
  }

  const commentId = JSON.parse(createRes.body).id;
  sleep(CONFIG.sleep.betweenSteps);

  const getRes = http.get(
    `${CONFIG.base}/feed/reviews/${reviewId}/comments/${commentId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  check(getRes, { 'get 200': (r) => r.status === 200 });
  sleep(CONFIG.sleep.betweenSteps);

  const updMp = multipart({ text: `Comentário atualizado VU${__VU} iter${__ITER}` });
  const updateRes = http.put(
    `${CONFIG.base}/feed/reviews/${reviewId}/comments/${commentId}`,
    updMp.body,
    { headers: { 'Content-Type': updMp.contentType, Authorization: `Bearer ${accessToken}` } }
  );
  check(updateRes, { 'update 200': (r) => r.status === 200 });
  sleep(CONFIG.sleep.betweenSteps);

  const deleteRes = http.del(
    `${CONFIG.base}/feed/reviews/${reviewId}/comments/${commentId}`,
    null,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  check(deleteRes, { 'delete 204': (r) => r.status === 204 });

  sleep(CONFIG.sleep.afterIteration);
}

export function listComments(data) {
  const { accessToken, reviewId } = data.users[__VU % data.users.length];
  if (!reviewId) { sleep(CONFIG.sleep.listing); return; }

  const res = http.get(
    `${CONFIG.base}/feed/reviews/${reviewId}/comments`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  check(res, {
    'list 200': (r) => r.status === 200,
    'list tem content': (r) => {
      try { return JSON.parse(r.body).content != null; }
      catch { return false; }
    },
  });

  sleep(CONFIG.sleep.listing);
}
