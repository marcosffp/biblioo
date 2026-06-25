import http from 'k6/http';
import { sleep, check, fail } from 'k6';
import { b64decode } from 'k6/encoding';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 500,
  password:     'Senha@12345',
  prefix:       'spikereview',
  minBookId:    1,
  maxBookId:    20,

  spike: {
    baseVus:    70,
    peakVus:    500,
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

const SAFE_VU   = () => (typeof __VU   !== 'undefined' ? __VU   : 0);
const SAFE_ITER = () => (typeof __ITER !== 'undefined' ? __ITER : -1);

function logWarn(context, extra = {}) {
  console.warn(JSON.stringify({ vu: SAFE_VU(), iter: SAFE_ITER(), ...context, ...extra }));
}

function logError(context, extra = {}) {
  console.error(JSON.stringify({ vu: SAFE_VU(), iter: SAFE_ITER(), ...context, ...extra }));
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


function currentBookId() {
  const totalBooks = CONFIG.maxBookId - CONFIG.minBookId + 1;
  return CONFIG.minBookId + ((__VU * 37 + __ITER) % totalBooks);
}

export function setup() {
  const users   = [];
  const headers = { 'Content-Type': 'application/json' };

  for (let i = 0; i < CONFIG.userPoolSize; i++) {
    const ts    = Date.now() + i;
    const email = `${CONFIG.prefix}_${ts}@test.com`;

    const reg = http.post(
      `${CONFIG.base}/auth/register`,
      JSON.stringify({ username: `${CONFIG.prefix}_${ts}`, email, password: CONFIG.password }),
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

    const authH = { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` };

    const shelfRes = http.post(
      `${CONFIG.base}/shelves`,
      JSON.stringify({ name: `Estante ${ts}`, description: 'spike test' }),
      { headers: authH }
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

    let allBooksAdded = true;
    for (let b = CONFIG.minBookId; b <= CONFIG.maxBookId; b++) {
      const itemRes = http.post(
        `${CONFIG.base}/shelves/${shelfId}/items`,
        JSON.stringify({ bookId: b, initialStatus: 'COMPLETED' }),
        { headers: authH }
      );
      check(itemRes, { 'book added 201': (r) => r.status === 201 });
      if (itemRes.status !== 201) {
        logError({ step: 'addBook', userIndex: i, bookId: b, status: itemRes.status, body: itemRes.body });
        allBooksAdded = false;
        break;
      }
    }

    if (!allBooksAdded) continue;

    users.push({ accessToken, userId });
  }

  if (users.length === 0) {
    throw new Error('Nenhum usuário criado com sucesso. Abortando o teste de spike.');
  }

  console.log(`Setup concluído: ${users.length} usuários prontos de ${CONFIG.userPoolSize} tentativas.`);
  return { users };
}

export const options = {
  setupTimeout: '1200s',
  stages: [
    { duration: CONFIG.spike.rampUpBase, target: CONFIG.spike.baseVus },
    { duration: CONFIG.spike.rampToPeak, target: CONFIG.spike.peakVus },
    { duration: CONFIG.spike.holdPeak,   target: CONFIG.spike.peakVus },
    { duration: CONFIG.spike.rampDown,   target: CONFIG.spike.baseVus },
    { duration: CONFIG.spike.cooldown,   target: 0                    },
  ],
  thresholds: {
    http_req_duration: [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:   [`rate<${CONFIG.thresholds.failRate}`],
  },
};

export default function (data) {
  const user = data.users[(__VU - 1) % data.users.length];
  if (!user) return;
  const { accessToken, userId } = user;

  const bookId = currentBookId();

  const listRes = http.get(
    `${CONFIG.base}/feed/reviews/user/${userId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  check(listRes, {
    'list 200': (r) => r.status === 200,
  });

  if (listRes.status !== 200) {
    logWarn({ step: 'list', userId, status: listRes.status, body: listRes.body });
  }

  sleep(CONFIG.sleep.betweenOps);

  const createRes = http.post(
    `${CONFIG.base}/feed/reviews?bookId=${bookId}&rating=3&text=${encodeURIComponent(`Spike review VU${__VU} iter${__ITER}`)}`,
    null,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  check(createRes, {
    'create 201 ou 429': (r) => r.status === 201 || r.status === 429,
    'create 201 retorna id': (r) => {
      if (r.status !== 201) return true;
      try { return JSON.parse(r.body).id != null; }
      catch { return false; }
    },
  });

  if (createRes.status !== 201 && createRes.status !== 429) {
    logWarn({
      step:   'create',
      bookId,
      status: createRes.status,
      body:   createRes.body,
    });
  }

  if (createRes.status === 201) {
    let reviewId = null;
    try {
      reviewId = JSON.parse(createRes.body).id;
    } catch {
      logError({ step: 'parseReviewId' });
    }

    if (reviewId != null) {
      const deleteRes = http.del(
        `${CONFIG.base}/feed/reviews/${reviewId}`,
        null,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      check(deleteRes, { 'delete 204': (r) => r.status === 204 });
      if (deleteRes.status !== 204) {
        logWarn({ step: 'delete', reviewId, status: deleteRes.status, body: deleteRes.body });
      }
    }
  }

  sleep(CONFIG.sleep.afterIteration);
}