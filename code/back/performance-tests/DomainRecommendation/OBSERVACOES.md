# Observações — DomainRecommendation

> **Data:** 2026-06-24

---

## Recommendation (Motor de Recomendação)

### Pontos positivos

- **15 checks de payload distintos** (2 de autenticação + presença de dados em cada uma das 6 estratégias) — todos 100% aprovados em load, spike e stress. Não apenas o status HTTP foi validado, mas também a integridade do conteúdo retornado.
- As 6 estratégias de recomendação apresentam latências praticamente idênticas entre si (diferença máxima de ~13ms no p(95) do load) — o sistema distribui o custo computacional de forma uniforme independentemente da estratégia.
- **Warm-up efetivo no stress:** com cache pré-aquecido, o stress (400 VUs) manteve p(95) de 1.21s bem abaixo do threshold de 3000ms, sem falhas de negócio.

### Pontos de atenção

- **Latência máxima de 28.13s no load e 6.46s no stress.** Os picos extremos (muito acima do p(95)) indicam que o motor de recomendação tem custo alto na primeira execução para usuários frios — ao carregar histórico de leitura e processar múltiplas estratégias simultaneamente sem dados pré-computados. Em produção, usuários novos podem experimentar latências elevadas no primeiro acesso.
- **Mediana maior que a média no spike** (1.2s vs 967.93ms): distribuição assimétrica inversa ao padrão esperado. Indica que uma parcela de requests resolve rapidamente (cache hit) puxando a média para baixo, mas a maioria enfrenta o caminho de processamento completo. Confirmado pela diferença entre min (3.06ms) e med (1.2s) — o sistema possui dois perfis de resposta distintos.
- **Assimetria load × stress:** o stress (400 VUs, p(95) 1.21s) é mais rápido que o spike (600 VUs, p(95) 2.11s) em condição equivalente, pois o stress tem warm-up completo enquanto o spike concentra muitos VUs em janelas onde o cache ainda não está totalmente aquecido.
- **Latências mais altas que execuções anteriores:** load e stress apresentam p(95) ~773ms e ~1.21s respectivamente, contra ~728ms e ~606ms em runs anteriores — reflexo de diferenças de ambiente (estado do banco acumulado, carga de background).

---

## Roll Dice (Recomendação Aleatória)

### Pontos positivos

- **Latências muito baixas no load e spike:** p(95) de 31.4ms com 600 VUs constantes no load e 49.94ms no spike — entre 25× e 42× mais rápido que o motor de recomendação completo. O roll-dice claramente utiliza lógica simples de seleção sem processamento de ML/regras.
- **1.768 req/s no load** — maior throughput entre os subdomínios de recomendação. Zero falhas em todos os três testes, incluindo 800 VUs no stress.
- O load com **600 VUs constantes** (sem rampa) é o cenário de maior pressão sustentada do DomainRecommendation e foi concluído sem degradação relevante de negócio.

### Pontos de atenção

- **Degradação expressiva no stress com 800 VUs:** o p(95) salta de ~31ms (load) para **420.03ms** — aumento de ~13×. A mediana passa de 15ms para 112ms (7.5×), enquanto o p(90) vai de 25ms para 350ms. Padrão típico de distribuição bimodal acentuada: a maioria ainda resolve rápido (cache), mas uma fração crescente enfrenta contenção de escrita no banco (roll-dice persiste um registro por chamada).
- **Latência máxima de 3.24s no load e 4.55s no stress.** Picos desproporcionais à mediana (~15ms e ~112ms), sugerindo GC pause da JVM ou lock momentâneo de banco sob alta concorrência de escrita. Dentro dos thresholds (2000ms e 2500ms respectivamente), mas indicam que o banco pode ser gargalo sob picos de escrita concorrente.
- **Throughput no stress reduzido:** ~512 req/s totais (vs ~1768/s no load), reflexo do sleep aleatório de até 0.5s por iteração + contenção sob 800 VUs. Durante a fase VU ativa o executor processa ~587 iter/s, mas o throughput geral dilui com o setup de 800 usuários.

---

## Observações Transversais

1. **Warm-up de cache como variável crítica:** A diferença mais relevante entre os testes de recommendation é a presença ou ausência do warm-up. O load (sem warm-up) tem p(95) de 772ms com 500 VUs; o stress (com warm-up) tem 1.21s com 400 VUs — mesmo com warm-up, o stress é mais lento porque o banco está sob maior pressão cumulativa. Em produção, o sistema de recomendação deve ter estratégia de aquecimento de cache após reinicializações — especialmente no horário de pico — para evitar latências de 6s+ nos primeiros acessos.

2. **Contraste de perfil entre os dois subdomínios:** Roll-dice e recommendation têm perfis completamente opostos. Roll-dice é CPU/banco-simples (rápido, alto throughput, degrada sob escrita concorrente a 800 VUs). Recommendation é computacionalmente intenso (latência média alta, muito volume de dados de resposta, cache crítico). Sob degradação geral do sistema, os dois pontos de falha são diferentes: banco de escrita para roll-dice, processamento de regras/histórico+cache para recommendation.

3. **Volume de dados:** O recommendation stress transferiu **~2.4 GB** em ~5m27s — muito acima dos demais domínios. As respostas carregam listas de livros com metadados completos para 6 estratégias por iteração. Em produção, paginação ou limitação do número de itens por estratégia pode reduzir significativamente a banda e a latência de serialização.

4. **Zero falhas funcionais em todos os 6 testes.** O DomainRecommendation demonstra estabilidade funcional completa mesmo sob carga máxima (800 VUs no stress de roll-dice, 400 VUs no stress de recommendation).
