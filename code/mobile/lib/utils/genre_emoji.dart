/// Mapeia o nome `original` (em inglês) de um gênero para um emoji representativo.
///
/// O backend (`GET /genres`) retorna gêneros dinâmicos em inglês no campo
/// `original` — então a correspondência é feita por palavra-chave sobre esse
/// valor, e não por uma lista fixa. Gêneros sem correspondência caem no
/// fallback 📖, garantindo que a UI nunca fique sem ícone.
library;

/// Pares emoji → palavras-chave. A ordem importa: termos mais específicos
/// (ex.: "science fiction") vêm antes dos genéricos (ex.: "science").
const _genreEmojiKeywords = <String, List<String>>{
  '🚀': ['science fiction', 'sci-fi', 'scifi'],
  '❤️': ['romance', 'love stories'],
  '🧙': ['fantasy', 'magic', 'mythology'],
  '🔍': ['mystery', 'detective', 'crime', 'noir'],
  '👻': ['horror', 'ghost', 'supernatural', 'occult'],
  '⚡': ['thriller', 'suspense'],
  '🗺️': ['adventure'],
  '🏛️': ['historical', 'history'],
  '✨': ['self-help', 'self help', 'personal development', 'motivational'],
  '📜': ['classic', 'literary', 'literature'],
  '🪶': ['poetry', 'poems', 'verse'],
  '🧠': ['philosophy', 'philosophical', 'psychology'],
  '👤': ['biography', 'autobiography', 'memoir'],
  '⭐': ['young adult', 'teen', 'juvenile'],
  '🎨': ['comic', 'graphic novel', 'manga'],
  '😂': ['humor', 'humour', 'comedy', 'satire'],
  '💼': ['business', 'economics', 'finance', 'management', 'entrepreneur'],
  '🍳': ['cooking', 'cookbook', 'food', 'culinary'],
  '✈️': ['travel'],
  '🙏': ['religion', 'religious', 'spiritual', 'faith', 'bible'],
  '⚔️': ['war', 'military'],
  '🩺': ['health', 'medical', 'fitness', 'wellness'],
  '🎭': ['drama', 'theatre', 'theater', 'plays'],
  '👶': ['children', 'picture book'],
  '🎓': ['education', 'reference', 'textbook', 'study', 'academic'],
  '🏃': ['sports', 'sport', 'games'],
  '🎵': ['music'],
  '🖼️': ['art', 'photography', 'design'],
  '🌍': ['politics', 'political', 'social science', 'society'],
  '🔬': ['science', 'technology', 'nature', 'mathematics'],
  '🐉': ['dragon', 'epic'],
};

/// Retorna o emoji associado a [original] (nome em inglês do gênero).
String genreEmoji(String original) {
  final lower = original.toLowerCase();
  for (final entry in _genreEmojiKeywords.entries) {
    for (final keyword in entry.value) {
      if (lower.contains(keyword)) return entry.key;
    }
  }
  return '📖';
}