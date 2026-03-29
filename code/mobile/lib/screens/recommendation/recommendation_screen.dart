import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class RecommendationScreen extends StatelessWidget {
  const RecommendationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          const SliverAppBar(
            floating: true,
            snap: true,
            title: Text('Para Você'),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverList(
              delegate: SliverChildListDelegate([

                // Jogar o Dado — destaque
                _DiceCard(onTap: () => context.push('/recommendation/dice')),
                const SizedBox(height: 24),

                // Trilhas de recomendação
                _TrailSection(
                  title: 'Baseado no seu perfil',
                  subtitle: 'Porque você leu 1984',
                  books: const [
                    _BookMatch(title: 'A Revolução dos Bichos', author: 'George Orwell', match: 95, reason: 'Baseado em 1984 que você leu'),
                    _BookMatch(title: 'Fahrenheit 451', author: 'Ray Bradbury', match: 92, reason: 'Distopias que você ama'),
                    _BookMatch(title: 'Admirável Mundo Novo', author: 'Aldous Huxley', match: 89, reason: 'Clássicos da ficção científica'),
                  ],
                ),
                const SizedBox(height: 24),

                _TrailSection(
                  title: 'Em alta agora',
                  subtitle: 'Trending',
                  books: const [
                    _BookMatch(title: 'Cem Anos de Solidão', author: 'G. G. Márquez', match: 87, reason: 'Muito lido essa semana'),
                    _BookMatch(title: 'O Nome do Vento', author: 'Patrick Rothfuss', match: 84, reason: 'Popular na comunidade'),
                  ],
                ),
                const SizedBox(height: 24),

                _TrailSection(
                  title: 'Autores similares',
                  subtitle: 'Similar authors',
                  books: const [
                    _BookMatch(title: 'A Quinta Onda', author: 'Rick Yancey', match: 81, reason: 'Autor com estilo próximo'),
                    _BookMatch(title: 'Station Eleven', author: 'Emily St. John Mandel', match: 78, reason: 'Mesma vibe narrativa'),
                  ],
                ),
                const SizedBox(height: 80),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _DiceCard extends StatelessWidget {
  final VoidCallback onTap;
  const _DiceCard({required this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: theme.colorScheme.primaryContainer,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Icon(Icons.casino_outlined, size: 40, color: theme.colorScheme.primary),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Jogar o Dado', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  Text(
                    'Deixe o destino escolher seu próximo livro',
                    style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                  ),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios, size: 16, color: theme.colorScheme.onSurfaceVariant),
          ],
        ),
      ),
    );
  }
}

class _BookMatch {
  final String title;
  final String author;
  final int match;
  final String reason;
  const _BookMatch({required this.title, required this.author, required this.match, required this.reason});
}

class _TrailSection extends StatelessWidget {
  final String title;
  final String subtitle;
  final List<_BookMatch> books;
  const _TrailSection({required this.title, required this.subtitle, required this.books});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                Text(subtitle, style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
              ],
            ),
            TextButton(onPressed: () {}, child: const Text('Ver mais')),
          ],
        ),
        const SizedBox(height: 8),
        ...books.map((b) => _BookMatchTile(book: b)),
      ],
    );
  }
}

class _BookMatchTile extends StatelessWidget {
  final _BookMatch book;
  const _BookMatchTile({required this.book});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Container(
          width: 40, height: 56,
          decoration: BoxDecoration(
            color: theme.colorScheme.primaryContainer,
            borderRadius: BorderRadius.circular(4),
          ),
          child: Icon(Icons.menu_book, color: theme.colorScheme.primary),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: theme.colorScheme.primary,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                '${book.match}% match',
                style: theme.textTheme.labelSmall?.copyWith(color: theme.colorScheme.onPrimary),
              ),
            ),
          ],
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(book.title, style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500)),
            Text(book.author, style: theme.textTheme.bodySmall),
            Text(book.reason, style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
          ],
        ),
        isThreeLine: true,
        trailing: IconButton(icon: const Icon(Icons.add_circle_outline), onPressed: () {}),
      ),
    );
  }
}
