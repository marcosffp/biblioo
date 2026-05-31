abstract class PreferencesEvent {}

class PreferencesGenresLoadRequested extends PreferencesEvent {}

class PreferencesSubmitted extends PreferencesEvent {
  final List<String> selectedGenres;
  PreferencesSubmitted(this.selectedGenres);
}

class PreferencesSkipped extends PreferencesEvent {}
