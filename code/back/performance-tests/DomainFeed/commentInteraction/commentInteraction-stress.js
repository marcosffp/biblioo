// Stress sobre CommentInteractionController — rampa progressiva até 600 VUs.

import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base:         'http://localhost:8080',
  userPoolSize: 800,
  password:     'Senha@12345',
  prefix:       'stresscint',
  bookId:       1,

  stress: {
    stageDuration: '30s',
    stages:        [20, 50, 100, 200, 300, 400, 600],
  },

  thresholds: {
    p95General: 2500,
    failRate:   0.05,
  },

  sleep: {
    betweenSteps:   0.2,
    afterIteration: 0.5,
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

    http.post(
      `${CONFIG.base}/auth/register`,
      JSON.stringify({ username: `${CONFIG.prefix}_${uid}`, email, password: CONFIG.password }),
      { headers }
    );
    const login = http.post(
      `${CONFIG.base}/auth/login`,
      JSON.stringify({ email, password: CONFIG.password }),
      { headers }
    );
    if (login.status !== 200) continue;
    const accessToken = JSON.parse(login.body).accessToken;
    const authH = { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` };

    const shelfRes = http.post(
      `${CONFIG.base}/shelves`,
      JSON.stringify({ name: `CInt Stress ${uid}`, description: '' }),
      { headers: authH }
    );
    if (shelfRes.status !== 201) continue;
    const shelfId = JSON.parse(shelfRes.body).id;

    const itemRes = http.post(
      `${CONFIG.base}/shelves/${shelfId}/items`,
      JSON.stringify({ bookId: CONFIG.bookId, initialStatus: 'COMPLETED' }),
      { headers: authH }
    );
    if (itemRes.status !== 201) continue;

    const reviewMp = multipart({
      bookId: String(CONFIG.bookId), rating: '4', text: `Review ${uid}`, publish: 'false',
    });
    const reviewRes = http.post(
      `${CONFIG.base}/feed/reviews`,
      reviewMp.body,
      { headers: { 'Content-Type': reviewMp.contentType, Authorization: `Bearer ${accessToken}` } }
    );
    if (reviewRes.status !== 201) continue;
    const reviewId = JSON.parse(reviewRes.body).id;

    const commentMp = multipart({ text: `Comentário pai ${uid}` });
    const commentRes = http.post(
      `${CONFIG.base}/feed/reviews/${reviewId}/comments`,
      commentMp.body,
      { headers: { 'Content-Type': commentMp.contentType, Authorization: `Bearer ${accessToken}` } }
    );
    if (commentRes.status !== 201) continue;

    users.push({ accessToken, commentId: JSON.parse(commentRes.body).id });
  }

  if (users.length === 0) throw new Error('Nenhum usuário preparado no setup.');
  return { users };
}

export const options = {
  setupTimeout: '600s',
  stages: [
    ...CONFIG.stress.stages.map((vus) => ({ duration: CONFIG.stress.stageDuration, target: vus })),
    { duration: CONFIG.stress.stageDuration, target: 0 },
  ],
  thresholds: {
    http_req_duration: [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:   [`rate<${CONFIG.thresholds.failRate}`],
  },
};

export default function (data) {
  const user = data.users[(__VU - 1) % data.users.length];
  if (!user) return;
  const { accessToken, commentId } = user;
  const authH = { Authorization: `Bearer ${accessToken}` };

  // LIKE
  const like = http.post(`${CONFIG.base}/feed/comments/${commentId}/like`, null, { headers: authH });
  check(like, { 'like 200': (r) => r.status === 200 });
  sleep(CONFIG.sleep.betweenSteps);

  // GET replies
  const listRes = http.get(
    `${CONFIG.base}/feed/comments/${commentId}/replies?page=0&size=10`,
    { headers: authH }
  );
  check(listRes, { 'list 200': (r) => r.status === 200 });
  sleep(CONFIG.sleep.betweenSteps);

  // CREATE + DELETE reply
  const replyText = encodeURIComponent(`Stress reply VU${__VU} iter${__ITER}`);
  const reply = http.post(
    `${CONFIG.base}/feed/comments/${commentId}/replies?text=${replyText}`,
    null,
    { headers: authH }
  );
  check(reply, { 'reply 201': (r) => r.status === 201 });

  if (reply.status === 201) {
    sleep(CONFIG.sleep.betweenSteps);
    const replyId = JSON.parse(reply.body).id;
    const delRes = http.del(`${CONFIG.base}/feed/comments/${replyId}`, null, { headers: authH });
    check(delRes, { 'delete 204': (r) => r.status === 204 });
  }

  sleep(CONFIG.sleep.afterIteration);
}
