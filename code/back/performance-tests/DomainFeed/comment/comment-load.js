import http from 'k6/http';
import { sleep, check, fail } from 'k6';
import { b64decode } from 'k6/encoding';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 230,
  password:     'Senha@12345',
  prefix:       'loadcomment',
  bookId:       1,

  load: {
    crudVus:    158,
    listingVus: 52,
    duration:   '2m',
  },

  thresholds: {
    p95General:  1500,
    p95Crud:     1500,
    p95Listing:   500,
    failRate:    0.02,
  },

  sleep: {
    betweenSteps:   0.3,
    afterIteration: 1,
    listing:        0.5,
  },
};

function logWarn(context, extra = {}) {
  console.warn(JSON.stringify({ vu: typeof __VU !== 'undefined' ? __VU : 0, iter: typeof __ITER !== 'undefined' ? __ITER : 0, ...context, ...extra }));
}

function logError(context, extra = {}) {
  console.error(JSON.stringify({ vu: typeof __VU !== 'undefined' ? __VU : 0, iter: typeof __ITER !== 'undefined' ? __ITER : 0, ...context, ...extra }));
}

function parseUserId(token) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) base64 += '=';

    const payload = JSON.parse(b64decode(base64, 'std', 's'));

    const raw = payload.sub || payload.userId || payload.id || payload.user_id;
    if (raw == null) {
      console.warn('Claims disponíveis: ' + Object.keys(payload).join(', '));
    }
    return raw;
  } catch (e) {
    logError({ step: 'parseUserId', error: String(e) });
    return null;
  }
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
  const users   = [];
  const headers = { 'Content-Type': 'application/json' };

  for (let i = 0; i < CONFIG.userPoolSize; i++) {
    const uid   = `${i}_${Math.floor(Math.random() * 1e9)}`;
    const email = `${CONFIG.prefix}_${uid}@test.com`;

    const reg = http.post(
      `${CONFIG.base}/auth/register`,
      JSON.stringify({ username: `${CONFIG.prefix}_${uid}`, email, password: CONFIG.password }),
      { headers }
    );
    check(reg, { 'register 201': (r) => r.status === 201 });
    if (reg.status !== 201) {
      logError({ step: 'register', userIndex: i, status: reg.status, body: reg.body });
      continue;
    }

    const login = http.post(
      `${CONFIG.base}/auth/login`,
      JSON.stringify({ email, password: CONFIG.password }),
      { headers }
    );
    check(login, { 'login 200': (r) => r.status === 200 });
    if (login.status !== 200) {
      logError({ step: 'login', userIndex: i, status: login.status, body: login.body });
      continue;
    }

    let accessToken = null;
    let userId      = null;
    try {
      const body  = JSON.parse(login.body);
      accessToken = body.accessToken || body.access_token || body.token;
      userId      = parseUserId(accessToken);
    } catch (e) {
      logError({ step: 'parseLogin', userIndex: i, error: String(e) });
      continue;
    }

    if (!accessToken || !userId) {
      logWarn({ step: 'setup', userIndex: i, msg: 'accessToken ou userId ausente', userId });
      continue;
    }

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${accessToken}`,
    };

    const shelfRes = http.post(
      `${CONFIG.base}/shelves`,
      JSON.stringify({ name: `Load Test Shelf ${uid}`, description: '' }),
      { headers: authHeaders }
    );
    check(shelfRes, { 'shelf created 201': (r) => r.status === 201 });
    if (shelfRes.status !== 201) {
      logError({ step: 'createShelf', userIndex: i, status: shelfRes.status, body: shelfRes.body });
      continue;
    }

    let shelfId = null;
    try {
      shelfId = JSON.parse(shelfRes.body).id;
    } catch (e) {
      logError({ step: 'parseShelfId', userIndex: i, error: String(e) });
      continue;
    }

    const itemRes = http.post(
      `${CONFIG.base}/shelves/${shelfId}/items`,
      JSON.stringify({ bookId: CONFIG.bookId, initialStatus: 'COMPLETED' }),
      { headers: authHeaders }
    );
    check(itemRes, { 'book added to shelf 201': (r) => r.status === 201 });
    if (itemRes.status !== 201) {
      logError({ step: 'addBookToShelf', userIndex: i, bookId: CONFIG.bookId, status: itemRes.status, body: itemRes.body });
      continue;
    }

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
    check(reviewRes, { 'review base 201': (r) => r.status === 201 });
    if (reviewRes.status !== 201) {
      logError({ step: 'createReview', userIndex: i, status: reviewRes.status, body: reviewRes.body });
      continue;
    }

    let reviewId = null;
    try {
      reviewId = JSON.parse(reviewRes.body).id;
    } catch (e) {
      logError({ step: 'parseReviewId', userIndex: i, error: String(e) });
      continue;
    }

    if (!reviewId) {
      logWarn({ step: 'setup', userIndex: i, msg: 'reviewId ausente após create' });
      continue;
    }

    users.push({ accessToken, userId, reviewId });
  }

  if (users.length === 0) {
    throw new Error('Nenhum usuário foi criado/logado com sucesso. Abortando o teste.');
  }

  console.log(`Setup concluído: ${users.length} usuários prontos de ${CONFIG.userPoolSize} tentativas.`);
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
  const user = data.users[(__VU - 1) % data.users.length];
  if (!user) return;
  const { accessToken, reviewId } = user;

  const authHeaders = { Authorization: `Bearer ${accessToken}` };

  const mp = multipart({ text: `Comentário VU${__VU} iter${__ITER}` });
  const createRes = http.post(
    `${CONFIG.base}/feed/reviews/${reviewId}/comments`,
    mp.body,
    { headers: { 'Content-Type': mp.contentType, ...authHeaders } }
  );

  const createOk = check(createRes, {
    'create 201': (r) => r.status === 201,
    'create retorna id': (r) => {
      try { return JSON.parse(r.body).id != null; }
      catch { return false; }
    },
  });

  if (!createOk || createRes.status !== 201) {
    logWarn({ step: 'create', reviewId, status: createRes.status, body: createRes.body });
    fail(`CREATE falhou: status=${createRes.status}`);
    return;
  }

  let commentId;
  try {
    commentId = JSON.parse(createRes.body).id;
  } catch {
    logError({ step: 'parseCommentId' });
    fail('Falha ao parsear id do comentário criado');
    return;
  }

  sleep(CONFIG.sleep.betweenSteps);

  const getRes = http.get(
    `${CONFIG.base}/feed/reviews/${reviewId}/comments/${commentId}`,
    { headers: authHeaders }
  );
  check(getRes, { 'get 200': (r) => r.status === 200 });

  if (getRes.status !== 200) {
    logWarn({ step: 'get', commentId, status: getRes.status, body: getRes.body });
  }

  sleep(CONFIG.sleep.betweenSteps);

  const updMp = multipart({ text: `Comentário atualizado VU${__VU} iter${__ITER}` });
  const updateRes = http.put(
    `${CONFIG.base}/feed/reviews/${reviewId}/comments/${commentId}`,
    updMp.body,
    { headers: { 'Content-Type': updMp.contentType, ...authHeaders } }
  );
  check(updateRes, { 'update 200': (r) => r.status === 200 });

  if (updateRes.status !== 200) {
    logWarn({ step: 'update', commentId, status: updateRes.status, body: updateRes.body });
  }

  sleep(CONFIG.sleep.betweenSteps);

  const deleteRes = http.del(
    `${CONFIG.base}/feed/reviews/${reviewId}/comments/${commentId}`,
    null,
    { headers: authHeaders }
  );
  check(deleteRes, { 'delete 204': (r) => r.status === 204 });

  if (deleteRes.status !== 204) {
    logWarn({ step: 'delete', commentId, status: deleteRes.status, body: deleteRes.body });
  }

  sleep(CONFIG.sleep.afterIteration);
}

export function listComments(data) {
  const user = data.users[(__VU - 1) % data.users.length];
  if (!user) return;
  const { accessToken, reviewId } = user;

  if (!reviewId) {
    logWarn({ step: 'listComments', msg: 'reviewId nulo, pulando listagem' });
    sleep(CONFIG.sleep.listing);
    return;
  }

  const res = http.get(
    `${CONFIG.base}/feed/reviews/${reviewId}/comments`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  check(res, {
    'list 200': (r) => r.status === 200,
  });

  if (res.status !== 200) {
    logWarn({ step: 'listComments', reviewId, status: res.status, body: res.body });
  }

  sleep(CONFIG.sleep.listing);
}