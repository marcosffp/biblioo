# Atas de Reunião — Biblioo

Registro das reuniões de acompanhamento do projeto, organizadas em ordem cronológica.

---

## Atas registradas

| Arquivo | Data | Pauta principal | Secretário |
|---|---|---|---|
| [ATA-2026-03-17.md](./ATA-2026-03-17.md) | 17/03/2026 | Revisão da Sprint 2 · Planejamento da Sprint 3 | Gabriela Alvarenga Cardoso |
| [ATA-2026-04-26.md](./ATA-2026-04-26.md) | 26/04/2026 | Revisão da Sprint 4 · Planejamento da Sprint 5 | Mateus Araújo Santos |
| [ATA-2026-05-29.md](./ATA-2026-05-29.md) | 29/05/2026 | Revisão da Sprint 5 · Alinhamento das próximas atividades | Marcos Alberto Ferreira Pinto |
| [ATA-2026-06-25.md](./ATA-2026-06-25.md) | 25/06/2026 | Revisão da Sprint 6 · Deploy e encerramento do projeto | Marcos Alberto Ferreira Pinto |

---

## Resumo por reunião

### 17/03/2026 — Sprint 2 → Sprint 3

**Participantes:** Bernardo Alvim · Carlos Figueiredo · Gabriela Cardoso · Marcos Pinto · Mateus Santos · Rafael Moura

Revisão dos artefatos da Sprint 2 (requisitos, modelagem, arquitetura e correções solicitadas pelo professor) e planejamento da Sprint 3 com distribuição de responsabilidades:

| Responsável | Entrega |
|---|---|
| Bernardo Souza Alvim | Atualização do modelo relacional e criação de schemas (.dbml / .puml) |
| Gabriela Alvarenga Cardoso | Histórias de usuário corrigidas após feedback do professor |
| Carlos José Figueiredo | TAP e organização dos requisitos no documento do projeto |
| Marcos Alberto Pinto | Modelagem arquitetural e descrição dos componentes do sistema |
| Mateus Araújo Santos | Organização da apresentação e revisão de documentos |
| Rafael Ganascini de Moura | Diagramas de classes e apoio à modelagem |

---

### 26/04/2026 — Sprint 4 → Sprint 5

**Participantes:** Bernardo Alvim · Carlos Figueiredo · Gabriela Cardoso · Marcos Pinto · Mateus Santos · Rafael Moura

Apresentação das entregas da Sprint 4 e alinhamento das próximas prioridades:

| Responsável | Entrega |
|---|---|
| Bernardo Souza Alvim | Módulo de comunidade (chat, convites, detalhes), notificações, ajustes de perfil e autenticação |
| Carlos José Figueiredo | Front-end: mensagens de comunidade, melhorias de layout; post no feed em andamento |
| Gabriela Alvarenga Cardoso | Front-end: chat, criação/edição de comunidade, seleção de livros, melhorias em perfil e estante |
| Marcos Alberto Pinto | Back-end: recomendações, cache de feed com Redis, WebSocket, publicação de reviews, trending e testes de performance |
| Mateus Araújo Santos | Mobile: estantes, coleções, estatísticas, busca de livros, post no feed e reviews |
| Rafael Ganascini de Moura | Back-end: login Google, gerenciamento de usuários/seguidores, notificações RabbitMQ/Firebase, Cloudinary e testes de performance |

**Pendência registrada:** revisão geral do feed (mobile, front e back) — responsabilidade de toda a equipe.

---

### 25/06/2026 — Sprint 6 → Encerramento

**Participantes:** Bernardo Alvim · Carlos Figueiredo · Gabriela Cardoso · Marcos Pinto · Mateus Santos · Rafael Moura

Revisão das entregas da Sprint 6 e alinhamento final. Ciclo completo de 40 RFs concluídos:

| Responsável | Entrega |
|---|---|
| Bernardo Souza Alvim · Mateus Araújo Santos | Importação da biblioteca do Goodreads via CSV (RF-38) |
| Gabriela Alvarenga Cardoso · Carlos José Figueiredo | Refinamento de funcionalidades de comunidade (chat, convites, votação) |
| Rafael Ganascini de Moura · Mateus Araújo Santos | Refinamento de funcionalidades de perfil (DNA Literário, seguidores, privacidade) |
| Marcos Alberto Pinto | Atualização completa da documentação (requisitos, modelagem, avaliação, ATAM, solução) |
| Marcos Alberto Pinto · Rafael Ganascini de Moura | Deploy do backend em Google Cloud Run (portfolio + produção) |
| Bernardo Souza Alvim · Carlos José Figueiredo | Deploy do frontend web na Vercel |

Não foram registradas pendências. Todos os 40 RFs e 19 RNFs foram implementados e documentados.

---

### 29/05/2026 — Sprint 5 → Próximas atividades

**Participantes:** Marcos Alberto Feirreira Pinto

Revisão das entregas da Sprint 5 e alinhamento das próximas implementações:

| Responsável | Entrega |
|---|---|
| Marcos Alberto Pinto | Sistema de recomendações e personalização · Funcionalidades de DNA Literário e eventos |
| Rafael Ganascini de Moura | Autenticação Google · Assistente Bibo (criação de estantes, consultas, operações na plataforma) · Preferências de usuário · Sistema de notificações |
| Gabriela Alvarenga Cardoso | Compartilhamento em redes sociais · Sistema de votação em comunidades |
| Carlos José Figueiredo | Melhorias no feed (interface, exibição e experiência de navegação) |
| Mateus Araújo Santos | Correções e evoluções da aplicação mobile (estabilidade, usabilidade e desempenho) |

Não foram registradas pendências. Destaques: avanço significativo nas funcionalidades de personalização e recomendação; assistente Bibo passou a executar operações diretamente na plataforma.

---

## Template

O arquivo [ATA-YYYY-MM-DD.md](./ATA-YYYY-MM-DD.md) contém o template padrão para novas atas. Copie-o, renomeie com a data real e preencha as seções.
