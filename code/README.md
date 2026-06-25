<img width="1600" style="height:auto; border-radius: 12px;" alt="banner" src="../docs/imagens/banner.png" />

# Código

> Monorepo com os três produtos do Biblioo — backend, frontend web e app mobile.

---

## Estrutura

```
code/
├── back/      # API REST · Spring Boot 4 · Java 25
├── front/     # Interface web · Next.js 16 · React 19
└── mobile/    # App Flutter · Android & iOS · Offline-first
```

---

## Subprojetos

### [back/](./back/README.md) — Backend

API REST em **Spring Boot 4 (Java 25)** seguindo arquitetura **Hexagonal (Ports & Adapters)** em monólito modular. Inclui:

- **11 módulos** de domínio: `user`, `books`, `feed`, `community`, `recommendation`, `dna`, `notification`, `assistant`, `share`, `trending`, `infrastructure`
- **6 algoritmos de recomendação** determinísticos: co-leitura (Neo4j), gênero favorito atual, trending com decay exponencial, Thompson Sampling, filtragem colaborativa e repetição espaçada
- **Assistente Bibo** com Google Gemini via Spring AI, histórico em Redis, rate limit 20 req/min
- **Chat em tempo real** via WebSocket/STOMP com broker RabbitMQ
- **Notificações** SSE (web) + Firebase FCM (mobile)
- **Importação Goodreads** via CSV (máx. 10 MB / 10 k linhas)
- **Busca full-text** via OpenSearch + Google Books API
- **Observabilidade** com Prometheus, Grafana e Micrometer
- **Testes de performance** K6: 72 testes (load · spike · stress) em 8 domínios — 100% aprovados, 0 falhas sistêmicas
- **Deploy** em Google Cloud Run com pipeline Cloud Build + GitHub Actions

**Stack:** Java 25 · Spring Boot 4 · MySQL · Neo4j · Redis · OpenSearch · RabbitMQ · Docker Compose

---

### [front/](./front/README.md) — Frontend Web

SPA em **Next.js 16 (App Router)** com **React 19** e TypeScript. Inclui:

- **16 rotas** cobrindo todo o ecossistema: feed, estantes, comunidades, recomendações, perfil, DNA Literário, configurações e importação Goodreads
- **Componentes** organizados por domínio (`bookcase/`, `community/`, `feed/`, `profile/`, `chat/`, `header/`)
- **13 hooks** de domínio que encapsulam toda a lógica de negócio e chamadas de API
- **14 serviços** tipados com contratos Freezed mapeando cada endpoint do backend
- **Chat em tempo real** via WebSocket/STOMP com `@stomp/stompjs` + `sockjs-client`
- **Assistente Bibo** com streaming SSE via `@microsoft/fetch-event-source`
- **Testes** com Vitest + Testing Library
- **Deploy** na Vercel com integração contínua via GitHub (deploy automático a cada push na branch `main`)

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS · Radix UI · Framer Motion · Vitest

 **URL de produção:** [biblioo-rust.vercel.app](https://biblioo-rust.vercel.app)

---

### [mobile/](./mobile/README.md) — App Mobile

App **Flutter 3.11+** offline-first para Android e iOS. Inclui:

- **13 features** independentes com padrão BLoC/Repository/Datasource: `auth`, `shelf`, `collection`, `book`, `feed`, `community`, `recommendation`, `dna`, `notification`, `assistant`, `preferences`, `share`, `user`
- **21 screens** com navegação declarativa via GoRouter (18+ rotas, guard de autenticação em 3 níveis)
- **Offline-first**: Drift (SQLite tipado) + Hive para cache de respostas; Repository sempre tenta local primeiro
- **Auth segura**: JWT em `FlutterSecureStorage`, interceptor de renovação automática em 401
- **6 trilhas de recomendação** carregadas em paralelo com atualização incremental da UI
- **Deep linking** `biblioo://` para reset de senha e convites de comunidade
- **Material 3** com tema claro/escuro e paleta teal alinhada ao frontend web

**Stack:** Flutter 3.11 · Dart 3.11 · BLoC · Drift · Hive · Dio · GoRouter · GetIt · Freezed

---

## Quick start

### Backend

```bash
cd back
cp .env.example .env          # preencha as variáveis
docker-compose up -d          # sobe MySQL, Redis, RabbitMQ, OpenSearch, Neo4j
./mvnw spring-boot:run        # API em http://localhost:8080
```

### Frontend web

```bash
cd front
cp .env.example .env.local    # NEXT_PUBLIC_API_URL + NEXT_PUBLIC_GOOGLE_CLIENT_ID
npm install
npm run dev                   # http://localhost:3000
```

### App mobile

```bash
cd mobile
cp .env.example .env          # API_URL + GOOGLE_WEB_CLIENT_ID
flutter pub get
dart run build_runner build --delete-conflicting-outputs
flutter run
```

---

## Documentação detalhada

| Produto | README |
|---|---|
| Backend | [code/back/README.md](./back/README.md) |
| Frontend Web | [code/front/README.md](./front/README.md) |
| App Mobile | [code/mobile/README.md](./mobile/README.md) |

---

<div align="center">
  <img width="70%" alt="pucminas" src="../docs/imagens/banner-institucional.svg"/>
</div>
<p align="center">Fonte do banner: <a href="https://github.com/joaopauloaramuni">João Paulo Carneiro Aramuni</a></p>

---
