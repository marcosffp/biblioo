import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:              'http://localhost:8080',
  password:          'Senha@12345',
  prefix:            'loadcomm',
  userPoolSize:      50,
  communityPoolSize: 10,

  bookId: 1,

  load: {
    readVus:        40,
    manageVus:      15,
    membersVus:     20,
    leaveJoinVus:   15,
    duration:       '2m',
  },

  thresholds: {
    p95General:     1000,
    p95Read:         500,
    p95Manage:      2000,
    p95Members:      800,
    p95LeaveJoin:   1500,
    failRate:       0.01,
  },

  sleep: {
    betweenSteps:   0.3,
    afterIteration: 1,
    read:           0.5,
  },
};


export const options = {
  setupTimeout: '5m',

  scenarios: {
    read: {
      executor: 'constant-vus',
      vus:      CONFIG.load.readVus,
      duration: CONFIG.load.duration,
      exec:     'readCommunities',
    },
    manage: {
      executor: 'constant-vus',
      vus:      CONFIG.load.manageVus,
      duration: CONFIG.load.duration,
      exec:     'manageCommunities',
    },
    members: {
      executor: 'constant-vus',
      vus:      CONFIG.load.membersVus,
      duration: CONFIG.load.duration,
      exec:     'membersAndDiscovery',
    },
    leaveJoin: {
      executor: 'constant-vus',
      vus:      CONFIG.load.leaveJoinVus,
      duration: CONFIG.load.duration,
      exec:     'leaveAndJoin',
    },
  },

  thresholds: {
    http_req_duration:                          [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:                            [`rate<${CONFIG.thresholds.failRate}`],
    'http_req_duration{scenario:read}':         [`p(95)<${CONFIG.thresholds.p95Read}`],
    'http_req_duration{scenario:manage}':       [`p(95)<${CONFIG.thresholds.p95Manage}`],
    'http_req_duration{scenario:members}':      [`p(95)<${CONFIG.thresholds.p95Members}`],
    'http_req_duration{scenario:leaveJoin}':    [`p(95)<${CONFIG.thresholds.p95LeaveJoin}`],
  },
};

export function setup() {
  const jsonHeaders = { 'Content-Type': 'application/json' };

  const ownerTs    = Date.now();
  const ownerEmail = `${CONFIG.prefix}_owner_${ownerTs}@test.com`;

  const ownerReg = http.post(
    `${CONFIG.base}/auth/register`,
    JSON.stringify({
      username: `${CONFIG.prefix}_owner_${ownerTs}`,
      email:    ownerEmail,
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

  const ownerToken   = JSON.parse(ownerLogin.body).accessToken;
  const ownerHeaders = {
    'Content-Type': 'application/json',
    Authorization:  `Bearer ${ownerToken}`,
  };

  const commIds = [];
  for (let i = 0; i < CONFIG.communityPoolSize; i++) {
    const commRes = http.post(
      `${CONFIG.base}/communities`,
      JSON.stringify({
        name:        `Comm Load ${ownerTs}_${i}`,
        description: 'Criada pelo setup do load test',
        type:        'PUBLIC',
        bookId:      CONFIG.bookId,
      }),
      { headers: ownerHeaders }
    );
    check(commRes, { 'create community 201': (r) => r.status === 201 });

    if (commRes.status === 201) {
      commIds.push(JSON.parse(commRes.body).id);
    }
  }

  if (commIds.length === 0) {
    console.error('Nenhuma comunidade criada — verifique se CONFIG.bookId existe no banco.');
    return { users: [], commIds: [] };
  }

  const users = [];
  for (let i = 0; i < CONFIG.userPoolSize; i++) {
    const ts    = Date.now() + i;
    const email = `${CONFIG.prefix}_${ts}@test.com`;

    const reg = http.post(
      `${CONFIG.base}/auth/register`,
      JSON.stringify({ username: `${CONFIG.prefix}_${ts}`, email, password: CONFIG.password }),
      { headers: jsonHeaders }
    );
    check(reg, { 'register 201': (r) => r.status === 201 });

    const login = http.post(
      `${CONFIG.base}/auth/login`,
      JSON.stringify({ email, password: CONFIG.password }),
      { headers: jsonHeaders }
    );
    check(login, { 'login 200': (r) => r.status === 200 });

    const { accessToken } = JSON.parse(login.body);
    const authHeaders = { Authorization: `Bearer ${accessToken}` };

    for (const commId of commIds) {
      const joinRes = http.post(
        `${CONFIG.base}/communities/${commId}/join`,
        null,
        { headers: authHeaders }
      );
      check(joinRes, { 'join 204': (r) => r.status === 204 });
    }

    users.push({ accessToken });
  }

  return { users, commIds };
}


export function readCommunities(data) {
  if (!data.commIds || data.commIds.length === 0) return;

  const user    = data.users[__VU % data.users.length];
  const headers = { Authorization: `Bearer ${user.accessToken}` };

  const listRes = http.get(`${CONFIG.base}/communities`, { headers });
  check(listRes, { 'GET /communities 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.betweenSteps);

  const commId = randomItem(data.commIds);
  const getRes = http.get(`${CONFIG.base}/communities/${commId}`, { headers });
  check(getRes, { 'GET /communities/{id} 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.read);
}


export function manageCommunities(data) {
  if (!data.users || data.users.length === 0) return;

  const user    = data.users[__VU % data.users.length];
  const headers = {
    'Content-Type': 'application/json',
    Authorization:  `Bearer ${user.accessToken}`,
  };

  const ts        = Date.now();
  const createRes = http.post(
    `${CONFIG.base}/communities`,
    JSON.stringify({
      name:        `Comm VU${__VU} ${ts}`,
      description: 'Criada no load test',
      type:        'PUBLIC',
      bookId:      CONFIG.bookId,
    }),
    { headers }
  );
  check(createRes, {
    'create 201':      (r) => r.status === 201,
    'create retorna id': (r) => {
      try { return JSON.parse(r.body).id != null; }
      catch { return false; }
    },
  });

  if (createRes.status !== 201) {
    sleep(CONFIG.sleep.afterIteration);
    return;
  }

  const commId = JSON.parse(createRes.body).id;
  sleep(CONFIG.sleep.betweenSteps);

  const getRes = http.get(
    `${CONFIG.base}/communities/${commId}`,
    { headers: { Authorization: `Bearer ${user.accessToken}` } }
  );
  check(getRes, { 'GET community 200': (r) => r.status === 200 });
  sleep(CONFIG.sleep.betweenSteps);

  const updateRes = http.put(
    `${CONFIG.base}/communities/${commId}`,
    JSON.stringify({
      name:        `Comm atualizada VU${__VU} ${ts}`,
      description: 'Atualizada no load test',
    }),
    { headers }
  );
  check(updateRes, { 'update 200': (r) => r.status === 200 });
  sleep(CONFIG.sleep.betweenSteps);

  const deleteRes = http.del(`${CONFIG.base}/communities/${commId}`, null, { headers });
  check(deleteRes, { 'delete 204': (r) => r.status === 204 });

  sleep(CONFIG.sleep.afterIteration);
}

export function membersAndDiscovery(data) {
  if (!data.commIds || data.commIds.length === 0) return;

  const user    = data.users[__VU % data.users.length];
  const headers = { Authorization: `Bearer ${user.accessToken}` };

  const commId   = randomItem(data.commIds);
  const membersRes = http.get(
    `${CONFIG.base}/communities/${commId}/members?page=0&size=20`,
    { headers }
  );
  check(membersRes, { 'GET members 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.betweenSteps);

  const mineRes = http.get(`${CONFIG.base}/communities/mine`, { headers });
  check(mineRes, { 'GET /mine 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.betweenSteps);

  const byBookRes = http.get(
    `${CONFIG.base}/communities/book/${CONFIG.bookId}`,
    { headers }
  );
  check(byBookRes, { 'GET /book/{bookId} 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.read);
}

export function leaveAndJoin(data) {
  if (!data.commIds || data.commIds.length === 0) return;

  const user    = data.users[__VU % data.users.length];
  const headers = { Authorization: `Bearer ${user.accessToken}` };
  const commId  = randomItem(data.commIds);

  const leaveRes = http.del(
    `${CONFIG.base}/communities/${commId}/leave`,
    null,
    { headers }
  );
  check(leaveRes, {
    'leave 204 ou 4xx': (r) => r.status === 204 || (r.status >= 400 && r.status < 500),
  });

  sleep(CONFIG.sleep.betweenSteps);

  const joinRes = http.post(
    `${CONFIG.base}/communities/${commId}/join`,
    null,
    { headers }
  );
  check(joinRes, {
    'join 204 ou 4xx': (r) => r.status === 204 || (r.status >= 400 && r.status < 500),
  });

  sleep(CONFIG.sleep.afterIteration);
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
