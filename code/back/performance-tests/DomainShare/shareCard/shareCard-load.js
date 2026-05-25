// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANTE: ShareCardService cacheia o PNG no Redis por 1h (chave por userId).
// Com pool fixo de usuários, só a 1ª requisição de cada VU exercita o render
// real (Java2D/BufferedImage). As demais são Redis HIT. Esse teste mede o
// comportamento realista em produção (render + cache hit), NÃO é stress puro
// de renderização. Para isolar custo de render, desabilite o cache no backend.
// ─────────────────────────────────────────────────────────────────────────────

import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 230,
  password:     'Senha@12345',
  prefix:       'loadshare',

  load: {
    cardVus:  150,
    duration: '2m',
  },

  thresholds: {
    p95General: 1500,  // ms — render real pode passar de 500ms; cache hit fica <50ms
    failRate:   0.01,  // 1%
  },

  sleep: {
    afterIteration: 1,  // s
  },
};

export function setup() {
  const users = [];
  const headers = { 'Content-Type': 'application/json' };

  for (let i = 0; i < CONFIG.userPoolSize; i++) {
    const ts = Date.now() + i;
    const email = `${CONFIG.prefix}_${ts}@test.com`;

    const reg = http.post(
      `${CONFIG.base}/auth/register`,
      JSON.stringify({ username: `${CONFIG.prefix}_${ts}`, email, password: CONFIG.password }),
      { headers }
    );
    check(reg, { 'register 201': (r) => r.status === 201 });

    const login = http.post(
      `${CONFIG.base}/auth/login`,
      JSON.stringify({ email, password: CONFIG.password }),
      { headers }
    );
    check(login, { 'login 200': (r) => r.status === 200 });

    const { accessToken } = JSON.parse(login.body);
    users.push({ accessToken });
  }

  return { users };
}

export const options = {
  setupTimeout: '300s',
  scenarios: {
    card: {
      executor: 'constant-vus',
      vus:      CONFIG.load.cardVus,
      duration: CONFIG.load.duration,
      exec:     'getCard',
    },
  },
  thresholds: {
    http_req_duration: [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:   [`rate<${CONFIG.thresholds.failRate}`],
  },
};

export function getCard(data) {
  const token = data.users[__VU % data.users.length].accessToken;
  const headers = { Authorization: `Bearer ${token}` };

  const res = http.get(`${CONFIG.base}/share/card?type=dna`, { headers });

  check(res, {
    'card 200':   (r) => r.status === 200,
    'is PNG':     (r) => {
      const ct = r.headers['Content-Type'] || r.headers['content-type'];
      return ct && ct.startsWith('image/png');
    },
    'has bytes':  (r) => r.body && r.body.length > 100,
  });

  sleep(CONFIG.sleep.afterIteration);
}
