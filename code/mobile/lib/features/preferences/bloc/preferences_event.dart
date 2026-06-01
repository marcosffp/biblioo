abstract class PreferencesEvent {}

class PreferencesGenresLoadRequested extends PreferencesEvent {}

class PreferencesSubmitted extends PreferencesEvent {
  final int userId;
  final List<String> selectedGenres;
  final List<int> selectedBookIds;
  PreferencesSubmitted(
    this.userId,
    this.selectedGenres,
    this.selectedBookIds,
  );
}

class PreferencesSkipped extends PreferencesEvent {
  final int userId;
  PreferencesSkipped(this.userId);
}