<img width="1600" style="height:auto; border-radius: 12px;" alt="banner" src="../../../docs/imagens/banner.png" />

# Testes de Performance — Biblioo Backend

> Suíte k6 para avaliação de requisitos não funcionais do backend Biblioo.
> 8 domínios · 71 testes · 3 perfis por subdomínio (load / spike / stress) · **71/71 aprovados**.

---

## Navegação rápida

- [Estrutura da pasta](#estrutura-da-pasta)
- [Domínios e scripts](#domínios-e-scripts)
- [Evidências](#evidências)
- [Documentação](#documentação)
- [Como executar](#como-executar)
- [Problemas conhecidos](#problemas-conhecidos)

---

## Estrutura da pasta

```
performance-tests/
├── README.md                              ← este arquivo (mapa de navegação)
│
├── docs/
│   ├── DOCUMENTO-AVALIACAO-PERFORMANCE.md  ← avaliação formal com evidências load
│   └── RELATORIO-GERAL.md                  ← todos os 71 testes com evidências load/spike/stress
│
├── DomainBook/
│   ├── RELATORIO-DOMAINBOOK.md
│   ├── OBSERVACOES.md
│   ├── book/
│   ├── collection/
│   ├── shelf/
│   └── shelfItem/
│
├── DomainCommunity/
│   ├── RELATORIO-DOMAINCOMMUNITY.md
│   ├── OBSERVACOES.md
│   ├── community/
│   ├── admin/
│   ├── message/
│   ├── messageRest/
│   └── voting/
│
├── DomainDna/
│   ├── RELATORIO-DOMAINDNA.md
│   ├── OBSERVACOES.md
│   └── dna/
│
├── DomainFeed/
│   ├── RELATORIO-DOMAINFEED.md
│   ├── OBSERVACOES.md
│   ├── feed/
│   ├── post/
│   ├── comment/
│   ├── commentInteraction/
│   └── review/
│
├── DomainRecommendation/
│   ├── RELATORIO-DOMAINRECOMMENDATION.md
│   ├── OBSERVACOES.md
│   ├── recommendation/
│   └── roll-dice/
│
├── DomainShare/
│   ├── RELATORIO-DOMAINSHARE.md
│   ├── OBSERVACOES.md
│   └── shareCard/
│
├── DomainTrending/
│   ├── RELATORIO-DOMAINTRENDING.md
│   ├── OBSERVACOES.md
│   └── trending/
│
├── DomainUser/
│   ├── RELATORIO-DOMAINUSER.md
│   ├── OBSERVACOES.md
│   ├── user/
│   └── social/
│
└── evidencias/
    ├── load/     ← prints dos testes de carga (um por subdomínio)
    ├── spike/    ← prints dos testes de pico
    └── stress/   ← prints dos testes de stress
```

---

## Domínios e scripts

### DomainBook

| Subdomínio | Scripts |
|------------|---------|
| book | `book/books-load.js` · `books-spike.js` · `books-stress.js` |
| collection | `collection/collection-load.js` · `collection-spike.js` · `collection-stress.js` |
| shelf | `shelf/shelf-load.js` · `shelf-spike.js` · `shelf-stress.js` |
| shelfItem | `shelfItem/shelfItem-load.js` · `shelfItem-spike.js` · `shelfItem-stress.js` |

Relatório: [`DomainBook/RELATORIO-DOMAINBOOK.md`](DomainBook/RELATORIO-DOMAINBOOK.md) · Observações: [`DomainBook/OBSERVACOES.md`](DomainBook/OBSERVACOES.md)

---

### DomainCommunity

| Subdomínio | Scripts |
|------------|---------|
| community | `community/community-load.js` · `community-spike.js` · `community-stress.js` |
| community-invites | `community/community-invites-load.js` · `community-invites-stress.js` |
| community-join-requests | `community/community-join-requests-load.js` · `community-join-requests-stress.js` |
| admin | `admin/admin-load.js` · `admin-spike.js` · `admin-stress.js` |
| message (WS/STOMP) | `message/message-concurrency.js` · `message-load.js` · `message-spike.js` · `message-stress.js` |
| messageRest | `messageRest/messageRest-load.js` · `messageRest-spike.js` · `messageRest-stress.js` |
| voting | `voting/voting-load.js` · `voting-spike.js` · `voting-stress.js` |

Relatório: [`DomainCommunity/RELATORIO-DOMAINCOMMUNITY.md`](DomainCommunity/RELATORIO-DOMAINCOMMUNITY.md) · Observações: [`DomainCommunity/OBSERVACOES.md`](DomainCommunity/OBSERVACOES.md)

---

### DomainDna

| Subdomínio | Scripts |
|------------|---------|
| dna | `dna/dna-load.js` · `dna-spike.js` · `dna-stress.js` |

Relatório: [`DomainDna/RELATORIO-DOMAINDNA.md`](DomainDna/RELATORIO-DOMAINDNA.md) · Observações: [`DomainDna/OBSERVACOES.md`](DomainDna/OBSERVACOES.md)

---

### DomainFeed

| Subdomínio | Scripts |
|------------|---------|
| feed | `feed/feed-load.js` · `feed-spike.js` · `feed-stress.js` |
| post | `post/post-load.js` · `post-spike.js` · `post-stress.js` |
| comment | `comment/comment-load.js` · `comment-spike.js` · `comment-stress.js` |
| commentInteraction | `commentInteraction/commentInteraction-load.js` · `commentInteraction-spike.js` · `commentInteraction-stress.js` |
| review | `review/review-load.js` · `review-spike.js` · `review-stress.js` |

Relatório: [`DomainFeed/RELATORIO-DOMAINFEED.md`](DomainFeed/RELATORIO-DOMAINFEED.md) · Observações: [`DomainFeed/OBSERVACOES.md`](DomainFeed/OBSERVACOES.md)

---

### DomainRecommendation

| Subdomínio | Scripts |
|------------|---------|
| recommendation | `recommendation/recommendation-load.js` · `recommendation-spike.js` · `recommendation-stress.js` |
| roll-dice | `roll-dice/roll-dice-load.js` · `roll-dice-spike.js` · `roll-dice-stress.js` |

Relatório: [`DomainRecommendation/RELATORIO-DOMAINRECOMMENDATION.md`](DomainRecommendation/RELATORIO-DOMAINRECOMMENDATION.md) · Observações: [`DomainRecommendation/OBSERVACOES.md`](DomainRecommendation/OBSERVACOES.md)

---

### DomainShare

| Subdomínio | Scripts |
|------------|---------|
| shareCard | `shareCard/shareCard-load.js` · `shareCard-spike.js` · `shareCard-stress.js` |

Relatório: [`DomainShare/RELATORIO-DOMAINSHARE.md`](DomainShare/RELATORIO-DOMAINSHARE.md) · Observações: [`DomainShare/OBSERVACOES.md`](DomainShare/OBSERVACOES.md)

---

### DomainTrending

| Subdomínio | Scripts |
|------------|---------|
| trending | `trending/trending-load.js` · `trending-spike.js` · `trending-stress.js` |

Relatório: [`DomainTrending/RELATORIO-DOMAINTRENDING.md`](DomainTrending/RELATORIO-DOMAINTRENDING.md) · Observações: [`DomainTrending/OBSERVACOES.md`](DomainTrending/OBSERVACOES.md)

---

### DomainUser

| Subdomínio | Scripts |
|------------|---------|
| user | `user/user-load.js` · `user-spike.js` · `user-stress.js` |
| social (público) | `social/social-load.js` · `social-spike.js` · `social-stress.js` |
| social-requests (privado) | `social/social-requests-load.js` · `social-requests-spike.js` · `social-requests-stress.js` |

Relatório: [`DomainUser/RELATORIO-DOMAINUSER.md`](DomainUser/RELATORIO-DOMAINUSER.md) · Observações: [`DomainUser/OBSERVACOES.md`](DomainUser/OBSERVACOES.md)

---

## Evidências

Os prints de execução do k6 estão organizados por tipo de teste:

| Pasta | Conteúdo |
|-------|----------|
| `evidencias/load/` | Um print por subdomínio — saída-resumo do k6 (THRESHOLDS + TOTAL RESULTS) |
| `evidencias/spike/` | Prints dos testes de pico |
| `evidencias/stress/` | Prints dos testes de stress |

As evidências são referenciadas nos relatórios de cada domínio e no [`docs/RELATORIO-GERAL.md`](docs/RELATORIO-GERAL.md).

---

## Documentação

| Arquivo | Quando ler |
|---------|-----------|
| [`docs/DOCUMENTO-AVALIACAO-PERFORMANCE.md`](docs/DOCUMENTO-AVALIACAO-PERFORMANCE.md) | Ponto de entrada para avaliadores — evidências visuais dos load tests, análise por domínio |
| [`docs/RELATORIO-GERAL.md`](docs/RELATORIO-GERAL.md) | Consolidação de todos os 71 testes com evidências load/spike/stress e links para cada domínio |
| `DomainXxx/RELATORIO-DomainXxx.md` | Métricas detalhadas (requests, throughput, p95, checks, falhas) por subdomínio e teste |
| `DomainXxx/OBSERVACOES.md` | Análise técnica: comportamentos não óbvios, gargalos, race conditions, decisões de design dos scripts |

**Ordem de leitura sugerida:**
1. [`docs/DOCUMENTO-AVALIACAO-PERFORMANCE.md`](docs/DOCUMENTO-AVALIACAO-PERFORMANCE.md) — visão geral com evidências
2. [`docs/RELATORIO-GERAL.md`](docs/RELATORIO-GERAL.md) — números completos de todos os 71 testes
3. `DomainXxx/RELATORIO-DomainXxx.md` + `DomainXxx/OBSERVACOES.md` — aprofundamento por domínio

---

## Como executar

### Pré-requisitos

```bash
brew install k6          # macOS
k6 version               # testado com k6 v1.7.1
```

O backend deve estar rodando em `http://localhost:8080`. Ver `code/back/README.md` para instruções de setup.

### Executar um teste

```bash
# A partir de code/back/
k6 run performance-tests/DomainBook/book/books-load.js

# A partir de performance-tests/
k6 run DomainUser/user/user-load.js
k6 run DomainCommunity/voting/voting-stress.js
k6 run DomainCommunity/message/message-concurrency.js
k6 run DomainRecommendation/recommendation/recommendation-load.js
```

### Gerar evidência com freeze

```bash
# Instalar freeze (charmbracelet)
brew install charmbracelet/tap/freeze

# A partir de code/back/
freeze --execute "k6 run --quiet --log-output=none performance-tests/DomainUser/user/user-load.js" \
  -o performance-tests/evidencias/load/DomainUser-user-load.png \
  --window --padding 30 --shadow.blur 20 --execute.timeout 8m
```

---

<div align="center">
  <img width="70%" alt="pucminas" src="../../../docs/imagens/banner-institucional.svg"/>
</div>
<p align="center">Fonte do banner: <a href="https://github.com/joaopauloaramuni">João Paulo Carneiro Aramuni</a></p>

---
