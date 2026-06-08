<img width="1600" style="height:auto; border-radius: 12px;" alt="banner" src="../../docs/imagens/banner.png" />

# Frontend

> Interface web da rede social de leitura Biblioo — estantes, feed social, comunidades com chat em tempo real, recomendações personalizadas, DNA Literário e assistente de IA conversacional.

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
- [Tipagens](#-tipagens)
- [Utilitários e biblioteca](#-utilitários-e-biblioteca)
- [WebSocket e tempo real](#-websocket-e-tempo-real)
- [Variáveis de ambiente](#-variáveis-de-ambiente)
- [Instalação e execução](#-instalação-e-execução)
- [Testes](#-testes)
- [Padrão de código](#-padrão-de-código)
- [Regras de arquitetura](#-regras-de-arquitetura)
- [Tecnologias e dependências](#-tecnologias-e-dependências)

---

## 📖 Sobre o projeto

O frontend do **Biblioo** é uma SPA construída com **Next.js 16 (App Router)** e **React 19**. A interface cobre todo o ecossistema da plataforma: autenticação com e-mail/senha ou Google OAuth, organização de livros em estantes e coleções com rastreamento de progresso de leitura, feed social com posts e reviews com imagens/GIFs, comunidades com chat em tempo real via WebSocket/STOMP, recomendações geradas pelos seis algoritmos do backend, DNA Literário, metas de leitura, importação de biblioteca do Goodreads e o assistente conversacional **Bibo** com streaming via SSE.

---

## 📄 Páginas e rotas

| Rota | Arquivo | Descrição |
|---|---|---|
| `/` | `app/page.tsx` | Página raiz — redireciona para `/login` |
| `/login` | `app/login/page.tsx` | Login com e-mail/senha ou Google OAuth; exibe modal de tutorial no primeiro acesso |
| `/register` | `app/register/page.tsx` | Cadastro com validação de força de senha em tempo real |
| `/forgot-password` | `app/forgot-password/page.tsx` | Solicitação de link de redefinição de senha |
| `/reset-password` | `app/reset-password/page.tsx` | Redefinição de senha via token recebido por e-mail |
| `/onboarding` | `app/onboarding/page.tsx` | Fluxo pós-cadastro em 2 etapas: seleção de gêneros + busca de livros iniciais |
| `/feed` | `app/feed/page.tsx` | Feed social — posts e reviews de quem o usuário segue, com sidebar de trending |
| `/for-you` | `app/for-you/page.tsx` | Recomendações personalizadas — 6 trilhas de descoberta + Roll Dice universal |
| `/bookcase` | `app/bookcase/page.tsx` | Biblioteca pessoal — gestão de estantes, itens, coleções e busca de livros |
| `/community` | `app/community/page.tsx` | Descoberta, criação e acesso ao chat em tempo real das comunidades |
| `/profile` | `app/profile/page.tsx` | Perfil próprio com estantes, atividade recente e comunidades |
| `/profile/edit` | `app/profile/edit/page.tsx` | Edição de perfil (username, bio, avatar, banner) |
| `/profile/followers` | `app/profile/followers/page.tsx` | Lista paginada de seguidores |
| `/profile/following` | `app/profile/following/page.tsx` | Lista paginada de seguidos |
| `/profile/[username]` | `app/profile/[username]/page.tsx` | Perfil público de qualquer usuário com opção de seguir |
| `/settings` | `app/settings/page.tsx` | Configurações da conta — e-mail, senha, criação de senha Google, importação Goodreads |

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
    │   ├── bookcase/              # Estantes, itens, coleções, painel de detalhes
    │   ├── chat/                  # BiblioChatWidget — assistente Bibo com SSE
    │   ├── community/             # Chat, votações, convites, modais de comunidade
    │   ├── feed/                  # CreatePostModal, CreateReviewModal, FeedComposeCard
    │   ├── header/                # NotificationsDropdown, ProfileMenu, SearchBar
    │   ├── modal/                 # Modais compartilhados
    │   ├── profile/               # ProfileHeaderCard, LiteraryDnaSection, ReadingGoalSection...
    │   └── *.tsx                  # Componentes primitivos e compostos globais
    ├── hooks/                     # Custom hooks por domínio
    ├── lib/                       # Configuração base de API e helpers de headers
    ├── services/                  # Camada de acesso à API REST do backend
    ├── types/                     # Tipagens TypeScript — contratos de API e UI
    ├── utils/                     # Funções utilitárias puras
    ├── test/                      # Setup global de testes (jest-dom matchers)
    └── proxy.ts                   # Proxy de requests (Next.js API routes)
```

---

## 🧩 Componentes

Os componentes são organizados por domínio dentro de `src/components/`.

### Layout e autenticação

| Componente | Descrição |
|---|---|
| `AppShell` | Layout principal — sidebar, header e widget do chat Bibo |
| `TopHeader` | Cabeçalho superior com busca global, notificações e menu de usuário |
| `Sidebar` | Navegação lateral com links principais |
| `AuthGuard` | Proteção de rotas — redireciona usuários não autenticados |
| `AuthLayout` | Template de layout para telas de autenticação |

### Primitivos e compostos globais

| Componente | Descrição |
|---|---|
| `Button` | Botão reutilizável com estado de carregamento e variantes |
| `TextInput` / `PasswordInput` | Inputs controlados com label, erro e toggle de visibilidade |
| `PasswordStrengthChecklist` | Checklist de requisitos de senha em tempo real |
| `ChipToggle` | Botão de alternância para filtros e seleção |
| `RatingStars` | Avaliação interativa de 1–5 estrelas |
| `ProgressBar` | Barra de progresso genérica (metas, leitura) |
| `SkeletonBlock` | Placeholder de carregamento |
| `EmptyState` | Estado vazio com ícone e mensagem |
| `Avatar` | Avatar de usuário com fallback de iniciais |
| `BackArrowButton` / `BackHeader` | Botão e cabeçalho de navegação de retorno |
| `BookCoverPlaceholder` | Fallback visual para capas de livros sem imagem |
| `BookCard` | Card de livro com capa, título e autor (visão de grid) |
| `BookDetailsCard` | Modal com informações completas do livro e ação de adicionar à estante |
| `PostCard` | Card de post com texto, imagens, livro associado, curtidas e comentários |
| `ReviewFeedCard` | Card de review com nota em estrelas, texto, imagens, curtidas e comentários |
| `CommentsSection` | Seção de comentários com curtidas para posts e reviews |
| `UserBadge` | Badge compacto com avatar e username |
| `PageHeader` / `SectionHeader` | Títulos de página e seção com ação opcional |
| `GoogleSignInButton` | Botão de login OAuth do Google |
| `ClientPortal` | Portal para renderizar modais e dropdowns fora da árvore DOM |
| `WelcomeTutorialModal` | Modal de boas-vindas exibido no primeiro acesso |
| `UnfollowPrivateConfirmModal` | Confirmação ao deixar de seguir conta privada |

### Bookcase (`components/bookcase/`)

| Componente | Descrição |
|---|---|
| `BookcaseResults` | Grid de livros, estantes ou coleções com paginação |
| `ShelfBooksGrid` | Grid de livros de uma estante específica |
| `ShelfBookDetailsPanel` | Painel deslizante para editar status, progresso e review de um livro |
| `ShelfCoverFrame` | Frame visual de capa de livro no preview da estante |
| `BookcaseModals` | Gerenciador de todos os modais da bookcase (criar estante, editar, adicionar livro, etc.) |

### Community (`components/community/`)

| Componente | Descrição |
|---|---|
| `CommunityChatView` | Interface principal do chat com scroll automático e envio de mensagens |
| `CommunityChatPanel` | Container de mensagens com paginação reversa |
| `CommunityInfoPanel` | Sidebar com info da comunidade, membros e ações de moderação |
| `CommunityCard` | Card de comunidade para descoberta e grid |
| `CommunityCreateModal` | Formulário de criação de comunidade |
| `CommunityInviteModal` | Gerencia convites diretos a usuários |
| `CommunityJoinRequestsModal` | Aprovar / rejeitar solicitações de entrada em comunidade privada |
| `NonMemberCommunityModal` | Opções de entrar ou solicitar acesso a comunidade privada |
| `CreateVotingModal` | Criar votação de livro na comunidade |
| `VotingPanel` | Exibir e votar em votações ativas |
| `EditMessageModal` | Editar mensagem enviada no chat |
| `ConfirmActionModal` | Diálogo de confirmação genérico para ações destrutivas |

### Feed (`components/feed/`)

| Componente | Descrição |
|---|---|
| `FeedComposeCard` | Card de composição de post/review no topo do feed |
| `CreatePostModal` | Criar post com texto, até 5 imagens, 1 GIF, tags, spoiler e livro associado |
| `CreateReviewModal` | Criar review com nota e texto |
| `EditReviewModal` | Editar review existente |

### Header (`components/header/`)

| Componente | Descrição |
|---|---|
| `SearchBar` | Busca global com sugestões de livros e usuários em tempo real |
| `SearchSuggestionsList` | Dropdown de resultados de busca |
| `NotificationsDropdown` | Sino de notificações com lista de eventos e marcação de lidas |
| `ProfileMenu` | Menu de usuário com atalhos para perfil, configurações e logout |

### Profile (`components/profile/`)

| Componente | Descrição |
|---|---|
| `ProfileHeaderCard` | Cabeçalho com avatar, banner, bio, seguir e estatísticas |
| `ProfileStatsGrid` | Grid com livros lidos, páginas lidas e streak de leitura |
| `ProfileTabs` | Tabs: Biblioteca · Atividade · Comunidades |
| `ProfileShelfBookCard` | Card de livro na aba de biblioteca do perfil |
| `ProfileFollowersPanel` | Lista de seguidores/seguidos com toggle |
| `UserActivityFeed` | Timeline de reviews e posts recentes do usuário |
| `UserReviewsTab` | Aba com todas as reviews do usuário |
| `UserCommunitiesTab` | Lista de comunidades que o usuário participa |
| `LiteraryDnaSection` | Exibe os temas e arquétipos do DNA Literário |
| `ReadingGoalSection` | Progresso da meta de leitura anual |
| `ShareCapsuleModal` | Gerar e compartilhar card de estatísticas de leitura |
| `FollowUserCard` | Card de usuário para descoberta de quem seguir |

### Chat (`components/chat/`)

| Componente | Descrição |
|---|---|
| `BiblioChatWidget` | Widget flutuante do assistente Bibo com streaming SSE de respostas do Gemini |

---

## 🪝 Hooks

Custom hooks em `src/hooks/` encapsulam a lógica de negócio das páginas e desacoplam completamente os componentes das chamadas de API.

| Hook | Responsabilidade |
|---|---|
| `useBookcasePage` | Estado completo da bookcase — estantes, itens, coleções, filtros de busca e todos os modais |
| `useShelfForm` | Criar, editar e excluir estantes com validação |
| `useCollectionForm` | Criar, editar e excluir coleções, incluindo associação de estantes |
| `useAddBook` | Fluxo de busca de livros e adição a uma estante com deduplicação |
| `useShelfBookDetails` | Atualizar status, progresso de página e review de livro no painel de detalhes |
| `useCommunityPage` | Descoberta de comunidades, criação, entrada, convites e solicitações de ingresso |
| `useCommunity` | Dados de uma comunidade específica — membros, roles e ações de moderação |
| `useCommunityMessages` | Envio e recebimento de mensagens em tempo real via WebSocket |
| `useVoting` | Criar, publicar, votar e administrar votações de livros em comunidades |
| `useFollowToggle` | Seguir / deixar de seguir usuário com atualização otimista do estado |
| `useNotifications` | Buscar, marcar como lida e deletar notificações |
| `useNotificationsPanel` | Estado de abertura/fechamento do dropdown de notificações |
| `useDropdownClose` | Fecha dropdowns ao clicar fora (click outside handler) |

---

## 🌐 Serviços e camada de API

A camada de serviços em `src/services/` abstrai todas as chamadas HTTP ao backend. A configuração base (URL, headers de autenticação) está em `src/lib/`.

### `auth.ts`

| Função | Descrição |
|---|---|
| `loginWithEmailPassword()` | Login com e-mail e senha |
| `registerWithEmailPassword()` | Cadastro de nova conta |
| `loginWithGoogle()` | Login via token Google OAuth |
| `forgotPassword()` | Solicitar e-mail de redefinição |
| `resetPassword()` | Redefinir senha com token |
| `getAccessToken()` / `saveAuthSession()` / `clearAuthSession()` | Gestão de sessão JWT no localStorage |
| `isTokenExpired()` | Verificar expiração do token antes de requests |

### `bookcase.ts`

| Função | Descrição |
|---|---|
| `searchBooks()` / `suggestBooks()` / `getBookById()` | Busca e detalhes de livros |
| `listShelves()` / `getShelfById()` / `createShelf()` / `updateShelf()` / `deleteShelf()` | CRUD de estantes |
| `listShelfItems()` / `addBookToShelf()` / `removeBookFromShelf()` | Gerenciar itens de estante |
| `changeShelfItemStatus()` / `updateShelfItemProgress()` | Atualizar status e página atual |
| `listCollections()` / `getCollectionById()` / `createCollection()` / `updateCollection()` | CRUD de coleções |
| `createBookReview()` / `updateBookReview()` / `deleteBookReview()` / `getMyBookReview()` | Reviews de livros |
| `getActiveReadingDays()` | Streak de leitura (dias com progresso registrado) |

### `feed.ts`

| Função | Descrição |
|---|---|
| `getFeed()` | Feed paginado com cursor-based pagination |
| `createPost()` / `deletePost()` | Gerenciar posts |
| `createReview()` / `updateReview()` / `deleteReview()` | Gerenciar reviews |
| `likeContent()` / `unlikeContent()` | Curtir/descurtir posts, reviews e comentários |
| `getComments()` / `createComment()` / `deleteComment()` | Gerenciar comentários |

### `community.ts`

| Função | Descrição |
|---|---|
| `listCommunities()` / `getCommunityById()` | Listar e buscar comunidades |
| `createCommunity()` / `joinCommunity()` / `leaveCommunity()` | Criação e participação |
| `sendCommunityMessage()` / `editMessage()` / `deleteMessage()` | Chat de comunidade |
| `getCommunityMessages()` | Histórico de mensagens com paginação |
| `inviteUserToCommunity()` / `requestPrivateJoin()` | Convites e solicitações |
| `approveDenyJoinRequest()` | Ações administrativas de ingresso |

### `community-messages.ts`

Gerencia a conexão WebSocket/STOMP para o chat em tempo real (ver [WebSocket e tempo real](#-websocket-e-tempo-real)).

### `profile.ts`

| Função | Descrição |
|---|---|
| `getMyProfile()` / `getProfileByUsername()` | Perfil próprio e público |
| `updateMyProfile()` / `uploadMyAvatar()` / `uploadMyBanner()` | Atualizar dados de perfil |
| `updateMyVisibility()` | Alternar perfil público/privado |
| `followUser()` / `unfollowUser()` | Ações de follow |
| `listMyShelves()` / `listShelfItems()` | Estantes e livros do usuário |
| `getMyDna()` | DNA Literário — temas e arquétipos |

### `recommendations.ts`

| Função | Trilha |
|---|---|
| `getBecauseYouRead()` | T1 — co-leitura via Neo4j |
| `getFavoriteGenreNow()` | T2 — gêneros dominantes atuais |
| `getTrendingInCommunities()` | T3 — decay exponencial de engajamento |
| `getCatalogSurprise()` | T4 — Thompson Sampling |
| `getSimilarAuthors()` | T5 — filtragem colaborativa |
| `getRereadWorthIt()` | T6 — repetição espaçada |
| `rollDice()` | Roll Dice — seleção aleatória das 6 trilhas |

### `notifications.ts`

| Função | Descrição |
|---|---|
| `getNotifications()` | Buscar notificações paginadas |
| `markAsRead()` / `markAllAsRead()` | Marcar como lida |
| `deleteNotification()` | Remover notificação |

### `voting.ts`

| Função | Descrição |
|---|---|
| `getVotings()` / `createVoting()` | Listar e criar votações |
| `publishVoting()` / `castVote()` | Publicar e votar |
| `closeVoting()` / `approveVoting()` / `rejectVoting()` | Administrar resultado |

### `activity.ts`

| Função | Descrição |
|---|---|
| `getUserActivityPosts()` | Posts recentes do usuário para timeline |
| `getUserActivityReviews()` | Reviews recentes do usuário para timeline |

### `assistant.ts`

| Função | Descrição |
|---|---|
| `sendAssistantMessage()` | Enviar mensagem ao Bibo com streaming SSE |
| `listAssistantConversations()` | Histórico de conversas |

### `preferences.ts`

| Função | Descrição |
|---|---|
| `getGenres()` | Buscar todos os gêneros com tradução pt-BR |
| `saveUserPreferences()` | Salvar preferências de gêneros e livros (onboarding) |

### `search.ts`

Busca global unificada de livros (OpenSearch + Google Books) e usuários (OpenSearch).

---

## 📐 Tipagens

Todas as tipagens ficam em `src/types/`, organizadas por contexto.

| Arquivo | O que contém |
|---|---|
| `types/api.ts` | Contratos de resposta do backend: livros, usuários, estantes, coleções, reviews, posts, comunidades, feed, recomendações, DNA, votações |
| `types/auth.ts` | `AuthSession`, `LoginRequest`, `RegisterRequest` |
| `types/profile.ts` | `DisplayShelfBook` (livro com dados de estante), `ShelfItemWithShelfId` |
| `types/ui.ts` | Tipagens específicas de UI (variantes de componentes, estados de modal) |
| `types/index.ts` | Re-exportações centralizadas |

---

## 🛠️ Utilitários e biblioteca

### `src/utils/`

| Arquivo | Funções principais |
|---|---|
| `cn.ts` | `cn()` — mescla classes Tailwind (clsx + tailwind-merge) |
| `date.ts` | `formatFeedTime()`, `formatMessageTime()`, `formatDateLabel()`, `isSameDay()`, `formatMonthYear()` |
| `format.ts` | Formatação geral de strings e números |
| `jwt.ts` | `getJwtUserId()`, `getJwtExpiry()` — parse de payload JWT sem dependência externa |
| `notifications.ts` | Helpers para formatação de notificações |
| `bookcase-filters.ts` | `mapBackendReadingStatus()`, `filterBooksByStatusAndSearch()`, `filterCollectionsBySearch()`, `computeBookSuggestions()`, `addBookToShelfWithoutDuplicate()` |
| `book-utils.ts` | Utilitários de dados de livros (normalização, fallbacks de capa) |

### `src/lib/`

| Arquivo | Função |
|---|---|
| `api-config.ts` | URL base da API via `NEXT_PUBLIC_API_URL` |
| `api-headers.ts` | `requiredBearerHeaders()`, `optionalBearerHeaders()`, `jsonBearerHeaders()` — helpers para montar headers de autenticação |

---

## 💬 WebSocket e tempo real

### Chat das comunidades — WebSocket / STOMP

O chat usa **WebSocket com protocolo STOMP** via `@stomp/stompjs` + `sockjs-client`, conectando ao broker RabbitMQ do backend.

```
Navegador
    │  SockJS → WS  ·  protocolo STOMP
    ▼
Backend Spring (WebSocket + STOMP)
    │  FanoutExchange (RabbitMQ)
    ▼
RabbitMQ (relay entre instâncias Cloud Run — session affinity garante a conexão)
```

**Fluxo no hook `useCommunityMessages`:**
1. Ao entrar em uma comunidade, conecta ao endpoint `/ws` do backend via SockJS
2. Subscribe no tópico `/topic/community/{id}`
3. Mensagens enviadas para `/app/community/{id}/send`
4. Desconexão automática via cleanup do `useEffect` ao sair da comunidade

### Assistente Bibo — SSE (Server-Sent Events)

O `BiblioChatWidget` usa **`@microsoft/fetch-event-source`** para streaming das respostas do Gemini em tempo real, mantendo a conexão aberta enquanto o modelo gera a resposta token por token.

---

## 🔑 Variáveis de ambiente

Crie um arquivo `.env.local` na raiz de `front/`. **Nunca versionar em produção.**

```dotenv
# URL base do backend (sem barra final)
NEXT_PUBLIC_API_URL=http://localhost:8080

# Client ID do Google OAuth (mesmo configurado no backend)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu_client_id_google
```

> `NEXT_PUBLIC_` expõe a variável ao bundle do cliente. Nunca colocar secrets com esse prefixo.

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
| Desenvolvimento | `npm run dev` | Servidor Next.js com hot-reload |
| Build | `npm run build` | Bundle de produção otimizado |
| Produção | `npm run start` | Serve o build de produção |
| Lint | `npm run lint` | Verificação ESLint |
| Type check | `npm run typecheck` | Verificação TypeScript sem emitir arquivos |
| Testes | `npm run test` | Suíte de testes com Vitest |
| Testes (watch) | `npm run test:watch` | Vitest em modo interativo |
| Cobertura | `npm run test:coverage` | Relatório de cobertura de testes |

---

## 🧪 Testes

Os testes usam **Vitest** + **Testing Library** com jsdom. O setup global está em `src/test/setup.ts`.

```bash
npm run test            # executa todos os testes uma vez
npm run test:watch      # modo watch — reexecuta ao salvar
npm run test:coverage   # relatório HTML de cobertura
```

### Localização dos testes

```
src/
├── test/
│   └── setup.ts                       # Configuração global (jest-dom matchers)
└── utils/
    ├── cn.test.ts                      # Testes do utilitário de classnames
    └── bookcase-filters.test.ts        # Testes dos filtros de estante (status, busca, deduplicação)
```

Os testes cobrem lógica pura: filtragem de livros por status e texto, mescla de classes Tailwind e deduplicação ao adicionar livros. Componentes visuais são verificados via type check (`npm run typecheck`).

---

## 🎨 Padrão de código

- **Linguagem:** TypeScript estrito — sem `any` implícito
- **Estilo:** Tailwind CSS com utilitário `cn()` (clsx + tailwind-merge) para composição de classes
- **Variantes:** `class-variance-authority` (CVA) para componentes com múltiplas variantes
- **Lint:** ESLint com `eslint-config-next`
- **Componentes:** funcionais com hooks — sem class components
- **Código em inglês**, comentários, mensagens de UI e erros em pt-BR

---

## 🔒 Regras de arquitetura

| Regra | Motivação |
|---|---|
| Toda chamada HTTP passa por `src/services/` | Centraliza autenticação, error handling e tipagem dos contratos de API |
| Autenticação JWT gerenciada em `src/services/auth.ts` | `isTokenExpired()` antes de cada request sensível previne 401 em cascata |
| Hooks de página nunca importam diretamente `fetch` | `src/lib/api-headers.ts` garante que todos os requests usem o mesmo bearer token |
| Componentes de domínio nunca chamam serviços diretamente | Chamadas de API ficam nos hooks; componentes recebem dados como props ou via hook |
| Estado de autenticação no `localStorage` — sem cookie HTTP-only | Decisão de frontend-only; o backend valida o JWT em todo request |
| Imagens de qualquer origem permitidas no `next.config` | Capas de livros e avatares vêm de Cloudinary, Google Books e outras CDNs externas |
| `cn()` obrigatório para composição de classes — nunca template strings | Previne conflitos de classes Tailwind e garante precedência correta |
| Sem Redux / Context para estado global | Estado de cada feature é isolado nos hooks de domínio; escalável sem overhead de boilerplate |

---

## 📦 Tecnologias e dependências

| Categoria | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | 16 |
| UI | React + React DOM | 19 |
| Linguagem | TypeScript | 5 |
| Estilização | Tailwind CSS + tailwindcss-animate | 3 |
| Componentes acessíveis | Radix UI (Avatar, Slot) | 1.x |
| Variantes de componentes | class-variance-authority (CVA) | 0.7.x |
| Composição de classes | clsx + tailwind-merge | 2.x / 3.x |
| Animações | Framer Motion | 11 |
| Ícones | Lucide React | 1.x |
| WebSocket / STOMP | @stomp/stompjs + sockjs-client | 7.x / 1.x |
| SSE (Assistente Bibo) | @microsoft/fetch-event-source | 2.x |
| Google OAuth | @react-oauth/google | 0.13.x |
| Testes | Vitest + Testing Library (React + jest-dom) | 4.x / 16.x |
| Cobertura | @vitest/coverage-v8 | 4.x |
| DOM simulado | jsdom | 29.x |
| Lint | ESLint + eslint-config-next | 9 |

---

<div align="center">
  <img width="70%" alt="pucminas" src="../../docs/imagens/banner-institucional.svg"/>
</div>
<p align="center">Fonte do banner: <a href="https://github.com/joaopauloaramuni">João Paulo Carneiro Aramuni</a></p>

---
