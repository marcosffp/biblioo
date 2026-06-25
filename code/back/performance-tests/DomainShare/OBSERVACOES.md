# Observações — DomainShare

> **Data:** 2026-06-24

---

## ShareCard (geração de cards de leitura em PNG)

### Pontos positivos
- Apesar de gerar **imagens PNG** (operação tipicamente cara), o p(95) ficou entre **29ms e 118ms** em todos os testes — o cache Redis (TTL 1h por userId) é altamente eficaz: após a primeira renderização de cada card, as demais são HIT.
- Suportou 600 VUs no stress servindo **3.9 GB** de imagens sem nenhuma falha e com folga enorme nos thresholds (57ms vs limite de 3000ms).
- O spike de 500 VUs entregou **1.1 GB em 1m14s** sem degradação, com p(95) de apenas 29ms.
- **Média do stress (10.7ms) menor que a do load (80ms):** no stress, o pool de 800 usuários e sleep de 0.5s por iteração resultam em maior taxa de cache HIT por VU (cada usuário repete requisições), enquanto o load com 230 usuários × sleep de 1s × 150 VUs constantes expõe mais renders frios relativamente.

### Pontos de atenção
- **Load p(95) de 118ms** — 3× maior que medições anteriores de mesmo cenário (39ms). Reflete maior proporção de renders frios no pool de 230 usuários com 150 VUs constantes: os primeiros ~230 requests são render real, gerando outliers que puxam o p(95) acima do p(90) (86ms). Com pool menor que VUs pico, cada VU eventualmente encontra usuário sem cache aquecido.
- **Latência máxima de 4.98s no load e 1.03s no stress.** Os picos são os cache MISS (primeira renderização de cada card via Java2D/BufferedImage). Sob um cenário com muitos cards únicos (baixa taxa de HIT), a latência média subiria — vale testar futuramente com chaves de card mais variadas para medir o custo do render frio em escala.
- **Banda de rede é o gargalo real, não a CPU.** O domínio movimenta volumes muito maiores que os demais (678 MB no load, 3.9 GB no stress). Em produção, o custo dominante será largura de banda / egress, não latência de render.
- **Arquivo de evidência de stress mal nomeado:** o PNG de stress foi salvo como `shareCard/DomainTrending-shareCard-stress.png` (deve ser `DomainShare-shareCard-stress.png`).

---

## Observações Transversais
1. **Zero falhas nos 3 testes.** O fluxo de compartilhamento é estável até 600 VUs.
2. O comportamento observado depende fortemente da taxa de cache HIT; os números aqui refletem um cenário com pool fixo de usuários (alta taxa de HIT após primeiros requests). Recomenda-se um teste complementar com cards majoritariamente únicos para estressar o caminho de render frio em escala.
3. O threshold generoso (1500ms no load, 3000ms no stress) foi definido prevendo renders frios; com cache quente, a folga é de ~13× a ~52×.
