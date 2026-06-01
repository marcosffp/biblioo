import http from 'k6/http';
import { sleep, check, fail } from 'k6';
import { b64decode } from 'k6/encoding';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 800,
  password:     'Senha@12345',
  prefix:       'stressreview',
  minBookId:    1,
  maxBookId:    20,

  stress: {
    stageDuration: '30s',
    stages:        [20, 50, 100, 200, 300, 400, 600],
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

// ── Helpers de log estruturado ───────────────────────────────────────────────
// Guards: __VU/__ITER não existem no contexto de setup() do k6 — acessá-los
// direto dispara ReferenceError e derruba o setup quando um request falha lá dentro.
const SAFE_VU   = () => (typeof __VU   !== 'undefined' ? __VU   : 0);
const SAFE_ITER = () => (typeof __ITER !== 'undefined' ? __ITER : -1);

function logWarn(context, extra = {}) {
  console.warn(JSON.stringify({ vu: SAFE_VU(), iter: SAFE_ITER(), ...context, ...extra }));
}

function logError(context, extra = {}) {
  console.error(JSON.stringify({ vu: SAFE_VU(), iter: SAFE_ITER(), ...context, ...extra }));
}

// ── parseUserId ──────────────────────────────────────────────────────────────
// FIX #1: usa b64decode do k6/encoding (atob não é garantido no k6).
// FIX #2: cobre múltiplos campos de claim com fallbacks.
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

// ── multipart ────────────────────────────────────────────────────────────────
// Compatível com @RequestParam no Spring (consumes=MULTIPART_FORM_DATA_VALUE).
function multipart(fields) {
  const boundary = 'K6FormBoundary';
  let body = '';
  for (const [name, value] of Object.entries(fields)) {
    body += `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`;
  }
  body += `--${boundary}--\r\n`;
  return { body, contentType: `multipart/form-data; boundary=${boundary}` };
}

// ── Rotação de bookId ────────────────────────────────────────────────────────
// Distribui uniformemente entre minBookId..maxBookId por VU+iteração,
// evitando que o mesmo userId+bookId se repita (anti-duplicata de review).
function currentBookId() {
  const totalBooks = CONFIG.maxBookId - CONFIG.minBookId + 1;
  return CONFIG.minBookId + ((__VU * 37 + __ITER) % totalBooks);
}

// ── setup ────────────────────────────────────────────────────────────────────
export function setup() {
  const users   = [];
  const headers = { 'Content-Type': 'application/json' };

  for (let i = 0; i < CONFIG.userPoolSize; i++) {
    const ts    = Date.now() + i;
    const email = `${CONFIG.prefix}_${ts}@test.com`;

    // 1. Registrar
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

    // 2. Login
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

    // FIX #3: não empurra usuário inválido para o pool.
    if (!accessToken || !userId) {
      logWarn({ step: 'setup', userIndex: i, msg: 'accessToken ou userId ausente', userId });
      continue;
    }

    const authH = { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` };

    // 3. Criar estante
    const shelfRes = http.post(
      `${CONFIG.base}/shelves`,
      JSON.stringify({ name: `Estante ${ts}`, description: 'stress test' }),
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

    // 4. Adicionar todos os livros do range à estante com COMPLETED.
    // Necessário para que qualquer bookId da rotação passe na validação
    // de ReviewService.createReview (livro deve estar na estante do usuário).
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

  // FIX #4: aborta o teste se nenhum usuário for criado.
  if (users.length === 0) {
    throw new Error('Nenhum usuário criado com sucesso. Abortando o teste de stress.');
  }

  console.log(`Setup concluído: ${users.length} usuários prontos de ${CONFIG.userPoolSize} tentativas.`);
  return { users };
}

// ── options ──────────────────────────────────────────────────────────────────
export const options = {
  setupTimeout: '1800s',
  stages: [
    ...CONFIG.stress.stages.map((vus) => ({ duration: CONFIG.stress.stageDuration, target: vus })),
    { duration: CONFIG.stress.stageDuration, target: 0 },
  ],
  thresholds: {
    http_req_duration: [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:   [`rate<${CONFIG.thresholds.failRate}`],
  },
};

// ── default (cenário de stress) ──────────────────────────────────────────────
export default function (data) {
  // FIX #5 (distribuição de usuários): __VU começa em 1; sem o -1 o índice 0
  // nunca é acessado corretamente e a distribuição fica enviesada.
  const user = data.users[(__VU - 1) % data.users.length];
  if (!user) return;
  const { accessToken, userId } = user;

  const bookId = currentBookId();

  // ── LIST ────────────────────────────────────────────────────────────────
  const listRes = http.get(
    `${CONFIG.base}/feed/reviews/user/${userId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  // FIX #6 (validação mais profunda): verifica status
  check(listRes, {
    'list 200': (r) => r.status === 200,
  });

  if (listRes.status !== 200) {
    logWarn({ step: 'list', userId, status: listRes.status, body: listRes.body });
  }

  sleep(CONFIG.sleep.betweenSteps);

  // ── CREATE ──────────────────────────────────────────────────────────────
  // ReviewController: POST /feed/reviews — @RequestParam (sem multipart)
  const createRes = http.post(
    `${CONFIG.base}/feed/reviews?bookId=${bookId}&rating=4&text=${encodeURIComponent(`Stress review VU${__VU} iter${__ITER}`)}`,
    null,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  // FIX #7 (validação mais profunda): em 201 também valida o id retornado.
  check(createRes, {
    'create 201': (r) => r.status === 201,
    'create retorna id e bookId': (r) => {
      if (r.status !== 201) return true; // só valida estrutura se criou
      try {
        const body = JSON.parse(r.body);
        return body.id != null && Number(body.bookId) === bookId;
      } catch {
        return false;
      }
    },
  });

  if (createRes.status !== 201) {
    logWarn({ step: 'create', bookId, status: createRes.status, body: createRes.body });
    // Em stress, falha de create é esperada nos estágios mais altos;
    // não chama fail() para não encerrar a iteração prematuramente.
    sleep(CONFIG.sleep.afterIteration);
    return;
  }

  let reviewId = null;
  try {
    reviewId = JSON.parse(createRes.body).id;
  } catch {
    logError({ step: 'parseReviewId' });
    sleep(CONFIG.sleep.afterIteration);
    return;
  }

  sleep(CONFIG.sleep.betweenSteps);

  // ── GET ─────────────────────────────────────────────────────────────────
  const getRes = http.get(
    `${CONFIG.base}/feed/reviews/${reviewId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  check(getRes, { 'get 200': (r) => r.status === 200 });

  if (getRes.status !== 200) {
    logWarn({ step: 'get', reviewId, status: getRes.status, body: getRes.body });
  }

  sleep(CONFIG.sleep.betweenSteps);

  // ── DELETE ──────────────────────────────────────────────────────────────
  const delRes = http.del(
    `${CONFIG.base}/feed/reviews/${reviewId}`,
    null,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  // FIX #8 (delete com log): antes era silencioso em falha.
  check(delRes, { 'delete 204': (r) => r.status === 204 });
  if (delRes.status !== 204) {
    logWarn({ step: 'delete', reviewId, status: delRes.status, body: delRes.body });
  }

  sleep(CONFIG.sleep.afterIteration);
}