import 'package:biblioo/shared/widgets/stat_item.dart';
import 'package:flutter/material.dart';

class ProfileStatsCard extends StatelessWidget {
  final String booksRead;
  final String pagesRead;
  final String daysPerBook;
  final String readersReached;
  final int activeDays;

  const ProfileStatsCard({
    super.key,
    required this.booksRead,
    required this.pagesRead,
    required this.daysPerBook,
    required this.readersReached,
    this.activeDays = 0,
  });

  /// Retorna o widget do ícone de foguinho baseado na quantidade de dias ativos.
  Widget _buildFlameIcon(BuildContext context, int count) {
    final Color color;
    if (count == 0) {
      color = Theme.of(
        context,
      ).colorScheme.onSurfaceVariant.withValues(alpha: 0.35);
    } else if (count <= 5) {
      color = const Color(0xFFFBBF24); // yellow-400
    } else if (count <= 15) {
      color = const Color(0xFFFB923C); // orange-400
    } else if (count <= 30) {
      color = const Color(0xFFF97316); // orange-500
    } else {
      color = const Color(0xFFEF4444); // red-500
    }
    return Icon(Icons.local_fire_department_rounded, size: 18, color: color);
  }

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
              StatItem(value: booksRead, label: 'Livros lidos'),
              StatItem(value: pagesRead, label: 'Páginas lidas'),
              StatItemWithIcon(
                value: activeDays.toString(),
                label: 'Dias ativos',
                icon: _buildFlameIcon(context, activeDays),
              ),
              StatItem(value: readersReached, label: 'Leitores alcançados'),
            ],
          ),
        ),
      ),
    );
  }
}
