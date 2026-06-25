import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus:        1,
  iterations: 1,
};

const BASE     = 'http://localhost:8080';
const PASSWORD = 'Senha@12345';
const PREFIX   = 'debugshelf';
const MIN_BOOK = 1;
const MAX_BOOK = 20;
const N_USERS  = 5;

function parseUserId(token) {
  try {
    return JSON.parse(atob(token.split('.')[1])).sub;
  } catch { return null; }
}

export default function () {
  const baseHeaders = { 'Content-Type': 'application/json' };
  const report = [];

  for (let i = 0; i < N_USERS; i++) {
    const ts    = Date.now() + i;
    const email = `${PREFIX}_${ts}@test.com`;

    const regRes = http.post(
      `${BASE}/auth/register`,
      JSON.stringify({ username: `${PREFIX}_${ts}`, email, password: PASSWORD }),
      { headers: baseHeaders }
    );
    const regOk = check(regRes, { 'register 201': (r) => r.status === 201 });
    if (!regOk) {
      console.error(`[i=${i}] FALHOU register: status=${regRes.status} body=${regRes.body}`);
      continue;
    }

    const loginRes = http.post(
      `${BASE}/auth/login`,
      JSON.stringify({ email, password: PASSWORD }),
      { headers: baseHeaders }
    );
    const loginOk = check(loginRes, { 'login 200': (r) => r.status === 200 });
    if (!loginOk) {
      console.error(`[i=${i}] FALHOU login: status=${loginRes.status} body=${loginRes.body}`);
      continue;
    }

    const { accessToken } = JSON.parse(loginRes.body);
    const userId = parseUserId(accessToken);
    const authH  = { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` };

    const shelfRes = http.post(
      `${BASE}/shelves`,
      JSON.stringify({ name: `Debug Estante ${ts}`, description: 'debug' }),
      { headers: authH }
    );
    const shelfOk = check(shelfRes, { 'shelf 201': (r) => r.status === 201 });
    if (!shelfOk) {
      console.error(`[i=${i}] FALHOU shelf: status=${shelfRes.status} body=${shelfRes.body}`);
      continue;
    }

    const shelfId = JSON.parse(shelfRes.body).id;

    const bookId = MIN_BOOK + (i % (MAX_BOOK - MIN_BOOK + 1));

    console.log(`[i=${i}] userId=${userId} shelfId=${shelfId} bookId calculado=${bookId}`);

    const itemRes = http.post(
      `${BASE}/shelves/${shelfId}/items`,
      JSON.stringify({ bookId: bookId, initialStatus: 'COMPLETED' }),
      { headers: authH }
    );
    const itemOk = check(itemRes, { 'add item 201': (r) => r.status === 201 });

    const itemBody = itemRes.body;
    let   itemId   = null;
    let   itemBook = null;
    try {
      const parsed = JSON.parse(itemBody);
      itemId   = parsed.id;
      itemBook = parsed.bookId;
    } catch (e) {}

    if (!itemOk) {
      console.error(`[i=${i}] FALHOU add item: status=${itemRes.status} body=${itemBody}`);
    } else {
      console.log(`[i=${i}] item criado: itemId=${itemId} bookId retornado pelo backend=${itemBook}`);
    }

    const listRes = http.get(
      `${BASE}/shelves/${shelfId}/items`,
      { headers: authH }
    );
    check(listRes, { 'list items 200': (r) => r.status === 200 });

    let savedBooks = [];
    try {
      const items = JSON.parse(listRes.body);
      savedBooks  = items.map(it => it.bookId ?? it.book?.id ?? '?');
    } catch (e) {}

    console.log(`[i=${i}] livros salvos na estante ${shelfId}: [${savedBooks.join(', ')}]`);

    report.push({ i, userId, shelfId, bookIdEsperado: bookId, bookIdRetornado: itemBook, savedBooks });
  }

  console.log('\n========== RESUMO ==========');
  for (const r of report) {
    const bate = r.bookIdEsperado === r.bookIdRetornado ? '✓' : '✗ DIVERGE';
    console.log(
      `i=${r.i} userId=${r.userId} shelfId=${r.shelfId} | esperado=${r.bookIdEsperado} retornado=${r.bookIdRetornado} salvos=[${r.savedBooks.join(',')}] ${bate}`
    );
  }
  console.log('============================\n');
}