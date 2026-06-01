import http from 'k6/http';
import { sleep, check } from 'k6';
import { b64decode } from 'k6/encoding';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 800,
  password:     'Senha@12345',
  prefix:       'stresspost',

  stress: {
    stageDuration: '30s',
    stages:        [20, 50, 100, 200, 300, 400, 600],
  },

  thresholds: {
    p95General: 1500,
    failRate:   0.05,
  },

  sleep: {
    betweenSteps:   0.2,
    afterIteration: 0.5,
  },
};

// b64decode do k6 em vez de atob (não existe no runtime do k6)
// padding manual do base64url + fallback para múltiplos claims
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
    // uid aleatório evita colisão em loops rápidos (Date.now()+i não é suficiente)
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
  setupTimeout: '300s',
  stages: [
    ...CONFIG.stress.stages.map((vus) => ({ duration: CONFIG.stress.stageDuration, target: vus })),
    { duration: CONFIG.stress.stageDuration, target: 0 },
  ],
  thresholds: {
    http_req_duration: [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:   [`rate<${CONFIG.thresholds.failRate}`],
  },
};

export default function (data) {
  const user = data.users[__VU % data.users.length];

  if (!user) {
    sleep(CONFIG.sleep.afterIteration);
    return;
  }

  const { accessToken, userId } = user;

  if (!userId) {
    console.warn(`VU${__VU}: userId nulo, pulando iteração`);
    sleep(CONFIG.sleep.afterIteration);
    return;
  }

  const listRes = http.get(
    `${CONFIG.base}/feed/posts/user/${userId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  check(listRes, {
    'list 200': (r) => r.status === 200,
    'list tem content': (r) => {
      try { return JSON.parse(r.body).content != null; }
      catch { return false; }
    },
  });
  sleep(CONFIG.sleep.betweenSteps);

  const mp = multipart({
    text:       `Stress post VU${__VU} iter${__ITER}`,
    hasSpoiler: 'false',
  });
  const createRes = http.post(
    `${CONFIG.base}/feed/posts`,
    mp.body,
    { headers: { 'Content-Type': mp.contentType, Authorization: `Bearer ${accessToken}` } }
  );
  check(createRes, { 'create 201': (r) => r.status === 201 });

  if (createRes.status !== 201) {
    console.warn(`VU${__VU} iter${__ITER}: create falhou com status ${createRes.status} — body: ${createRes.body}`);
    sleep(CONFIG.sleep.afterIteration);
    return;
  }

  let postId = null;
  try {
    postId = JSON.parse(createRes.body).id;
  } catch {
    console.error(`VU${__VU}: falha ao parsear id do post criado`);
  }

  if (postId == null) {
    sleep(CONFIG.sleep.afterIteration);
    return;
  }

  sleep(CONFIG.sleep.betweenSteps);

  const getRes = http.get(
    `${CONFIG.base}/feed/posts/${postId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  check(getRes, { 'get 200': (r) => r.status === 200 });
  sleep(CONFIG.sleep.betweenSteps);

  const delRes = http.del(
    `${CONFIG.base}/feed/posts/${postId}`,
    null,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  check(delRes, { 'delete 204': (r) => r.status === 204 });

  sleep(CONFIG.sleep.afterIteration);
}