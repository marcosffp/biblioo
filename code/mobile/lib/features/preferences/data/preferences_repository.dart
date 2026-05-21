import 'package:biblioo/features/preferences/data/preferences_local_datasource.dart';
import 'package:biblioo/features/preferences/data/preferences_remote_datasource.dart';
import 'package:biblioo/features/preferences/domain/genre.dart';

class PreferencesRepository {
  final PreferencesRemoteDatasource _remote;
  final PreferencesLocalDatasource _local;

  const PreferencesRepository(this._remote, this._local);

  bool isOnboardingDone() => _local.isOnboardingDone();

  Future<List<Genre>> getGenres() async {
    final models = await _remote.getGenres();
    return models.map((m) => m.toEntity()).toList();
  }

  /// Salva preferências no backend e marca onboarding como concluído.
  /// Se [genres] estiver vazio, pula a chamada ao backend (apenas marca local).
  Future<void> savePreferences(List<String> genres) async {
    if (genres.isNotEmpty) {
      await _remote.savePreferences(genres);
    }
    await _local.markOnboardingDone();
  }

  Future<void> skipOnboarding() => _local.markOnboardingDone();
}
