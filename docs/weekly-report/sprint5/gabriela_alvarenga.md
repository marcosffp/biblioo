# Relatório Semanal

## Semana 1 (04/05/2026 - 10/05/2026)

### O que foi feito:

- Implementação do componente BiblioChatWidget e integração no AppShell.
- Agrupamento de mensagens e persistência do histórico em localStorage no BiblioChatWidget.
- Implementação de parsing e renderização de mensagens no widget do assistente.
- Funcionalidade de busca com navegação por resultados no BiblioChatWidget.
- Implementação de efeito de digitação e auto-scroll no widget do assistente Bibo.

### Links dos Pull Requests:

- [PR #236](https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-1-ti5-0492100-biblioo/pull/236)

## Semana 2 (11/05/2026 - 17/05/2026)

### O que foi feito:

- Implementação dos componentes UserActivityFeed, UserReviewsTab e UserCommunitiesTab para a página de perfil.
- Implementação do ShareCapsuleModal para geração de cápsulas de leitura compartilháveis.
- Implementação do rastreamento do DNA Literário com cache e atualização da UI de metas de leitura.
- Implementação do componente FireIcon com animação de chama e melhorias nas estatísticas do perfil.
- Implementação do LiteraryDnaSection com exibição animada de temas literários.
- Implementação de paginação da estante na página de perfil.
- Implementação da SettingsPage com funcionalidade de redefinição de senha.
- Adição do link de configurações no TopHeader para navegação aprimorada.
- Remoção de campos de e-mail desnecessários da página de edição de perfil.
- Implementação de remoção de livros nos componentes da estante.
- Atualização do nome do assistente de "Bibi" para "Bibo" no widget de chat.
- Melhoria na normalização de categorias no DnaCalculationService do backend.

### Links dos Pull Requests:

- [PR #239](https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-1-ti5-0492100-biblioo/pull/239)

## Semana 3 (18/05/2026 - 24/05/2026)

### O que foi feito:

- Implementação da função generateShareCard para geração dinâmica de imagens no ShareCapsuleModal.
- Substituição de elementos `<img>` pelo componente Image do Next.js para carregamento otimizado de imagens em toda a aplicação.
- Adição de animações com Framer Motion em BookCard, PostCard, ReviewFeedCard e TopHeader.
- Atualização das ilustrações SVG e ajuste de layout no WelcomeTutorialModal.
- Adição de seção de review expansível no painel de detalhes de livro da estante (ShelfBookDetailsPanel).
- Substituição de placeholders por BookCoverPlaceholder nos componentes relevantes.
- Implementação do componente PasswordStrengthChecklist para validação de força de senha em tempo real.
- Melhorias no onboarding com layout aprimorado, animações e redirecionamento para a página "Para Você".
- Implementação do modelo ReadingActiveDay e repositório no backend para rastreamento de dias de leitura ativa.
- Refatoração da lógica de adição de livros e seleção de estante nos componentes da estante.
- Adição de truncamento de texto para nomes de coleções no BookcaseResults.
- Adição de tooltips nas estatísticas do perfil e nos resultados da estante para melhor experiência do usuário.
- Adição da prop authorUsername em PostCard e ReviewFeedCard.

### Links dos Pull Requests:

- [PR #264](https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-1-ti5-0492100-biblioo/pull/264)

## Semana 4 (25/05/2026 - 01/06/2026)

### O que foi feito:

- Atualização dos componentes Sidebar e BookcaseModals com novos ícones e melhorias visuais.
- Atualização do grid layout na página de perfil e ajuste de margem no ProfileStatsGrid.
- Substituição do ícone BibliooFaceIcon pelo ícone Book na Sidebar com atualização dos rótulos de navegação.
- Refatoração do layout da SettingsPage com melhoria na experiência do usuário.
- Remoção da seção "danger zone" da SettingsPage para uma interface mais limpa.
- Remoção do estado readersReached e cálculos relacionados da página de perfil.
- Adição da prop authorUsername no UserActivityFeed e componentes relacionados.

### Links dos Pull Requests:

- [PR #264](https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2026-1-ti5-0492100-biblioo/pull/264)
