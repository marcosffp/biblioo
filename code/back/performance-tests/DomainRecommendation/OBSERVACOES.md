# Observações — DomainRecommendation

> **Data:** 2026-05-28

---

## Recommendation (Motor de Recomendação)

### Pontos positivos

- **15 checks de payload distintos** (2 de autenticação + presença de dados em cada uma das 6 estratégias) — todos 100% aprovados em load, spike e stress. Não apenas o status HTTP foi validado, mas também a integridade do conteúdo retornado.
- Throughput excepcional: **1.467 req/s no load** e **1.534 req/s no stress** — o motor de recomendação é o subdomínio com maior volume de dados processados, tendo recebido **4.4 GB** de resposta apenas no stress test.
- As 6 estratégias de recomendação apresentam latências praticamente idênticas entre si (diferença máxima de ~6ms no p(95) do load) — o sistema distribui o custo computacional de forma uniforme independentemente da estratégia.
- O stress test atingiu **71.272 iterações** em 3m30s com 400 VUs, tornando-o o teste com maior volume de iterações completas do DomainRecommendation.

### Pontos de atenção

- **Latência máxima de 16.32s no load test** (e 4.27s no spike, 2.64s no stress). O pico extremo no load é o mais preocupante: ocorreu sem warm-up de cache, sugerindo que o motor de recomendação tem custo alto na primeira execução para um usuário frio — possivelmente carregando histórico de leitura e processando múltiplas estratégias simultaneamente sem dados pré-computados. Em produção, um usuário novo pode experimentar uma resposta acima de 10s no primeiro acesso.
- **Mediana maior que a média no spike** (832ms vs 665ms): distribuição assimétrica inversa ao padrão esperado. Indica que uma parcela de requests resolve rapidamente (cache hit) puxando a média para baixo, mas a maioria dos requests enfrenta o caminho de processamento completo. Confirmado pela diferença entre min (2.51ms) e med (832ms) — o sistema possui dois perfis de resposta claramente distintos.
- O spike apresenta p(95) de **1.28s** — quase 2× o do load (727ms) mesmo com pool maior (600 vs 500 usuários). A rampa agressiva do spike concentra 600 VUs em janelas curtas onde o cache de recomendação ainda não está totalmente aquecido para todos os usuários, expondo o custo de computação a frio.
- **Assimetria entre load e stress:** o stress (400 VUs, 606ms p(95)) é mais rápido que o load (500 VUs, 727ms p(95)), apesar de ter mais VUs simultâneos no pico. Isso é explicado pelo **warm-up de cache** presente no spike e stress — os 600 usuários pré-aquecidos antes do cenário garantem que o sistema responde com dados já computados durante o teste. O load não tem warm-up, e é o teste com pior latência mesmo com menos VUs.

---

## Roll Dice (Recomendação Aleatória)

### Pontos positivos

- **Latências excepcionalmente baixas** para um endpoint de recomendação: p(95) de **21.11ms com 600 VUs constantes** no load e **19.41ms no spike** — mais de 35× mais rápido que o motor de recomendação completo. O roll-dice claramente utiliza uma lógica de seleção muito mais simples (provavelmente consulta direta ao banco sem processamento de ML/regras).
- O load test com **600 VUs constantes** é o cenário mais exigente de concorrência sustentada do DomainRecommendation, e o roll-dice o suportou com apenas 21ms de p(95) e throughput de **1.819 req/s** — o maior throughput entre todos os subdomínios de recomendação.
- Zero falhas em todos os três testes, incluindo 800 VUs no stress (o maior número de VUs de qualquer subdomínio do DomainRecommendation).

### Pontos de atenção

- **Degradação expressiva no stress com 800 VUs:** o p(95) salta de ~20ms (load e spike) para **120.32ms** — um aumento de 6×. O p(90) passa de 18ms para 102ms, e a mediana se mantém em 13ms. Esse padrão indica distribuição bimodal acentuada: a maioria dos requests ainda resolve rapidamente, mas uma fração crescente enfrenta contenção — provavelmente lock de banco ou fila de operações de escrita (o roll-dice persiste um registro a cada chamada).
- **Latência máxima de 2.47s no load** e **1.67s no stress**. Os picos de latência máxima são desproporcionais à mediana (13ms), sugerindo que o outlier é causado por GC pause da JVM ou lock de banco momentâneo sob alta concorrência de escrita. No load constante de 600 VUs, o p(95) ainda passa com folga, mas o max é um sinal de que o banco pode ser gargalo sob picos de escrita concorrente.
- O stress gerou **507.608 checks** em 4m — número que reflete o alto volume de writes persistidos. Em produção com 800 usuários simultâneos fazendo roll-dice, o banco de dados recebe ~900 escritas por segundo, o que pode competir com outras operações de escrita do sistema (shelf items, DNA recalculation).

---

## Observações Transversais

1. **Warm-up de cache como variável crítica:** A diferença mais relevante entre os testes de recommendation é a presença ou ausência do warm-up. O load test (sem warm-up) tem p(95) de 727ms com 500 VUs; o stress (com warm-up) tem 606ms com 400 VUs. Em produção, o sistema de recomendação deve ter uma estratégia de aquecimento de cache após reinicializações — especialmente no horário de pico — para evitar latências de 10s+ nos primeiros acessos.

2. **Contraste de perfil entre os dois subdomínios:** Roll-dice e recommendation têm perfis completamente opostos. Roll-dice é CPU/banco-simples (rápido, alto throughput, degrada sob escrita concorrente). Recommendation é computacionalmente intenso (latência média alta, muito volume de dados de resposta). Sob degradação geral do sistema, os dois pontos de falha são diferentes: banco de escrita para roll-dice, processamento de regras/histórico para recommendation.

3. **Volume de dados:** O recommendation stress transferiu **4.4 GB** em 3m30s — mais que todos os testes do DomainBook somados (~1.3 GB). As respostas de recomendação carregam listas de livros com metadados completos. Em produção, paginação ou limitação do número de itens retornados por estratégia pode reduzir significativamente a banda e a latência de serialização.

4. **Zero falhas em todos os 6 testes:** Resultado positivo — o DomainRecommendation demonstra estabilidade funcional completa mesmo sob carga máxima (800 VUs no stress de roll-dice).
