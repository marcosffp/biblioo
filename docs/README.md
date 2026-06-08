# Biblioo

**Bernardo Souza Alvim, bernardo.alvim@sga.pucminas.br**

**Carlos José Gomes Batista Figueiredo, carlos.figueiredo.1507022@sga.pucminas.br**

**Gabriela Alvarenga Cardoso, gabriela.cardoso.1026227@sga.pucminas.br**

**Marcos Alberto Ferreira Pinto, mafpinto@sga.pucminas.br**

**Mateus Araujo Santos, mateus.santos.1487920@sga.pucminas.br**

**Rafael Ganascini de Moura, rafael.ganascini@sga.pucminas.br**

---

Professores:

Cleiton Silva Tavares

Cristiano de Macêdo Neto

João Paulo Carneiro Aramuni

---

_Curso de Engenharia de Software, Campus Lourdes_

_Instituto de Informática e Ciências Exatas – Pontifícia Universidade Católica de Minas Gerais (PUC MINAS), Belo Horizonte – MG – Brasil_

---

_**Resumo**. O Biblioo é uma plataforma de comunidade literária web e mobile desenvolvida para leitores ativos brasileiros. O sistema resolve a fragmentação das experiências digitais de leitura ao reunir em um único ambiente: organização de estantes personalizadas com rastreamento de progresso, feed social com posts e reviews, comunidades com chat em tempo real via WebSocket, seis algoritmos independentes de recomendação personalizada — combinando grafo de relacionamentos (Neo4j), filtragem colaborativa, aprendizado bayesiano (Thompson Sampling) e repetição espaçada —, DNA Literário com arquétipo e perfil de leitura do usuário, notificações em tempo real e o assistente conversacional Bibo, integrado ao Google Gemini, capaz de executar ações diretamente na plataforma. A arquitetura segue o estilo Hexagonal em um monólito modular com 11 domínios, implantado em dois ambientes no Google Cloud Run com pipeline CI/CD automatizado. Uma suíte de 72 testes de performance (K6) validou os requisitos não funcionais definidos — nenhuma falha funcional foi registrada em toda a carga de testes, com throughput máximo de 1 538 req/s e latência p95 de 11 ms para o chat em tempo real._

---

## SUMÁRIO

1. [Apresentação](1.apresentacao.md#apresentacao "Apresentação")
   - 1.1. Problema
   - 1.2. Objetivos do trabalho
   - 1.3. Definições e Abreviaturas

2. [Nosso Produto](2.nosso_produto.md#produto "Nosso Produto")
   - 2.1. Visão do Produto
   - 2.2. É / Não É · Faz / Não Faz
   - 2.3. Personas

3. [Requisitos](3.requisitos.md#requisitos "Requisitos")
   - 3.1. Requisitos Funcionais (RF-01 a RF-40)
   - 3.2. Requisitos Não Funcionais (RNF-01 a RNF-22)
   - 3.3. Restrições Arquiteturais
   - 3.4. Mecanismos Arquiteturais

4. [Modelagem](4.modelagem.md#modelagem "Modelagem e Projeto Arquitetural")
   - 4.1. Histórias de Usuário
   - 4.2. Visão Lógica
   - 4.3. Modelo de Dados

5. [Wireframes](5.wireframe.md#wireframes "Wireframes")
   - Web: Login, Feed, Estante, Coleção, Comunidades, Perfil, Recomendação
   - Mobile: Login, Feed, Estante, Comunidade, Perfil, Recomendação, Chat

6. [Projeto da Solução](6.solucao.md#solucao "Projeto da Solução")

7. [Avaliação da Arquitetura](7.avaliacao.md#avaliacao "Avaliação da Arquitetura")
   - 7.1. Cenários
   - 7.2. Avaliação (ATAM — 5 cenários com dados de testes K6)
   - 7.3. Avaliação Geral da Arquitetura

---

<a name="ferramentas"></a>
## Ferramentas e Ambientes

| Ambiente | Plataforma | Link de Acesso |
|---|---|---|
| Repositório de código (privado) | GitHub — organização PUC Minas | https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-1-ti5-0492100-biblioo |
| Repositório público (espelho CI/CD) | GitHub | https://github.com/marcosffp/biblioo |
| Backend — ambiente portfolio | Google Cloud Run | https://biblioo-portfolio-595140312227.us-central1.run.app |
| Backend — ambiente produção | Google Cloud Run | https://biblioo-producao-595140312227.us-central1.run.app |
| Documentação interativa da API | Swagger UI (via backend) | https://biblioo-producao-595140312227.us-central1.run.app/swagger-ui.html |
| Wireframes interativos | Figma | — |
| Schemas do banco de dados | Repositório (`docs/schema/`) | `biblioo.dbml` · `biblioo.components.puml` |
| Wireframes estáticos | Repositório (`docs/wireframe/`) | `web/` · `mobile/` |
| Atas de reunião | Repositório (`assets/atas/`) | ATA-2026-03-17 · ATA-2026-04-26 · ATA-2026-05-29 |
