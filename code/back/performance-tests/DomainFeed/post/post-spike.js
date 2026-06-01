import http from 'k6/http';
import { sleep, check } from 'k6';
import { b64decode } from 'k6/encoding';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 500,
  password:     'Senha@12345',
  prefix:       'spikepost',

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
    p95General: 1500,
    failRate:   0.05,
  },

  sleep: {
    betweenOps:     0.2,
    afterIteration: 0.5,
  },
};

// Mesmo padrão do post-load.js:
// - usa b64decode do k6 (atob não existe no runtime do k6)
// - trata padding do base64url manualmente
// - tenta extrair sub, userId, id ou user_id do payload
// - loga warning se nenhum claim for encontrado
// - envolve tudo em try/catch para não quebrar o setup
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
    // Mesmo padrão do post-load.js: uid aleatório evita colisão em execuções paralelas rápidas
    // (Date.now() + i colide quando o loop é mais rápido que a resolução do clock)
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

    // Mesmo padrão do post-load.js: try/catch no parse + validação antes de adicionar
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
  const user = data.users[__VU % data.users.length];

  // Mesmo padrão do post-load.js: guarda defensivo antes de usar os valores
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
  sleep(CONFIG.sleep.betweenOps);

  const mp = multipart({
    text:       `Spike post VU${__VU} iter${__ITER}`,
    hasSpoiler: 'false',
  });
  const createRes = http.post(
    `${CONFIG.base}/feed/posts`,
    mp.body,
    { headers: { 'Content-Type': mp.contentType, Authorization: `Bearer ${accessToken}` } }
  );
  check(createRes, { 'create 201 ou 429': (r) => r.status === 201 || r.status === 429 });

  if (createRes.status === 201) {
    let postId = null;
    try {
      postId = JSON.parse(createRes.body).id;
    } catch {
      console.error(`VU${__VU}: falha ao parsear id do post criado`);
    }

    if (postId != null) {
      http.del(
        `${CONFIG.base}/feed/posts/${postId}`,
        null,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    }
  }

  sleep(CONFIG.sleep.afterIteration);
}