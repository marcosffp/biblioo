import 'package:biblioo/shared/widgets/stat_item.dart';
import 'package:flutter/material.dart';

class ProfileStatsCard extends StatelessWidget {
  const ProfileStatsCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: const Wrap(
          alignment: WrapAlignment.spaceAround,
          spacing: 20,
          runSpacing: 12,
          children: [
            StatItem(value: '-', label: 'Livros Lidos'),
            StatItem(value: '-', label: 'Avaliacoes'),
            StatItem(value: '-', label: 'Seguidores'),
            StatItem(value: '-', label: 'Paginas Lidas'),
          ],
        ),
      ),
    );
  }
}
