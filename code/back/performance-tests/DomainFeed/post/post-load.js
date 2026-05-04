import http from 'k6/http';
import { sleep, check } from 'k6';
import { b64decode } from 'k6/encoding';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 100,
  password:     'Senha@12345',
  prefix:       'loadpost',

  load: {
    crudVus:    60,
    listingVus: 20,
    duration:   '2m',
  },

  thresholds: {
    p95General:  1000,
    p95Crud:     1500,
    p95Listing:   600,
    failRate:    0.01,
  },

  sleep: {
    betweenSteps:   0.3,
    afterIteration: 1,
    listing:        0.5,
  },
};

// b64decode já está importado no topo do arquivo — não precisa de require aqui
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
    console.error('Falha ao parsear JWT: ' + e);
    return null;
  }
}

// FIX 2: multipart monta campos simples corretamente para o Spring
// O Spring com consumes=MULTIPART_FORM_DATA_VALUE lê @RequestParam do body multipart, não da query string
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
    // FIX 3: usa índice puro em vez de Date.now()+i para evitar colisões de timestamp
    // em execuções paralelas rápidas
    const uid   = `${__VU || 0}_${i}_${Math.floor(Math.random() * 1e9)}`;
    const email = `${CONFIG.prefix}_${uid}@test.com`;

    const reg = http.post(
      `${CONFIG.base}/auth/register`,
      JSON.stringify({ username: `${CONFIG.prefix}_${uid}`, email, password: CONFIG.password }),
      { headers }
    );
    check(reg, { 'register 201': (r) => r.status === 201 });

    const login = http.post(
      `${CONFIG.base}/auth/login`,
      JSON.stringify({ email, password: CONFIG.password }),
      { headers }
    );
    check(login, { 'login 200': (r) => r.status === 200 });

    let accessToken = null;
    let userId      = null;

    try {
      const body = JSON.parse(login.body);
      accessToken = body.accessToken || body.access_token || body.token;
      userId      = parseUserId(accessToken);
    } catch (e) {
      console.error(`Falha ao parsear resposta de login para usuário ${i}: ${e}`);
    }

    // FIX 4: só adiciona usuário se ambos os valores foram obtidos com sucesso
    if (accessToken && userId) {
      users.push({ accessToken, userId });
    } else {
      console.warn(`Usuário ${i} ignorado: accessToken=${accessToken}, userId=${userId}`);
    }
  }

  if (users.length === 0) {
    throw new Error('Nenhum usuário foi criado/logado com sucesso. Abortando o teste.');
  }

  console.log(`Setup concluído: ${users.length} usuários prontos.`);
  return { users };
}

export const options = {
  scenarios: {
    crud: {
      executor: 'constant-vus',
      vus:      CONFIG.load.crudVus,
      duration: CONFIG.load.duration,
      exec:     'crudPost',
    },
    listing: {
      executor: 'constant-vus',
      vus:      CONFIG.load.listingVus,
      duration: CONFIG.load.duration,
      exec:     'listPosts',
    },
  },
  thresholds: {
    http_req_duration:                      [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:                        [`rate<${CONFIG.thresholds.failRate}`],
    'http_req_duration{scenario:crud}':     [`p(95)<${CONFIG.thresholds.p95Crud}`],
    'http_req_duration{scenario:listing}':  [`p(95)<${CONFIG.thresholds.p95Listing}`],
  },
};

export function crudPost(data) {
  // garante que temos pelo menos 2 usuários
  if (data.users.length < 2) {
    throw new Error('Precisa de pelo menos 2 usuários para testar like.');
  }

  // 👇 usuário dono do post
  const owner = data.users[__VU % data.users.length];

  // 👇 usuário diferente para curtir
  const liker = data.users[(__VU + 1) % data.users.length];

  if (!owner || !liker) return;

  const ownerToken = owner.accessToken;
  const likerToken = liker.accessToken;

  // ── CREATE ────────────────────────────────────────────────────────────────
  // bookId é opcional; inclui apenas em metade das iterações para testar ambos os casos
  const mp = multipart({
    text:       `Post de load test VU${__VU} iter${__ITER}`,
    hasSpoiler: 'false',
    ...(__ITER % 2 === 0 ? { bookId: '1' } : {}),
  });

  const createRes = http.post(
    `${CONFIG.base}/feed/posts`,
    mp.body,
    { headers: { 'Content-Type': mp.contentType, Authorization: `Bearer ${ownerToken}` } }
  );

  check(createRes, {
    'create 201': (r) => r.status === 201,
    'create retorna id': (r) => {
      try { return JSON.parse(r.body).id != null; }
      catch { return false; }
    },
  });

  if (createRes.status !== 201) {
    console.warn(`VU${__VU} iter${__ITER}: create falhou com status ${createRes.status} — body: ${createRes.body}`);
    sleep(CONFIG.sleep.afterIteration);
    return;
  }

  let postId;
  try {
    postId = JSON.parse(createRes.body).id;
  } catch {
    console.error(`VU${__VU}: falha ao parsear id do post criado`);
    sleep(CONFIG.sleep.afterIteration);
    return;
  }

  sleep(CONFIG.sleep.betweenSteps);

  // ── GET ──────────────────────────────────────────────────────────────────
  const getRes = http.get(
    `${CONFIG.base}/feed/posts/${postId}`,
    { headers: { Authorization: `Bearer ${ownerToken}` } }
  );

  check(getRes, { 'get 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.betweenSteps);

  // ── LIKE (AGORA COM OUTRO USUÁRIO) ────────────────────────────────────────
  const likeRes = http.post(
    `${CONFIG.base}/feed/posts/${postId}/like`,
    null,
    { headers: { Authorization: `Bearer ${likerToken}` } }
  );

  check(likeRes, {
    'like 200': (r) => r.status === 200,
  });

  if (likeRes.status !== 200) {
    console.warn(`VU${__VU} iter${__ITER}: like falhou com status ${likeRes.status} — body: ${likeRes.body}`);
  }

  sleep(CONFIG.sleep.betweenSteps);

  // ── UPDATE ───────────────────────────────────────────────────────────────
  const updMp = multipart({
    text:       `Post atualizado VU${__VU} iter${__ITER}`,
    hasSpoiler: 'false',
    ...(__ITER % 2 === 0 ? { bookId: '1' } : {}),
  });

  const updateRes = http.put(
    `${CONFIG.base}/feed/posts/${postId}`,
    updMp.body,
    { headers: { 'Content-Type': updMp.contentType, Authorization: `Bearer ${ownerToken}` } }
  );

  check(updateRes, {
    'update 200': (r) => r.status === 200,
  });

  if (updateRes.status !== 200) {
    console.warn(`VU${__VU} iter${__ITER}: update falhou com status ${updateRes.status} — body: ${updateRes.body}`);
  }

  sleep(CONFIG.sleep.betweenSteps);

  // ── DELETE ───────────────────────────────────────────────────────────────
  const deleteRes = http.del(
    `${CONFIG.base}/feed/posts/${postId}`,
    null,
    { headers: { Authorization: `Bearer ${ownerToken}` } }
  );

  check(deleteRes, { 'delete 204': (r) => r.status === 204 });

  sleep(CONFIG.sleep.afterIteration);
}

export function listPosts(data) {
  const user = data.users[__VU % data.users.length];
  if (!user) return;
  const { accessToken, userId } = user;

  // FIX 7: garante que userId não é null antes de montar a URL
  if (!userId) {
    console.warn(`VU${__VU}: userId nulo, pulando listagem`);
    sleep(CONFIG.sleep.listing);
    return;
  }

  const res = http.get(
    `${CONFIG.base}/feed/posts/user/${userId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  check(res, {
    'list 200': (r) => r.status === 200,
    'list tem content': (r) => {
      try { return JSON.parse(r.body).content != null; }
      catch { return false; }
    },
  });

  if (res.status !== 200) {
    console.warn(`VU${__VU}: list falhou com status ${res.status} — body: ${res.body}`);
  }

  sleep(CONFIG.sleep.listing);
}