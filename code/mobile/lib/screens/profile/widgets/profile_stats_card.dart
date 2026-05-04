import 'package:biblioo/shared/widgets/stat_item.dart';
import 'package:flutter/material.dart';

class ProfileStatsCard extends StatelessWidget {
  const ProfileStatsCard({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Wrap(
            alignment: WrapAlignment.spaceAround,
            spacing: 20,
            runSpacing: 12,
            children: [
              const StatItem(value: '-', label: 'Avaliações'),
              const StatItem(value: '-', label: 'Livros lidos'),
              const StatItem(value: '-', label: 'Páginas lidas'),
            ],
          ),
        ),
      ),
    );
  }
}

class _InteractiveStatItem extends StatelessWidget {
  final String value;
  final String label;
  final VoidCallback onTap;

  const _InteractiveStatItem({
    required this.value,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: StatItem(value: value, label: label),
      ),
    );
  }
}
