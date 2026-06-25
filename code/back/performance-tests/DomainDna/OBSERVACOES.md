# Observações — DomainDna

> **Data:** 2026-06-24

---

## DNA Literário

### Pontos positivos

- Latências consistentemente baixas em todos os cenários: p(95) de **45.21ms** no load (80 VUs), **58.63ms** no spike (300 VUs) e **29.88ms** no stress (500 VUs). Todos os três cenários ficaram muito abaixo dos SLAs configurados (1500ms, 1000ms e 2000ms respectivamente), com margem ampla em todos os casos.
- Zero falhas em todos os três tipos de teste, incluindo 300 VUs no spike e 500 VUs no stress.
- O setup dos testes é robusto: cada VU usa um usuário pré-registrado com estante criada e 5 livros COMPLETED, garantindo que o domínio DNA tenha dados reais para processar via RabbitMQ antes do início das iterações.
- O throughput do spike (205.6/s) foi o mais alto dos três, o que é esperado pelo design: sleep de 0.5s por iteração vs. 1s no load e stress, com pico de 300 VUs em janela curta.

### Pontos de atenção

- **Latência mais alta no load em comparação ao stress:** p(95) de 45.21ms no load (80 VUs) contra 29.88ms no stress (500 VUs). O comportamento aparentemente contraditório é explicável: o stress cria 500 usuários com DNA já computado em cache de banco, enquanto o load usa apenas 100 usuários com maior contenção relativa por slot. Com menos usuários no pool, a rotação de tokens gera maior sobreposição de sessões ativas.
- **readDna mais lento que listingDna no load:** p(95) de 48.17ms vs 38.2ms. Ambos chamam `GET /dna`, mas o cenário `readDna` tem 60 VUs contra 20 do `listingDna` — a maior concorrência de leitura gera contenção adicional no banco, confirmando que o endpoint não tem cache de aplicação.
- **Máxima do stress acima de 84ms:** o `max` no stress chegou a 84.29ms, acima dos ~74ms observados no load. Embora ainda muito distante do SLA de 2000ms, indica que sob carga de 500 VUs surgem outliers pontuais, possivelmente relacionados a garbage collection ou picos de contenção no pool de conexões HikariCP.
- Para os usuários criados durante os testes, o DNA estará majoritariamente em estado `IN_FORMATION` (apenas 5 livros, mínimo insuficiente para computação completa). O endpoint responde com `DnaProgressResponse` em vez do `DnaResponse` computado, o que mantém a latência artificialmente baixa em comparação com o caminho real de produção onde o DNA completo é serializado.

---

## Observações Transversais

1. **Estado IN_FORMATION como proxy:** Os testes criam usuários com exatamente 5 livros concluídos. Se o limiar de DNA computado exigir mais livros, todos os requests retornam `DnaProgressResponse` — mais leve que `DnaResponse`. Para testar o caminho completo de produção, os scripts deveriam usar usuários com histórico de leitura mais amplo (10+ livros de gêneros variados).

2. **Zero falhas com tolerância a 429:** O spike define `get dna 200 ou 429` como check válido, antecipando possível rate limiting. O fato de nenhum 429 ter ocorrido indica que o endpoint de DNA não tem rate limiting configurado — ou o rate limiter (se existir) tem limite acima de 300 RPS.

3. **Throughput menor no stress que no spike apesar de mais VUs:** O stress tem sleep de 1s por iteração (vs 0.5s no spike) e inclui estágios de ramp-up que mantêm VUs baixos na maior parte do tempo. O throughput de 150.27/s no stress reflete o design dos testes, não um gargalo real — a latência p(95) de 29.88ms comprova que o endpoint ainda tinha capacidade disponível no pico de 500 VUs.
