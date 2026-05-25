import 'package:biblioo/shared/widgets/stat_item.dart';
import 'package:flutter/material.dart';

class ProfileStatsCard extends StatelessWidget {
  final String booksRead;
  final String pagesRead;
  final String daysPerBook;
  final String readersReached;

  const ProfileStatsCard({
    super.key,
    required this.booksRead,
    required this.pagesRead,
    required this.daysPerBook,
    required this.readersReached,
  });

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
              StatItem(value: daysPerBook, label: 'Dias / livro'),
              StatItem(value: readersReached, label: 'Leitores alcançados'),
            ],
          ),
        ),
      ),
    );
  }
}
