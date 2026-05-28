# Observações — DomainBook

> **Data:** 2026-05-28

---

## Book (busca e detalhes de livros)

### Pontos positivos
- Latências excepcionalmente baixas para operações de leitura: p(95) de apenas **32.51ms** no load com 100 VUs e **18.6ms** no stress com 400 VUs, indicando cache eficiente ou consultas bem indexadas na integração com a API externa (Google Books / banco local).
- Spike de 300 VUs com p(95) de **8.42ms** — o melhor resultado absoluto entre todos os subdomínios. O endpoint de busca de livros aguenta picos muito bem.
- Nenhuma falha em nenhum dos três tipos de teste (0% de taxa de erro).

### Pontos de atenção
- No load test, um request atingiu **3.68s** de tempo máximo (max), desviando bastante da mediana de 12ms. Provavelmente é um cold start de JVM ou GC pause. Não afetou o p(95), mas vale monitorar em produção.
- O cenário `search` (80 VUs) tem latência ~4× maior que `details` (20 VUs) em média: 26.94ms vs 6.66ms. Isso sugere que a busca textual é mais custosa que a busca por ID — esperado, mas confirma que o endpoint de search merece índice dedicado.

---

## Collection (coleções do usuário)

### Pontos positivos
- CRUD completo com 150 VUs em load test: todos os 12 checks passaram com 0 falhas e p(95) de 22.29ms — excelente desempenho para operações de escrita.
- Suporta 500 VUs em spike sem nenhuma falha, com p(95) de 241.76ms — bem dentro do threshold de 2500ms.

### Pontos de atenção
- **Alto volume de séries temporais únicas:** o stress test gerou **800.053 séries** (8× o limite sugerido de 100.000). Isso ocorre porque os IDs de collection e shelf são usados como tags de URL, gerando uma série por ID. Em produção isso não é um problema de performance, mas indica que os testes de stress poderiam usar URL grouping (`name` tag) para reduzir o overhead do k6 em si.
- No stress test com 600 VUs, a latência máxima chega a **1.81s** e o p(95) a **309.26ms** — ainda dentro do threshold, mas mostra que o CRUD de collections começa a pressionar o banco com muita concorrência de escrita.
- A duração real do stress (4m39.8s) ultrapassou o planejado (4m) porque o `gracefulStop` de 30s foi acionado para finalizar as iterações em andamento.

---

## Shelf (estantes)

### Pontos positivos
- Load test com CRUD completo de shelf (create, get, update, delete) mais listagem simultânea: 0 falhas, p(95) de 44.66ms com 210 VUs.
- O subdomínio de shelf apresentou o **maior throughput no spike**: 716.6 req/s com 500 VUs — melhor que collection e shelfItem no mesmo tipo de teste.

### Pontos de atenção
- O p(95) de shelf é o maior entre os subdomínios de Book no load test (44.66ms vs 22.29ms de collection e 27.75ms de shelfItem). O fluxo de CRUD de shelf envolve mais etapas (register + login + create + list + get + update + delete), o que eleva o tempo médio de iteração.
- No stress test com 600 VUs, a latência máxima de **516.23ms** sugere contenção de banco em operações de escrita concorrente (create + delete simultâneos de muitos VUs).
- Os testes de shelf geraram **400.369 séries temporais**, o que representa consumo significativo de memória do k6 durante o stress.

---

## ShelfItem (itens nas estantes)

### Pontos positivos
- O fluxo mais completo do DomainBook (11 checks: register, login, setup shelf, CRUD de itens, update progress, change status, remove) — todos aprovados com 0 falhas no load test.
- A operação de listagem isolada (`listing`, 60 VUs) tem p(95) baixíssimo: **13.79ms**, mostrando que a leitura de itens de estante é bem otimizada.

### Pontos de atenção
- **ShelfItem spike: p(95) de 238.08ms** com média de 123.48ms e mediana de 145.51ms. É o subdomínio com maior latência relativa no spike, indicando que as operações de escrita (add item, update progress) são mais custosas sob carga concentrada.
- No stress com 600 VUs, o p(95) chegou a **337.32ms** e o máximo a **1.24s** — o threshold foi generosamente definido em 3000ms, o que permite aprovar, mas a tendência de latência sob carga máxima merece monitoramento.
- A mediana do spike (145.51ms) é maior que a média (123.48ms) no spike test, o que é incomum e sugere distribuição bimodal: um grupo de requests rápidos (cold cache) e outro mais lento (hot write path com contenção).

---

## Observações Transversais

1. **Alto uso de séries temporais no k6:** Todos os testes de collection e shelf geraram warnings de séries únicas acima do limite de 100.000. A causa é o uso de IDs de recursos como parte da URL sem agrupamento. Solução: adicionar `{ tags: { name: '/collections/:id' } }` nas chamadas HTTP para agrupar as métricas.

2. **Picos de latência máxima isolados:** Em vários testes, a latência máxima (`max`) foi muito superior ao p(95), indicando outliers pontuais (GC pause, lock de banco, etc.) que não afetam o desempenho percentil mas podem afetar usuários individualmente. Vale configurar alertas em produção para latência acima de 500ms.

3. **Zero falhas em todos os 12 testes:** Resultado positivo — o DomainBook demonstra estabilidade funcional completa sob carga até 600 VUs simultâneos.
