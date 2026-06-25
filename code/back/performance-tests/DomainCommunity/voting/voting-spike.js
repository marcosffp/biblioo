import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:              'http://localhost:8080',
  password:          'Senha@12345',
  prefix:            'spikevoting',
  userPoolSize:      50,
  communityPoolSize: 5,
  bookIds:           [1, 2, 3, 4],

  spike: {
    duration: '1m',
    target:   500,
  },

  thresholds: {
    p95General: 2000,
    failRate:   0.05,
  },

  sleep: {
    betweenSteps:   0.1,
    afterIteration: 0.1,
  },
};

export const options = {
  setupTimeout: '10m',
  stages: [
    { duration: '10s', target: 70 },
    { duration: '5s',  target: CONFIG.spike.target },
    { duration: '20s', target: CONFIG.spike.target },
    { duration: '5s',  target: 70 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:   [`rate<${CONFIG.thresholds.failRate}`],
  },
};

export function setup() {
  const jsonHeaders = { 'Content-Type': 'application/json' };

  const ownerTs    = Math.floor(Date.now() / 1000);
  const ownerEmail = `${CONFIG.prefix}_owner_${ownerTs}@test.com`;

  http.post(`${CONFIG.base}/auth/register`, JSON.stringify({
    username: `${CONFIG.prefix}_owner_${ownerTs}`, email: ownerEmail, password: CONFIG.password,
  }), { headers: jsonHeaders });

  const ownerLogin = http.post(`${CONFIG.base}/auth/login`, JSON.stringify({ email: ownerEmail, password: CONFIG.password }), { headers: jsonHeaders });
  const ownerToken   = JSON.parse(ownerLogin.body).accessToken;
  const ownerHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` };

  const commIds = [];
  for (let i = 0; i < CONFIG.communityPoolSize; i++) {
    const res = http.post(`${CONFIG.base}/communities`, JSON.stringify({
      name: `Spike Votings ${ownerTs}_${i}`, description: 'Test', type: 'PUBLIC', bookId: CONFIG.bookIds[0]
    }), { headers: ownerHeaders });
    if (res.status === 201) commIds.push(JSON.parse(res.body).id);
  }

  const publishedVotings = [];
  for (const commId of commIds) {
    const ts = Date.now();
    const start = new Date(ts + 10000).toISOString();
    const end = new Date(ts + 86400000).toISOString();
    const voteRes = http.post(`${CONFIG.base}/communities/${commId}/votings`, JSON.stringify({
      title: `Votação ${ts}`, tieBreakRule: 'RANDOM_DRAW', startsAt: start, endsAt: end,
      options: CONFIG.bookIds.filter((_, i) => i < 3).map(id => ({ bookId: id }))
    }), { headers: ownerHeaders });
    
    if (voteRes.status === 201) {
      const vId = JSON.parse(voteRes.body).id;
      const pubRes = http.post(`${CONFIG.base}/communities/${commId}/votings/${vId}/publish`, null, { headers: ownerHeaders });
      if (pubRes.status === 200) publishedVotings.push({ commId, votingId: vId, options: JSON.parse(pubRes.body).options });
    }
  }

  const users = [];
  for (let i = 0; i < CONFIG.userPoolSize; i++) {
    const ts = Date.now() + i;
    const email = `${CONFIG.prefix}_${ts}@test.com`;
    http.post(`${CONFIG.base}/auth/register`, JSON.stringify({ username: `${CONFIG.prefix}_${ts}`, email, password: CONFIG.password }), { headers: jsonHeaders });
    const login = http.post(`${CONFIG.base}/auth/login`, JSON.stringify({ email, password: CONFIG.password }), { headers: jsonHeaders });
    const { accessToken } = JSON.parse(login.body);
    for (const commId of commIds) http.post(`${CONFIG.base}/communities/${commId}/join`, null, { headers: { Authorization: `Bearer ${accessToken}` } });
    users.push({ accessToken });
  }

  return { ownerToken, users, commIds, publishedVotings };
}

export default function (data) {
  if (!data.publishedVotings || !data.publishedVotings.length) {
    console.warn('publishedVotings vazio — setup não conseguiu publicar nenhuma votação');
    return;
  }

  const userIdx = (__VU - 1) % data.users.length;
  const user    = data.users[userIdx];
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` };

  const voting = data.publishedVotings[(__VU - 1) % data.publishedVotings.length];
  const optId  = voting.options[userIdx % voting.options.length].id;

  const voteRes = http.post(
    `${CONFIG.base}/communities/${voting.commId}/votings/${voting.votingId}/vote`,
    JSON.stringify({ optionId: optId }),
    { headers }
  );
  check(voteRes, { 'POST /vote 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.afterIteration);
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}