# Relatório Semanal

## Semana 1 (23/03/2026 - 30/03/2026)

### O que foi feito:
- Implementação completa do módulo user: autenticação com JWT (registro, login, refresh, logout), gerenciamento de perfil, follow/unfollow e exceções globais
- Integração com OpenSearch para busca de usuários por username
- Integração com Cloudinary para upload de avatar e banner
- Configuração do Spring Security e dependências JWT

### Links dos Pull Requests:
- [PR #51](https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-1-ti5-0492100-biblioo/pull/51)
- [PR #57](https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-1-ti5-0492100-biblioo/pull/57)


## Semana 2 (30/03/2026 - 06/04/2026)

### O que foi feito:
- Correções gerais no backend e reorganização da estrutura de pastas (código movido de `back/biblioo/` para `back/`)
- Refatoração das portas de repositório obsoletas e atualização das dependências dos serviços

### Links dos Pull Requests:


## Semana 3 (06/04/2026 - 13/04/2026)

### O que foi feito:
- Implementação do gerenciamento de solicitações de seguir (follow requests), com novo status `FollowStatus`, atualização do `UserService` e `UserFollowRepository`
- Tradução das mensagens de erro para português
- Implementação do sistema de notificações com RabbitMQ e Firebase Cloud Messaging (FCM): entidades `Notification` e `DeviceToken`, `NotificationService`, consumers RabbitMQ, adapter SSE e adapter FCM
- Ajuste na configuração do Firebase para uso de credenciais em Base64

### Links dos Pull Requests:
- [PR #84](https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-1-ti5-0492100-biblioo/pull/84)
