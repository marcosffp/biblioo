import http from 'k6/http';
import ws   from 'k6/ws';
import { sleep, check } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

const stompConnectErrors  = new Counter('stomp_connect_errors');
const stompMessagesSent   = new Counter('stomp_messages_sent');
const stompMessagesRecv   = new Counter('stomp_messages_received');
const stompSendFailRate   = new Rate('stomp_send_fail_rate');
const wsConnectDuration   = new Trend('ws_connect_duration_ms', true);
const msgDeliveryLatency  = new Trend('msg_delivery_latency_ms', true);
const msgDeliverySuccess  = new Rate('msg_delivery_success_rate');

const CONFIG = {
  baseHttp: 'http://localhost:8080',
  baseWs:   'ws://localhost:8080',
  wsPath:   '/ws',
  password: 'Senha@12345',
  prefix:   'msgstress',

  userPoolSize:      150,
  communityPoolSize: 10,

  bookId: 1,

  stress: {
    stageDuration: '30s',
    stages: [20, 50, 100, 150, 200, 250],
  },

  stomp: {
    sendIntervalSec:   2,
    connectTimeoutMs:  5000,
    deliveryTimeoutMs: 6000,
  },

  thresholds: {
    p95DeliveryMs: 3000,
    failRate:      0.02,
  },
};

export const options = {
  setupTimeout: '5m',

  stages: [
    ...CONFIG.stress.stages.map((vus) => ({
      duration: CONFIG.stress.stageDuration,
      target:   vus,
    })),
    { duration: CONFIG.stress.stageDuration, target: 0 },
  ],

  thresholds: {
    stomp_send_fail_rate:      [`rate<${CONFIG.thresholds.failRate}`],
    msg_delivery_success_rate: [`rate>${1 - CONFIG.thresholds.failRate}`],
    msg_delivery_latency_ms:   [`p(95)<${CONFIG.thresholds.p95DeliveryMs}`],
    ws_connect_duration_ms:    [`p(95)<2000`],
  },
};

export function setup() {
  const jsonHeaders = { 'Content-Type': 'application/json' };

  const ownerTs    = Date.now();
  const ownerEmail = `${CONFIG.prefix}_owner_${ownerTs}@test.com`;

  const ownerReg = http.post(
    `${CONFIG.baseHttp}/auth/register`,
    JSON.stringify({
      username: `${CONFIG.prefix}_owner_${ownerTs}`,
      email:    ownerEmail,
      password: CONFIG.password,
    }),
    { headers: jsonHeaders }
  );
  check(ownerReg, { 'owner register 201': (r) => r.status === 201 });

  const ownerLogin = http.post(
    `${CONFIG.baseHttp}/auth/login`,
    JSON.stringify({ email: ownerEmail, password: CONFIG.password }),
    { headers: jsonHeaders }
  );
  check(ownerLogin, { 'owner login 200': (r) => r.status === 200 });

  const ownerToken   = JSON.parse(ownerLogin.body).accessToken;
  const ownerHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` };

  const commIds = [];
  for (let i = 0; i < CONFIG.communityPoolSize; i++) {
    const commRes = http.post(
      `${CONFIG.baseHttp}/communities`,
      JSON.stringify({
        name:        `Stress Comm ${ownerTs}_${i}`,
        description: 'Setup stress test WS',
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
    console.error('Nenhuma comunidade criada. Verifique CONFIG.bookId.');
    return { users: [], commIds: [] };
  }

  const users = [];
  for (let i = 0; i < CONFIG.userPoolSize; i++) {
    const ts    = Date.now() + i;
    const email = `${CONFIG.prefix}_${ts}@test.com`;

    const reg = http.post(
      `${CONFIG.baseHttp}/auth/register`,
      JSON.stringify({ username: `${CONFIG.prefix}_${ts}`, email, password: CONFIG.password }),
      { headers: jsonHeaders }
    );
    check(reg, { 'register 201': (r) => r.status === 201 });

    const login = http.post(
      `${CONFIG.baseHttp}/auth/login`,
      JSON.stringify({ email, password: CONFIG.password }),
      { headers: jsonHeaders }
    );
    check(login, { 'login 200': (r) => r.status === 200 });

    const { accessToken } = JSON.parse(login.body);
    const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` };

    for (const commId of commIds) {
      const joinRes = http.post(
        `${CONFIG.baseHttp}/communities/${commId}/join`,
        null,
        { headers: authHeaders }
      );
      check(joinRes, { 'join community 204': (r) => r.status === 204 });
    }

    users.push({ accessToken });
  }

  return { users, commIds };
}

export default function (data) {
  if (!data.users.length || !data.commIds.length) return;

  const user   = data.users[__VU % data.users.length];
  const commId = randomItem(data.commIds);
  const token  = user.accessToken;
  const wsUrl  = `${CONFIG.baseWs}${CONFIG.wsPath}`;

  let seq = 0;
  const pending = {};
  let stompConnected = false;
  const connectedAt  = Date.now();

  const response = ws.connect(wsUrl, { headers: { Authorization: `Bearer ${token}` } }, (socket) => {

    socket.setTimeout(() => {
      if (!stompConnected) {
        stompConnectErrors.add(1);
        console.warn(`VU ${__VU}: handshake timeout`);
        socket.close();
      }
    }, CONFIG.stomp.connectTimeoutMs);

    socket.setInterval(() => {
      const now = Date.now();
      for (const id of Object.keys(pending)) {
        if (now - pending[id] > CONFIG.stomp.deliveryTimeoutMs) {
          msgDeliverySuccess.add(0);
          stompSendFailRate.add(1);
          delete pending[id];
        }
      }
    }, 1000);

    socket.send(stompFrame('CONNECT', {
      'accept-version': '1.1,1.2',
      'heart-beat':     '0,0',
      'Authorization':  `Bearer ${token}`,
    }));

    socket.on('message', (raw) => {
      const frame = parseStompFrame(raw);
      if (!frame) return;

      switch (frame.command) {

        case 'CONNECTED': {
          stompConnected = true;
          wsConnectDuration.add(Date.now() - connectedAt);

          socket.send(stompFrame('SUBSCRIBE', {
            id:          'sub-community',
            destination: `/topic/community.${commId}`,
          }));
          socket.send(stompFrame('SUBSCRIBE', {
            id:          'sub-errors',
            destination: '/user/queue/errors',
          }));

          socket.setInterval(() => {
            const clientMsgId = `vu${__VU}-${seq}-${Date.now()}`;
            const payload = JSON.stringify({
              content:         `Stress msg ${seq + 1} VU ${__VU}`,
              parentMessageId: null,
              tags:            [],
              images:          [],
              gifUrl:          null,
              hasSpoiler:      false,
              clientMessageId: clientMsgId,
            });

            socket.send(stompFrame('SEND', {
              destination:    `/app/community/${commId}/send`,
              'content-type': 'application/json',
            }, payload));

            pending[clientMsgId] = Date.now();
            stompMessagesSent.add(1);
            seq++;
          }, CONFIG.stomp.sendIntervalSec * 1000);

          break;
        }

        case 'MESSAGE': {
          stompMessagesRecv.add(1);

          if (frame.headers.destination === '/user/queue/errors') {
            try {
              const event = JSON.parse(frame.body);
              if (event.type === 'ERROR') {
                stompSendFailRate.add(1);
              }
            } catch (_) {}
            break;
          }

          try {
            const event       = JSON.parse(frame.body);
            const clientMsgId = event?.data?.clientMessageId;
            if (clientMsgId && pending[clientMsgId] !== undefined) {
              msgDeliveryLatency.add(Date.now() - pending[clientMsgId]);
              msgDeliverySuccess.add(1);
              stompSendFailRate.add(0);
              delete pending[clientMsgId];
            }
          } catch (_) {}

          break;
        }

        case 'ERROR': {
          stompConnectErrors.add(1);
          stompSendFailRate.add(1);
          console.error(`VU ${__VU}: STOMP ERROR — ${frame.body}`);
          socket.close();
          break;
        }
      }
    });

    socket.on('error', (e) => {
      stompConnectErrors.add(1);
      stompSendFailRate.add(1);
      console.error(`VU ${__VU}: WS error — ${e}`);
    });
  });

  check(response, { 'WS connect 101': (r) => r && r.status === 101 });
}

function stompFrame(command, headers = {}, body = '') {
  let frame = command + '\n';
  for (const [k, v] of Object.entries(headers)) {
    frame += `${k}:${v}\n`;
  }
  frame += '\n' + body + '\0';
  return frame;
}

function parseStompFrame(raw) {
  if (!raw || raw === '\n') return null;

  const withoutNull = raw.endsWith('\0') ? raw.slice(0, -1) : raw;
  const lines = withoutNull.split('\n');
  if (lines.length < 1) return null;

  const command = lines[0].trim();
  if (!command) return null;

  const headers = {};
  let i = 1;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line === '' || line === '\r') { i++; break; }
    const colon = line.indexOf(':');
    if (colon > 0) {
      headers[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
    }
  }

  return { command, headers, body: lines.slice(i).join('\n') };
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
