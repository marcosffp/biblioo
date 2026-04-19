import http from "k6/http";
import { sleep, check } from "k6";

const CONFIG = {
  base: "http://localhost:8080",

  bookIds: Array.from({ length: 35 }, (_, i) => i + 1),

  queries: [
    "Dom Casmurro",
    "Orgulho e Preconceito",
    "O Grande Gatsby",
    "1984",
    "Harry Potter",
    "O Senhor dos Anéis",
  ],

  load: {
    searchVus: 80,
    detailVus: 20,
    duration: "2m",
  },

  thresholds: {
    p95General: 1500,
    p95Search: 2000,
    p95Details: 800,
    failRate: 0.01,
  },

  sleep: {
    search: 1,
    details: 0.5,
  },
};

export const options = {
  scenarios: {
    search: {
      executor: "constant-vus",
      vus: CONFIG.load.searchVus,
      duration: CONFIG.load.duration,
      exec: "searchBooks",
    },
    details: {
      executor: "constant-vus",
      vus: CONFIG.load.detailVus,
      duration: CONFIG.load.duration,
      exec: "getBookDetail",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<1500"],
    http_req_failed: ["rate<0.01"],

    "http_req_duration{scenario:search}": ["p(95)<2000"],
    "http_req_duration{scenario:details}": ["p(95)<800"],

    http_req_waiting: ["p(95)<1200"], // tempo no servidor
  },
};

export function searchBooks() {
  const q = CONFIG.queries[Math.floor(Math.random() * CONFIG.queries.length)];
  const res = http.get(
    `${CONFIG.base}/books/search?q=${encodeURIComponent(q)}`,
  );

  check(res, {
    "status 200": (r) => r.status === 200,
    "body é array JSON": (r) => {
      try {
        return Array.isArray(JSON.parse(r.body));
      } catch {
        return false;
      }
    },
  });

  sleep(CONFIG.sleep.search);
}

export function getBookDetail() {
  const id = CONFIG.bookIds[Math.floor(Math.random() * CONFIG.bookIds.length)];
  const res = http.get(`${CONFIG.base}/books/${id}`);

  check(res, {
    "status 200 ou 404": (r) => r.status === 200 || r.status === 404,
  });

  sleep(CONFIG.sleep.details);
}
