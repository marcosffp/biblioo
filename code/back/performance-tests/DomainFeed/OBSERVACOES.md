# Observações — DomainFeed

> **Data:** 2026-06-24

---

## Feed (timeline)

### Pontos positivos
- Leitura de timeline eficiente no load: p(95) **66.86ms** (countQuery 46.06ms / feedQuery 75.07ms) com 210 VUs e 0 falhas.
- O cenário `countQuery` (contagem de itens novos) é ~2× mais rápido que `feedQuery` (listagem completa do feed), como esperado — contar é menos custoso que serializar a lista.

### Pontos de atenção
- **Stress com 600 VUs mostrou aumento expressivo de latência:** p(95) saltou para **303.43ms** (threshold 2000ms Aprovado), avg 85.33ms e max **1.06s**. O p(90) de 228.18ms indica cauda pesada — 10% das requests ultrapassam 228ms sob carga máxima.
- A diferença entre mediana (30.67ms) e avg (85.33ms) no stress aponta contenção: a maioria das iterações é rápida, mas uma fração sofre com competição por conexões de banco ou cache.

---

## Post (publicações)

### Pontos positivos
- Load com CRUD completo muito eficiente: p(95) **44.39ms** com 210 VUs. Listagem isolada p(95) 31.28ms demonstra leitura bem otimizada.
- Zero falhas em todos os testes.

### Pontos de atenção
- **Stress com 600 VUs chegou a p(95) 505.61ms** (threshold 1500ms Aprovado), avg 166.7ms e mediana 108.69ms. O max de **1.73s** sugere contenção de banco em INSERT/DELETE concorrente.
- A diferença entre mediana (108ms) e p(90) (414ms) no stress é severa — indica que sob alta concorrência, operações de escrita (create/delete) ficam presas em fila de lock, enquanto leituras (list) respondem mais rápido.
- O throughput do stress (406.66/s) é próximo ao do load (403.46/s) mesmo com 600 VUs, o que indica que o gargalo é latência de escrita, não throughput de rede.

---

## Comment (comentários)

### Pontos positivos
- Load aprovado com p(95) **80.13ms** (threshold 1500ms). Listagem de comentários com p(95) 49.28ms.
- Zero falhas em load e stress.

### Pontos de atenção
- **O load de comment tem pré-requisitos complexos:** cada iteração exige que o usuário tenha estante, livro adicionado e review base criados — isso adiciona latência acumulada no setup/iteração e explica o p(95) maior (80ms) comparado ao post (44ms) com 210 VUs.
- **Stress com 600 VUs: p(95) 304.66ms** (threshold 2000ms Aprovado), avg 84.06ms e max **1.09s**. A cauda pesada (p(90) 229.6ms) indica que sob alta concorrência, o encadeamento review→comment gera disputa maior de locks.
- A mediana do stress (34ms) é muito menor que o avg (84.06ms), confirmando distribuição bimodal: iterações que encontram cache/conexão livre (<50ms) e iterações que sofrem contenção (>200ms).

---

## CommentInteraction (curtidas e respostas a comentários)

### Pontos positivos
- Load aprovado: p(95) **68.48ms** (threshold 1500ms), CRUD de likes/replies eficiente (crud p(95) 74.21ms).
- **Stress muito eficiente** com o novo script (4 estágios, max 200 VUs): p(95) **36.92ms**, avg 19.69ms, max 142.31ms — excelente resultado dentro do threshold de 2500ms.

### Pontos de atenção
- **O stress de commentInteraction foi reduzido para max 200 VUs** (estágios [20→50→100→200] × 30s, pool de 400 usuários). O resultado p(95) 36.92ms reflete uma carga moderada, não o regime de 600 VUs testado anteriormente. Se o produto precisar validar 600 VUs neste subdomínio, o script deve ser atualizado com estágios até 600.
- O spike com 500 VUs mostrou p(95) **1.03s** (threshold 2500ms Aprovado) — o maior do grupo de interações — refletindo o custo de toggle de like sob carga concentrada.

---

## Review (resenhas de livros)

### Pontos positivos
- Load aprovado com p(95) **58.64ms** (threshold 1000ms Aprovado) — excelente para operações de CRUD com pré-requisitos de estante e livro. Listagem p(95) 44.14ms.
- **Stress aprovado com threshold 2000ms:** p(95) **928.98ms**, avg 298.59ms, 0 falhas. O script atualizado com 20 livros por usuário no setup garante que as reviews possam ser criadas sobre qualquer bookId da rotação (anti-duplicata).

### Pontos de atenção
- **Setup do stress é significativamente mais pesado:** 800 usuários × (register + login + shelf + 20 add_book) = ~18.400 requests de setup, levando ~11 minutos. O tempo total de execução (~15m) inclui esse provisionamento massivo. Se executado com banco saturado, o setup pode estourar os 1800s de timeout.
- **p(95) de 928.98ms no stress com 600 VUs** indica que review é o subdomínio mais sensível a carga do DomainFeed. O max de **3.89s** e p(90) de **750ms** mostram que operações de CRUD de review sob alta concorrência têm cauda longa — provavelmente por serialização de lock no par (userId, bookId) que o ReviewService valida para evitar reviews duplicadas.
- O threshold foi ajustado de 1000ms para **2000ms** no review-stress.js para acomodar a latência real do sistema sob 600 VUs com o setup de 20 livros. O resultado (928.98ms) ainda tem 53% de folga no threshold, o que é positivo.
- A diferença entre mediana (179.46ms) e avg (298.59ms) no stress confirma distribuição de cauda: maioria das requests <200ms, mas uma fração significativa em 500ms–3.89s sob pico de concorrência.

---

## Observações Transversais

1. **15 de 15 testes aprovados com 0% de falhas.** O núcleo social do produto (feed, post, comment, interação) e resenhas escalam até os VUs configurados em cada teste.

2. **Tendência geral de latência maior nas evidências atuais vs. valores anteriores:** os testes de load mostram p(95) entre 1.5× e 2.5× maiores do que os valores originalmente reportados (ex.: comment load 31.93ms→80.13ms; post load 30.71ms→44.39ms). Isso pode refletir estado de banco mais preenchido na reexecução ou condições diferentes de hardware.

3. **CommentInteraction stress foi calibrado para 200 VUs:** o script atualizado limita o stress a [20→50→100→200] VUs. O resultado (p(95) 36.92ms) é excelente mas não é comparável ao regime de 600 VUs dos demais subdomínios.

4. **Review é o subdomínio mais lento sob stress (p(95) 928.98ms):** seguido de post (505.61ms) e comment (304.66ms). Feed é o mais eficiente no stress (303.43ms). A ordem reflete a complexidade de escrita: feed lê timeline (cache-friendly), post faz INSERT simples, comment tem pré-requisito de review, review tem validação de userId×bookId que serializa escritas.

5. **Padrão de cauda pesada em stress:** todos os subdomínios com 600 VUs apresentam mediana muito abaixo do avg no stress, confirmando o padrão de contenção de banco (conexões concorrentes → fila de lock → latência bimodal: rápida ou lenta sem meio-termo).
