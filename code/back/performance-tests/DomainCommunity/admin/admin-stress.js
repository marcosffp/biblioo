import http from 'k6/http';
import { sleep, check } from 'k6';

// Stress das operações ADMINISTRATIVAS de comunidade. Segue o padrão do DomainBook
// (shelfItem-stress): rampa crescente até 600 VUs, cenário único com o ciclo
// administrativo reversível. Cada VU é dona exclusiva de uma comunidade
// (communityPoolSize > pico de 600) com dois buddies — readmitidos/expulsos por iteração.
const CONFIG = {
  base:         'http://localhost:8080',
  password:     'Senha@12345',
  prefix:       'tadm',
  bookId:       1,
  communityPoolSize: 650,   // > pico de 600 VUs ⇒ comunidade exclusiva por VU

  stress: {
    stageDuration: '30s',
    stages: [20, 50, 100, 200, 300, 400, 600],
  },

  thresholds: {
    p95General: 3000,  // ms
    failRate:   0.05,  // 5%
  },

  sleep: { betweenSteps: 0.2, afterIteration: 0.3 },
};

export const options = {
  setupTimeout: '20m',
  stages: [
    ...CONFIG.stress.stages.map((vus) => ({ duration: CONFIG.stress.stageDuration, target: vus })),
    { duration: CONFIG.stress.stageDuration, target: 0 },
  ],
  thresholds: {
    http_req_duration: [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:   [`rate<${CONFIG.thresholds.failRate}`],
  },
};

function registerAndLogin(label, i, headers) {
  const ts       = Date.now() + i;
  const username = `${CONFIG.prefix}_${label}${i}_${ts}`.slice(0, 30);
  const email    = `${username}@test.com`;
  const reg = http.post(`${CONFIG.base}/auth/register`,
    JSON.stringify({ username, email, password: CONFIG.password }), { headers });
  if (reg.status !== 201) return null;
  try {
    const body = JSON.parse(reg.body);
    return { token: body.accessToken, userId: body.user.id };
  } catch { return null; }
}

export function setup() {
  const jsonHeaders = { 'Content-Type': 'application/json' };
  const communities = [];

  for (let i = 0; i < CONFIG.communityPoolSize; i++) {
    const owner = registerAndLogin('o', i, jsonHeaders);
    if (!owner) continue;
    const ownerHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${owner.token}` };

    const commRes = http.post(`${CONFIG.base}/communities`,
      JSON.stringify({
        name:        `Admin ${i} ${Date.now()}`,
        description: 'Comunidade para teste de operações administrativas',
        type:        'PRIVATE',
        bookId:      CONFIG.bookId,
      }), { headers: ownerHeaders });
    if (commRes.status !== 201) continue;

    const bR = registerAndLogin('r', i, jsonHeaders);
    const bL = registerAndLogin('l', i, jsonHeaders);
    if (!bR || !bL) continue;

    communities.push({
      communityId: JSON.parse(commRes.body).id,
      ownerId:     owner.userId,
      ownerToken:  owner.token,
      bRId:        bR.userId,
      bRToken:     bR.token,
      bLId:        bL.userId,
      bLToken:     bL.token,
    });
  }

  if (communities.length === 0) throw new Error('Setup falhou: nenhuma comunidade preparada.');
  console.log(`Setup: ${communities.length} comunidades (owner + 2 buddies cada).`);
  return { communities };
}

export default function (data) {
  const c         = data.communities[(__VU - 1) % data.communities.length];
  const owner     = { Authorization: `Bearer ${c.ownerToken}` };
  const jsonOwner = { 'Content-Type': 'application/json', Authorization: `Bearer ${c.ownerToken}` };
  const cid       = c.communityId;
  const b         = CONFIG.sleep.betweenSteps;

  // 1. Gera link de convite.
  const link = http.post(`${CONFIG.base}/communities/${cid}/invite-link`, null, { headers: owner });
  check(link, { 'invite-link 200': (r) => r.status === 200 });
  const token = link.status === 200 ? JSON.parse(link.body).inviteLink : null;
  sleep(b);

  // 2. bR solicita entrada.
  const req = http.post(`${CONFIG.base}/communities/${cid}/join-requests`, null, { headers: { Authorization: `Bearer ${c.bRToken}` } });
  check(req, { 'join-request 201 ou conflito': (r) => r.status === 201 || (r.status >= 400 && r.status < 500) });
  sleep(b);

  // 3-4. Lista pendentes e aprova a primeira.
  const pend = http.get(`${CONFIG.base}/communities/${cid}/join-requests?page=0&size=10`, { headers: owner });
  check(pend, { 'GET /join-requests 200': (r) => r.status === 200 });
  if (pend.status === 200) {
    try {
      const page = JSON.parse(pend.body);
      if (page.content && page.content.length > 0) {
        check(http.post(`${CONFIG.base}/communities/join-requests/${page.content[0].id}/approve`, null, { headers: owner }), { 'approve 204': (r) => r.status === 204 });
      }
    } catch (_) { /* corpo inesperado */ }
  }
  sleep(b);

  // 5. Promove/rebaixa bR.
  const rolePath = `${CONFIG.base}/communities/${cid}/members/${c.bRId}/role`;
  check(http.put(rolePath, JSON.stringify({ role: 'MODERATOR' }), { headers: jsonOwner }), { 'role->MODERATOR 204': (r) => r.status === 204 });
  check(http.put(rolePath, JSON.stringify({ role: 'MEMBER' }),    { headers: jsonOwner }), { 'role->MEMBER 204':    (r) => r.status === 204 });
  sleep(b);

  // 6. Lista membros.
  check(http.get(`${CONFIG.base}/communities/${cid}/members?page=0&size=20`, { headers: owner }), { 'GET /members 200': (r) => r.status === 200 });

  // 7. bL entra pelo link.
  if (token) {
    check(http.post(`${CONFIG.base}/communities/join/${token}`, null, { headers: { Authorization: `Bearer ${c.bLToken}` } }),
      { 'join/{token} 204 ou conflito': (r) => r.status === 204 || (r.status >= 400 && r.status < 500) });
  }
  sleep(b);

  // 8. Transfere e devolve.
  check(http.post(`${CONFIG.base}/communities/${cid}/transfer-ownership`, JSON.stringify({ newOwnerId: c.bRId }), { headers: jsonOwner }), { 'transfer->bR 204': (r) => r.status === 204 });
  check(http.post(`${CONFIG.base}/communities/${cid}/transfer-ownership`, JSON.stringify({ newOwnerId: c.ownerId }),
    { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${c.bRToken}` } }), { 'transfer-back 204': (r) => r.status === 204 });
  sleep(b);

  // 9. Expulsa bL e bR.
  check(http.del(`${CONFIG.base}/communities/${cid}/members/${c.bLId}`, null, { headers: owner }), { 'removeMember bL 204 ou conflito': (r) => r.status === 204 || (r.status >= 400 && r.status < 500) });
  check(http.del(`${CONFIG.base}/communities/${cid}/members/${c.bRId}`, null, { headers: owner }), { 'removeMember bR 204 ou conflito': (r) => r.status === 204 || (r.status >= 400 && r.status < 500) });
  sleep(b);

  // 10. Revoga link.
  check(http.del(`${CONFIG.base}/communities/${cid}/invite-link`, null, { headers: owner }), { 'revoke invite-link 204': (r) => r.status === 204 });

  sleep(CONFIG.sleep.afterIteration);
}
