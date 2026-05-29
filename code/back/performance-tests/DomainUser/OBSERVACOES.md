# Observações — DomainUser

> **Data:** 2026-05-28

---

## User (autenticação e perfil)

### Pontos positivos
- **Melhor escalabilidade de toda a suíte.** O stress com 600 VUs sustentou **1538 req/s** com p(95) de apenas **147ms** e 0% de falhas — autenticação (register/login) e leitura de perfil são extremamente eficientes mesmo sob carga máxima.
- Spike de 500 VUs com p(95) de **16.45ms** — o endpoint de perfil/login absorve picos sem degradação perceptível.
- Cenário `profile` (126 VUs) consistentemente mais rápido que `auth` (84 VUs): no load, p(95) de 34.85ms vs 79.23ms. Esperado — o hashing de senha no register/login (BCrypt) é intencionalmente custoso.

### Pontos de atenção
- Latência máxima isolada de **725.47ms** no cenário `profile` durante o load test, bem acima do p(95) de 34.85ms. Outlier pontual (provável GC pause / cold start de JVM), não afetou percentis.
- O custo do `auth` (BCrypt) é o fator dominante de latência do domínio. Sob carga real com muitos logins simultâneos, vale monitorar — embora o threshold de 2000ms tenha sobrado folga (79ms).

---

## Observações Transversais
1. **Zero falhas nos 3 testes**, inclusive sob 600 VUs. O DomainUser é a base de autenticação de todo o sistema e demonstrou robustez total.
2. O volume de dados do stress (257 MB recebidos) reflete o alto número de respostas de perfil/token servidas (427 mil requests).