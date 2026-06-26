# Observações — DomainBook

> **Data:** 2026-06-24

---

## Book (busca e detalhes de livros)

### Pontos positivos
- Latências muito baixas para operações de leitura no load test: p(95) de **33.83ms** com 100 VUs e max de apenas **60.7ms**, indicando cache eficiente ou consultas bem indexadas na integração com a API externa (Google Books / banco local).
- Spike de 300 VUs com p(95) de **18.91ms** — o endpoint de busca de livros aguenta picos concentrados muito bem.
- Nenhuma falha em nenhum dos três tipos de teste (0% de taxa de erro).

### Pontos de atenção
- **Stress com 400 VUs mostrou aumento significativo de latência:** p(95) chegou a **100.89ms** e a mediana saltou para 14.49ms (vs 11.34ms no load com 100 VUs). O max de **663.55ms** indica contenção pontual do servidor sob carga crescente — dentro do threshold de 1000ms, mas a tendência é relevante para produção.
- O cenário `search` (80 VUs) tem latência ~2.3× maior que `details` (20 VUs) em média: 17.23ms vs 7.59ms. Confirma que a busca textual é mais custosa que a busca por ID — o endpoint de search merece índice dedicado em produção.

---

## Collection (coleções do usuário)

### Pontos positivos
- CRUD completo com 150 VUs em load test: todos os 12 checks passaram com 0 falhas e p(95) de **34.44ms** — excelente para operações de escrita.
- Suporta 500 VUs em spike sem nenhuma falha, com p(95) de **574.91ms** — bem dentro do threshold de 2500ms.
- O stress test com 600 VUs apresentou melhora real em relação a execuções anteriores: p(95) de **250.07ms** com avg de 67.5ms — performance consistente mesmo no pico de carga.

### Pontos de atenção
- No stress test com 600 VUs, a latência máxima atinge **1.7s** e o p(90) chega a **170.84ms** — ainda dentro do threshold, mas mostra que o CRUD de collections começa a pressionar o banco com alta concorrência de escrita (add shelf + remove shelf simultâneos de 600 VUs).
- A diferença entre mediana (22.1ms) e p(90) (170.84ms) no stress indica cauda pesada: a maioria das requests é rápida, mas uma fração significativa enfrenta contenção de banco nas operações de patch e delete.

---

## Shelf (estantes)

### Pontos positivos
- Load test com CRUD completo (create, get, update, delete) + listagem simultânea: 0 falhas, p(95) de **47.24ms** com 210 VUs.
- O subdomínio de shelf apresentou o **maior throughput no spike** entre os testes de 500 VUs: 500.90 req/s — melhor que collection e shelfItem no mesmo tipo de teste.
- Stress test com 600 VUs: p(95) de **128.61ms**, consideravelmente abaixo do threshold de 2500ms, e max de **480.75ms** — sem outliers extremos.

### Pontos de atenção
- O p(95) de shelf é o maior entre os subdomínios de Book no load test (47.24ms vs 34.44ms de collection e 43.89ms de shelfItem). O fluxo de CRUD de shelf envolve mais etapas (register + login + create + list + get + update + delete), elevando o tempo médio de iteração.
- No stress test com 600 VUs, a latência máxima de **480.75ms** sugere contenção de banco em operações de escrita concorrente. O p(90) de 98.83ms indica que 10% das requests demoram mais que o dobro da mediana de 13.95ms.
- A diferença entre avg (33.91ms) e p(90) (98.83ms) no stress aponta para uma distribuição com cauda — a leitura (list) puxa a média para baixo enquanto create/delete sob 600 VUs causa picos.

---

## ShelfItem (itens nas estantes)

### Pontos positivos
- O fluxo mais completo do DomainBook (11 checks: register, login, setup shelf, CRUD de itens, update progress, change status, remove) — todos aprovados com 0 falhas no load test.
- A operação de listagem isolada (`listing`, 60 VUs) tem p(95) de **19.1ms**, confirmando que a leitura de itens de estante é bem otimizada.

### Pontos de atenção
- **ShelfItem stress é o teste mais exigente do domínio:** com 600 VUs e 7 operações por iteração (list → add → get → update progress → change status → remove), o p(95) chegou a **717.87ms** e o p(90) a **599.87ms**. Ainda dentro do threshold de 3000ms, mas a cauda é expressiva.
- A mediana de **177.89ms** vs avg de **249.05ms** no stress indica que a maioria das requests é mais rápida que a média — as operações de escrita (`PATCH` progress, `PATCH` status e `DELETE`) têm latência mais alta sob contenção e puxam a média para cima.
- O throughput do stress (331.39 req/s) é o menor do domínio — reflexo do fluxo sequencial longo (6 requests por iteração com sleeps de 0.2s entre etapas e 0.5s ao final).
- A lógica de recuperação de **409 Conflict** no `add item` (lista itens → remove remanescente → refaz POST) pode adicionar até 2 requests extras por iteração em momentos de contenção, elevando a latência efetiva medida pelo k6.
- **ShelfItem spike: p(95) de 475.65ms** com mediana de **299.29ms** — valor de mediana acima da média (247.07ms), sugestivo de distribuição bimodal: requests rápidos (warm path) e um grupo mais lento (escritas em contenção sob pico repentino).

---

## Observações Transversais

1. **Todos os stress tests agora seguem a mesma estrutura:** 7 estágios [20→50→100→200→300→400→600] × 30s por estágio = 3m30s + 30s de ramp down. O pool de 800 usuários criado no `setup()` garante isolamento entre VUs e elimina conflitos de concorrência por usuário.

2. **Picos de latência máxima isolados:** Em vários stress tests, a latência `max` é muito superior ao p(95) (ex.: book stress: max 663ms vs p(95) 100ms; shelfItem stress: max 1.92s vs p(95) 717ms). São outliers pontuais (GC pause, lock de banco, recovery de 409) que não afetam o percentil, mas vale configurar alertas em produção para latência acima de 500ms.

3. **Zero falhas em todos os 12 testes:** Resultado positivo — o DomainBook demonstra estabilidade funcional completa sob carga até 600 VUs simultâneos.

4. **ShelfItem stress requer atenção especial em produção:** É o único subdomínio com p(95) acima de 500ms no stress. O fluxo de 7 operações sequenciais por usuário cria dependência de estado (item precisa existir para get/patch/delete), tornando-o mais sensível a contenção de banco do que os outros subdomínios.
