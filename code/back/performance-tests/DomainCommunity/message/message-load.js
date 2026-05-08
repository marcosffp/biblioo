import http from 'k6/http';
import ws   from 'k6/ws';
import { sleep, check } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// ── Métricas customizadas ────────────────────────────────────────────────────
const stompConnectErrors  = new Counter('stomp_connect_errors');
const stompMessagesSent   = new Counter('stomp_messages_sent');
const stompMessagesRecv   = new Counter('stomp_messages_received');
const stompSendFailRate   = new Rate('stomp_send_fail_rate');      // 1=falha, 0=entregue
const wsConnectDuration   = new Trend('ws_connect_duration_ms', true);
const msgDeliveryLatency  = new Trend('msg_delivery_latency_ms', true);  // SEND → broadcast recebido
const msgDeliverySuccess  = new Rate('msg_delivery_success_rate');       // 1=entregue, 0=timeout

// ── Configuração central ─────────────────────────────────────────────────────
const CONFIG = {
  baseHttp: 'http://localhost:8080',
  baseWs:   'ws://localhost:8080',
  wsPath:   '/ws',           // endpoint WebSocket nativo (sem SockJS)
  password: 'Senha@12345',
  prefix:   'msgload',

  userPoolSize:      80,
  communityPoolSize: 10,
  bookId:            1,

  load: {
    sendVus:  100,
    listVus:  60,
    duration: '2m',
  },

  stomp: {
    sendIntervalSec:   2,     // intervalo entre envios por VU (s)
    connectTimeoutMs:  5000,  // timeout do handshake STOMP
    deliveryTimeoutMs: 5000,  // tempo máximo para confirmar entrega do broadcast
  },

  thresholds: {
    p95General:    1500,  // ms
    p95List:        1500,  // ms
    p95DeliveryMs: 2000,  // ms — latência end-to-end SEND → broadcast
    failRate:      0.01,  // 1 %
  },

  sleep: {
    list:           1,
    afterIteration: 0.5,
  },
};

// ── Opções k6 ────────────────────────────────────────────────────────────────
export const options = {
  setupTimeout: '5m',

  scenarios: {
    sendMessages: {
      executor: 'constant-vus',
      vus:      CONFIG.load.sendVus,
      duration: CONFIG.load.duration,
      exec:     'sendMessages',
    },
    listMessages: {
      executor: 'constant-vus',
      vus:      CONFIG.load.listVus,
      duration: CONFIG.load.duration,
      exec:     'listMessages',
    },
  },

  thresholds: {
    http_req_duration:                          [`p(95)<${CONFIG.thresholds.p95General}`],
    http_req_failed:                            [`rate<${CONFIG.thresholds.failRate}`],
    'http_req_duration{scenario:listMessages}': [`p(95)<${CONFIG.thresholds.p95List}`],
    stomp_send_fail_rate:                       [`rate<${CONFIG.thresholds.failRate}`],
    msg_delivery_success_rate:                  [`rate>${1 - CONFIG.thresholds.failRate}`],
    msg_delivery_latency_ms:                    [`p(95)<${CONFIG.thresholds.p95DeliveryMs}`],
  },
};

// ── Setup: cria usuários e comunidades ──────────────────────────────────────
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
        name:        `Load Comm ${ownerTs}_${i}`,
        description: 'Setup load test mensagens',
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

// ── Cenário principal: WebSocket + STOMP → envio e validação de entrega ──────
//
// Fluxo por VU (conexão persistente — sem reconexão a cada iteração):
//   1. Abre conexão WebSocket e faz handshake STOMP
//   2. Subscreve /topic/community.{id}  — recebe broadcasts de novas mensagens
//   3. Subscreve /user/queue/errors     — detecta erros de domínio
//   4. Envia mensagens periodicamente com clientMessageId único
//   5. Ao receber broadcast, correlaciona com clientMessageId enviado
//   6. Registra latência end-to-end (SEND → MESSAGE recebido)
//   7. Mensagens sem confirmação dentro de deliveryTimeoutMs são marcadas falha
//
// Sucesso real = mensagem foi processada, persistida e devolvida via broadcast.
// O envio do frame STOMP sozinho NÃO conta como sucesso.

export function sendMessages(data) {
  if (!data.users.length || !data.commIds.length) return;

  const user   = data.users[__VU % data.users.length];
  const commId = randomItem(data.commIds);
  const token  = user.accessToken;
  const wsUrl  = `${CONFIG.baseWs}${CONFIG.wsPath}`;

  let seq = 0;
  const pending = {};   // clientMessageId -> sentAt (timestamp ms)
  let stompConnected = false;
  const connectedAt  = Date.now();

  const response = ws.connect(wsUrl, { headers: { Authorization: `Bearer ${token}` } }, (socket) => {

    // Timeout de segurança: fecha se o handshake STOMP não completar
    socket.setTimeout(() => {
      if (!stompConnected) {
        stompConnectErrors.add(1);
        console.warn(`VU ${__VU}: STOMP CONNECTED não recebido em ${CONFIG.stomp.connectTimeoutMs} ms`);
        socket.close();
      }
    }, CONFIG.stomp.connectTimeoutMs);

    // Expiração periódica: mensagens sem broadcast dentro do timeout → falha
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

          // Subscreve ao topic de broadcast para receber mensagens entregues
          socket.send(stompFrame('SUBSCRIBE', {
            id:          'sub-community',
            destination: `/topic/community.${commId}`,
          }));

          // Subscreve à fila pessoal de erros de domínio
          socket.send(stompFrame('SUBSCRIBE', {
            id:          'sub-errors',
            destination: '/user/queue/errors',
          }));

          // Envia mensagens indefinidamente — VU permanece conectado
          // pelo tempo completo do cenário (sem reconexão)
          socket.setInterval(() => {
            const clientMsgId = `vu${__VU}-${seq}-${Date.now()}`;
            const payload = JSON.stringify({
              content:         `Load msg ${seq + 1} VU ${__VU}`,
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

            // Registra o instante de envio — sucesso só quando broadcast chegar
            pending[clientMsgId] = Date.now();
            stompMessagesSent.add(1);
            seq++;
          }, CONFIG.stomp.sendIntervalSec * 1000);

          break;
        }

        case 'MESSAGE': {
          stompMessagesRecv.add(1);

          // Erro de domínio retornado pelo backend (ex: não é membro)
          if (frame.headers.destination === '/user/queue/errors') {
            try {
              const event = JSON.parse(frame.body);
              if (event.type === 'ERROR') {
                stompSendFailRate.add(1);
                console.warn(`VU ${__VU}: erro de domínio — ${event.payload?.content}`);
              }
            } catch (_) {}
            break;
          }

          // Broadcast de comunidade — correlaciona com mensagem enviada por este VU
          // Mensagens de outros VUs na mesma comunidade chegam aqui mas não estão
          // em pending[], sendo ignoradas silenciosamente.
          try {
            const event       = JSON.parse(frame.body);
            const clientMsgId = event?.data?.clientMessageId;

            if (clientMsgId && pending[clientMsgId] !== undefined) {
              const latency = Date.now() - pending[clientMsgId];
              msgDeliveryLatency.add(latency);
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
      console.error(`VU ${__VU}: WebSocket error — ${e}`);
    });

    // Sem socket.close() aqui: VU permanece conectado até o cenário terminar.
    // Isso elimina o overhead de handshake de reconexão e representa uso real.
  });

  check(response, { 'WS connect status 101': (r) => r && r.status === 101 });

  sleep(CONFIG.sleep.afterIteration);
}

// ── Cenário secundário: leitura HTTP ────────────────────────────────────────
export function listMessages(data) {
  if (!data.commIds || data.commIds.length === 0) return;

  const user    = data.users[__VU % data.users.length];
  const headers = { Authorization: `Bearer ${user.accessToken}` };
  const commId  = randomItem(data.commIds);

  const res = http.get(
    `${CONFIG.baseHttp}/communities/${commId}/messages?limit=50`,
    { headers, tags: { scenario: 'listMessages' } }
  );

  check(res, {
    'GET messages 200':     (r) => r.status === 200,
    'GET messages é lista': (r) => {
      try { return Array.isArray(JSON.parse(r.body)); }
      catch { return false; }
    },
  });

  sleep(CONFIG.sleep.list);
}

// ── Helpers STOMP ────────────────────────────────────────────────────────────

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

  const body = lines.slice(i).join('\n');
  return { command, headers, body };
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
