import http from 'k6/http';
import { sleep, check } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const CONFIG = {
  baseUrl:  'http://localhost:8080',
  poolSize: 800,
  password: 'Senha@12345',
  prefix:   'stressrolldice',

  thresholds: {
    p95:      2500,
    failRate: 0.05,
  },

  sleep: {
    maxThinkTime: 0.5,
  },
};

function logWarn(msg, x = {}) {
  console.warn(JSON.stringify({ level: 'WARN', msg, vu: __VU, iter: __ITER, ...x }));
}
function logError(msg, x = {}) {
  console.error(JSON.stringify({ level: 'ERROR', msg, vu: __VU, iter: __ITER, ...x }));
}

export function setup() {
  const users   = [];
  const headers = { 'Content-Type': 'application/json' };

  for (let i = 0; i < CONFIG.poolSize; i++) {
    const uid   = uuidv4().slice(0, 8);
    const email = `${CONFIG.prefix}_${uid}@test.com`;

    const reg = http.post(
      `${CONFIG.baseUrl}/auth/register`,
      JSON.stringify({ username: `${CONFIG.prefix}_${uid}`, email, password: CONFIG.password }),
      { headers },
    );
    if (!check(reg, { 'register 201': (r) => r.status === 201 })) {
      logWarn('register falhou', { email, status: reg.status });
      continue;
    }

    const login = http.post(
      `${CONFIG.baseUrl}/auth/login`,
      JSON.stringify({ email, password: CONFIG.password }),
      { headers },
    );
    if (!check(login, { 'login 200': (r) => r.status === 200 })) {
      logWarn('login falhou', { email, status: login.status });
      continue;
    }

    const accessToken = login.json('accessToken');
    if (!accessToken) { logWarn('accessToken ausente', { email }); continue; }

    users.push({ accessToken });
  }

  if (users.length < CONFIG.poolSize * 0.5) {
    throw new Error(`Setup insuficiente: ${users.length}/${CONFIG.poolSize} usuários criados`);
  }

  console.log(`Setup concluído: ${users.length} usuários prontos.`);
  return { users };
}

export const options = {
  setupTimeout: '600s',
  scenarios: {
    rollDiceStress: {
      executor:         'ramping-vus',
      startVUs:         0,
      stages: [
        { duration: '1m', target: 100 },
        { duration: '1m', target: 200 },
        { duration: '1m', target: 500 },
        { duration: '1m', target: 800 },
      ],
      gracefulRampDown: '10s',
      exec:             'execRollDice',
    },
  },
  thresholds: {
    'http_req_duration{name:roll-dice}': [`p(95)<${CONFIG.thresholds.p95}`],
    http_req_failed:                     [`rate<${CONFIG.thresholds.failRate}`],
  },
};

export function execRollDice(data) {
  const user = data.users[(__VU - 1) % data.users.length];
  if (!user) { sleep(Math.random() * CONFIG.sleep.maxThinkTime); return; }

  const r = http.get(
    `${CONFIG.baseUrl}/roll-dice`,
    {
      headers: { Authorization: `Bearer ${user.accessToken}` },
      tags:    { name: 'roll-dice' },
    },
  );

  const ok = check(r, {
    'roll-dice 200 ou 204':       (res) => res.status === 200 || res.status === 204,
    'roll-dice tem id (se 200)':  (res) => res.status !== 200 || res.json('id') !== null,
  });

  if (!ok) logError('roll-dice falhou', { status: r.status, body: r.body });

  sleep(Math.random() * CONFIG.sleep.maxThinkTime);
}
