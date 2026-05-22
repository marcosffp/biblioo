import 'package:biblioo/features/preferences/bloc/preferences_bloc.dart';
import 'package:biblioo/features/preferences/bloc/preferences_event.dart';
import 'package:biblioo/features/preferences/bloc/preferences_state.dart';
import 'package:biblioo/features/preferences/domain/genre.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final Set<String> _selectedGenres = {};

  static const _minGenres = 3;

  @override
  void initState() {
    super.initState();
    context.read<PreferencesBloc>().add(PreferencesGenresLoadRequested());
  }

  void _toggleGenre(String original) {
    setState(() {
      if (_selectedGenres.contains(original)) {
        _selectedGenres.remove(original);
      } else {
        _selectedGenres.add(original);
      }
    });
  }

  void _finish() {
    context
        .read<PreferencesBloc>()
        .add(PreferencesSubmitted(_selectedGenres.toList()));
  }

  void _skip() {
    context.read<PreferencesBloc>().add(PreferencesSkipped());
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<PreferencesBloc, PreferencesState>(
      listener: (context, state) {
        if (state.status == PreferencesStatus.done) {
          context.go('/feed');
        }
      },
      child: Scaffold(
        body: SafeArea(
          child: _GenresStep(
            selectedGenres: _selectedGenres,
            onToggle: _toggleGenre,
            onFinish: _finish,
            onSkip: _skip,
            minGenres: _minGenres,
          ),
        ),
      ),
    );
  }
}

// ── Genres step ───────────────────────────────────────────────────────────────

class _GenresStep extends StatelessWidget {
  final Set<String> selectedGenres;
  final void Function(String) onToggle;
  final VoidCallback onFinish;
  final VoidCallback onSkip;
  final int minGenres;

  const _GenresStep({
    required this.selectedGenres,
    required this.onToggle,
    required this.onFinish,
    required this.onSkip,
    required this.minGenres,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final canFinish = selectedGenres.length >= minGenres;
    final remaining = (minGenres - selectedGenres.length).clamp(0, minGenres);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Quais gêneros você mais curte?',
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Escolha pelo menos $minGenres para personalizarmos suas recomendações.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        Expanded(
          child: BlocBuilder<PreferencesBloc, PreferencesState>(
            buildWhen: (p, c) => p.status != c.status || p.genres != c.genres,
            builder: (context, state) => _buildBody(context, state),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
          child: BlocBuilder<PreferencesBloc, PreferencesState>(
            buildWhen: (p, c) => p.status != c.status,
            builder: (context, state) {
              final isSubmitting = state.status == PreferencesStatus.submitting;
              return Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          selectedGenres.isEmpty
                              ? 'Nenhum selecionado'
                              : '${selectedGenres.length} selecionado${selectedGenres.length != 1 ? 's' : ''}${remaining > 0 ? ' · selecione mais $remaining' : ''}',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: remaining > 0
                                ? theme.colorScheme.primary
                                : theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      FilledButton.icon(
                        style: FilledButton.styleFrom(
                          minimumSize: const Size(0, 44),
                        ),
                        onPressed: (canFinish && !isSubmitting) ? onFinish : null,
                        icon: isSubmitting
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Icon(Icons.check, size: 18),
                        label: const Text('Começar a explorar'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    child: TextButton(
                      onPressed: isSubmitting ? null : onSkip,
                      child: const Text('Pular por agora'),
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildBody(BuildContext context, PreferencesState state) {
    if (state.status == PreferencesStatus.loadingGenres) {
      return const Center(child: CircularProgressIndicator());
    }
    if (state.status == PreferencesStatus.genresError) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(state.errorMessage ?? 'Erro ao carregar gêneros'),
            const SizedBox(height: 12),
            FilledButton.tonal(
              onPressed: () => context
                  .read<PreferencesBloc>()
                  .add(PreferencesGenresLoadRequested()),
              child: const Text('Tentar novamente'),
            ),
          ],
        ),
      );
    }
    return _GenreGrid(
      genres: state.genres,
      selected: selectedGenres,
      onToggle: onToggle,
    );
  }
}

class _GenreGrid extends StatelessWidget {
  final List<Genre> genres;
  final Set<String> selected;
  final void Function(String) onToggle;

  const _GenreGrid({
    required this.genres,
    required this.selected,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        childAspectRatio: 2.8,
      ),
      itemCount: genres.length,
      itemBuilder: (context, index) {
        final genre = genres[index];
        final isSelected = selected.contains(genre.original);
        return _GenreChip(
          genre: genre,
          isSelected: isSelected,
          onTap: () => onToggle(genre.original),
        );
      },
    );
  }
}

class _GenreChip extends StatelessWidget {
  final Genre genre;
  final bool isSelected;
  final VoidCallback onTap;

  const _GenreChip({
    required this.genre,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return AnimatedContainer(
      duration: const Duration(milliseconds: 150),
      decoration: BoxDecoration(
        color: isSelected
            ? theme.colorScheme.primaryContainer
            : theme.colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isSelected
              ? theme.colorScheme.primary
              : theme.colorScheme.outlineVariant,
          width: isSelected ? 2 : 1,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  genre.translated,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                    color: isSelected
                        ? theme.colorScheme.onPrimaryContainer
                        : theme.colorScheme.onSurface,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (isSelected)
                Icon(Icons.check_circle, size: 18, color: theme.colorScheme.primary),
            ],
          ),
        ),
      ),
    );
  }
}
