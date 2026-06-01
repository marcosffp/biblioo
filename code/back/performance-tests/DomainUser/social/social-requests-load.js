import http from 'k6/http';
import { sleep, check } from 'k6';

// Grafo social do User — caminho PRIVADO (solicitações de seguir).
// Cobre: PUT /me/visibility, follow em conta privada (→202 PENDING),
// GET /me/follow-requests, accept e reject de solicitação.
//
// Cenário único de propósito: assim __VU é contíguo (1..N) e cada VU recebe um
// par EXCLUSIVO { owner privado, requester } indexado por __VU. Como nenhum par
// é compartilhado, não há corrida na lista de solicitações de um mesmo owner
// (o padrão que derruba join-requests/voting sob concorrência).
const CONFIG = {
  base:     'http://localhost:8080',
  password: 'Senha@12345',
  prefix:   'socialreq',

  requestVus: 100,   // = nº de pares owner/requester criados no setup
  duration:  '2m',

  thresholds: {
    p95General: 1500,  // ms — fluxo de escrita (follow/accept/reject)
    failRate:   0.01,  // 1%
  },

  sleep: {
    betweenSteps:   0.3,
    afterIteration: 0.5,
  },
};

export const options = {
  setupTimeout: '3m',

  scenarios: {
    requests: {
      executor: 'constant-vus',
      vus:      CONFIG.requestVus,
      duration: CONFIG.duration,
      exec:     'requestFlow',
    },
  },

  thresholds: {
    http_req_duration: [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:   [`rate<${CONFIG.thresholds.failRate}`],
  },
};

// ── Setup ─────────────────────────────────────────────────────────────────────
// Cria CONFIG.requestVus pares. O owner de cada par é tornado PRIVADO
// (PUT /me/visibility) para que o follow vire uma solicitação (202).
function registerAndLogin(username, headers) {
  const reg = http.post(
    `${CONFIG.base}/auth/register`,
    JSON.stringify({ username, email: `${username}@test.com`, password: CONFIG.password }),
    { headers }
  );
  check(reg, { 'register 201': (r) => r.status === 201 });
  if (reg.status !== 201) return null;

  const login = http.post(
    `${CONFIG.base}/auth/login`,
    JSON.stringify({ email: `${username}@test.com`, password: CONFIG.password }),
    { headers }
  );
  check(login, { 'login 200': (r) => r.status === 200 });
  if (login.status !== 200) return null;

  try {
    return { username, accessToken: JSON.parse(login.body).accessToken };
  } catch {
    return null;
  }
}

export function setup() {
  const headers = { 'Content-Type': 'application/json' };
  const pairs = [];

  for (let i = 0; i < CONFIG.requestVus; i++) {
    const ts        = Date.now() + i;
    const owner     = registerAndLogin(`${CONFIG.prefix}_owner_${ts}`, headers);
    const requester = registerAndLogin(`${CONFIG.prefix}_req_${ts}`, headers);
    if (!owner || !requester) continue;

    // Torna o owner privado para que follows virem solicitações.
    const visRes = http.put(
      `${CONFIG.base}/users/me/visibility`,
      JSON.stringify({ isPrivate: true }),
      { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${owner.accessToken}` } }
    );
    check(visRes, { 'visibility 200': (r) => r.status === 200 });
    if (visRes.status !== 200) continue;

    pairs.push({ owner, requester });
  }

  if (pairs.length === 0) {
    throw new Error('Setup falhou: nenhum par owner/requester criado.');
  }

  console.log(`Setup concluído: ${pairs.length} pares owner(privado)/requester.`);
  return { pairs };
}

// ── Cenário: solicitação de seguir → accept/reject ───────────────────────────
// Par exclusivo por VU. Alterna entre aceitar (iteração par) e rejeitar (ímpar)
// para exercitar os dois caminhos. Sempre reverte o estado ao fim da iteração,
// deixando o par pronto para uma nova solicitação na próxima iteração.
export function requestFlow(data) {
  const pair = data.pairs[(__VU - 1) % data.pairs.length];
  if (!pair) return;

  const { owner, requester } = pair;
  const ownerH = { Authorization: `Bearer ${owner.accessToken}` };
  const reqH   = { Authorization: `Bearer ${requester.accessToken}` };

  // 1. Requester solicita seguir o owner privado → 202 (PENDING)
  const followRes = http.post(`${CONFIG.base}/users/${owner.username}/follow`, null, { headers: reqH });
  check(followRes, { 'follow privado 202': (r) => r.status === 202 });

  sleep(CONFIG.sleep.betweenSteps);

  // 2. Owner lista as solicitações pendentes
  const listRes = http.get(
    `${CONFIG.base}/users/me/follow-requests?page=0&size=20`,
    { headers: ownerH }
  );
  check(listRes, { 'GET /follow-requests 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.betweenSteps);

  // 3. Alterna accept/reject pela paridade da iteração
  if (__ITER % 2 === 0) {
    // Aceita e depois o requester desfaz o follow para resetar o estado.
    const acceptRes = http.post(
      `${CONFIG.base}/users/me/follow-requests/${requester.username}/accept`,
      null,
      { headers: ownerH }
    );
    check(acceptRes, { 'accept 204': (r) => r.status === 204 });

    sleep(CONFIG.sleep.betweenSteps);

    const unfollowRes = http.del(`${CONFIG.base}/users/${owner.username}/follow`, null, { headers: reqH });
    check(unfollowRes, { 'unfollow reset 204': (r) => r.status === 204 });
  } else {
    // Rejeita — a solicitação some e o par fica pronto para nova rodada.
    const rejectRes = http.del(
      `${CONFIG.base}/users/me/follow-requests/${requester.username}`,
      null,
      { headers: ownerH }
    );
    check(rejectRes, { 'reject 204': (r) => r.status === 204 });
  }

  sleep(CONFIG.sleep.afterIteration);
}
