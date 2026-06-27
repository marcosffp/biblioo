# Observações — DomainTrending

> **Data:** 2026-06-24

---

## Trending (livros e comunidades em alta)

### Pontos positivos
- **Leitura agregada muito rápida.** Mesmo combinando rankings de comunidades e de livros (dados de múltiplos domínios), o p(95) ficou entre **16.5ms e 32ms** nos três testes. Confirma que os rankings são pré-computados / materializados, não calculados a cada request.
- **Load melhorou em relação à execução anterior:** p(95) caiu de 37.62ms para 31.3ms com número de requests praticamente idêntico (51.279 vs 51.029). Os dois endpoints têm comportamento simétrico (books p(95) 31.76ms, communities p(95) 31.62ms).
- Spike de 500 VUs com p(95) de **16.51ms** e 0% de erro — absorve picos de navegação na home/descoberta sem esforço.
- **Stress com p(95) ~23.8ms e latência máxima ~173ms** — muito abaixo do threshold de 2000ms e muito melhor que a execução anterior (440ms). Folga de ~87× no threshold.

### Pontos de atenção
- **Username do owner em `trending-stress.js` ainda excede o limite de 30 chars.** `trendstress_owner_` (18 chars) + timestamp de 13 dígitos = 31 chars. O owner falha a registrar silenciosamente, nenhuma comunidade é criada no setup do stress, e o `trending/communities` retorna dados acumulados de outras execuções — não dados gerados por este teste. O check `owner register 201` foi removido do script, mas a causa raiz (username longo) deve ser corrigida (ex.: usar `trendstress_o_` + sufixo curto ≤ 12 chars).
- No load o owner usa `trendload_owner_` (16 chars) + timestamp = 29 chars ≤ 30 Aprovado — o setup funciona corretamente e as 5 comunidades são criadas.
- As **7 falhas HTTP no stress** são 401 das tentativas de criar comunidade com token nulo. Revelam que o setup do stress está degradado mas estão dentro do threshold (< 5%). Em ambiente sem estado acumulado, o `trending/communities` no stress poderia retornar array vazio.
- A latência máxima subiu de 178ms (load) para ~173ms (stress) — praticamente igual, mostrando que o pico não aumenta com a carga. O stress mantém p(95) similar ao load, o que é muito positivo.

---

## Observações Transversais
1. **Praticamente zero falhas.** O domínio de trending é predominantemente leitura e se mostrou um dos mais estáveis e rápidos da suíte nos três cenários.
2. Os dois endpoints (`/trending/books` e `/trending/communities`) têm latências simétricas em todos os testes — indicativo de que ambos passam pelo mesmo caminho de cache/materialização.
3. Como depende de dados agregados, vale validar futuramente o custo de **recálculo/atualização** dos rankings (o caminho de escrita sob alta carga de posts/reviews/joins), que não é exercitado por estes testes de leitura.
