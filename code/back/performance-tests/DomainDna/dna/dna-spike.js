import http from 'k6/http';
import { sleep, check } from 'k6';
import { b64decode } from 'k6/encoding';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 400,
  password:     'Senha@12345',
  prefix:       'spikedna',
  bookIds:      [1, 2, 3, 4, 5],

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

function logWarn(context, extra = {}) {
  console.warn(JSON.stringify({ vu: __VU, iter: __ITER, ...context, ...extra }));
}

function logError(context, extra = {}) {
  console.error(JSON.stringify({ vu: __VU, iter: __ITER, ...context, ...extra }));
}

function parseUserId(token) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) base64 += '=';
    const payload = JSON.parse(b64decode(base64, 'std', 's'));
    const raw = payload.sub || payload.userId || payload.id || payload.user_id;
    if (raw == null) console.warn('Claims disponíveis: ' + Object.keys(payload).join(', '));
    return raw;
  } catch (e) {
    logError({ step: 'parseUserId', error: String(e) });
    return null;
  }
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
      JSON.stringify({ name: `DNA Spike Shelf ${ts}`, description: '' }),
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
    for (const bookId of CONFIG.bookIds) {
      const itemRes = http.post(
        `${CONFIG.base}/shelves/${shelfId}/items`,
        JSON.stringify({ bookId, initialStatus: 'COMPLETED' }),
        { headers: authH }
      );
      check(itemRes, { 'book added 201': (r) => r.status === 201 });
      if (itemRes.status !== 201) {
        logError({ step: 'addBook', userIndex: i, bookId, status: itemRes.status, body: itemRes.body });
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
  setupTimeout: '300s',
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

  const authH = { Authorization: `Bearer ${accessToken}` };

  const dnaRes = http.get(`${CONFIG.base}/dna`, { headers: authH });
  check(dnaRes, {
    'get dna 200 ou 429': (r) => r.status === 200 || r.status === 429,
    'get dna retorna body': (r) => {
      if (r.status !== 200) return true;
      try {
        const body = JSON.parse(r.body);
        return body.status != null || body.booksRead != null;
      } catch { return false; }
    },
  });
  if (dnaRes.status !== 200 && dnaRes.status !== 429) {
    logWarn({ step: 'getDna', status: dnaRes.status, body: dnaRes.body });
  }

  sleep(CONFIG.sleep.afterIteration);
}
