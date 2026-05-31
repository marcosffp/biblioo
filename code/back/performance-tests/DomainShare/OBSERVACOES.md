# Observações — DomainShare

> **Data:** 2026-05-28

---

## ShareCard (geração de cards de leitura em PNG)

### Pontos positivos
- Apesar de gerar **imagens PNG** (operação tipicamente cara), o p(95) ficou entre **27ms e 40ms** em todos os testes — o cache (Redis) é altamente eficaz: após a primeira renderização de cada card, as demais são HIT.
- Suportou 600 VUs no stress servindo **3.9 GB** de imagens sem nenhuma falha e com folga enorme nos thresholds (35ms vs limite de 3000ms).
- O spike de 500 VUs entregou **1.1 GB em 1m14s** (15 MB/s de saída) sem degradação.

### Pontos de atenção
- **Banda de rede é o gargalo real, não a CPU.** O domínio movimenta volumes de dados muito maiores que os demais (718 MB no load, 3.9 GB no stress). Em produção, o custo dominante será largura de banda / egress, não latência de render.
- Latência máxima de **1.49s** no load (vs p(95) de 39.77ms): são os cache MISS (primeira renderização de cada card). Sob um cenário com muitos cards únicos (baixa taxa de HIT), a latência média subiria — vale testar futuramente com chaves de card mais variadas para medir o custo do render frio em escala.
- O threshold foi definido generosamente (1500–3000ms) justamente prevendo o render; com cache quente, a folga é de ~40×.

---

## Observações Transversais
1. **Zero falhas nos 3 testes.** O fluxo de compartilhamento é estável até 600 VUs.
2. O comportamento observado depende fortemente da taxa de cache HIT; os números aqui refletem um cenário favorável (pool de usuários repetido). Recomenda-se um teste complementar com cards majoritariamente únicos para estressar o caminho de render.