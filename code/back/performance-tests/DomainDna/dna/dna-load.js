import http from 'k6/http';
import { sleep, check, fail } from 'k6';
import { b64decode } from 'k6/encoding';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 100,
  password:     'Senha@12345',
  prefix:       'loaddna',
  // DNA requer mínimo 5 livros concluídos; usando os mesmos IDs do ambiente local
  bookIds:      [1, 2, 3, 4, 5],

  load: {
    readVus:    60,
    listingVus: 20,
    duration:   '2m',
  },

  thresholds: {
    p95Crud:    1500,
    p95Listing:  500,
    failRate:   0.02,
  },

  sleep: {
    betweenSteps:   0.3,
    afterIteration: 1,
    listing:        0.5,
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

    const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` };

    const shelfRes = http.post(
      `${CONFIG.base}/shelves`,
      JSON.stringify({ name: `DNA Load Shelf ${uid}`, description: '' }),
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

    // Adicionar 5 livros como COMPLETED dispara shelf.reading.completed → recálculo async do DNA via RabbitMQ
    let allBooksAdded = true;
    for (const bookId of CONFIG.bookIds) {
      const itemRes = http.post(
        `${CONFIG.base}/shelves/${shelfId}/items`,
        JSON.stringify({ bookId, initialStatus: 'COMPLETED' }),
        { headers: authHeaders }
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
    throw new Error('Nenhum usuário criado com sucesso. Abortando o teste.');
  }

  console.log(`Setup concluído: ${users.length} usuários prontos de ${CONFIG.userPoolSize} tentativas.`);
  return { users };
}

export const options = {
  scenarios: {
    readDna: {
      executor: 'constant-vus',
      vus:      CONFIG.load.readVus,
      duration: CONFIG.load.duration,
      exec:     'getDna',
    },
    listingDna: {
      executor: 'constant-vus',
      vus:      CONFIG.load.listingVus,
      duration: CONFIG.load.duration,
      exec:     'listDna',
    },
  },
  thresholds: {
    http_req_duration:                        [`p(95)<${CONFIG.thresholds.p95Crud}`],
    http_req_failed:                          [`rate<${CONFIG.thresholds.failRate}`],
    'http_req_duration{scenario:readDna}':    [`p(95)<${CONFIG.thresholds.p95Crud}`],
    'http_req_duration{scenario:listingDna}': [`p(95)<${CONFIG.thresholds.p95Listing}`],
  },
};

// DnaController: GET /dna — 200 sempre (DnaProgressResponse ou DnaResponse dependendo do status)
export function getDna(data) {
  const user = data.users[(__VU - 1) % data.users.length];
  if (!user) return;
  const { accessToken } = user;

  const res = http.get(
    `${CONFIG.base}/dna`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const ok = check(res, {
    'get dna 200':    (r) => r.status === 200,
    'retorna status ou booksRead': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status != null || body.booksRead != null;
      } catch { return false; }
    },
  });

  if (!ok || res.status !== 200) {
    logWarn({ step: 'getDna', status: res.status, body: res.body });
  }

  sleep(CONFIG.sleep.afterIteration);
}

// DnaController: GET /dna/snapshots + GET /dna/phases
// PATCH /dna/phases/{phaseId}/name testado apenas se existirem fases (criadas pelo DnaScheduler)
export function listDna(data) {
  const user = data.users[(__VU - 1) % data.users.length];
  if (!user) return;
  const { accessToken, userId } = user;

  const authH = { Authorization: `Bearer ${accessToken}` };

  const snapshotsRes = http.get(`${CONFIG.base}/dna/snapshots`, { headers: authH });
  check(snapshotsRes, {
    'snapshots 200':     (r) => r.status === 200,
    'snapshots é array': (r) => {
      try { return Array.isArray(JSON.parse(r.body)); }
      catch { return false; }
    },
  });
  if (snapshotsRes.status !== 200) {
    logWarn({ step: 'getSnapshots', userId, status: snapshotsRes.status, body: snapshotsRes.body });
  }

  sleep(CONFIG.sleep.betweenSteps);

  const phasesRes = http.get(`${CONFIG.base}/dna/phases`, { headers: authH });
  check(phasesRes, {
    'phases 200':     (r) => r.status === 200,
    'phases é array': (r) => {
      try { return Array.isArray(JSON.parse(r.body)); }
      catch { return false; }
    },
  });
  if (phasesRes.status !== 200) {
    logWarn({ step: 'getPhases', userId, status: phasesRes.status, body: phasesRes.body });
  }

  // Renomear somente se existir fase — fases exigem 3 meses consecutivos de mesmo arquétipo
  if (phasesRes.status === 200) {
    let phases = [];
    try { phases = JSON.parse(phasesRes.body); } catch { /* sem fases */ }

    if (phases.length > 0) {
      const phaseId   = phases[0].id;
      const renameRes = http.patch(
        `${CONFIG.base}/dna/phases/${phaseId}/name`,
        JSON.stringify({ customName: `Fase Load VU${__VU}` }),
        { headers: { 'Content-Type': 'application/json', ...authH } }
      );
      check(renameRes, { 'rename phase 200': (r) => r.status === 200 });
      if (renameRes.status !== 200) {
        logWarn({ step: 'renamePhase', phaseId, status: renameRes.status, body: renameRes.body });
      }
    }
  }

  sleep(CONFIG.sleep.listing);
}
