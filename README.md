<img width="1600" style="height:auto; border-radius: 12px;" alt="banner" src="docs/imagens/banner.png" />

# Biblioo

> Rede social de leitura com estantes virtuais, feed social, comunidades com chat em tempo real, recomendações personalizadas geradas por seis algoritmos distintos e um assistente de IA conversacional.

---

## 🛠️ Stack

### Backend
![Java](https://img.shields.io/badge/Java-25-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Neo4j](https://img.shields.io/badge/Neo4j-5.18-008CC1?style=for-the-badge&logo=neo4j&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.4-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![OpenSearch](https://img.shields.io/badge/OpenSearch-2.18-005EB8?style=for-the-badge&logo=opensearch&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-4.0-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

### Mobile
![Flutter](https://img.shields.io/badge/Flutter-3.11%2B-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![Dart](https://img.shields.io/badge/Dart-3.11-0175C2?style=for-the-badge&logo=dart&logoColor=white)
![Bloc](https://img.shields.io/badge/Bloc-8.1.6-5A4FCF?style=for-the-badge)

### Infra e Deploy
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Cloud Run](https://img.shields.io/badge/Cloud_Run-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)

---

## 📑 Sumário

- [Sobre o projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura geral](#-arquitetura-geral)
- [Estrutura do repositório](#-estrutura-do-repositório)
- [Integrantes](#-integrantes)
- [Orientadores](#-orientadores)
- [Como executar](#-como-executar)

---

## 📖 Sobre o projeto

O **Biblioo** é uma plataforma digital voltada para leitores que desejam registrar suas leituras, descobrir novos livros e interagir com outros membros da comunidade literária. Os usuários organizam sua estante virtual, compartilham opiniões por meio de posts e reviews, participam de comunidades com chat em tempo real e recebem recomendações geradas por seis algoritmos independentes que combinam grafo de relacionamentos (Neo4j), aprendizado bayesiano (Thompson Sampling) e repetição espaçada.

O assistente conversacional **Bibo**, alimentado pelo Google Gemini, vai além de responder perguntas: ele é capaz de criar comunidades, organizar estantes, montar coleções e guiar o usuário dentro do ecossistema social do Biblioo de forma contextual e automatizada.

---

## ✨ Funcionalidades

| Área | Descrição |
|---|---|
| **Estantes** | Organização de livros em estantes e coleções personalizadas |
| **Feed social** | Posts, reviews, comentários e curtidas com fanout em tempo real |
| **Comunidades** | Chat com WebSocket/STOMP, votação de livros, convites e solicitações |
| **Recomendações** | 6 trilhas independentes: BecauseYouRead, FavoriteGenreNow, TrendingInCommunities, CatalogSurprise, SimilarAuthors e RereadWorthIt |
| **DNA Literário** | Perfil de leitura com arquétipos literários e snapshots históricos |
| **Bibo** | Assistente de IA conversacional com function calling e streaming via SSE |
| **Notificações** | Push via Firebase FCM + notificações in-app |
| **Busca** | Full-text de livros (OpenSearch + Google Books) e usuários |
| **Mobile offline-first** | App Flutter com sincronização automática ao reconectar |

---

## 🏛️ Arquitetura geral

```
┌──────────────────────────────────────────────────────────────┐
│                   Clientes                                   │
│     Next.js (Web)              Flutter (iOS / Android)       │
└────────────────────────┬─────────────────────────────────────┘
                         │  REST · WebSocket/STOMP · SSE
┌────────────────────────▼─────────────────────────────────────┐
│               Backend — Spring Boot (Cloud Run)              │
│   Monólito modular com arquitetura Hexagonal (Ports & Adapters)│
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │  users   │ │  books   │ │  feed    │ │  recommendation│  │
│  │  auth    │ │  shelves │ │  posts   │ │  (6 algoritmos)│  │
│  │  profile │ │  search  │ │  reviews │ │                │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │community │ │assistant │ │   dna    │ │  notification  │  │
│  │chat/STOMP│ │  (Bibo)  │ │          │ │  (FCM)         │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘  │
└──────────────────────────────────────────────────────────────┘
         │          │          │          │          │
       MySQL      Neo4j      Redis    RabbitMQ   OpenSearch
      (TiDB)    (Aura)    (Upstash) (CloudAMQP) (Bonsai/GCE)
```

**Padrões de destaque:**

| Padrão | Onde se aplica |
|---|---|
| Outbox | Publicação assíncrona garantida no RabbitMQ dentro de `@Transactional` |
| Fanout-on-write | Feed com threshold de 10.000 seguidores |
| Thompson Sampling | Recomendação CatalogSurprise — aprendizado bayesiano por interação |
| Spaced Repetition | Recomendação RereadWorthIt — intervalo ótimo de releitura |
| Collaborative Filtering | Recomendação SimilarAuthors via Neo4j 2 níveis |
| Sliding Window Cache | Feed Redis com warm-size de 200 itens |
| Offline-first (mobile) | Drift/SQLite local + sync remoto ao reconectar |

---

## 📁 Estrutura do repositório

```
biblioo/
├── code/
│   ├── back/          # Backend — Spring Boot
│   ├── front/         # Frontend — Next.js
│   └── mobile/        # App mobile — Flutter
├── docs/              # Documentação do projeto
├── assets/            # Atas, gerência e outros artefatos
└── divulge/           # Materiais de divulgação e apresentações
```

Cada subprojeto possui seu próprio README com instruções detalhadas:

- [Backend — `code/back/README.md`](code/back/README.md)
- [Frontend — `code/front/README.md`](code/front/README.md)
- [Mobile — `code/mobile/README.md`](code/mobile/README.md)

---

## 👥 Integrantes

| Nome |
|---|
| Bernardo Souza Alvim |
| Carlos José Gomes Batista Figueiredo |
| Gabriela Alvarenga Cardoso |
| Marcos Alberto Ferreira Pinto |
| Mateus Araújo Santos |
| Rafael Ganascini de Moura |

---

## 🎓 Orientadores

| Nome |
|---|
| Cleiton Silva Tavares |
| Cristiano de Macêdo Neto |
| João Paulo Carneiro Aramuni |

---

## 🚀 Como executar

### Pré-requisitos globais

- Git
- Docker + Docker Compose
- Java 25+ e Maven 3.9+
- Node.js 20+ e npm 10+
- Flutter SDK 3.11+

### 1. Clone o repositório

```bash
git clone https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-1-ti5-0492100-biblioo.git
cd plf-es-2026-1-ti5-0492100-biblioo
```

### 2. Backend

```bash
cd code/back
cp .env.example .env          # preencha as variáveis
docker-compose up -d           # sobe MySQL, Redis, RabbitMQ, Neo4j, OpenSearch
./mvnw spring-boot:run         # API disponível em http://localhost:8080
```

Swagger UI: `http://localhost:8080/swagger-ui.html`

### 3. Frontend

```bash
cd code/front
npm install
cp .env.example .env.local     # preencha NEXT_PUBLIC_API_URL e NEXT_PUBLIC_GOOGLE_CLIENT_ID
npm run dev                    # disponível em http://localhost:3000
```

### 4. Mobile

```bash
cd code/mobile
flutter pub get
cp .env.example .env           # preencha API_URL e GOOGLE_WEB_CLIENT_ID
flutter run
```

> Consulte os READMEs individuais de cada subprojeto para instruções completas de variáveis de ambiente, deploy em nuvem e testes de performance.

---

<div align="center">
  <img width="70%" alt="pucminas" src="docs/imagens/banner-institucional.svg"/>
</div>
<p align="center">Fonte do banner: <a href="https://github.com/joaopauloaramuni">João Paulo Carneiro Aramuni</a></p>

---
