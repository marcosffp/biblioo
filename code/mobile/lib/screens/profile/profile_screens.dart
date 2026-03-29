// ── profile_screen.dart ──────────────────────────────────
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            expandedHeight: 160,
            actions: [
              IconButton(icon: const Icon(Icons.settings_outlined), onPressed: () {}),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Container(color: theme.colorScheme.primaryContainer),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Avatar sobre o banner
                  Transform.translate(
                    offset: const Offset(0, -36),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        CircleAvatar(
                          radius: 36,
                          backgroundColor: theme.colorScheme.primary,
                          child: Text('JL', style: theme.textTheme.titleLarge?.copyWith(color: theme.colorScheme.onPrimary)),
                        ),
                        const Spacer(),
                        OutlinedButton(
                          onPressed: () => context.push('/profile/edit'),
                          style: OutlinedButton.styleFrom(minimumSize: const Size(0, 36)),
                          child: const Text('Editar'),
                        ),
                        const SizedBox(width: 8),
                        FilledButton(
                          onPressed: () {},
                          style: FilledButton.styleFrom(minimumSize: const Size(0, 36)),
                          child: const Text('Compartilhar'),
                        ),
                      ],
                    ),
                  ),
                  Transform.translate(
                    offset: const Offset(0, -24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('João Leitor', style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w600)),
                        const SizedBox(height: 2),
                        Row(children: [
                          Icon(Icons.public, size: 14, color: theme.colorScheme.onSurfaceVariant),
                          Text(' Perfil Público', style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
                        ]),
                        const SizedBox(height: 8),
                        Text('Apaixonado por literatura clássica e ficção científica.', style: theme.textTheme.bodyMedium),
                      ],
                    ),
                  ),

                  // Stats
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _StatItem(value: '47', label: 'Livros Lidos'),
                          _StatItem(value: '32', label: 'Avaliações'),
                          _StatItem(value: '128', label: 'Seguidores'),
                          _StatItem(value: '84.2k', label: 'Páginas Lidas'),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // DNA Literário preview
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(children: [
                        Icon(Icons.auto_awesome, size: 18, color: theme.colorScheme.primary),
                        const SizedBox(width: 6),
                        Text('DNA Literário', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                      ]),
                      TextButton(onPressed: () => context.push('/profile/dna'), child: const Text('Ver mais')),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ...[
                    ('Ficção Científica', 0.35),
                    ('Romance', 0.28),
                    ('Distopia', 0.20),
                  ].map((g) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Column(
                      children: [
                        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                          Text(g.$1, style: theme.textTheme.bodyMedium),
                          Text('${(g.$2 * 100).toInt()}%', style: theme.textTheme.bodySmall),
                        ]),
                        const SizedBox(height: 4),
                        LinearProgressIndicator(value: g.$2, borderRadius: BorderRadius.circular(4)),
                      ],
                    ),
                  )),
                  const SizedBox(height: 20),

                  // Avaliações e comentários
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Avaliações', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                      TextButton(onPressed: () {}, child: const Text('Ver todas')),
                    ],
                  ),
                  const SizedBox(height: 8),
                  _ReviewWithReplies(theme: theme),
                  const SizedBox(height: 80),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String value, label;
  const _StatItem({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(children: [
      Text(value, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
      Text(label, style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
    ]);
  }
}

class _ReviewWithReplies extends StatelessWidget {
  final ThemeData theme;
  const _ReviewWithReplies({required this.theme});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Review principal
            Row(children: [
              CircleAvatar(
                radius: 14,
                backgroundColor: theme.colorScheme.primaryContainer,
                child: Text('JL', style: TextStyle(color: theme.colorScheme.primary, fontSize: 10)),
              ),
              const SizedBox(width: 8),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('João Leitor', style: theme.textTheme.labelMedium),
                Row(children: List.generate(5, (i) => Icon(Icons.star, size: 12, color: theme.colorScheme.primary))),
              ])),
            ]),
            const SizedBox(height: 6),
            const Text('Uma das melhores distopias que já li. Orwell foi assustadoramente profético.'),
            const SizedBox(height: 8),
            Row(children: [
              Icon(Icons.favorite_border, size: 14, color: theme.colorScheme.onSurfaceVariant),
              Text(' 12', style: theme.textTheme.bodySmall),
              const SizedBox(width: 12),
              GestureDetector(
                onTap: () {},
                child: Row(children: [
                  Icon(Icons.chat_bubble_outline, size: 14, color: theme.colorScheme.onSurfaceVariant),
                  Text(' Responder', style: theme.textTheme.bodySmall),
                ]),
              ),
            ]),

            // Replies encadeadas (Twitter-style)
            const SizedBox(height: 12),
            IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Container(
                    width: 2,
                    margin: const EdgeInsets.only(left: 13),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.outlineVariant,
                      borderRadius: BorderRadius.circular(1),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _Reply(author: 'Ana Clara', avatar: 'AC', text: 'Concordo! Capítulo 7 me deixou sem palavras.', theme: theme),
                        const SizedBox(height: 8),
                        _Reply(author: 'Pedro H.', avatar: 'PH', text: 'Leia Admirável Mundo Novo depois!', theme: theme),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Reply extends StatelessWidget {
  final String author, avatar, text;
  final ThemeData theme;
  const _Reply({required this.author, required this.avatar, required this.text, required this.theme});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CircleAvatar(
          radius: 12,
          backgroundColor: theme.colorScheme.primaryContainer,
          child: Text(avatar, style: TextStyle(color: theme.colorScheme.primary, fontSize: 8)),
        ),
        const SizedBox(width: 8),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(author, style: theme.textTheme.labelSmall),
          Text(text, style: theme.textTheme.bodySmall),
        ])),
      ],
    );
  }
}

// ── edit_profile_screen.dart ─────────────────────────────
class EditProfileScreen extends StatelessWidget {
  const EditProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: BackButton(onPressed: () => context.pop()),
        title: const Text('Editar Perfil'),
        actions: [TextButton(onPressed: () => context.pop(), child: const Text('Salvar'))],
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const TextField(decoration: InputDecoration(labelText: 'Nome de usuário', prefixIcon: Icon(Icons.alternate_email))),
          const SizedBox(height: 12),
          const TextField(decoration: InputDecoration(labelText: 'Bio', prefixIcon: Icon(Icons.info_outline)), maxLines: 3),
          const SizedBox(height: 12),
          SwitchListTile(
            title: const Text('Perfil público'),
            subtitle: const Text('Qualquer pessoa pode ver seu perfil'),
            value: true,
            onChanged: (_) {},
            contentPadding: EdgeInsets.zero,
          ),
        ],
      ),
    );
  }
}

// ── dna_screen.dart ──────────────────────────────────────
class DnaScreen extends StatelessWidget {
  const DnaScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        leading: BackButton(onPressed: () => context.pop()),
        title: const Text('DNA Literário'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Soul genre card
          Card(
            color: theme.colorScheme.primaryContainer,
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(children: [
                Icon(Icons.auto_awesome, size: 36, color: theme.colorScheme.primary),
                const SizedBox(height: 8),
                Text('Explorador de Mundos', style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Text('Seu gênero predominante', style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
              ]),
            ),
          ),
          const SizedBox(height: 16),

          // Stats grid
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.4,
            children: [
              _DnaStat(icon: Icons.menu_book, label: 'Livros lidos', value: '47'),
              _DnaStat(icon: Icons.speed, label: 'Ritmo', value: '3.2/mês'),
              _DnaStat(icon: Icons.emoji_events, label: 'Percentil', value: 'Top 22%'),
              _DnaStat(icon: Icons.local_fire_department, label: 'Mês intenso', value: 'Mar 2026'),
            ],
          ),
          const SizedBox(height: 16),

          // Gêneros favoritos
          Text('Gêneros favoritos', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          ...[
            ('Ficção Científica', 0.35),
            ('Romance', 0.28),
            ('Distopia', 0.20),
            ('Fantasia', 0.11),
            ('Biografia', 0.06),
          ].map((g) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Column(children: [
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Text(g.$1),
                Text('${(g.$2 * 100).toInt()}%', style: theme.textTheme.bodySmall),
              ]),
              const SizedBox(height: 4),
              LinearProgressIndicator(value: g.$2, borderRadius: BorderRadius.circular(4)),
            ]),
          )),
          const SizedBox(height: 16),

          // Frase do período
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Icon(Icons.format_quote, color: theme.colorScheme.primary),
                  const SizedBox(width: 6),
                  Text('Período em destaque', style: theme.textTheme.labelLarge),
                ]),
                const SizedBox(height: 8),
                const Text('Em março de 2026 você leu 6 livros — seu melhor mês até agora. Ficção científica dominou sua leitura.'),
              ]),
            ),
          ),
          const SizedBox(height: 80),
        ],
      ),
    );
  }
}

class _DnaStat extends StatelessWidget {
  final IconData icon;
  final String label, value;
  const _DnaStat({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: theme.colorScheme.primary),
            const SizedBox(height: 6),
            Text(value, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
            Text(label, style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}
