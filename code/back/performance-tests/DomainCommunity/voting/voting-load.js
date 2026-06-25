import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base: 'http://localhost:8080',
  password: 'Senha@12345',
  prefix: 'loadvoting',
  userPoolSize: 50,
  communityPoolSize: 5,

  bookIds: [1, 2, 3, 4],

  load: {
    readVus: 84,
    manageVus: 21,
    voteVus: 105,
    duration: '2m',
  },

  thresholds: {
    p95General: 1000,
    p95Read: 500,
    p95Manage: 2000,
    p95Vote: 800,
    failRate: 0.01,
  },

  sleep: {
    betweenSteps: 0.3,
    afterIteration: 1,
    read: 0.5,
  },
};

export const options = {
  setupTimeout: '10m',

  scenarios: {
    read: {
      executor: 'constant-vus',
      vus: CONFIG.load.readVus,
      duration: CONFIG.load.duration,
      exec: 'readVotings',
    },
    manage: {
      executor: 'constant-vus',
      vus: CONFIG.load.manageVus,
      duration: CONFIG.load.duration,
      exec: 'manageVotings',
    },
    vote: {
      executor: 'constant-vus',
      vus: CONFIG.load.voteVus,
      duration: CONFIG.load.duration,
      exec: 'castVotes',
    },
  },

  thresholds: {
    http_req_duration: [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed: [`rate<${CONFIG.thresholds.failRate}`],
    'http_req_duration{scenario:read}': [`p(95)<${CONFIG.thresholds.p95Read}`],
    'http_req_duration{scenario:manage}': [`p(95)<${CONFIG.thresholds.p95Manage}`],
    'http_req_duration{scenario:vote}': [`p(95)<${CONFIG.thresholds.p95Vote}`],
  },
};

export function setup() {
  const jsonHeaders = { 'Content-Type': 'application/json' };

  const ownerTs = Date.now();
  const ownerEmail = `${CONFIG.prefix}_owner_${ownerTs}@test.com`;

  const ownerReg = http.post(
    `${CONFIG.base}/auth/register`,
    JSON.stringify({
      username: `${CONFIG.prefix}_owner_${ownerTs}`,
      email: ownerEmail,
      password: CONFIG.password,
    }),
    { headers: jsonHeaders }
  );
  check(ownerReg, { 'owner register 201': (r) => r.status === 201 });

  const ownerLogin = http.post(
    `${CONFIG.base}/auth/login`,
    JSON.stringify({ email: ownerEmail, password: CONFIG.password }),
    { headers: jsonHeaders }
  );
  check(ownerLogin, { 'owner login 200': (r) => r.status === 200 });

  const ownerToken = JSON.parse(ownerLogin.body).accessToken;
  const ownerHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${ownerToken}`,
  };

  const commIds = [];
  for (let i = 0; i < CONFIG.communityPoolSize; i++) {
    const commRes = http.post(
      `${CONFIG.base}/communities`,
      JSON.stringify({
        name: `Comm Votings ${ownerTs}_${i}`,
        description: 'Comunidade para testes de votações',
        type: 'PUBLIC',
        bookId: CONFIG.bookIds[0],
      }),
      { headers: ownerHeaders }
    );
    check(commRes, { 'create community 201': (r) => r.status === 201 });

    if (commRes.status === 201) {
      commIds.push(JSON.parse(commRes.body).id);
    }
  }

  // ── 2. Pool exclusivo para o cenário manage (sem votações ativas pré-criadas) ──
  // Separado de commIds para que manageVotings possa publicar sem conflito de
  // VotingAlreadyActiveException causado pelas votações criadas no bloco 3 abaixo.
  const mgmtCommIds = [];
  for (let i = 0; i < CONFIG.communityPoolSize; i++) {
    const mgmtRes = http.post(
      `${CONFIG.base}/communities`,
      JSON.stringify({
        name: `Comm Mgmt ${ownerTs}_${i}`,
        description: 'Comunidade exclusiva para gerenciamento de votações',
        type: 'PUBLIC',
        bookId: CONFIG.bookIds[0],
      }),
      { headers: ownerHeaders }
    );
    check(mgmtRes, { 'create mgmt community 201': (r) => r.status === 201 });
    if (mgmtRes.status === 201) mgmtCommIds.push(JSON.parse(mgmtRes.body).id);
  }

  // ── 3. Cria votações para uso nos testes de leitura e votos ─────────────────
  const publishedVotings = [];
  for (const commId of commIds) {
    const ts = Date.now();
    const start = new Date(ts + 10000).toISOString();
    const end = new Date(ts + 86400000).toISOString();

    // Votação publicada
    const voteRes = http.post(
      `${CONFIG.base}/communities/${commId}/votings`,
      JSON.stringify({
        title: `Votação do mês ${ts}`,
        tieBreakRule: 'RANDOM_DRAW',
        startsAt: start,
        endsAt: end,
        options: CONFIG.bookIds.filter((_, i) => i < 3).map(id => ({ bookId: id }))
      }),
      { headers: ownerHeaders }
    );

    check(voteRes, { 'create voting 201': (r) => r.status === 201 });
    if (voteRes.status === 201) {
      const votingId = JSON.parse(voteRes.body).id;
      const pubRes = http.post(`${CONFIG.base}/communities/${commId}/votings/${votingId}/publish`, null, { headers: ownerHeaders });
      if (pubRes.status === 200) {
        publishedVotings.push({ commId, votingId, options: JSON.parse(pubRes.body).options }); // options terá ids
      }
    }
  }

  // ── 3. Cria pool de usuários membros das comunidades ───────────────────────
  const users = [];
  for (let i = 0; i < CONFIG.userPoolSize; i++) {
    const ts = Date.now() + i;
    const email = `${CONFIG.prefix}_${ts}@test.com`;

    const reg = http.post(
      `${CONFIG.base}/auth/register`,
      JSON.stringify({ username: `${CONFIG.prefix}_${ts}`, email, password: CONFIG.password }),
      { headers: jsonHeaders }
    );

    const login = http.post(
      `${CONFIG.base}/auth/login`,
      JSON.stringify({ email, password: CONFIG.password }),
      { headers: jsonHeaders }
    );

    const { accessToken } = JSON.parse(login.body);
    const authHeaders = { Authorization: `Bearer ${accessToken}` };

    for (const commId of [...commIds, ...mgmtCommIds]) {
      http.post(`${CONFIG.base}/communities/${commId}/join`, null, { headers: authHeaders });
    }
    users.push({ accessToken });
  }

  return { ownerToken, users, commIds, mgmtCommIds, publishedVotings };
}

// ── Cenários ─────────────────────────────────────────────────────────────────

export function readVotings(data) {
  if (!data.commIds.length) return;

  const user = randomItem(data.users);
  const headers = { Authorization: `Bearer ${user.accessToken}` };
  const commId = randomItem(data.commIds);

  const listRes = http.get(`${CONFIG.base}/communities/${commId}/votings`, { headers });
  check(listRes, { 'GET /votings 200': (r) => r.status === 200 });

  if (JSON.parse(listRes.body).content?.length > 0) {
    const votingId = randomItem(JSON.parse(listRes.body).content).id;
    const getRes = http.get(`${CONFIG.base}/communities/${commId}/votings/${votingId}`, { headers });
    check(getRes, { 'GET /votings/{id} 200': (r) => r.status === 200 });
  }

  sleep(CONFIG.sleep.read);
}

export function castVotes(data) {
  if (!data.publishedVotings.length) return;

  // Seleção determinística por __VU: cada VU sempre usa o mesmo usuário e a mesma
  // opção, evitando AlreadyVotedDifferentOptionException por picks aleatórios conflitantes.
  // O mecanismo de toggle do servidor retorna 200 tanto ao votar quanto ao desvotar,
  // portanto iterações consecutivas do mesmo VU alternam voto/desvoto sem falha.
  const userIdx = (__VU - 1) % data.users.length;
  const user = data.users[userIdx];
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` };

  const voting = data.publishedVotings[(__VU - 1) % data.publishedVotings.length];
  const optId = voting.options[userIdx % voting.options.length].id;

  const voteRes = http.post(
    `${CONFIG.base}/communities/${voting.commId}/votings/${voting.votingId}/vote`,
    JSON.stringify({ optionId: optId }),
    { headers }
  );
  check(voteRes, { 'POST /vote 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.betweenSteps);
}

export function manageVotings(data) {
  if (!data.mgmtCommIds.length) return;

  const authHeader = { Authorization: `Bearer ${data.ownerToken}` };
  const headers = { 'Content-Type': 'application/json', ...authHeader };
  const commId = data.mgmtCommIds[__VU % data.mgmtCommIds.length];
  const ts = Date.now();

  // Fecha qualquer votação ACTIVE remanescente antes de criar nova — necessário porque
  // k6 pode atribuir VU IDs não-consecutivos entre cenários, fazendo __VU % N colidir.
  // authHeader precisa de wrapper { headers: ... } para o k6 enviar o header corretamente.
  const listRes = http.get(`${CONFIG.base}/communities/${commId}/votings`, { headers: authHeader });
  if (listRes.status === 200) {
    const active = (JSON.parse(listRes.body).content || []).find(v => v.status === 'ACTIVE');
    if (active) {
      http.post(`${CONFIG.base}/communities/${commId}/votings/${active.id}/close`, null, { headers });
    }
  }

  const start = new Date(ts + 50000).toISOString();
  const end = new Date(ts + 86400000).toISOString();

  const createRes = http.post(
    `${CONFIG.base}/communities/${commId}/votings`,
    JSON.stringify({
      title: `Nova votação ${ts}`,
      tieBreakRule: 'ADMIN_CHOICE',
      startsAt: start,
      endsAt: end,
      options: CONFIG.bookIds.filter((_, i) => i < 3).map(id => ({ bookId: id })),
    }),
    { headers }
  );
  check(createRes, { 'create voting 201': (r) => r.status === 201 });

  if (createRes.status === 201) {
    const votingId = JSON.parse(createRes.body).id;

    let pubRes = http.post(
      `${CONFIG.base}/communities/${commId}/votings/${votingId}/publish`,
      null,
      { headers }
    );
    // Retry único: se 409 (VotingAlreadyActiveException por colisão de VU IDs),
    // fecha a votação ativa conflitante e tenta publicar novamente.
    if (pubRes.status === 409) {
      const retryList = http.get(`${CONFIG.base}/communities/${commId}/votings`, { headers: authHeader });
      if (retryList.status === 200) {
        const conflicting = (JSON.parse(retryList.body).content || []).find(v => v.status === 'ACTIVE');
        if (conflicting) {
          http.post(`${CONFIG.base}/communities/${commId}/votings/${conflicting.id}/close`, null, { headers });
        }
      }
      pubRes = http.post(`${CONFIG.base}/communities/${commId}/votings/${votingId}/publish`, null, { headers });
    }
    sleep(CONFIG.sleep.betweenSteps);

    // Só tenta fechar se publicou com sucesso; fechar DRAFT retorna 4xx
    if (pubRes.status === 200) {
      http.post(
        `${CONFIG.base}/communities/${commId}/votings/${votingId}/close`,
        null,
        { headers }
      );
    }
  }

  sleep(CONFIG.sleep.afterIteration * 2);
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}