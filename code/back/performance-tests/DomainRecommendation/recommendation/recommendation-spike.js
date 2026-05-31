import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 600,
  password:     'Senha@12345',
  prefix:       'spikerecommendation',

  spike: {
    baseVus:      70,
    peakVus:      600,
    rampUpBase:   '10s',
    rampUpPeak:   '10s',
    peakDuration: '30s',
    rampDownBase: '10s',
    cooldown:     '10s',
  },

  thresholds: {
    p95General: 3000,
    failRate:   0.05,
  },

  sleep: {
    maxThinkTime: 0.5,
    // Intervalo entre usuários durante o warm-up para não sobrecarregar
    // o banco antes do teste começar. 50ms = ~20 req/s de warm-up.
    warmupBetweenUsers: 0.05,
  },
};

const ENDPOINTS = [
  { url: '/recommendations/because-you-read',        tag: 'because-you-read'        },
  { url: '/recommendations/favorite-genre-now',      tag: 'favorite-genre-now'      },
  { url: '/recommendations/trending-in-communities', tag: 'trending-in-communities' },
  { url: '/recommendations/catalog-surprise',        tag: 'catalog-surprise'        },
  { url: '/recommendations/similar-authors',         tag: 'similar-authors'         },
  { url: '/recommendations/reread-worth-it',         tag: 'reread-worth-it'         },
];

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

/**
 * Aquece o cache de todos os endpoints para um único usuário.
 * Faz as 6 chamadas em batch — mesma lógica do cenário principal —
 * mas sem checks nem logs de aviso para não poluir o setup.
 * Retorna true se ao menos uma resposta foi 200.
 */
function warmupUser(accessToken) {
  const headers = { Authorization: `Bearer ${accessToken}` };

  const requests = ENDPOINTS.map(({ url, tag }) => [
    'GET',
    `${CONFIG.base}${url}`,
    null,
    { headers, tags: { name: tag } },
  ]);

  const responses = http.batch(requests);
  return responses.some((r) => r.status === 200);
}

export function setup() {
  const users   = [];
  const headers = { 'Content-Type': 'application/json' };

  // ── 1. Registro e login ──────────────────────────────────────────────────
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

  // ── 2. Cache warm-up ─────────────────────────────────────────────────────
  // Propósito: popular o cache de cada usuário antes do ramp-up.
  // Sem isso, a primeira iteração de cada VU sempre bate no banco a frio,
  // criando pico artificial de latência logo no início do spike.
  //
  // Estratégia:
  //   - Chamada em batch (6 endpoints por vez) para cada usuário.
  //   - Sleep curto entre usuários para não saturar o banco durante o setup.
  //   - Falhas de warm-up são logadas mas não interrompem o teste —
  //     o endpoint simplesmente continuará a frio para esse usuário.
  //
  // Tempo estimado: 400 usuários × 50 ms = ~20 s adicionais no setup.
  console.log(`Iniciando warm-up de cache para ${users.length} usuários...`);
  let warmupOk = 0;
  let warmupFail = 0;

  for (let i = 0; i < users.length; i++) {
    const ok = warmupUser(users[i].accessToken);
    if (ok) {
      warmupOk++;
    } else {
      warmupFail++;
      logWarn({ step: 'warmup', userIndex: i, msg: 'warm-up sem resposta 200' });
    }

    // Pequena pausa para não criar uma rajada de 400 req simultâneas
    // no banco durante o setup — o semáforo de concorrência continua ativo.
    sleep(CONFIG.sleep.warmupBetweenUsers);
  }

  console.log(`Warm-up concluído: ${warmupOk} OK, ${warmupFail} falhas.`);

  return { users };
}

export const options = {
  setupTimeout: '600s', // aumentado de 300s → 600s para cobrir o warm-up (~20s extra)
  scenarios: {
    spike: {
      executor:         'ramping-vus',
      startVUs:         0,
      stages: [
        { duration: CONFIG.spike.rampUpBase,   target: CONFIG.spike.baseVus  },
        { duration: CONFIG.spike.rampUpPeak,   target: CONFIG.spike.peakVus  },
        { duration: CONFIG.spike.peakDuration, target: CONFIG.spike.peakVus  },
        { duration: CONFIG.spike.rampDownBase, target: CONFIG.spike.baseVus  },
        { duration: CONFIG.spike.cooldown,     target: 0                     },
      ],
      gracefulRampDown: '10s',
      exec:             'queryRecommendation',
    },
  },
  thresholds: {
    http_req_duration:                                       [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:                                         [`rate<${CONFIG.thresholds.failRate}`],
    'http_req_duration{name:because-you-read}':              ['p(95)<3000'],
    'http_req_duration{name:favorite-genre-now}':            ['p(95)<3000'],
    'http_req_duration{name:trending-in-communities}':       ['p(95)<3000'],
    'http_req_duration{name:catalog-surprise}':              ['p(95)<3000'],
    'http_req_duration{name:similar-authors}':               ['p(95)<3000'],
    'http_req_duration{name:reread-worth-it}':               ['p(95)<3000'],
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
    'because you read 200':       (r) => r.status === 200,
    'because you read tem books':  ()  => Array.isArray(byrBody?.books),
  });
  if (byr.status !== 200) logWarn({ step: 'because-you-read', status: byr.status, body: byr.body });

  check(fgn, {
    'favorite genre now 200':           (r) => r.status === 200,
    'favorite genre now tem topGenres':  ()  => Array.isArray(fgnBody?.topGenres),
    'favorite genre now tem books':      ()  => Array.isArray(fgnBody?.books),
  });
  if (fgn.status !== 200) logWarn({ step: 'favorite-genre-now', status: fgn.status, body: fgn.body });

  check(tic, {
    'trending in communities 200':       (r) => r.status === 200,
    'trending in communities tem books':  ()  => Array.isArray(ticBody?.books),
  });
  if (tic.status !== 200) logWarn({ step: 'trending-in-communities', status: tic.status, body: tic.body });

  check(cs, {
    'catalog surprise 200':       (r) => r.status === 200,
    'catalog surprise tem books':  ()  => Array.isArray(csBody?.books),
  });
  if (cs.status !== 200) logWarn({ step: 'catalog-surprise', status: cs.status, body: cs.body });

  check(sa, {
    'similar authors 200':       (r) => r.status === 200,
    'similar authors tem books':  ()  => Array.isArray(saBody?.books),
  });
  if (sa.status !== 200) logWarn({ step: 'similar-authors', status: sa.status, body: sa.body });

  check(rr, {
    'reread worth it 200':       (r) => r.status === 200,
    'reread worth it tem books':  ()  => Array.isArray(rrBody?.books),
  });
  if (rr.status !== 200) logWarn({ step: 'reread-worth-it', status: rr.status, body: rr.body });

  sleep(Math.random() * CONFIG.sleep.maxThinkTime);
}