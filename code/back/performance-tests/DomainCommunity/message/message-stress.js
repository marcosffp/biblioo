import http from 'k6/http';
import { sleep, check } from 'k6';

const CONFIG = {
  base: 'http://localhost:8080/communities',

  commIds: Array.from({ length: 15 }, (_, i) => i + 1),

  stress: {
    stageDuration: '30s',
    stages: [20, 50, 100, 200, 300, 400],
  },

  thresholds: {
    p95General: 1000,
    failRate:   0.05,
  },

  sleep: { afterIteration: 0.5 },
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
  const commId = CONFIG.commIds[Math.floor(Math.random() * CONFIG.commIds.length)];

  // GET Sync heavy call
  const syncRes = http.get(`${CONFIG.base}/${commId}/messages/sync?after=12345`);
  check(syncRes, { 'GET sync status 200 ou 4xx': (r) => r.status === 200 || r.status >= 400 });

  sleep(CONFIG.sleep.afterIteration);
}