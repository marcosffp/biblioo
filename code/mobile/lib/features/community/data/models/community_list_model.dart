import 'community_model.dart';

class CommunityListModel {
  final List<CommunityModel> mine;
  final List<CommunityModel> suggestions;

  const CommunityListModel({
    required this.mine,
    required this.suggestions,
  });

  factory CommunityListModel.fromJson(Map<String, dynamic> json) =>
      CommunityListModel(
        mine: (json['mine'] as List<dynamic>)
            .map((e) => CommunityModel.fromJson(e as Map<String, dynamic>))
            .toList(),
        suggestions: (json['suggestions'] as List<dynamic>)
            .map((e) => CommunityModel.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}
