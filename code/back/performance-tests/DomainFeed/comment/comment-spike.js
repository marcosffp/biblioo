import http from 'k6/http';
import { sleep, check, fail } from 'k6';
import { b64decode } from 'k6/encoding';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 500,
  password:     'Senha@12345',
  prefix:       'spikecomment',
  bookId:       1,

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

// FIX #1 (log estruturado): helpers centralizados de log, alinhados com
// review-load.js e comment-load.js.
function logWarn(context, extra = {}) {
  console.warn(JSON.stringify({ vu: typeof __VU !== 'undefined' ? __VU : 0, iter: typeof __ITER !== 'undefined' ? __ITER : 0, ...context, ...extra }));
}

function logError(context, extra = {}) {
  console.error(JSON.stringify({ vu: typeof __VU !== 'undefined' ? __VU : 0, iter: typeof __ITER !== 'undefined' ? __ITER : 0, ...context, ...extra }));
}

// FIX #2 (b64decode): substitui atob() nativo — não disponível em todos os
// runtimes k6 — pelo b64decode da lib oficial, com tratamento de padding e
// caracteres URL-safe, igual aos demais arquivos do projeto.
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
    // FIX #3 (uid sem colisão de timestamp): usa índice + random em vez de
    // Date.now()+i, evitando emails duplicados em execuções paralelas rápidas.
    const uid   = `${i}_${Math.floor(Math.random() * 1e9)}`;
    const email = `${CONFIG.prefix}_${uid}@test.com`;

    // 1. Registrar usuário
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

    // FIX #4 (parse defensivo do login): o original fazia destructuring direto,
    // quebrando silenciosamente se o campo tivesse nome diferente ou o parse falhasse.
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

    // 3. Criar estante
    const shelfRes = http.post(
      `${CONFIG.base}/shelves`,
      JSON.stringify({ name: `Spike Test Shelf ${uid}`, description: '' }),
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

    // 4. Adicionar livro à estante
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

    // 5. Criar review base para comentar durante o spike
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

  // FIX #5 (guard de usuário mínimo): aborta o teste se nenhum usuário foi
  // preparado com sucesso, evitando execução silenciosa sem carga real.
  if (users.length === 0) {
    throw new Error('Nenhum usuário foi criado/logado com sucesso. Abortando o teste.');
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
    { duration: CONFIG.spike.cooldown,   target: 0 },
  ],
  thresholds: {
    http_req_duration: [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:   [`rate<${CONFIG.thresholds.failRate}`],
  },
};

export default function (data) {
  // FIX #6 (distribuição de VUs): __VU começa em 1, então sem o -1 o índice 0
  // nunca era acessado corretamente e a distribuição ficava enviesada.
  const user = data.users[(__VU - 1) % data.users.length];
  if (!user) { sleep(CONFIG.sleep.afterIteration); return; }

  const { accessToken, reviewId } = user;

  const authHeaders = { Authorization: `Bearer ${accessToken}` };

  // ── LIST ─────────────────────────────────────────────────────────────────
  const listRes = http.get(
    `${CONFIG.base}/feed/reviews/${reviewId}/comments`,
    { headers: authHeaders }
  );

  // FIX #7 (validação profunda no list): valida estrutura
  // alinhado com comment-load.js e review-load.js.
  check(listRes, {
    'list 200': (r) => r.status === 200,
  });

  if (listRes.status !== 200) {
    logWarn({ step: 'list', reviewId, status: listRes.status, body: listRes.body });
  }

  sleep(CONFIG.sleep.betweenOps);

  // ── CREATE ────────────────────────────────────────────────────────────────
  const mp = multipart({ text: `Spike comment VU${__VU} iter${__ITER}` });
  const createRes = http.post(
    `${CONFIG.base}/feed/reviews/${reviewId}/comments`,
    mp.body,
    { headers: { 'Content-Type': mp.contentType, ...authHeaders } }
  );

  // 429 é esperado durante o pico de spike — não deve ser tratado como falha.
  check(createRes, { 'create 201 ou 429': (r) => r.status === 201 || r.status === 429 });

  if (createRes.status !== 201 && createRes.status !== 429) {
    logWarn({ step: 'create', reviewId, status: createRes.status, body: createRes.body });
  }

  // ── DELETE (cleanup) ─────────────────────────────────────────────────────
  if (createRes.status === 201) {
    // FIX #8 (parse defensivo do commentId): o original fazia JSON.parse direto
    // sem try/catch, podendo lançar exceção não tratada se o body fosse inválido.
    let commentId = null;
    try {
      commentId = JSON.parse(createRes.body).id;
    } catch {
      logError({ step: 'parseCommentId' });
    }

    if (commentId) {
      const deleteRes = http.del(
        `${CONFIG.base}/feed/reviews/${reviewId}/comments/${commentId}`,
        null,
        { headers: authHeaders }
      );

      // FIX #9 (check + log no delete): o original não validava nem logava
      // falhas no delete, mascarando vazamentos de dados no banco durante o spike.
      check(deleteRes, { 'delete 204': (r) => r.status === 204 });
      if (deleteRes.status !== 204) {
        logWarn({ step: 'delete', commentId, status: deleteRes.status, body: deleteRes.body });
      }
    }
  }

  sleep(CONFIG.sleep.afterIteration);
}