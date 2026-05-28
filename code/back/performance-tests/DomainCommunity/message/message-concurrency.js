import http from 'k6/http';
import ws   from 'k6/ws';
import { sleep, check } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// ── Métricas customizadas ────────────────────────────────────────────────────
const stompConnectErrors   = new Counter('stomp_connect_errors');
const stompMessagesSent    = new Counter('stomp_messages_sent');
const stompMessagesRecv    = new Counter('stomp_messages_received');
const stompSendFailRate    = new Rate('stomp_send_fail_rate');
const wsConnectDuration    = new Trend('ws_connect_duration_ms', true);
const msgDeliveryLatency   = new Trend('msg_delivery_latency_ms', true);
const msgDeliverySuccess   = new Rate('msg_delivery_success_rate');

// Métricas específicas de concorrência
const msgOutOfOrder        = new Counter('msg_out_of_order');        // msgs recebidas fora de sequência
const msgDuplicated        = new Counter('msg_duplicated');          // mesmo clientMessageId chegou 2x
const msgOverwritten       = new Counter('msg_overwritten');         // msg recebida sobrescreveu outra (mesmo seq, conteúdo diferente)
const concurrencyViolation = new Rate('concurrency_violation_rate'); // qualquer violação acima

// ── Configuração central ─────────────────────────────────────────────────────
const CONFIG = {
  baseHttp: 'http://localhost:8080',
  baseWs:   'ws://localhost:8080',
  wsPath:   '/ws',
  password: 'Senha@12345',
  prefix:   'msgconc',

  // Pool pequeno: todos os VUs entram na mesma comunidade
  // para maximizar colisão de escrita concorrente
  userPoolSize:      200,
  communityPoolSize: 1,   // 1 comunidade só — todos brigando pelo mesmo canal
  bookId:            1,

  concurrency: {
    vus:      200,          // todos enviando ao mesmo tempo na mesma comunidade
    duration: '2m',
    burstVus: 200,          // fase de burst: todos enviam ao mesmo tempo sem intervalo
    burstDuration: '20s',
  },

  stomp: {
    sendIntervalSec:   1,     // envio rápido para maximizar concorrência
    connectTimeoutMs:  5000,
    deliveryTimeoutMs: 8000,
  },

  thresholds: {
    p95DeliveryMs:      3000,
    failRate:           0.01,
    concurrencyFailRate: 0.00,  // zero tolerância para violações de concorrência
  },
};

// ── Opções k6 ────────────────────────────────────────────────────────────────
export const options = {
  setupTimeout: '5m',

  scenarios: {
    // Fase 1: carga constante — todos enviando ao mesmo tempo
    concurrentSend: {
      executor: 'constant-vus',
      vus:      CONFIG.concurrency.vus,
      duration: CONFIG.concurrency.duration,
      exec:     'concurrentSend',
    },
    // Fase 2: burst — todos os VUs enviam no exato mesmo segundo (sem sleep)
    burstSend: {
      executor:   'constant-vus',
      vus:        CONFIG.concurrency.burstVus,
      duration:   CONFIG.concurrency.burstDuration,
      exec:       'burstSend',
      startTime:  CONFIG.concurrency.duration,  // começa depois da fase 1
    },
  },

  thresholds: {
    http_req_failed:           [`rate<${CONFIG.thresholds.failRate}`],
    stomp_send_fail_rate:      [`rate<${CONFIG.thresholds.failRate}`],
    msg_delivery_success_rate: [`rate>${1 - CONFIG.thresholds.failRate}`],
    msg_delivery_latency_ms:   [`p(95)<${CONFIG.thresholds.p95DeliveryMs}`],
    // Violações de integridade — zero tolerância
    msg_duplicated:            ['count==0'],
    msg_overwritten:           ['count==0'],
    concurrency_violation_rate:[`rate<=${CONFIG.thresholds.concurrencyFailRate}`],
    // msg_out_of_order: métrica observável (sem threshold).
    // Option B: clientes ordenam por data.id — entrega fora de ordem via STOMP é esperada
    // sob burst concorrente e não constitui violação de integridade.
  },
};

// ── Setup ────────────────────────────────────────────────────────────────────
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
        name:        `Concurrency Comm ${ownerTs}_${i}`,
        description: 'Teste de concorrência — ordem e sobrescrita',
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
      http.post(`${CONFIG.baseHttp}/communities/${commId}/join`, null, { headers: authHeaders });
    }

    users.push({ accessToken });
  }

  return { users, commIds };
}

// ── Cenário 1: envio concorrente com validação de ordem e duplicata ──────────
//
// Cada VU:
//   - Entra na mesma comunidade
//   - Envia mensagens com seq global embutido no conteúdo: "VU{n}:SEQ{n}"
//   - Escuta o broadcast e valida:
//       1. Nenhum clientMessageId chega duas vezes (duplicata)
//       2. Mensagens do próprio VU chegam em ordem crescente de seq
//       3. O conteúdo recebido bate com o enviado (sem sobrescrita)

export function concurrentSend(data) {
  if (!data.users.length || !data.commIds.length) return;

  const user   = data.users[__VU % data.users.length];
  const commId = data.commIds[0];  // todos na mesma comunidade
  const token  = user.accessToken;
  const wsUrl  = `${CONFIG.baseWs}${CONFIG.wsPath}`;

  let seq = 0;
  const pending   = {};  // clientMessageId -> { sentAt, seq, expectedContent }
  const seenIds   = {};  // clientMessageId -> true (detecta duplicatas)
  const lastIdRecv = {}; // vuId -> maior data.id recebido (observa ordem por ID do banco)

  let stompConnected = false;
  const connectedAt  = Date.now();

  const response = ws.connect(wsUrl, { headers: { Authorization: `Bearer ${token}` } }, (socket) => {

    socket.setTimeout(() => {
      if (!stompConnected) {
        stompConnectErrors.add(1);
        socket.close();
      }
    }, CONFIG.stomp.connectTimeoutMs);

    // Expira pendentes sem confirmação
    socket.setInterval(() => {
      const now = Date.now();
      for (const id of Object.keys(pending)) {
        if (now - pending[id].sentAt > CONFIG.stomp.deliveryTimeoutMs) {
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
            const clientMsgId      = `vu${__VU}-seq${seq}-${Date.now()}`;
            // Conteúdo carrega VU + seq explícitos — permite validar no broadcast
            const expectedContent  = `CONC|VU:${__VU}|SEQ:${seq}`;

            const payload = JSON.stringify({
              content:         expectedContent,
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

            pending[clientMsgId] = { sentAt: Date.now(), seq, expectedContent };
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
              if (event.type === 'ERROR') stompSendFailRate.add(1);
            } catch (_) {}
            break;
          }

          try {
            const event       = JSON.parse(frame.body);
            const clientMsgId = event?.data?.clientMessageId;
            const content     = event?.data?.content;

            if (!clientMsgId) break;

            // ── Validação 1: duplicata ──────────────────────────────────────
            if (seenIds[clientMsgId]) {
              msgDuplicated.add(1);
              concurrencyViolation.add(1);
              console.error(`VU ${__VU}: DUPLICATA detectada — ${clientMsgId}`);
            } else {
              seenIds[clientMsgId] = true;
            }

            // ── Validações sobre mensagens do próprio VU ────────────────────
            if (pending[clientMsgId] !== undefined) {
              const entry   = pending[clientMsgId];
              const latency = Date.now() - entry.sentAt;
              msgDeliveryLatency.add(latency);
              msgDeliverySuccess.add(1);
              stompSendFailRate.add(0);

              // ── Validação 2: sobrescrita de conteúdo ───────────────────────
              // O conteúdo recebido deve ser exatamente o que foi enviado
              if (content !== entry.expectedContent) {
                msgOverwritten.add(1);
                concurrencyViolation.add(1);
                console.error(
                  `VU ${__VU}: SOBRESCRITA — esperado "${entry.expectedContent}", recebido "${content}"`
                );
              }

              // ── Observação: ordem por ID do banco (Option B) ───────────────
              // Verifica que data.id cresce monotonicamente por remetente.
              // Não é violação de integridade — clientes ordenam por ID antes de exibir.
              const msgId = event?.data?.id;
              const match = clientMsgId.match(/^vu(\d+)-seq(\d+)-/);
              if (match && msgId) {
                const senderVu = match[1];
                const lastId   = lastIdRecv[senderVu];
                if (lastId !== undefined && msgId < lastId) {
                  msgOutOfOrder.add(1);
                }
                if (lastId === undefined || msgId > lastId) {
                  lastIdRecv[senderVu] = msgId;
                }
              }

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
  sleep(0.1);
}

// ── Cenário 2: burst — todos enviam ao mesmo tempo sem nenhum intervalo ──────
//
// Objetivo: forçar colisão máxima no backend.
// Todos os VUs enviam uma rajada de mensagens simultâneas sem sleep,
// depois escutam o broadcast e fazem as mesmas validações.
// Detecta race conditions que só aparecem sob pressão extrema e simultânea.

export function burstSend(data) {
  if (!data.users.length || !data.commIds.length) return;

  const user   = data.users[__VU % data.users.length];
  const commId = data.commIds[0];
  const token  = user.accessToken;
  const wsUrl  = `${CONFIG.baseWs}${CONFIG.wsPath}`;

  const BURST_SIZE = 5;  // mensagens disparadas em sequência imediata por VU

  const pending    = {};
  const seenIds    = {};
  const lastIdRecv = {};
  let seq = 0;
  let stompConnected = false;
  const connectedAt  = Date.now();

  const response = ws.connect(wsUrl, { headers: { Authorization: `Bearer ${token}` } }, (socket) => {

    socket.setTimeout(() => {
      if (!stompConnected) {
        stompConnectErrors.add(1);
        socket.close();
      }
    }, CONFIG.stomp.connectTimeoutMs);

    socket.setInterval(() => {
      const now = Date.now();
      for (const id of Object.keys(pending)) {
        if (now - pending[id].sentAt > CONFIG.stomp.deliveryTimeoutMs) {
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

          // Burst: dispara BURST_SIZE mensagens sem intervalo algum
          for (let b = 0; b < BURST_SIZE; b++) {
            const clientMsgId     = `burst-vu${__VU}-seq${seq}-${Date.now()}`;
            const expectedContent = `BURST|VU:${__VU}|SEQ:${seq}`;

            socket.send(stompFrame('SEND', {
              destination:    `/app/community/${commId}/send`,
              'content-type': 'application/json',
            }, JSON.stringify({
              content:         expectedContent,
              parentMessageId: null,
              tags:            [],
              images:          [],
              gifUrl:          null,
              hasSpoiler:      false,
              clientMessageId: clientMsgId,
            })));

            pending[clientMsgId] = { sentAt: Date.now(), seq, expectedContent };
            stompMessagesSent.add(1);
            seq++;
          }

          break;
        }

        case 'MESSAGE': {
          stompMessagesRecv.add(1);

          if (frame.headers.destination === '/user/queue/errors') {
            try {
              const event = JSON.parse(frame.body);
              if (event.type === 'ERROR') stompSendFailRate.add(1);
            } catch (_) {}
            break;
          }

          try {
            const event       = JSON.parse(frame.body);
            const clientMsgId = event?.data?.clientMessageId;
            const content     = event?.data?.content;

            if (!clientMsgId) break;

            if (seenIds[clientMsgId]) {
              msgDuplicated.add(1);
              concurrencyViolation.add(1);
              console.error(`BURST VU ${__VU}: DUPLICATA — ${clientMsgId}`);
            } else {
              seenIds[clientMsgId] = true;
            }

            if (pending[clientMsgId] !== undefined) {
              const entry = pending[clientMsgId];
              msgDeliveryLatency.add(Date.now() - entry.sentAt);
              msgDeliverySuccess.add(1);
              stompSendFailRate.add(0);

              if (content !== entry.expectedContent) {
                msgOverwritten.add(1);
                concurrencyViolation.add(1);
                console.error(
                  `BURST VU ${__VU}: SOBRESCRITA — esperado "${entry.expectedContent}", recebido "${content}"`
                );
              }

              // ── Observação: ordem por ID do banco (Option B) ───────────────
              const msgId = event?.data?.id;
              const match = clientMsgId.match(/^burst-vu(\d+)-seq(\d+)-/);
              if (match && msgId) {
                const senderVu = match[1];
                const lastId   = lastIdRecv[senderVu];
                if (lastId !== undefined && msgId < lastId) {
                  msgOutOfOrder.add(1);
                }
                if (lastId === undefined || msgId > lastId) {
                  lastIdRecv[senderVu] = msgId;
                }
              }

              delete pending[clientMsgId];
            }

          } catch (_) {}

          break;
        }

        case 'ERROR': {
          stompConnectErrors.add(1);
          stompSendFailRate.add(1);
          console.error(`BURST VU ${__VU}: STOMP ERROR — ${frame.body}`);
          socket.close();
          break;
        }
      }
    });

    socket.on('error', (e) => {
      stompConnectErrors.add(1);
      stompSendFailRate.add(1);
    });
  });

  check(response, { 'WS connect 101': (r) => r && r.status === 101 });
  // Sem sleep — burst intencional
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

  return { command, headers, body: lines.slice(i).join('\n') };
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
