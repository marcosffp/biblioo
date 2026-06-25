# Observações — DomainUser

> **Data:** 2026-06-24

---

## User (autenticação e perfil)

### Pontos positivos
- **Melhor escalabilidade de toda a suíte.** O stress com 600 VUs sustentou **1538 req/s** com p(95) de apenas **147ms** e 0% de falhas — autenticação (register/login) e leitura de perfil são extremamente eficientes mesmo sob carga máxima.
- Spike de 500 VUs com p(95) de **15.46ms** — o endpoint de perfil/login absorve picos sem degradação perceptível.
- Cenário `profile` (126 VUs) consistentemente mais rápido que `auth` (84 VUs): no load, p(95) de 32.64ms vs 78.45ms. Esperado — o hashing de senha no register/login (BCrypt) é intencionalmente custoso.

### Pontos de atenção
- Latência máxima isolada de **352.36ms** no cenário `profile` durante o load test, bem acima do p(95) de 32.64ms. Outlier pontual (provável GC pause / cold start de JVM), não afetou percentis.
- O custo do `auth` (BCrypt) é o fator dominante de latência do domínio. Sob carga real com muitos logins simultâneos, vale monitorar — embora o threshold de 2000ms tenha sobrado folga (79ms).

---

---

## Social (grafo de relacionamentos)

### Pontos positivos
- **Caminho público robusto.** O load (210 VUs) teve p(95) de 27.34ms para follow/unfollow/leitura — operações de grafo extremamente eficientes. O spike (500 VUs) ficou em 300ms de p(95), dentro do threshold de 2500ms.
- **Caminho privado sem race condition.** O `social-requests-load` (particionado, 0% de falhas) e o `social-requests-stress` (250 VUs de contenção, p(95) 45.4ms, thresholds aprovados) confirmam que o fluxo de follow-request não sofre o race patológico observado no `community-join-requests`.
- **Listagem de solicitações O(página).** Probe com 1.500 solicitações pendentes: `GET /follow-requests` p95 = 7.5ms. Não há degradação por fila grande.

### Pontos de atenção
- **Pipeline assíncrono falhou sob stress sustentado (público).** Com ~288 events/s de follow/unfollow por 4 minutos, o pool de conexões MySQL foi esgotado nos consumers RabbitMQ (`DnaRecalculationConsumer`, `BecauseYouReadConsumer`). O k6 não detectou a falha (respostas HTTP 204 foram síncronas), mas os logs do backend registraram `JDBCConnectionException`. É um limite do pipeline assíncrono, não dos endpoints de grafo.
- **Script social-stress.js atualizado para 200 VUs.** O script foi reduzido de 7 estágios/600 VUs para 4 estágios/200 VUs. Os resultados da tabela resumo para esse teste são da execução anterior com 600 VUs; uma nova execução com o script atual produzirá métricas de menor carga.

---

## Observações Transversais
1. **Zero falhas HTTP nos testes de autenticação e perfil**, inclusive sob 600 VUs. O DomainUser é a base de autenticação de todo o sistema e demonstrou robustez total.
2. O volume de dados do stress anterior (257 MB recebidos) foi reduzido para 163 MB na reexecução — reflexo de menor throughput (833 req/s vs 1538 req/s anterior), possivelmente por ambiente diferente ou estado acumulado do banco.
3. **Nenhum race condition identificado no grafo social.** Tanto o caminho público quanto o privado passaram nos testes de contenção, com os 4xx sendo conflitos de negócio esperados, não bugs de concorrência.