# Relatório Semanal

## Semana 1 (27/04/2026 - 03/05/2026)

### O que foi feito:

- Implementei a autenticação com Google OAuth no backend, com validação de token via `google-api-client`.
- Desenvolvi os componentes `GoogleTokenVerifierAdapter` e `GoogleUserFactory` para suportar o fluxo de login social.
- Criei o endpoint `POST /auth/google` para autenticação de usuários via Google e adicionei tratamento de erro específico (`GoogleAuthException`).

### Links dos Pull Requests:
- [PR #148](https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-1-ti5-0492100-biblioo/pull/148)

## Semana 2 (20/04/2026 - 26/04/2026)

### O que foi feito:

- Implementei validação mais rígida de senha no registro, exigindo ao menos uma letra maiúscula e um caractere especial.
- Contribuí com a base do módulo community, servindo como ponto de partida para a implementação da funcionalidade de comunidade.
- Implementei remoção de imagens associadas a post, comentário e review no fluxo de exclusão.
- Adicionei configuração de pasta no Cloudinary para organização dos arquivos de mídia.
- Desenvolvi scripts de testes de performance para comunidades e usuários (load, spike e stress), cobrindo cenários de leitura, gerenciamento e autenticação sob carga.
- Após o teste de carga, otimizei a performance do código com ajustes no fluxo e nas implementações do módulo.
- Realizei integração e estabilização das mudanças no branch `fix/backend`.

### Links dos Pull Requests:
- Branch `fix/backend` (merge direto em `dev`, sem PR associado)
- [PR #135](https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-1-ti5-0492100-biblioo/pull/135) - base do módulo comunidade, sem merge feito por mim


## Semana 3 (27/04/2026 - 03/05/2026)

### O que foi feito:

- Implementei autenticação com Google OAuth no backend, com validação de token via `google-api-client`.
- Desenvolvi os componentes `GoogleTokenVerifierAdapter` e `GoogleUserFactory` para suportar o fluxo de login social.
- Criei o endpoint `POST /auth/google` para autenticação de usuários via Google.
- Atualizei o endpoint `PUT /users/me` para permitir alteração de username com validação de unicidade.
- Adicionei tratamento de erro específico para autenticação Google (`GoogleAuthException`) e ajustes de configuração em `UserConfig`.

### Links dos Pull Requests:
- [PR #148](https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-1-ti5-0492100-biblioo/pull/148)
