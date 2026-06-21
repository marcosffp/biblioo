import 'package:biblioo/features/preferences/data/preferences_local_datasource.dart';
import 'package:biblioo/features/preferences/data/preferences_remote_datasource.dart';
import 'package:biblioo/features/preferences/domain/genre.dart';

class PreferencesRepository {
  final PreferencesRemoteDatasource _remote;
  final PreferencesLocalDatasource _local;

  const PreferencesRepository(this._remote, this._local);

  bool isOnboardingDone(int userId) => _local.isOnboardingDone(userId);

  Future<List<Genre>> getGenres() async {
    final models = await _remote.getGenres();
    return models.map((m) => m.toEntity()).toList();
  }

  Future<void> savePreferences(
    int userId,
    List<String> genres,
    List<int> bookIds,
  ) async {
    if (genres.isNotEmpty || bookIds.isNotEmpty) {
      await _remote.savePreferences(genres, bookIds);
    }
    await _local.markOnboardingDone(userId);
  }

  Future<void> skipOnboarding(int userId) => _local.markOnboardingDone(userId);
}