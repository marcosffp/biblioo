import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 100,
  password:     'Senha@12345',
  prefix:       'loadrecommendation',

  load: {
    peakVus: 60,
  },

  thresholds: {
    p95General: 1000,
    failRate:   0.01,
  },

  sleep: {
    maxThinkTime: 0.5,
  },
};

function logWarn(context, extra = {}) {
  console.warn(JSON.stringify({ vu: typeof __VU !== 'undefined' ? __VU : 0, iter: typeof __ITER !== 'undefined' ? __ITER : 0, ...context, ...extra }));
}

function logError(context, extra = {}) {
  console.error(JSON.stringify({ vu: typeof __VU !== 'undefined' ? __VU : 0, iter: typeof __ITER !== 'undefined' ? __ITER : 0, ...context, ...extra }));
}

function safeJson(r) {
  try { return r.json(); }
  catch { return null; }
}

export function setup() {
  const users   = [];
  const headers = { 'Content-Type': 'application/json' };

  for (let i = 0; i < CONFIG.userPoolSize; i++) {
    const uid   = `${i}_${Math.floor(Math.random() * 1e6)}`;
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
    try {
      const body  = JSON.parse(login.body);
      accessToken = body.accessToken || body.access_token || body.token;
    } catch (e) {
      logError({ step: 'parseLogin', userIndex: i, error: String(e) });
      continue;
    }

    if (!accessToken) {
      logWarn({ step: 'setup', userIndex: i, msg: 'accessToken ausente' });
      continue;
    }

    users.push({ accessToken });
  }

  if (users.length === 0) {
    throw new Error('Nenhum usuário foi criado/logado com sucesso. Abortando o teste.');
  }

  console.log(`Setup concluído: ${users.length} usuários prontos de ${CONFIG.userPoolSize} tentativas.`);
  return { users };
}

export const options = {
  setupTimeout: '300s',
  scenarios: {
    query: {
      executor:         'ramping-vus',
      startVUs:         0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m',  target: CONFIG.load.peakVus },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '10s',
      exec:             'queryRecommendation',
    },
  },
  thresholds: {
    http_req_duration:                                       [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:                                         [`rate<${CONFIG.thresholds.failRate}`],
    'http_req_duration{name:because-you-read}':              ['p(95)<800'],
    'http_req_duration{name:favorite-genre-now}':            ['p(95)<800'],
    'http_req_duration{name:trending-in-communities}':       ['p(95)<900'],
    'http_req_duration{name:catalog-surprise}':              ['p(95)<1200'],
    'http_req_duration{name:similar-authors}':               ['p(95)<1100'],
    'http_req_duration{name:reread-worth-it}':               ['p(95)<800'],
  },
};

export function queryRecommendation(data) {
  const user = data.users[(__VU - 1) % data.users.length];
  if (!user) { sleep(Math.random() * CONFIG.sleep.maxThinkTime); return; }

  const headers = { Authorization: `Bearer ${user.accessToken}` };

  const responses = http.batch([
    ['GET', `${CONFIG.base}/recommendations/because-you-read`,        null, { headers, tags: { name: 'because-you-read' } }],
    ['GET', `${CONFIG.base}/recommendations/favorite-genre-now`,      null, { headers, tags: { name: 'favorite-genre-now' } }],
    ['GET', `${CONFIG.base}/recommendations/trending-in-communities`, null, { headers, tags: { name: 'trending-in-communities' } }],
    ['GET', `${CONFIG.base}/recommendations/catalog-surprise`,        null, { headers, tags: { name: 'catalog-surprise' } }],
    ['GET', `${CONFIG.base}/recommendations/similar-authors`,         null, { headers, tags: { name: 'similar-authors' } }],
    ['GET', `${CONFIG.base}/recommendations/reread-worth-it`,         null, { headers, tags: { name: 'reread-worth-it' } }],
  ]);

  const [byr, fgn, tic, cs, sa, rr] = responses;
  const byrBody = safeJson(byr);
  const fgnBody = safeJson(fgn);
  const ticBody = safeJson(tic);
  const csBody  = safeJson(cs);
  const saBody  = safeJson(sa);
  const rrBody  = safeJson(rr);

  check(byr, {
    'because you read 200':      (r) => r.status === 200,
    'because you read tem books': ()  => Array.isArray(byrBody?.books),
  });
  if (byr.status !== 200) logWarn({ step: 'because-you-read', status: byr.status, body: byr.body });

  check(fgn, {
    'favorite genre now 200':          (r) => r.status === 200,
    'favorite genre now tem topGenres': ()  => Array.isArray(fgnBody?.topGenres),
    'favorite genre now tem books':     ()  => Array.isArray(fgnBody?.books),
  });
  if (fgn.status !== 200) logWarn({ step: 'favorite-genre-now', status: fgn.status, body: fgn.body });

  check(tic, {
    'trending in communities 200':      (r) => r.status === 200,
    'trending in communities tem books': ()  => Array.isArray(ticBody?.books),
  });
  if (tic.status !== 200) logWarn({ step: 'trending-in-communities', status: tic.status, body: tic.body });

  check(cs, {
    'catalog surprise 200':      (r) => r.status === 200,
    'catalog surprise tem books': ()  => Array.isArray(csBody?.books),
  });
  if (cs.status !== 200) logWarn({ step: 'catalog-surprise', status: cs.status, body: cs.body });

  check(sa, {
    'similar authors 200':      (r) => r.status === 200,
    'similar authors tem books': ()  => Array.isArray(saBody?.books),
  });
  if (sa.status !== 200) logWarn({ step: 'similar-authors', status: sa.status, body: sa.body });

  check(rr, {
    'reread worth it 200':      (r) => r.status === 200,
    'reread worth it tem books': ()  => Array.isArray(rrBody?.books),
  });
  if (rr.status !== 200) logWarn({ step: 'reread-worth-it', status: rr.status, body: rr.body });

  sleep(Math.random() * CONFIG.sleep.maxThinkTime);
}
