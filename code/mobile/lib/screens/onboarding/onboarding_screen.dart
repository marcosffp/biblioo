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
  int _step = 1;
  final Set<String> _selectedGenres = {};
  String? _selectedFrequency;

  static const _minGenres = 3;

  static const _frequencies = [
    _Frequency('daily', 'Todo dia', 'Leio pelo menos um pouco todos os dias', Icons.calendar_today),
    _Frequency('weekly', 'Algumas vezes por semana', 'Leio quando encontro um tempo livre', Icons.view_week),
    _Frequency('weekends', 'Fins de semana', 'Reservo o fim de semana para leitura', Icons.weekend),
    _Frequency('casual', 'Quando tenho tempo', 'Leio sem frequência definida', Icons.waves),
  ];

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
    context.read<PreferencesBloc>().add(
          PreferencesSubmitted(_selectedGenres.toList()),
        );
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
          child: Column(
            children: [
              _ProgressBar(step: _step),
              Expanded(
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 280),
                  transitionBuilder: (child, animation) => SlideTransition(
                    position: Tween<Offset>(
                      begin: const Offset(0.15, 0),
                      end: Offset.zero,
                    ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOut)),
                    child: FadeTransition(opacity: animation, child: child),
                  ),
                  child: _step == 1
                      ? _Step1(
                          key: const ValueKey(1),
                          selectedGenres: _selectedGenres,
                          onToggle: _toggleGenre,
                          onContinue: () => setState(() => _step = 2),
                          onSkip: _skip,
                          minGenres: _minGenres,
                        )
                      : _Step2(
                          key: const ValueKey(2),
                          selectedFrequency: _selectedFrequency,
                          frequencies: _frequencies,
                          onSelect: (f) => setState(() => _selectedFrequency = f),
                          onBack: () => setState(() => _step = 1),
                          onFinish: _finish,
                          onSkip: _skip,
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Progress bar ──────────────────────────────────────────────────────────────

class _ProgressBar extends StatelessWidget {
  final int step;
  const _ProgressBar({required this.step});

  @override
  Widget build(BuildContext context) {
    final color = Theme.of(context).colorScheme.primary;
    return TweenAnimationBuilder<double>(
      tween: Tween(end: step == 1 ? 0.5 : 1.0),
      duration: const Duration(milliseconds: 450),
      curve: Curves.easeInOut,
      builder: (context, value, _) => LinearProgressIndicator(
        value: value,
        backgroundColor: color.withValues(alpha: 0.15),
        color: color,
        minHeight: 3,
      ),
    );
  }
}

// ── Step 1 — Genres ───────────────────────────────────────────────────────────

class _Step1 extends StatelessWidget {
  final Set<String> selectedGenres;
  final void Function(String) onToggle;
  final VoidCallback onContinue;
  final VoidCallback onSkip;
  final int minGenres;

  const _Step1({
    super.key,
    required this.selectedGenres,
    required this.onToggle,
    required this.onContinue,
    required this.onSkip,
    required this.minGenres,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final canAdvance = selectedGenres.length >= minGenres;
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
                'Passo 1 de 2',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: theme.colorScheme.primary,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 8),
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
            builder: (context, state) {
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
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    selectedGenres.isEmpty
                        ? 'Nenhum selecionado'
                        : '${selectedGenres.length} selecionado${selectedGenres.length != 1 ? 's' : ''}${remaining > 0 ? ' · selecione mais $remaining' : ''}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: remaining > 0
                          ? theme.colorScheme.primary
                          : theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  FilledButton.icon(
                    onPressed: canAdvance ? onContinue : null,
                    icon: const Icon(Icons.arrow_forward, size: 18),
                    label: const Text('Continuar'),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: onSkip,
                  child: const Text('Pular por agora'),
                ),
              ),
            ],
          ),
        ),
      ],
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

// ── Step 2 — Reading frequency ────────────────────────────────────────────────

class _Frequency {
  final String id;
  final String label;
  final String description;
  final IconData icon;

  const _Frequency(this.id, this.label, this.description, this.icon);
}

class _Step2 extends StatelessWidget {
  final String? selectedFrequency;
  final List<_Frequency> frequencies;
  final void Function(String) onSelect;
  final VoidCallback onBack;
  final VoidCallback onFinish;
  final VoidCallback onSkip;

  const _Step2({
    super.key,
    required this.selectedFrequency,
    required this.frequencies,
    required this.onSelect,
    required this.onBack,
    required this.onFinish,
    required this.onSkip,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final canFinish = selectedFrequency != null;

    return BlocBuilder<PreferencesBloc, PreferencesState>(
      buildWhen: (p, c) => p.status != c.status,
      builder: (context, state) {
        final isSubmitting = state.status == PreferencesStatus.submitting;

        return SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Passo 2 de 2',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: theme.colorScheme.primary,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Com que frequência você lê?',
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Vamos ajudar você a manter o ritmo certo de leitura.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 24),

              ...frequencies.map((freq) {
                final isSelected = selectedFrequency == freq.id;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: _FrequencyCard(
                    frequency: freq,
                    isSelected: isSelected,
                    onTap: () => onSelect(freq.id),
                  ),
                );
              }),

              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton.icon(
                    onPressed: isSubmitting ? null : onBack,
                    icon: const Icon(Icons.arrow_back, size: 18),
                    label: const Text('Voltar'),
                  ),
                  FilledButton.icon(
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
          ),
        );
      },
    );
  }
}

class _FrequencyCard extends StatelessWidget {
  final _Frequency frequency;
  final bool isSelected;
  final VoidCallback onTap;

  const _FrequencyCard({
    required this.frequency,
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
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isSelected
              ? theme.colorScheme.primary
              : theme.colorScheme.outlineVariant,
          width: isSelected ? 2 : 1,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Icon(
                frequency.icon,
                size: 28,
                color: isSelected
                    ? theme.colorScheme.primary
                    : theme.colorScheme.onSurfaceVariant,
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      frequency.label,
                      style: theme.textTheme.bodyLarge?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: isSelected
                            ? theme.colorScheme.onPrimaryContainer
                            : theme.colorScheme.onSurface,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      frequency.description,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              if (isSelected)
                Icon(Icons.check_circle, size: 22, color: theme.colorScheme.primary),
            ],
          ),
        ),
      ),
    );
  }
}
