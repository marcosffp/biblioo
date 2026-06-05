<img width="1600" style="height:auto; border-radius: 12px;" alt="banner" src="../../docs/imagens/banner.png" />

# Frontend

> Interface web da rede social de leitura Biblioo — estantes, feed social, comunidades com chat em tempo real, recomendações personalizadas e assistente de IA conversacional.

---

## 🛠️ Stack Principal

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix_UI-1.x-8B5CF6?style=for-the-badge&logo=radixui&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)

---

## 📑 Sumário

- [Sobre o projeto](#-sobre-o-projeto)
- [Páginas e rotas](#-páginas-e-rotas)
- [Estrutura de pastas](#-estrutura-de-pastas)
- [Componentes](#-componentes)
- [Hooks](#-hooks)
- [Serviços e camada de API](#-serviços-e-camada-de-api)
- [WebSocket e chat em tempo real](#-websocket-e-chat-em-tempo-real)
- [Variáveis de ambiente](#-variáveis-de-ambiente)
- [Instalação e execução](#-instalação-e-execução)
- [Testes](#-testes)
- [Padrão de código](#-padrão-de-código)
- [Tecnologias e dependências](#-tecnologias-e-dependências)

---

## 📖 Sobre o projeto

O frontend do **Biblioo** é uma SPA (Single Page Application) construída com Next.js (App Router) e React 19. A interface cobre todo o ecossistema da plataforma: autenticação com e-mail ou Google, organização de livros em estantes personalizadas, feed social com posts e reviews, comunidades com chat em tempo real via WebSocket/STOMP, recomendações geradas pelos seis algoritmos do backend, DNA Literário, metas de leitura, compartilhamento de cápsulas e o assistente conversacional **Bibo**.

---

## 📄 Páginas e rotas

| Rota | Arquivo | Descrição |
|---|---|---|
| `/` | `app/page.tsx` | Página raiz — redireciona conforme estado de autenticação |
| `/login` | `app/login/page.tsx` | Login com e-mail/senha ou Google OAuth |
| `/register` | `app/register/page.tsx` | Cadastro de nova conta |
| `/forgot-password` | `app/forgot-password/page.tsx` | Solicitação de redefinição de senha |
| `/reset-password` | `app/reset-password/page.tsx` | Redefinição de senha via token por e-mail |
| `/onboarding` | `app/onboarding/page.tsx` | Fluxo de boas-vindas pós-cadastro |
| `/feed` | `app/feed/page.tsx` | Feed social — posts e reviews de quem o usuário segue |
| `/for-you` | `app/for-you/page.tsx` | Recomendações personalizadas — 6 trilhas de descoberta |
| `/bookcase` | `app/bookcase/page.tsx` | Estantes do usuário — gestão de livros e coleções |
| `/community` | `app/community/page.tsx` | Comunidades — lista, detalhes e chat em tempo real |
| `/profile` | `app/profile/page.tsx` | Perfil próprio do usuário autenticado |
| `/profile/edit` | `app/profile/edit/page.tsx` | Edição de perfil (username, bio, avatar, banner) |
| `/profile/followers` | `app/profile/followers/page.tsx` | Lista de seguidores |
| `/profile/following` | `app/profile/following/page.tsx` | Lista de seguidos |
| `/profile/[username]` | `app/profile/[username]/page.tsx` | Perfil público de qualquer usuário |
| `/settings` | `app/settings/page.tsx` | Configurações da conta |

---

## 📁 Estrutura de pastas

```
front/
├── public/                        # Assets estáticos (logos, ícones SVG)
└── src/
    ├── app/                       # App Router do Next.js — rotas e layouts
    │   ├── layout.tsx             # Layout raiz com providers globais
    │   ├── globals.css            # Estilos globais e variáveis CSS
    │   ├── bookcase/
    │   ├── community/
    │   ├── feed/
    │   ├── for-you/
    │   ├── forgot-password/
    │   ├── login/
    │   ├── onboarding/
    │   ├── profile/
    │   │   ├── [username]/        # Rota dinâmica — perfil público
    │   │   ├── edit/
    │   │   ├── followers/
    │   │   └── following/
    │   ├── register/
    │   ├── reset-password/
    │   └── settings/
    ├── components/                # Componentes React por domínio
    │   ├── bookcase/              # BookcaseModals, BookcaseResults, ShelfBookDetailsPanel...
    │   ├── chat/                  # BiblioChatWidget (assistente Bibo)
    │   ├── community/             # CommunityChatPanel, CommunityCreateModal, VotingPanel...
    │   ├── feed/                  # CreatePostModal, CreateReviewModal, FeedComposeCard...
    │   ├── header/                # NotificationsDropdown, ProfileMenu, SearchBar
    │   ├── modal/                 # Modais compartilhados
    │   ├── profile/               # ProfileHeaderCard, LiteraryDnaSection, ReadingGoalSection...
    │   └── *.tsx                  # Componentes primitivos e compostos globais
    ├── hooks/                     # Custom hooks por domínio
    ├── lib/                       # Configuração de API e utilitários de request
    ├── services/                  # Camada de acesso à API REST do backend
    ├── types/                     # Tipagens TypeScript — contratos de API e UI
    ├── utils/                     # Funções utilitárias puras
    ├── test/                      # Setup global de testes
    └── proxy.ts                   # Proxy de requests (Next.js API routes)
```

---

## 🧩 Componentes

Os componentes são organizados por domínio dentro de `src/components/`.

### Primitivos e compostos globais

| Componente | Descrição |
|---|---|
| `AppShell` | Layout principal com sidebar, header e área de conteúdo |
| `AuthGuard` | Proteção de rotas — redireciona usuários não autenticados |
| `AuthLayout` | Layout das telas de autenticação |
| `Avatar` | Avatar de usuário com fallback de iniciais |
| `Button` | Botão reutilizável com variantes (primary, ghost, outline...) |
| `TextInput` / `PasswordInput` | Inputs controlados com validação |
| `PasswordStrengthChecklist` | Checklist de requisitos de senha em tempo real |
| `BookCard` | Card de livro com capa, título e autor |
| `BookDetailsCard` | Painel expandido com detalhes, avaliação e ações de estante |
| `PostCard` / `ReviewFeedCard` | Cards do feed social (posts e reviews) |
| `CommentsSection` | Seção de comentários com curtidas |
| `CommunityCard` | Card de comunidade com nome, membros e livro atual |
| `Sidebar` | Navegação lateral principal |
| `TopHeader` | Cabeçalho superior com busca e ações globais |
| `SearchSuggestionsList` | Lista de sugestões de busca de livros e usuários |
| `RatingStars` | Componente de avaliação por estrelas |
| `ProgressBar` | Barra de progresso genérica (metas, leitura) |
| `SkeletonBlock` | Placeholder de carregamento |
| `EmptyState` | Estado vazio com ícone e mensagem |
| `WelcomeTutorialModal` | Modal de boas-vindas no onboarding |

### Por domínio

| Grupo | Componentes principais |
|---|---|
| `bookcase/` | `BookcaseModals`, `BookcaseResults`, `ShelfBookDetailsPanel`, `ShelfBooksGrid`, `ShelfCoverFrame` |
| `chat/` | `BiblioChatWidget` — widget flutuante do assistente Bibo com SSE |
| `community/` | `CommunityChatPanel`, `CommunityChatView`, `CommunityCreateModal`, `CommunityInfoPanel`, `CommunityInviteModal`, `CommunityJoinRequestsModal`, `VotingPanel`, `CreateVotingModal` |
| `feed/` | `CreatePostModal`, `CreateReviewModal`, `EditReviewModal`, `FeedComposeCard` |
| `header/` | `NotificationsDropdown`, `ProfileMenu`, `SearchBar` |
| `profile/` | `ProfileHeaderCard`, `ProfileStatsGrid`, `LiteraryDnaSection`, `ReadingGoalSection`, `ProfileTabs`, `UserActivityFeed`, `UserReviewsTab`, `UserCommunitiesTab`, `ShareCapsuleModal` |

---

## 🪝 Hooks

Custom hooks em `src/hooks/` encapsulam a lógica de negócio das páginas e desacoplam componentes de chamadas de API.

| Hook | Responsabilidade |
|---|---|
| `useBookcasePage` | Estado completo da página de estantes — estantes, livros, filtros e modais |
| `useAddBook` | Fluxo de busca e adição de livro a uma estante |
| `useShelfForm` | Criação e edição de estantes |
| `useShelfBookDetails` | Painel de detalhes de livro em uma estante |
| `useCollectionForm` | Criação e edição de coleções |
| `useCommunityPage` | Estado da página de comunidades — lista e seleção ativa |
| `useCommunity` | Dados de uma comunidade específica (membros, roles, ações) |
| `useCommunityMessages` | Histórico de mensagens com paginação |
| `useVoting` | Estado da votação de livro ativa em uma comunidade |
| `useFollowToggle` | Seguir / deixar de seguir usuário com estado otimista |
| `useNotifications` | Polling e marcação de notificações como lidas |
| `useNotificationsPanel` | Estado de abertura/fechamento do dropdown de notificações |
| `useDropdownClose` | Fecha dropdowns ao clicar fora (click outside handler) |

---

## 🌐 Serviços e camada de API

A camada de serviços em `src/services/` abstrai todas as chamadas HTTP ao backend. A configuração base (URL e headers de autenticação) fica em `src/lib/`.

| Serviço | Endpoints cobertos |
|---|---|
| `auth.ts` | Login, cadastro, refresh token, logout, Google OAuth, forgot/reset password |
| `profile.ts` | Perfil próprio e público, edição, upload de avatar/banner, seguidores/seguidos, solicitações |
| `bookcase.ts` | Estantes (CRUD), itens de estante, coleções |
| `feed.ts` | Feed paginado, posts (criar/excluir/curtir), reviews (criar/editar/excluir/curtir), comentários |
| `community.ts` | Comunidades (criar/editar), entrar, convites, solicitações de entrada |
| `community-messages.ts` | Histórico de mensagens do chat |
| `recommendations.ts` | 6 trilhas de recomendação — consumo individual e em batch |
| `search.ts` | Busca de livros (OpenSearch + Google Books) e usuários |
| `notifications.ts` | Listagem, marcar como lida, registro de token FCM |
| `assistant.ts` | Chat com o assistente Bibo via SSE (Server-Sent Events) |
| `voting.ts` | Votações de livro em comunidades |
| `activity.ts` | Atividade recente do usuário no perfil |
| `preferences.ts` | Configurações e preferências da conta |

---

## 💬 WebSocket e chat em tempo real

O chat das comunidades usa **WebSocket com protocolo STOMP** via `@stomp/stompjs` e `sockjs-client`, conectando ao broker RabbitMQ do backend (porta STOMP 61613).

```
Navegador
    │  SockJS → WS  ·  protocolo STOMP
    ▼
Backend Spring (WebSocket + STOMP)
    │  FanoutExchange
    ▼
RabbitMQ (relay entre instâncias Cloud Run)
```

**Fluxo:**
1. Ao entrar em uma comunidade, o hook `useCommunityMessages` conecta ao endpoint `/ws` do backend
2. Subscribe no tópico `/topic/community/{id}`
3. Mensagens enviadas via `/app/community/{id}/send`
4. Desconexão automática ao sair da comunidade ou do componente

O assistente **Bibo** usa **SSE (Server-Sent Events)** via `@microsoft/fetch-event-source` para streaming das respostas do Gemini em tempo real.

---

## 🔑 Variáveis de ambiente

Crie um arquivo `.env.local` na raiz de `front/`. **Nunca versionar em produção.**

```dotenv
# URL base do backend
NEXT_PUBLIC_API_URL=http://localhost:8080

# Client ID para Google OAuth (mesmo configurado no backend)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu_client_id_google
```

> `NEXT_PUBLIC_` expõe a variável para o bundle do cliente. Nunca colocar secrets nesse prefixo.

---

## 🚀 Instalação e execução

### Pré-requisitos

- Node.js 20+
- npm 10+
- Backend Biblioo rodando (ver [README do backend](../back/README.md))

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-1-ti5-0492100-biblioo.git
cd plf-es-2026-1-ti5-0492100-biblioo/code/front

# 2. Instale as dependências
npm install

# 3. Crie e preencha o arquivo de variáveis de ambiente
cp .env.example .env.local

# 4. Suba o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

### Scripts disponíveis

| Script | Comando | Descrição |
|---|---|---|
| Desenvolvimento | `npm run dev` | Inicia o servidor Next.js com hot-reload |
| Build | `npm run build` | Gera o bundle de produção |
| Produção | `npm run start` | Serve o build de produção |
| Lint | `npm run lint` | Verifica erros de lint com ESLint |
| Type check | `npm run typecheck` | Verifica tipos sem emitir arquivos |
| Testes | `npm run test` | Executa a suíte de testes com Vitest |
| Testes (watch) | `npm run test:watch` | Vitest em modo interativo |
| Cobertura | `npm run test:coverage` | Relatório de cobertura de testes |

---

## 🧪 Testes

Os testes usam **Vitest** + **Testing Library** com jsdom. O setup global está em `src/test/setup.ts`.

```bash
# Rodar todos os testes uma vez
npm run test

# Modo watch (reexecuta ao salvar)
npm run test:watch

# Relatório de cobertura
npm run test:coverage
```

**Localização dos testes:**

```
src/
├── test/
│   └── setup.ts                  # Configuração global (jest-dom matchers)
└── utils/
    ├── cn.test.ts                 # Testes do utilitário de classnames
    └── bookcase-filters.test.ts   # Testes dos filtros de estante
```

---

## 🎨 Padrão de código

- **Linguagem:** TypeScript estrito — sem `any` implícito
- **Estilo:** Tailwind CSS com utilitário `cn()` (clsx + tailwind-merge) para composição de classes
- **Lint:** ESLint com configuração do `eslint-config-next`
- **Componentes:** funcionais com hooks — sem class components
- **Código em inglês**, comentários e mensagens de UI em pt-BR

---

## 📦 Tecnologias e dependências

| Categoria | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | 16 |
| UI | React | 19 |
| Linguagem | TypeScript | 5 |
| Estilização | Tailwind CSS | 3 |
| Componentes acessíveis | Radix UI (Avatar, Slot) | 1.x |
| Animações | Framer Motion | 11 |
| Ícones | Lucide React | 1.x |
| Composição de classes | clsx + tailwind-merge + CVA | — |
| WebSocket / STOMP | @stomp/stompjs + sockjs-client | 7.x / 1.x |
| SSE (assistente Bibo) | @microsoft/fetch-event-source | 2.x |
| Google OAuth | @react-oauth/google | 0.13.x |
| Testes | Vitest + Testing Library | 4.x / 16.x |
| Cobertura | @vitest/coverage-v8 | 4.x |
| DOM simulado | jsdom | 29.x |

---

<div align="center">
  <img width="70%" alt="pucminas" src="../../docs/imagens/banner-institucional.svg"/>
</div>
<p align="center">Fonte do banner: <a href="https://github.com/joaopauloaramuni">João Paulo Carneiro Aramuni</a></p>

---
