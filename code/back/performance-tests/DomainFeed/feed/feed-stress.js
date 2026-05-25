import http from 'k6/http';
import { sleep, check } from 'k6';
import { b64decode } from 'k6/encoding';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 800,
  password:     'Senha@12345',
  prefix:       'stressfeed',

  stress: {
    stageDuration: '30s',
    stages:        [20, 50, 100, 200, 300, 400, 600],
  },

  thresholds: {
    p95General: 2000,
    failRate:   0.05,
  },

  sleep: {
    betweenSteps:   0.2,
    afterIteration: 0.5,
  },
};

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

export function setup() {
  const users = [];
  const headers = { 'Content-Type': 'application/json' };

  for (let i = 0; i < CONFIG.userPoolSize; i++) {
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
  if (!user) return;
  const { accessToken, userId } = user;

  if (!userId) {
    console.warn(`VU${__VU}: userId nulo, pulando iteração`);
    sleep(CONFIG.sleep.afterIteration);
    return;
  }

  const feedRes = http.get(
    `${CONFIG.base}/feed?userId=${userId}&size=20`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  check(feedRes, {
    'feed 200': (r) => r.status === 200,
    'feed tem items': (r) => {
      try { return JSON.parse(r.body).items != null; }
      catch { return false; }
    },
  });

  if (feedRes.status !== 200) {
    console.warn(`VU${__VU}: feed falhou com status ${feedRes.status} — body: ${feedRes.body}`);
  }

  sleep(CONFIG.sleep.betweenSteps);

  const countRes = http.get(
    `${CONFIG.base}/feed/new-count?userId=${userId}&sinceScore=0`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  check(countRes, {
    'count 200': (r) => r.status === 200,
    'count tem newItems': (r) => {
      try { return JSON.parse(r.body).newItems !== undefined; }
      catch { return false; }
    },
  });

  if (countRes.status !== 200) {
    console.warn(`VU${__VU}: count falhou com status ${countRes.status} — body: ${countRes.body}`);
  }

  sleep(CONFIG.sleep.afterIteration);
}