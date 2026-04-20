class CommunityPostDraft {
  final String text;
  final List<String> imagePaths;
  final String? gifUrl;
  final List<String> tags;
  final bool hasSpoiler;
  final int? pageRef;

  const CommunityPostDraft({
    required this.text,
    required this.imagePaths,
    required this.gifUrl,
    required this.tags,
    required this.hasSpoiler,
    required this.pageRef,
  });
}
