import http from 'k6/http';
import { sleep, check } from 'k6';

// Spike de concorrência do follow-request (caminho privado).
// Pico súbito de VUs disputando a fila de poucos owners privados — mesmo padrão
// de contenção do social-requests-stress.js.
//
// ⚠️ Mesma limitação do stress: sob pico alto numa máquina única (cliente+servidor
// +bancos), tende a esgotar conexões do SO (EOF/reset) — artefato local, não bug.
// Preferir o ambiente HOSPEDADO. Ver RELATORIO-DOMAINUSER 2.3.
const CONFIG = {
  base:              'http://localhost:8080',
  password:          'Senha@12345',
  prefix:            'sreqspike',
  ownerPoolSize:     50,
  requesterPoolSize: 550,

  spike: {
    baseVus: 70,
    peakVus: 500,
    rampUpBase: '10s',
    rampToPeak: '5s',
    holdPeak:   '20s',
    rampDown:   '5s',
    cooldown:   '10s',
  },

  thresholds: {
    p95General: 5000,
    failRate:   0.40,  // conflitos de estado esperados sob contenção
  },

  sleep: { betweenSteps: 0.1, afterIteration: 0.2 },
};

export const options = {
  setupTimeout: '6m',
  stages: [
    { duration: CONFIG.spike.rampUpBase, target: CONFIG.spike.baseVus },
    { duration: CONFIG.spike.rampToPeak, target: CONFIG.spike.peakVus },
    { duration: CONFIG.spike.holdPeak,   target: CONFIG.spike.peakVus },
    { duration: CONFIG.spike.rampDown,   target: CONFIG.spike.baseVus },
    { duration: CONFIG.spike.cooldown,   target: 0                    },
  ],
  thresholds: {
    http_req_duration: [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:   [`rate<${CONFIG.thresholds.failRate}`],
  },
};

function registerAndLogin(username, headers) {
  const reg = http.post(`${CONFIG.base}/auth/register`,
    JSON.stringify({ username, email: `${username}@test.com`, password: CONFIG.password }), { headers });
  if (reg.status !== 201) return null;
  const login = http.post(`${CONFIG.base}/auth/login`,
    JSON.stringify({ email: `${username}@test.com`, password: CONFIG.password }), { headers });
  if (login.status !== 200) return null;
  try { return { username, accessToken: JSON.parse(login.body).accessToken }; } catch { return null; }
}

export function setup() {
  const headers = { 'Content-Type': 'application/json' };
  const owners = [];
  for (let i = 0; i < CONFIG.ownerPoolSize; i++) {
    const ts = Date.now() + i;
    const u = registerAndLogin(`${CONFIG.prefix}_o${i}_${ts}`, headers);
    if (!u) continue;
    const vis = http.put(`${CONFIG.base}/users/me/visibility`, JSON.stringify({ isPrivate: true }),
      { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${u.accessToken}` } });
    if (vis.status === 200) owners.push(u);
  }
  const requesters = [];
  for (let i = 0; i < CONFIG.requesterPoolSize; i++) {
    const ts = Date.now() + i;
    const u = registerAndLogin(`${CONFIG.prefix}_r${i}_${ts}`, headers);
    if (u) requesters.push(u);
  }
  if (owners.length === 0) throw new Error('Setup falhou: nenhum owner privado.');
  console.log(`Setup: ${owners.length} owners privados + ${requesters.length} requesters.`);
  return { owners, requesters };
}

export default function (data) {
  if (!data.owners || data.owners.length === 0) return;
  const owner            = data.owners[__VU % data.owners.length];
  const requester        = data.requesters[Math.floor(Math.random() * data.requesters.length)];
  const requesterHeaders = { Authorization: `Bearer ${requester.accessToken}` };
  const ownerHeaders     = { Authorization: `Bearer ${owner.ownerToken || owner.accessToken}` };

  const followRes = http.post(`${CONFIG.base}/users/${owner.username}/follow`, null, { headers: requesterHeaders });
  check(followRes, { 'follow 202 ou conflito': (r) => r.status === 202 || (r.status >= 400 && r.status < 500) });

  sleep(CONFIG.sleep.betweenSteps);

  const pendingRes = http.get(`${CONFIG.base}/users/me/follow-requests?page=0&size=10`, { headers: ownerHeaders });
  check(pendingRes, { 'GET /follow-requests 200': (r) => r.status === 200 });

  if (pendingRes.status === 200) {
    try {
      const page = JSON.parse(pendingRes.body);
      if (page.users && page.users.length > 0) {
        sleep(CONFIG.sleep.betweenSteps);
        const rejectRes = http.del(`${CONFIG.base}/users/me/follow-requests/${page.users[0].username}`, null, { headers: ownerHeaders });
        check(rejectRes, { 'reject 204 ou conflito': (r) => r.status === 204 || (r.status >= 400 && r.status < 500) });
      }
    } catch (_) {}
  }

  sleep(CONFIG.sleep.afterIteration);
}
