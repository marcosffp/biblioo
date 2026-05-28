# Observações — DomainDna

> **Data:** 2026-05-28

---

## DNA Literário

### Pontos positivos

- Latências consistentemente baixas em todos os cenários: p(95) de **34.08ms** no load (80 VUs), **19.59ms** no spike (300 VUs) e **16.94ms** no stress (500 VUs). O endpoint escala de forma positiva — a latência percentil *diminui* conforme o nível de carga sobe, o que é contraditório mas explicável: o setup do stress cria 500 usuários com DNA já computado em cache de banco, enquanto o load usa apenas 100 usuários com mais contenção relativa por slot.
- Zero falhas em todos os três tipos de teste, incluindo 400 usuários simultâneos no spike e 500 no stress.
- A latência máxima (`max`) ficou abaixo de **76ms** em todos os testes — sem outliers extremos. O comportamento é estável e previsível, sem GC pauses ou cold starts detectáveis.
- O setup dos testes é robusto: cada VU usa um usuário pré-registrado com estante criada e 5 livros COMPLETED, garantindo que o domínio DNA tenha dados reais para processar via RabbitMQ antes do início das iterações.

### Pontos de atenção

- **Latência levemente maior no readDna vs listingDna no load:** p(95) de 37.34ms vs 29.41ms. Ambos chamam `GET /dna`, mas o cenário `readDna` tem 60 VUs contra 20 do `listingDna` — a maior concorrência de leitura gera pequena contenção no banco, confirmando que o endpoint não tem cache de aplicação, apenas otimização de consulta.
- Para os usuários criados durante os testes, o DNA estará majoritariamente em estado `IN_FORMATION` (apenas 5 livros, mínimo insuficiente para computação completa). O endpoint responde com `DnaProgressResponse` em vez do `DnaResponse` computado, o que mantém a latência artificialmente baixa em comparação com o caminho real de produção onde o DNA completo é serializado.
- O throughput do stress (150.8/s) é menor que o do spike (205.6/s) apesar de mais VUs, porque o stress inclui sleep de 1s por iteração como parte do fluxo real, enquanto o spike tem sleep de 0.5s. Isso é esperado pelo design dos testes, mas significa que o número real de requests concorrentes não é diretamente comparável entre os três tipos.

---

## Observações Transversais

1. **Estado IN_FORMATION como proxy:** Os testes criam usuários com exatamente 5 livros concluídos. Se o limiar de DNA computado exigir mais livros, todos os requests retornam `DnaProgressResponse` — mais leve que `DnaResponse`. Para testar o caminho completo de produção, os scripts deveriam usar usuários com histórico de leitura mais amplo (≥10 livros de gêneros variados).

2. **Zero falhas com tolerância a 429:** O spike define `get dna 200 ou 429` como check válido, antecipando possível rate limiting. O fato de nenhum 429 ter ocorrido indica que o endpoint de DNA não tem rate limiting configurado — ou o rate limiter (se existir) tem limite acima de 300 RPS.

3. **Consistência do max entre load e stress:** Ambos têm max em torno de 75ms — coincidência que sugere um limite natural de latência máxima do endpoint sob carga local (provavelmente limite de tempo de consulta no banco de dados + serialização JSON), e não um gargalo de concorrência.
