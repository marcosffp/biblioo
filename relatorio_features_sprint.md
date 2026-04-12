# Relatório de Implementação: Estantes e Coleções (Mobile & Backend)

Este documento detalha todas as integrações de funcionalidades, criação de fluxos entre o backend e o mobile, além dos ajustes de arquitetura realizados para estabilizar aa arquitetura do projeto Biblioo durante o desenvolvimento da Fase 1 (Estantes) e Fase 2 (Coleções).

---

## 1. Módulos e Funcionalidades Integradas Fim-a-Fim

### 1.1 Funcionalidade: Estantes (Shelves)
A feature de Estantes permite que o usuário organize seus livros em contêineres lógicos (ex: "Lidos", "Favoritos"). Finalizamos todo o ciclo de comunicação do App com o Backend.

*   **Listagem e Visualização:**
    *   **Mobile:** Implementação da tela `ShelfListScreen` que consome o estado `ShelfLoaded` do `ShelfBloc`. Exibe cards estilizados (`ShelfCard`) contendo as prévias de capa (Cover Previews) retornadas pela API.
    *   **Integração:** Requisição `GET /shelves` perfeitamente roteada e tipada pelo modelo Dart `ShelfModel`.
*   **Gerenciamento Interno de Livros (Shelf Items):**
    *   **Mobile:** Criação da tela `ShelfDetailScreenContent` onde o estado passa a ser `ShelfItemsLoaded`. Retorna os livros específicos populando `ShelfItemCard`s.
    *   **Integração:** Consumo de `GET /shelves/{shelfId}/items` (leitura), `POST /shelves/{shelfId}/items` (Adição de livros via busca OpenSearch) e `DELETE` para remoção.
*   **Mutação de Dados da Estante:**
    *   Integração nativa no App para Criar e Deletar estantes consumindo `/shelves` (POST, DELETE) e notificando a renderização visual via instâncias de `ShelfMutationSuccess`.

### 1.2 Funcionalidade: Coleções (Collections)
As coleções agregam diversas estantes do usuário. Por não existir um escopo/wireframe anterior duro para o design mobile, as interfaces foram construídas baseadas fielmente no esquema flexível `new_style.dart`.

*   **Listagem Integrada e Visualização:**
    *   **Mobile:** Implementação via Slivers integrando as "Minhas Coleções" diretamente na View principal de Shelves. O `CollectionBloc` fornece o estado das coleções (`CollectionLoaded`) para renderizar os `CollectionCard`s.
    *   **Integração:** O `GET /collections` foi integrado no DataSource móvel.
*   **Associação Dinâmica (Estante $\leftrightarrow$ Coleção):**
    *   **Mobile:** Criação de tela dedicada (`CollectionDetailScreen`) permitindo a adição e visualização local de quais estantes pertencem à uma dada Coleção.
    *   **Integração Funcional:** Interface robusta mapeando o request `PATCH /collections/{collectionId}/shelves` para plugar uma Estante em uma Coleção, e `DELETE` respectivo para desvincular.

---

## 2. Ajustes Arquiteturais e Correções Base no Backend (Spring Boot)

Com o envio das novas implementações de integração do mobile para os endpoints, algumas camadas profundas do mapeamento do Backend demandaram estabilizações para comportar os Casos de Uso.

1.  **Refatoração do OpenSearch (Autocomplete Matching)**
    *   **Motivação:** A pesquisa parcial no App (ex.: procurer por "Peq") na funcionalidade de "Adicionar Livro à Estante" falhava ao varrer o catálogo para preencher a Shelf.
    *   **Ação:** O `OpenSearchBookAdapter` foi convertido. Substituímos lógicas engessadas baseadas em `fuzziness(AUTO)` inteiriça pelo modo `TextQueryType.PhrasePrefix`, permitindo pesquisas sofisticadas de sufixo e prefixo sem quebrar as chamadas móveis.
2.  **Solução do Serviço Assíncrono de Coleções (Bug API 500)**
    *   **Motivação:** Ao o app disparar o evento `PATCH /collections/.../shelves`, o payload batia na API e estourava Erro 500 Interno devido ao service `@Async("collectionExecutor")` não possuir injeção no contexto do Spring.
    *   **Ação:** Criação do Bean gerenciador de contêineres na camada `AsyncConfig.java` reestabelecendo a segurança da arquitetura sem impactar a Thread Principal.
3.  **Correção de Condições de Corrida de Cache (Race Condition)**
    *   **Motivação:** O processo paralelo do Spring devolvia o Payload da coleção para o App FLutter _antes_ da estante ter sido devidamente gravada no MySQL e expurgada do REDIS, devolvendo objetos desatualizados localmente.
    *   **Ação:** Adição bloqueante com `.join()` forçando a responsabilidade atômica no `CollectionService.java`, unificando Gravação -> Recuperação -> Resposta UI na controller primária em uma timeline contínua.
4.  **Mapeamentos de DTO MapStruct**
    *   **Motivação:** O App Mobile requisitava a leitura da string de descrição das entidades de domínios preexistentes no banco, porém a rede as deserdava do JSON.
    *   **Ação:** Mapeada as Strings `description` rigidamente em `CollectionSummaryResponse` e `ShelfSummaryResponse`, acionando Code Gen para transpilar em endpoints ativos.

---

## 3. Estabilização e Solidez no Frontend (Flutter / BLoC)

O tráfego de dados e transição de estado da Interface Gráfica e Camada lógica também sofreram refinamentos sistêmicos exigindo robustez contra os fluxos implementados pela Fase 1 e 2.

1.  **Proteção contra Deadlocks de Estado (BLoc Routing)**
    *   **Problema:** Um conflito entre Visualização de Estantes e Visualização de Coleções mantinha o State Machine Preso ('Loading Infinito' no `CollectionDetailScreen`).
    *   **Estruturação:** Convertidos componentes visuais em Entidades Inteligentes (`StatefulWidget`) para realizar o `watch` agressivo nos blocos vizinhos, impondo um Reload (`ShelfLoadRequested`) unicamente para quebrar o estado cativo no gerenciador de dados. O tratamento previne também Loops frente a TimeOuts do backend renderizando falha explícita via `ShelfError`.
2.  **Escudos de Autenticação Segura de Redes (Dio Interceptor)**
    *   **Estruturação:** Adicionado validações cirúrgicas de descarte e LogOut nativo no `/auth/refresh` impedindo estouro de limites e *Infinite Callbacks* provenientes da expiração do JWT ao ligar as rotas novas de estantes na aplicação.
3.  **Segurança Layout e Tratadores Restritivos**
    *   *FittedBox* de limites de RenderFlex adicionados escalavelmente nos textos dinâmicos elásticos da camada de TopBar para prover transições visuais graciosas.

**Status Final:** Funcionalidades 100% integradas cobrindo desde a renderização nativa de tela do Device aos disparos e transações de banco de dados do Backend. Todo o fluxo CRUD obedece às normas mapeadas do `planejamento_fim_de_semana.md`.
