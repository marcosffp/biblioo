# Observações — DomainTrending

> **Data:** 2026-05-28

---

## Trending (livros e comunidades em alta)

### Pontos positivos
- **Leitura agregada muito rápida.** Mesmo combinando rankings de comunidades e de livros (dados de múltiplos domínios), o p(95) ficou entre **17ms e 38ms** nos três testes. Indica que os rankings são pré-computados / materializados, não calculados a cada request.
- Spike de 500 VUs com p(95) de **17.4ms** e 0% de erro — absorve picos de navegação na home/descoberta sem esforço.
- Threshold de load extremamente exigente (**p(95) < 500ms**) atendido com folga de ~13× (37.62ms).

### Pontos de atenção
- No stress com 600 VUs houve **7 requests com falha** (0.00% do total) e **1 falha de check em `owner register`**. São transitórias e ligadas ao setup (criação de comunidade pelo owner sob alta concorrência), não ao endpoint de trending em si. Bem dentro do threshold (< 5%).
- A latência máxima caiu de 189ms (load) para 440ms (stress) — leve pressão sob 600 VUs, mas ainda muito longe do limite de 2000ms.

---

## Observações Transversais
1. **Praticamente zero falhas.** O domínio de trending é predominantemente leitura e se mostrou um dos mais estáveis e rápidos da suíte.
2. Como depende de dados agregados, vale validar futuramente o custo de **recálculo/atualização** dos rankings (o caminho de escrita), que não é exercitado por estes testes de leitura.