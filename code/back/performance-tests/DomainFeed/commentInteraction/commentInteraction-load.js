// Cobre CommentInteractionController: like/unlike, replies (criar/listar/deletar).
// Setup: cria estante → adiciona livro → cria review → cria 1 comentário pai
// por usuário (esse é o commentId que os cenários vão exercitar).

import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 230,
  password:     'Senha@12345',
  prefix:       'loadcint',
  bookId:       1,  // seed: livro id=1 deve existir no banco local

  load: {
    crudVus:    150,
    listingVus: 60,
    duration:   '2m',
  },

  thresholds: {
    p95General: 1500,
    p95Crud:    1800,
    p95Listing: 1000,
    failRate:   0.02,
  },

  sleep: {
    betweenSteps:   0.3,
    afterIteration: 1,
    listing:        0.5,
  },
};

function multipart(fields) {
  const boundary = 'K6FormBoundary';
  let body = '';
  for (const [name, value] of Object.entries(fields)) {
    body += `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`;
  }
  body += `--${boundary}--\r\n`;
  return { body, contentType: `multipart/form-data; boundary=${boundary}` };
}

export function setup() {
  const users = [];
  const headers = { 'Content-Type': 'application/json' };

  for (let i = 0; i < CONFIG.userPoolSize; i++) {
    const uid   = `${i}_${Math.floor(Math.random() * 1e9)}`;
    const email = `${CONFIG.prefix}_${uid}@test.com`;

    const reg = http.post(
      `${CONFIG.base}/auth/register`,
      JSON.stringify({ username: `${CONFIG.prefix}_${uid}`, email, password: CONFIG.password }),
      { headers }
    );
    if (reg.status !== 201) continue;

    const login = http.post(
      `${CONFIG.base}/auth/login`,
      JSON.stringify({ email, password: CONFIG.password }),
      { headers }
    );
    if (login.status !== 200) continue;

    const accessToken = JSON.parse(login.body).accessToken;
    const authH = { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` };

    // 1) estante
    const shelfRes = http.post(
      `${CONFIG.base}/shelves`,
      JSON.stringify({ name: `CInt Shelf ${uid}`, description: '' }),
      { headers: authH }
    );
    if (shelfRes.status !== 201) continue;
    const shelfId = JSON.parse(shelfRes.body).id;

    // 2) livro na estante (status COMPLETED)
    const itemRes = http.post(
      `${CONFIG.base}/shelves/${shelfId}/items`,
      JSON.stringify({ bookId: CONFIG.bookId, initialStatus: 'COMPLETED' }),
      { headers: authH }
    );
    if (itemRes.status !== 201) continue;

    // 3) review (multipart)
    const reviewMp = multipart({
      bookId:  String(CONFIG.bookId),
      rating:  '4',
      text:    `Review base ${uid}`,
      publish: 'false',
    });
    const reviewRes = http.post(
      `${CONFIG.base}/feed/reviews`,
      reviewMp.body,
      { headers: { 'Content-Type': reviewMp.contentType, Authorization: `Bearer ${accessToken}` } }
    );
    if (reviewRes.status !== 201) continue;
    const reviewId = JSON.parse(reviewRes.body).id;

    // 4) comentário pai (multipart) — é o alvo dos cenários
    const commentMp = multipart({ text: `Comentário pai ${uid}` });
    const commentRes = http.post(
      `${CONFIG.base}/feed/reviews/${reviewId}/comments`,
      commentMp.body,
      { headers: { 'Content-Type': commentMp.contentType, Authorization: `Bearer ${accessToken}` } }
    );
    if (commentRes.status !== 201) continue;
    const commentId = JSON.parse(commentRes.body).id;

    users.push({ accessToken, commentId });
  }

  if (users.length === 0) {
    throw new Error('Nenhum usuário foi preparado. Verifique seed do bookId.');
  }
  return { users };
}

export const options = {
  setupTimeout: '300s',
  scenarios: {
    crud: {
      executor: 'constant-vus',
      vus:      CONFIG.load.crudVus,
      duration: CONFIG.load.duration,
      exec:     'crudInteractions',
    },
    listing: {
      executor: 'constant-vus',
      vus:      CONFIG.load.listingVus,
      duration: CONFIG.load.duration,
      exec:     'listReplies',
    },
  },
  thresholds: {
    http_req_duration:                     [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:                       [`rate<${CONFIG.thresholds.failRate}`],
    'http_req_duration{scenario:crud}':    [`p(95)<${CONFIG.thresholds.p95Crud}`],
    'http_req_duration{scenario:listing}': [`p(95)<${CONFIG.thresholds.p95Listing}`],
  },
};

export function crudInteractions(data) {
  const user = data.users[(__VU - 1) % data.users.length];
  if (!user) return;
  const { accessToken, commentId } = user;
  const authH = { Authorization: `Bearer ${accessToken}` };

  // LIKE (toggle on)
  const likeOn = http.post(`${CONFIG.base}/feed/comments/${commentId}/like`, null, { headers: authH });
  check(likeOn, { 'like on 200': (r) => r.status === 200 });
  sleep(CONFIG.sleep.betweenSteps);

  // CREATE REPLY (query string — endpoint usa @RequestParam sem consumes=)
  const replyText = encodeURIComponent(`Reply VU${__VU} iter${__ITER}`);
  const createReply = http.post(
    `${CONFIG.base}/feed/comments/${commentId}/replies?text=${replyText}`,
    null,
    { headers: authH }
  );
  const createOk = check(createReply, {
    'reply 201':         (r) => r.status === 201,
    'reply retorna id':  (r) => {
      try { return JSON.parse(r.body).id != null; }
      catch { return false; }
    },
  });

  if (createOk && createReply.status === 201) {
    const replyId = JSON.parse(createReply.body).id;
    sleep(CONFIG.sleep.betweenSteps);

    // DELETE da reply criada — evita acúmulo no banco
    const delRes = http.del(`${CONFIG.base}/feed/comments/${replyId}`, null, { headers: authH });
    check(delRes, { 'delete reply 204': (r) => r.status === 204 });
  }

  sleep(CONFIG.sleep.betweenSteps);

  // LIKE (toggle off)
  const likeOff = http.post(`${CONFIG.base}/feed/comments/${commentId}/like`, null, { headers: authH });
  check(likeOff, { 'like off 200': (r) => r.status === 200 });

  sleep(CONFIG.sleep.afterIteration);
}

export function listReplies(data) {
  const user = data.users[(__VU - 1) % data.users.length];
  if (!user) return;
  const { accessToken, commentId } = user;

  const res = http.get(
    `${CONFIG.base}/feed/comments/${commentId}/replies?page=0&size=10`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  check(res, {
    'list 200':  (r) => r.status === 200,
    'has page':  (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.content != null || Array.isArray(body);
      } catch { return false; }
    },
  });

  sleep(CONFIG.sleep.listing);
}
