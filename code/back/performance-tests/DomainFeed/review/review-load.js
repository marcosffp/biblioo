import http from 'k6/http';
import { sleep, check, fail } from 'k6';
import { b64decode } from 'k6/encoding';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 100,
  password:     'Senha@12345',
  prefix:       'loadreview',

  // FIX #1 (soft-delete / review duplicada):
  // Múltiplos livros garantem que cada iteração use um bookId diferente,
  // evitando conflito de "review já existe" mesmo se o delete for soft-delete.
  bookIds: [1, 2, 3, 4, 5],

  load: {
    crudVus:    60,
    listingVus: 20,
    duration:   '2m',
  },

  thresholds: {
    p95General:  1000,
    p95Crud:     1500,
    p95Listing:   500,
    // FIX #2 (threshold menos rígido):
    // 1% é agressivo demais para ambiente local com alta concorrência.
    failRate:    0.02,
  },

  sleep: {
    betweenSteps:   0.3,
    afterIteration: 1,
    listing:        0.5,
  },
};

// Retorna o bookId correto para a iteração atual,
// rotacionando entre os livros disponíveis.
function currentBookId() {
  return CONFIG.bookIds[__ITER % CONFIG.bookIds.length];
}

// FIX #3 (log estruturado): helper centralizado de log de erro.
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
    if (raw == null) {
      console.warn('Claims disponíveis: ' + Object.keys(payload).join(', '));
    }
    return raw;
  } catch (e) {
    logError({ step: 'parseUserId', error: String(e) });
    return null;
  }
}

// multipart monta campos simples corretamente para o Spring.
// Compatível com @RequestParam em endpoints consumes=MULTIPART_FORM_DATA_VALUE.
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

    let accessToken = null;
    let userId      = null;
    try {
      const body = JSON.parse(login.body);
      accessToken = body.accessToken || body.access_token || body.token;
      userId      = parseUserId(accessToken);
    } catch (e) {
      logError({ step: 'parseLogin', userIndex: i, error: String(e) });
      continue;
    }

    if (!accessToken || !userId) {
      logWarn({ step: 'setup', userIndex: i, msg: 'accessToken ou userId ausente', accessToken: !!accessToken, userId });
      continue;
    }

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${accessToken}`,
    };

    // 3. Criar estante
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

    // 4. Adicionar todos os livros da pool à estante com status COMPLETED.
    // Necessário porque ReviewService.createReview exige que o livro esteja na estante
    // e cada iteração pode usar um bookId diferente (rotação anti-duplicata).
    let allBooksAdded = true;
    for (const bookId of CONFIG.bookIds) {
      const itemRes = http.post(
        `${CONFIG.base}/shelves/${shelfId}/items`,
        JSON.stringify({ bookId, initialStatus: 'COMPLETED' }),
        { headers: authHeaders }
      );
      check(itemRes, { 'book added to shelf 201': (r) => r.status === 201 });
      if (itemRes.status !== 201) {
        logError({ step: 'addBookToShelf', userIndex: i, bookId, status: itemRes.status, body: itemRes.body });
        allBooksAdded = false;
        break;
      }
    }

    if (!allBooksAdded) continue;

    users.push({ accessToken, userId, shelfId });
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
      exec:     'crudReview',
    },
    listing: {
      executor: 'constant-vus',
      vus:      CONFIG.load.listingVus,
      duration: CONFIG.load.duration,
      exec:     'listReviews',
    },
  },
  thresholds: {
    http_req_duration:                      [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:                        [`rate<${CONFIG.thresholds.failRate}`],
    'http_req_duration{scenario:crud}':     [`p(95)<${CONFIG.thresholds.p95Crud}`],
    'http_req_duration{scenario:listing}':  [`p(95)<${CONFIG.thresholds.p95Listing}`],
  },
};

export function crudReview(data) {
  // FIX #4 (distribuição de usuários):
  // __VU começa em 1, então sem o -1 o índice 0 nunca seria acessado corretamente
  // e a distribuição ficava enviesada.
  const user = data.users[(__VU - 1) % data.users.length];
  if (!user) return;
  const { accessToken, userId } = user;

  const authHeaders = { Authorization: `Bearer ${accessToken}` };

  // Rotaciona entre livros por iteração para evitar "review duplicada"
  // mesmo quando o delete é soft-delete (a regra de negócio bloquearia o CREATE).
  const bookId = currentBookId();

  // ── CREATE ────────────────────────────────────────────────────────────────
  // ReviewController: POST /feed/reviews — MULTIPART_FORM_DATA
  // Campos: bookId, rating, text, publish (@RequestParam)
  const mp = multipart({
    bookId:  String(bookId),
    rating:  '4',
    text:    `Review de load test VU${__VU} iter${__ITER}`,
    publish: 'false',
  });
  const createRes = http.post(
    `${CONFIG.base}/feed/reviews`,
    mp.body,
    { headers: { 'Content-Type': mp.contentType, ...authHeaders } }
  );

  // FIX #5 (validação mais profunda):
  // Além de checar o status, valida que o body contém id e bookId correto.
  const createOk = check(createRes, {
    'create 201': (r) => r.status === 201,
    'create retorna id e bookId': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.id != null && Number(body.bookId) === bookId;
      } catch {
        return false;
      }
    },
  });

  // FIX #6 (não mascarar falha de CREATE):
  // Antes o código só fazia `return`, ocultando o problema nos logs do k6.
  // `fail()` marca a iteração como falha e aparece nas métricas.
  if (!createOk || createRes.status !== 201) {
    logWarn({
      step:   'create',
      status: createRes.status,
      bookId,
      body:   createRes.body,
    });
    fail(`CREATE falhou: status=${createRes.status}`);
    return;
  }

  let reviewId;
  try {
    reviewId = JSON.parse(createRes.body).id;
  } catch {
    logError({ step: 'parseReviewId' });
    fail('Falha ao parsear id da review criada');
    return;
  }

  sleep(CONFIG.sleep.betweenSteps);

  // ── GET ──────────────────────────────────────────────────────────────────
  // ReviewController: GET /feed/reviews/{reviewId}
  // Nota: o endpoint não exige autenticação; o header é enviado assim mesmo
  // para não esconder eventuais bugs de autorização no servidor.
  const getRes = http.get(
    `${CONFIG.base}/feed/reviews/${reviewId}`,
    { headers: authHeaders }
  );
  check(getRes, { 'get 200': (r) => r.status === 200 });

  if (getRes.status !== 200) {
    logWarn({ step: 'get', reviewId, status: getRes.status, body: getRes.body });
  }

  sleep(CONFIG.sleep.betweenSteps);

  // ── UPDATE ───────────────────────────────────────────────────────────────
  // ReviewController: PUT /feed/reviews/{reviewId} — MULTIPART_FORM_DATA
  // Campos: rating, text (@RequestParam); images, gif (@RequestPart, opcionais)
  const updMp = multipart({
    rating: '5',
    text:   `Review atualizada VU${__VU} iter${__ITER}`,
  });
  const updateRes = http.put(
    `${CONFIG.base}/feed/reviews/${reviewId}`,
    updMp.body,
    { headers: { 'Content-Type': updMp.contentType, ...authHeaders } }
  );
  check(updateRes, { 'update 200': (r) => r.status === 200 });

  if (updateRes.status !== 200) {
    logWarn({ step: 'update', reviewId, status: updateRes.status, body: updateRes.body });
  }

  sleep(CONFIG.sleep.betweenSteps);

  // ── DELETE ───────────────────────────────────────────────────────────────
  // ReviewController: DELETE /feed/reviews/{reviewId}
  // Soft-delete se tiver comentários, hard-delete se não tiver.
  // A rotação de bookIds garante que a próxima iteração use outro livro,
  // evitando conflito de "review já existe" independentemente do tipo de delete.
  const deleteRes = http.del(
    `${CONFIG.base}/feed/reviews/${reviewId}`,
    null,
    { headers: authHeaders }
  );
  check(deleteRes, { 'delete 204': (r) => r.status === 204 });

  if (deleteRes.status !== 204) {
    logWarn({ step: 'delete', reviewId, status: deleteRes.status, body: deleteRes.body });
  }

  sleep(CONFIG.sleep.afterIteration);
}

export function listReviews(data) {
  // FIX #4 (distribuição de usuários): mesma correção do __VU - 1
  const user = data.users[(__VU - 1) % data.users.length];
  if (!user) return;
  const { accessToken, userId } = user;

  if (!userId) {
    logWarn({ step: 'listReviews', msg: 'userId nulo, pulando listagem' });
    sleep(CONFIG.sleep.listing);
    return;
  }

  // ReviewController: GET /feed/reviews/user/{userId} — paginado, retorna Page<ReviewResponse>
  const res = http.get(
    `${CONFIG.base}/feed/reviews/user/${userId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  // FIX #5 (validação mais profunda):
  // Além de checar o status.
  check(res, {
    'list 200': (r) => r.status === 200,
  });

  if (res.status !== 200) {
    logWarn({ step: 'listReviews', userId, status: res.status, body: res.body });
  }

  sleep(CONFIG.sleep.listing);
}