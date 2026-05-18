import 'package:biblioo/features/recommendation/bloc/recommendation_bloc.dart';
import 'package:biblioo/features/recommendation/bloc/recommendation_event.dart';
import 'package:biblioo/features/recommendation/bloc/recommendation_state.dart';
import 'package:biblioo/features/recommendation/domain/recommended_book.dart';
import 'package:biblioo/screens/recommendation/widgets/rec_dice_banner.dart';
import 'package:biblioo/screens/recommendation/widgets/rec_trail_section.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

class RecommendationScreen extends StatefulWidget {
  const RecommendationScreen({super.key});

  @override
  State<RecommendationScreen> createState() => _RecommendationScreenState();
}

class _RecommendationScreenState extends State<RecommendationScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<RecommendationBloc>().add(RecommendationLoadRequested());
    });
  }

  Future<void> _refresh() async {
    context.read<RecommendationBloc>().add(RecommendationLoadRequested());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: CustomScrollView(
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
                  BlocBuilder<RecommendationBloc, RecommendationState>(
                    buildWhen: (p, c) =>
                        p.dice != c.dice || p.diceRolling != c.diceRolling,
                    builder: (context, state) => RecDiceBanner(
                      book: state.dice.data,
                      loading: state.dice.isLoading && !state.dice.hasData,
                      rolling: state.diceRolling,
                      onRoll: () => context
                          .read<RecommendationBloc>()
                          .add(RecommendationDiceRolled()),
                      onTap: (id) => context.push('/book/$id'),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Porque você leu
                  BlocBuilder<RecommendationBloc, RecommendationState>(
                    buildWhen: (p, c) => p.becauseYouRead != c.becauseYouRead,
                    builder: (context, state) {
                      final t = state.becauseYouRead;
                      return RecTrailSection(
                        title: t.data?.seedBookTitle != null
                            ? 'Porque você leu "${t.data!.seedBookTitle}"'
                            : 'Porque você leu...',
                        subtitle:
                            'Leitores com gosto similar também curtiram',
                        loading: t.isLoading && !t.hasData,
                        books: t.data?.books,
                      );
                    },
                  ),

                  _TrailBuilder(
                    title: 'Seu Gênero Favorito Agora',
                    selector: (s) => s.favoriteGenreNow,
                    subtitleFor: (data) => data.topGenres.join(' · '),
                    booksFor: (data) => data.books,
                  ),

                  _SimpleTrailBuilder(
                    title: 'Em Alta nas Comunidades',
                    subtitle: 'Os mais comentados e discutidos essa semana',
                    selector: (s) => s.trending,
                  ),

                  _SimpleTrailBuilder(
                    title: 'Surpresa do Catálogo',
                    subtitle:
                        'Algo fora da sua zona de conforto para expandir horizontes',
                    selector: (s) => s.catalogSurprise,
                  ),

                  _SimpleTrailBuilder(
                    title: 'Autores Similares',
                    subtitle: 'Você pode gostar de quem escreve assim',
                    selector: (s) => s.similarAuthors,
                  ),

                  _SimpleTrailBuilder(
                    title: 'Releituras que Valem',
                    subtitle: 'Livros que você leu e merecem uma nova chance',
                    selector: (s) => s.rereadWorthIt,
                  ),

                  const SizedBox(height: 80),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TrailBuilder<T> extends StatelessWidget {
  final String title;
  final TrailState<T> Function(RecommendationState) selector;
  final String? Function(T) subtitleFor;
  final List<RecommendedBook> Function(T) booksFor;

  const _TrailBuilder({
    required this.title,
    required this.selector,
    required this.subtitleFor,
    required this.booksFor,
  });

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<RecommendationBloc, RecommendationState>(
      buildWhen: (p, c) => selector(p) != selector(c),
      builder: (context, state) {
        final t = selector(state);
        return RecTrailSection(
          title: title,
          subtitle: t.data == null ? null : subtitleFor(t.data as T),
          loading: t.isLoading && !t.hasData,
          books: t.data == null ? null : booksFor(t.data as T),
        );
      },
    );
  }
}

class _SimpleTrailBuilder extends StatelessWidget {
  final String title;
  final String subtitle;
  final TrailState<List<RecommendedBook>> Function(RecommendationState) selector;

  const _SimpleTrailBuilder({
    required this.title,
    required this.subtitle,
    required this.selector,
  });

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<RecommendationBloc, RecommendationState>(
      buildWhen: (p, c) => selector(p) != selector(c),
      builder: (context, state) {
        final t = selector(state);
        return RecTrailSection(
          title: title,
          subtitle: subtitle,
          loading: t.isLoading && !t.hasData,
          books: t.data,
        );
      },
    );
  }
}
