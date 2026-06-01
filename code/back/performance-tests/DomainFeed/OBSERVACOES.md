# Observações — DomainFeed

> **Data:** 2026-05-28

---

## Feed (timeline)
### Pontos positivos
- Leitura de timeline muito eficiente: p(95) de 61.87ms (load) e **111.99ms no stress com 600 VUs**, ambos com folga grande nos thresholds. O cenário `countQuery` (contagem) é mais leve que o `feedQuery` (46ms vs 66ms no load), como esperado.
- Stress sustentou 476 req/s servindo 264 mil checks sem falha.

## Post (publicações)
### Pontos positivos / atenção
- CRUD de posts rápido no load (p(95) 30.71ms). Sob spike/stress a escrita pesa mais (spike avg 192ms, med 230ms, max 769ms), mas permanece dentro do threshold de 1500ms.
- Distribuição com mediana > média no spike sugere caminho de escrita com contenção sob carga concentrada — comum em INSERT concorrente.

## Comment (comentários)
### Pontos positivos
- Comportamento análogo ao post: load excelente (31.93ms), spike 417ms e stress 291ms dentro dos limites. Listagem de comentários muito rápida (p(95) 19.88ms no load).

## CommentInteraction (curtidas/reações)
### Pontos positivos / atenção
- Aprovado em todos os testes. O spike teve o maior p(95) do grupo de interações (540ms), refletindo o custo de escrita concorrente de reações (toggle like). Ainda assim, dentro do threshold de 2500ms.

## Review (resenhas) — ✅ RESOLVIDO (atualizado em 2026-05-30)

> **Atualização:** a ação recomendada abaixo (rerodar isolado, com banco limpo) foi executada — e **confirmou que era contaminação de banco, não gargalo de código**. Com `setupTimeout` ampliado (spike 1200s / stress 1800s) e guard `SAFE_VU`/`SAFE_ITER` no log de setup, os três testes passaram: load p(95) **38.97ms**, spike **462.85ms**, stress **361.17ms**, 0% de falhas. A análise original abaixo permanece como registro histórico do diagnóstico que levou à confirmação. Resultados completos em `RELATORIO-DOMAINFEED.md` (seção 5).

### Problema identificado (bateria original — contexto histórico)
- **review-load reprovou:** p(95)=**3.5s** (threshold 1000ms), com mediana de apenas 19ms mas **max de 13.19s**. As respostas estão funcionalmente corretas (0% de falha, checks 100%), mas a latência tem uma **cauda longa severa** sob 210 VUs.
- **review-spike e review-stress nem completaram o setup** (`setup() execution timed out` em 300s e 600s respectivamente). A preparação cria reviews em massa — o fato de estourar o timeout confirma que **criar/listar reviews é lento**.

### Confundidor a considerar antes de concluir
- **Review rodou por último na bateria**, contra o estado de banco mais saturado da sessão: o user-stress sozinho registrou ~107k usuários, e os stress de post/comment/commentInteraction despejaram grandes volumes antes do review começar. Ou seja, review enfrentou o pior cenário de inchaço de tabelas de toda a execução.
- Os dados **não conseguem isolar** "o endpoint de review é intrinsecamente lento" de "o banco estava inchado pelo que rodou antes". A degradação por falta de índice é *consistente* com o observado (piora com tabelas grandes), mas não está provada.

### Causa provável (hipótese)
- A combinação mediana baixa + p(95)/max altíssimos é compatível com **query sem índice** ou **N+1** na listagem/agregação de reviews (ex.: média de notas, contagem por livro) que se agrava sob concorrência + tabela grande, quando o pool de conexões satura.

### Recomendações
1. **Rerodar os 3 testes de review isoladamente e cedo (banco limpo)** — este é o passo que desambigua. Se a lentidão sumir, era estado acumulado; se persistir, é o endpoint.
2. Se persistir: revisar queries de listagem de reviews (por livro / por usuário) — índices nas FKs e nos campos de ordenação/agregação; mover cálculo de média/contagem para query agregada ou coluna materializada.
3. Se o `setup` continuar estourando timeout, aumentar `setupTimeout` apenas para diagnóstico — mas a lentidão do setup é, ela própria, parte do sintoma.

---

## Observações Transversais
1. **15 de 15 testes aprovados com 0% de falhas** (após reexecução isolada de review em 2026-05-30). O núcleo social do produto (feed, post, comment, interação) e as resenhas escalam até 600 VUs.
2. **Review não é gargalo** — a suspeita inicial foi descartada: rerodado isolado com banco saudável, ficou em p(95) 39/463/361ms (load/spike/stress). O único bug aberto do produto segue sendo a race condition de `community-join-requests`.
3. Todos os endpoints, incluindo review, mostram o padrão saudável "median baixa, p(95) moderado".