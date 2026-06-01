import http from 'k6/http';
import { sleep, check } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { Trend, Rate } from 'k6/metrics';

const trendCommunitiesLatency = new Trend('trending_communities_latency', true);
const trendBooksLatency = new Trend('trending_books_latency', true);
const errorRate = new Rate('trending_error_rate');

const CONFIG = {
  baseUrl:  'http://localhost:8080',
  password: 'Senha@12345',
  prefix:   'trendstress',
  poolSize: 800,
  bookIds:  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  communityBookIds: [1, 2, 3, 4, 5],

  thresholds: {
    p95:      2000,
    failRate: 0.05,
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function multipart(fields, boundary = 'Boundary123') {
  let body = '';
  for (const [k, v] of Object.entries(fields))
    body += `\r\n--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}`;
  return { body: body + `\r\n--${boundary}--`, type: `multipart/form-data; boundary=${boundary}` };
}

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function logWarn(msg, x = {}) {
  const vu   = typeof __VU   !== 'undefined' ? __VU   : 'setup';
  const iter = typeof __ITER !== 'undefined' ? __ITER : '-';
  console.warn(JSON.stringify({ level: 'WARN', msg, vu, iter, ...x }));
}

// ── Setup ─────────────────────────────────────────────────────────────────────

export function setup() {
  const jsonHeaders = { 'Content-Type': 'application/json' };

  const ownerTs = Date.now();
  const ownerEmail = `${CONFIG.prefix}_owner_${ownerTs}@test.com`;

  const ownerReg = http.post(
    `${CONFIG.baseUrl}/auth/register`,
    JSON.stringify({ username: `${CONFIG.prefix}_owner_${ownerTs}`, email: ownerEmail, password: CONFIG.password }),
    { headers: jsonHeaders }
  );
  check(ownerReg, { 'owner register 201': (r) => r.status === 201 });

  const ownerLogin = http.post(
    `${CONFIG.baseUrl}/auth/login`,
    JSON.stringify({ email: ownerEmail, password: CONFIG.password }),
    { headers: jsonHeaders }
  );
  const ownerToken = ownerLogin.json('accessToken');
  const ownerAuth = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` } };

  const communityIds = [];
  for (let i = 0; i < 5; i++) {
    const comm = http.post(
      `${CONFIG.baseUrl}/communities`,
      JSON.stringify({
        name: `Stress Comm ${ownerTs}_${i}`,
        description: 'Comunidade para teste de stress',
        type: 'PUBLIC',
        bookId: CONFIG.communityBookIds[i % CONFIG.communityBookIds.length],
      }),
      ownerAuth
    );
    if (comm.status === 201) communityIds.push(comm.json('id'));
  }

  const users = [];
  for (let i = 0; i < CONFIG.poolSize; i++) {
    const email = `${CONFIG.prefix}_${i}_${Math.floor(Math.random() * 1e9)}@test.com`;

    const reg = http.post(
      `${CONFIG.baseUrl}/auth/register`,
      JSON.stringify({ username: email.split('@')[0], email, password: CONFIG.password }),
      { headers: jsonHeaders }
    );
    if (!check(reg, { 'register 201': (r) => r.status === 201 })) {
      logWarn('register falhou', { email });
      continue;
    }

    const login = http.post(
      `${CONFIG.baseUrl}/auth/login`,
      JSON.stringify({ email, password: CONFIG.password }),
      { headers: jsonHeaders }
    );
    if (!check(login, { 'login 200': (r) => r.status === 200 })) continue;

    const accessToken = login.json('accessToken');
    const authJson = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` } };
    const authBearer = { headers: { Authorization: `Bearer ${accessToken}` } };

    for (const commId of communityIds)
      http.post(`${CONFIG.baseUrl}/communities/${commId}/join`, null, authBearer);

    const shelf = http.post(`${CONFIG.baseUrl}/shelves`, JSON.stringify({ name: `Estante stress ${i}` }), authJson);
    if (shelf.status !== 201) continue;
    const shelfId = shelf.json('id');

    const bookId = CONFIG.bookIds[i % CONFIG.bookIds.length];
    const item = http.post(
      `${CONFIG.baseUrl}/shelves/${shelfId}/items`,
      JSON.stringify({ bookId, initialStatus: 'COMPLETED' }),
      authJson
    );
    if (item.status !== 201) continue;

    const rvBody = multipart({ bookId, rating: (i % 5) + 1, text: `Review stress ${i}` });
    http.post(`${CONFIG.baseUrl}/feed/reviews`, rvBody.body,
      { headers: { 'Content-Type': rvBody.type, Authorization: `Bearer ${accessToken}` } });

    users.push({ accessToken });
  }

  if (users.length < CONFIG.poolSize * 0.5)
    throw new Error(`Setup insuficiente: ${users.length}/${CONFIG.poolSize}`);

  // Pre-warm
  if (users.length > 0) {
    const warmHeaders = { headers: { Authorization: `Bearer ${users[0].accessToken}` } };
    http.get(`${CONFIG.baseUrl}/trending/communities`, warmHeaders);
    http.get(`${CONFIG.baseUrl}/trending/books`, warmHeaders);
  }

  return { users };
}

// ── Options ───────────────────────────────────────────────────────────────────

export const options = {
  setupTimeout: '10m',

  scenarios: {
    stress_trending: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20  },
        { duration: '30s', target: 50  },
        { duration: '30s', target: 100 },
        { duration: '30s', target: 200 },
        { duration: '30s', target: 300 },
        { duration: '30s', target: 400 },
        { duration: '30s', target: 600 },
        { duration: '30s', target: 0   },
      ],
    },
  },

  thresholds: {
    http_req_duration:   [`p(95)<${CONFIG.thresholds.p95}`],
    http_req_failed:     [`rate<${CONFIG.thresholds.failRate}`],
    trending_error_rate: [`rate<${CONFIG.thresholds.failRate}`],
  },
};

// ── VU function ───────────────────────────────────────────────────────────────

export default function (data) {
  const user = randomItem(data.users);
  const authHeaders = { headers: { Authorization: `Bearer ${user.accessToken}` } };

  const commRes = http.get(
    `${CONFIG.baseUrl}/trending/communities`,
    { ...authHeaders, tags: { name: 'GET_trending_communities' } }
  );
  const commOk = check(commRes, {
    'GET /trending/communities 200 || 429': (r) => r.status === 200 || r.status === 429,
    'trending/communities é array':         (r) => r.status === 429 || Array.isArray(r.json()),
  });
  trendCommunitiesLatency.add(commRes.timings.duration);
  errorRate.add(!commOk);

  const booksRes = http.get(
    `${CONFIG.baseUrl}/trending/books`,
    { ...authHeaders, tags: { name: 'GET_trending_books' } }
  );
  const booksOk = check(booksRes, {
    'GET /trending/books 200 || 429': (r) => r.status === 200 || r.status === 429,
    'trending/books é array':         (r) => r.status === 429 || Array.isArray(r.json()),
  });
  trendBooksLatency.add(booksRes.timings.duration);
  errorRate.add(!booksOk);

  sleep(1);
}
