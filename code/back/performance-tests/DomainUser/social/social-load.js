import http from 'k6/http';
import { sleep, check } from 'k6';

// Grafo social do User — caminho PÚBLICO (sem dependência externa).
// Cobre: follow / unfollow, GET followers, GET following e busca de usuários.
// Os endpoints privados (follow-requests) ficam em social-requests-load.js,
// pois exigem pareamento owner/requester por VU.
const CONFIG = {
  base:     'http://localhost:8080',
  password: 'Senha@12345',
  prefix:   'socialload',

  // Pools criados no setup.
  // "celebs" são alvos PÚBLICOS compartilhados — muitos VUs seguem os mesmos.
  // "followers" são os atores; cada VU usa um follower EXCLUSIVO (partição por __VU),
  // então cada aresta (follower → celeb) é única e não há colisão de escrita.
  celebPoolSize:    20,
  followerPoolSize: 230,

  load: {
    graphVus:     140,  // follow/unfollow + leitura de followers/following
    discoveryVus:  70,  // busca + leitura de perfil/seguindo
    duration:     '2m',
  },

  thresholds: {
    p95General: 1000,  // ms
    p95Follow:  1500,  // ms — escrita (follow/unfollow)
    p95Read:     500,  // ms — leituras paginadas
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
    graph: {
      executor: 'constant-vus',
      vus:      CONFIG.load.graphVus,
      duration: CONFIG.load.duration,
      exec:     'graphFlow',
    },
    discovery: {
      executor: 'constant-vus',
      vus:      CONFIG.load.discoveryVus,
      duration: CONFIG.load.duration,
      exec:     'discoveryFlow',
    },
  },

  thresholds: {
    http_req_duration:                      [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:                        [`rate<${CONFIG.thresholds.failRate}`],
    'http_req_duration{scenario:graph}':    [`p(95)<${CONFIG.thresholds.p95Follow}`],
    'http_req_duration{scenario:discovery}':[`p(95)<${CONFIG.thresholds.p95Read}`],
  },
};

// ── Setup ─────────────────────────────────────────────────────────────────────
// Cria dois pools PÚBLICOS distintos: celebs (alvos) e followers (atores).
// Serem arrays separados garante que um follower nunca tenta seguir a si mesmo.
function registerAndLogin(prefix, i, headers) {
  const ts       = Date.now() + i;
  const username = `${prefix}_${ts}`;
  const email    = `${username}@test.com`;

  const reg = http.post(
    `${CONFIG.base}/auth/register`,
    JSON.stringify({ username, email, password: CONFIG.password }),
    { headers }
  );
  check(reg, { 'register 201': (r) => r.status === 201 });
  if (reg.status !== 201) return null;

  const login = http.post(
    `${CONFIG.base}/auth/login`,
    JSON.stringify({ email, password: CONFIG.password }),
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

  const celebs = [];
  for (let i = 0; i < CONFIG.celebPoolSize; i++) {
    const u = registerAndLogin(`${CONFIG.prefix}_celeb`, i, headers);
    if (u) celebs.push(u);
  }

  const followers = [];
  for (let i = 0; i < CONFIG.followerPoolSize; i++) {
    const u = registerAndLogin(`${CONFIG.prefix}_f`, i, headers);
    if (u) followers.push(u);
  }

  if (celebs.length === 0 || followers.length === 0) {
    throw new Error('Setup falhou: pools vazios. Verifique o backend.');
  }

  console.log(`Setup concluído: ${celebs.length} celebs + ${followers.length} followers.`);
  return { celebs, followers };
}

// ── Cenário 1: grafo — follow → ler followers/following → unfollow ────────────
// Cada VU usa um follower exclusivo (partição por __VU). Segue uma celeb pública
// (204), lê os seguidores dela e a própria lista de "following", e desfaz o follow
// (204) para reverter o estado e manter a iteração idempotente.
export function graphFlow(data) {
  const follower = data.followers[(__VU - 1) % data.followers.length];
  const celeb    = data.celebs[(__VU - 1) % data.celebs.length];
  const headers  = { Authorization: `Bearer ${follower.accessToken}` };

  // 1. Follow (alvo público → 204)
  const followRes = http.post(`${CONFIG.base}/users/${celeb.username}/follow`, null, { headers });
  check(followRes, { 'follow 204': (r) => r.status === 204 });

  sleep(CONFIG.sleep.betweenSteps);

  // 2. Followers da celeb (paginado)
  const followersRes = http.get(
    `${CONFIG.base}/users/${celeb.username}/followers?page=0&size=20`,
    { headers }
  );
  check(followersRes, { 'GET /followers 200': (r) => r.status === 200 });

  // 3. Following do próprio follower (deve conter a celeb agora)
  const followingRes = http.get(
    `${CONFIG.base}/users/${follower.username}/following?page=0&size=20`,
    { headers }
  );
  check(followingRes, { 'GET /following 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.betweenSteps);

  // 4. Unfollow (reverte o estado → 204)
  const unfollowRes = http.del(`${CONFIG.base}/users/${celeb.username}/follow`, null, { headers });
  check(unfollowRes, { 'unfollow 204': (r) => r.status === 204 });

  sleep(CONFIG.sleep.afterIteration);
}

// ── Cenário 2: descoberta — busca + leitura de perfil ────────────────────────
// Pura leitura. A busca (OpenSearch) pode retornar vazio se o índice ainda não
// propagou os usuários do setup, mas o status 200 é o que importa aqui.
export function discoveryFlow(data) {
  const viewer  = data.followers[(__VU - 1) % data.followers.length];
  const headers = { Authorization: `Bearer ${viewer.accessToken}` };

  // 1. Busca por prefixo (mínimo 2 caracteres)
  const searchRes = http.get(
    `${CONFIG.base}/users?q=${CONFIG.prefix.slice(0, 6)}&page=0&size=20`,
    { headers }
  );
  check(searchRes, { 'GET /users?q 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.betweenSteps);

  // 2. Perfil de uma celeb
  const target     = data.celebs[Math.floor(Math.random() * data.celebs.length)];
  const profileRes = http.get(`${CONFIG.base}/users/${target.username}`, { headers });
  check(profileRes, { 'GET /{username} 200': (r) => r.status === 200 });

  // 3. Seguindo da celeb (leitura paginada)
  const followingRes = http.get(
    `${CONFIG.base}/users/${target.username}/following?page=0&size=20`,
    { headers }
  );
  check(followingRes, { 'GET /following 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.afterIteration);
}
