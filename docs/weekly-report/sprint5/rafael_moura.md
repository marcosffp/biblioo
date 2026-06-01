# Relatório Semanal

## Semana 1 (27/04/2026 - 03/05/2026)

### O que foi feito:

- Implementei a autenticação com Google OAuth no backend, com validação de token via `google-api-client`.
- Desenvolvi os componentes `GoogleTokenVerifierAdapter` e `GoogleUserFactory` para suportar o fluxo de login social.
- Criei o endpoint `POST /auth/google` para autenticação de usuários via Google e adicionei tratamento de erro específico (`GoogleAuthException`).

### Links dos Pull Requests:
- [PR #148](https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-1-ti5-0492100-biblioo/pull/148)


## Semana 2 (04/05/2026 - 10/05/2026)

### O que foi feito:

- Implementei o assistente de IA "Bibo" no backend, seguindo a arquitetura hexagonal: serviço de domínio (`AssistantService`), ports de saída e adapters de infraestrutura.
- Desenvolvi o `AssistantController` e o fluxo de chat, com rate limiting e histórico de conversas.
- Implementei a persistência e o gerenciamento de conversas, com armazenamento do histórico em Redis (`RedisConversationHistoryAdapter`) e logging das ações do assistente.
- Criei o conjunto de ferramentas do assistente (`BiboTools`) integrando livros, coleções, comunidades, DNA literário e estante do usuário por meio de adapters dedicados.

### Links dos Pull Requests:
- [PR #225](https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-1-ti5-0492100-biblioo/pull/225)


## Semana 3 (11/05/2026 - 17/05/2026)

### O que foi feito:

- Bloqueei o login com Google quando o e-mail já está cadastrado com senha, evitando conflito entre os métodos de autenticação.
- Reforcei a resiliência e o comportamento anti-alucinação do assistente Bibo.
- Adicionei a ferramenta `listShelfItems` ao assistente, com composição alinhada ao padrão de ports.
- Corrigi uma violação arquitetural no `UserService`, ajustando os ports de persistência.
- Iniciei os testes de carga do backend, atualizando as configurações de load, spike e stress dos cenários de usuário e feed.

### Links dos Pull Requests:
- [PR #235](https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-1-ti5-0492100-biblioo/pull/235)
- [PR #237](https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-1-ti5-0492100-biblioo/pull/237)


## Semana 4 (18/05/2026 - 24/05/2026)

### O que foi feito:

- Dei continuidade aos testes de carga do backend, desenvolvendo scripts de performance para as interações de mensagens e comentários.
- Realizei a integração da branch de frontend da sprint no `dev`.

### Links dos Pull Requests:
- [PR #242](https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-1-ti5-0492100-biblioo/pull/242)


## Semana 5 (25/05/2026 - 31/05/2026)

### O que foi feito:

- Ampliei a cobertura de testes de performance (load, spike e stress) para interações de usuário, feed, comunidades e estante, executando os cenários com k6.
- Consolidei os relatórios de performance por domínio (`DomainUser`, `DomainFeed`, `DomainCommunity`) e o relatório geral do backend.
- Reorganizei a estrutura dos arquivos de testes de performance, removendo relatórios antigos e padronizando a documentação.
- Corrigi e estabilizei a suíte de testes do backend.
- Corrigi bugs e reforcei os guardrails do assistente Bibo.

### Links dos Pull Requests:
- [PR #249](https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-1-ti5-0492100-biblioo/pull/249)
- [PR #263](https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-1-ti5-0492100-biblioo/pull/263)
- [PR #266](https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-1-ti5-0492100-biblioo/pull/266)
