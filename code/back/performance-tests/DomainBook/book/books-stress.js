import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base: 'http://localhost:8080',

  bookIds: Array.from({ length: 35 }, (_, i) => i + 1),  // IDs 1–35

  queries: [
    'Dom Casmurro',
    'Orgulho e Preconceito',
    'O Grande Gatsby',
    '1984',
    'Harry Potter',
    'O Senhor dos Anéis',
  ],

  stress: {
    stageDuration: '30s',
    stages: [20, 50, 100, 200, 300, 400],  // VUs por estágio (rampa crescente)
  },

  thresholds: {
    p95General: 1000,  // ms
    failRate:   0.05,  // 5% — stress
  },

  sleep: {
    afterIteration: 0.5,  // s
  },
};

export const options = {
  stages: [
    ...CONFIG.stress.stages.map((vus) => ({ duration: CONFIG.stress.stageDuration, target: vus })),
    { duration: CONFIG.stress.stageDuration, target: 0 },  
  ],
  thresholds: {
    http_req_duration: [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:   [`rate<${CONFIG.thresholds.failRate}`],
  },
};

export default function () {
  const q  = CONFIG.queries[Math.floor(Math.random() * CONFIG.queries.length)];
  const id = CONFIG.bookIds[Math.floor(Math.random() * CONFIG.bookIds.length)];

  const searchRes = http.get(`${CONFIG.base}/books/search?q=${encodeURIComponent(q)}`);
  check(searchRes, {
    'search status 200': (r) => r.status === 200,
    'search body array': (r) => {
      try { return Array.isArray(JSON.parse(r.body)); }
      catch { return false; }
    },
  });

  const detailRes = http.get(`${CONFIG.base}/books/${id}`);
  check(detailRes, {
    'detail status 200 ou 404': (r) => r.status === 200 || r.status === 404,
  });

  sleep(CONFIG.sleep.afterIteration);
}