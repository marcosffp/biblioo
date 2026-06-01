import 'package:dio/dio.dart';
import 'models/book_voting_model.dart';

class CommunityVotingRemoteDatasource {
  final Dio dio;
  static const baseUrl = '/communities';

  CommunityVotingRemoteDatasource(this.dio);

  Future<BookVotingModel> createVoting(
    int communityId,
    Map<String, dynamic> payload,
  ) async {
    try {
      final response = await dio.post(
        '$baseUrl/$communityId/votings',
        data: payload,
      );
      return BookVotingModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception('Erro ao criar votação: ${e.message}');
    }
  }

  Future<BookVotingModel> publishVoting(int communityId, int votingId) async {
    try {
      final response = await dio.post(
        '$baseUrl/$communityId/votings/$votingId/publish',
      );
      return BookVotingModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception('Erro ao publicar votação: ${e.message}');
    }
  }

  /// Lista votações de uma comunidade
  Future<List<BookVotingModel>> listVotings(int communityId) async {
    try {
      final response = await dio.get('$baseUrl/$communityId/votings');
      final data = response.data;

      if (data is Map<String, dynamic>) {
        // Retorno paginado: { content: [...] }
        final content = data['content'];
        if (content is List<dynamic>) {
          return content
              .map((v) => BookVotingModel.fromJson(v as Map<String, dynamic>))
              .toList();
        }
      }

      if (data is List<dynamic>) {
        // Retorno em lista direta: [...]
        return data
            .map((v) => BookVotingModel.fromJson(v as Map<String, dynamic>))
            .toList();
      }

      return [];
    } on DioException catch (e) {
      throw Exception('Erro ao listar votações: ${e.message}');
    }
  }

  /// Obtém votação ativa da comunidade (se houver)
  Future<BookVotingModel?> getActiveVoting(int communityId) async {
    try {
      final votings = await listVotings(communityId);
      for (final voting in votings) {
        if (voting.status.toUpperCase() == 'PUBLISHED') {
          return voting;
        }
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  /// Obtém votação específica
  Future<BookVotingModel> getVoting(int communityId, int votingId) async {
    try {
      final response = await dio.get('$baseUrl/$communityId/votings/$votingId');
      return BookVotingModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception('Erro ao buscar votação: ${e.message}');
    }
  }

  /// Vota em uma opção
  Future<BookVotingModel> castVote(
    int communityId,
    int votingId,
    int optionId,
  ) async {
    try {
      final response = await dio.post(
        '$baseUrl/$communityId/votings/$votingId/vote',
        data: {'optionId': optionId},
      );
      return BookVotingModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception('Erro ao votar: ${e.message}');
    }
  }

  /// Desfaz o voto (se implementado no backend)
  Future<BookVotingModel> undoVote(
    int communityId,
    int votingId,
    int optionId,
  ) async {
    try {
      final response = await dio.post(
        '$baseUrl/$communityId/votings/$votingId/vote',
        data: {'optionId': optionId},
      );
      return BookVotingModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception('Erro ao desfazer voto: ${e.message}');
    }
  }

  /// Encerra votação (apenas proprietário)
  Future<BookVotingModel> closeVoting(int communityId, int votingId) async {
    try {
      final response = await dio.post(
        '$baseUrl/$communityId/votings/$votingId/close',
      );
      return BookVotingModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception('Erro ao encerrar votação: ${e.message}');
    }
  }

  /// Aprova resultado da votação (apenas proprietário)
  Future<BookVotingModel> approveVoting(
    int communityId,
    int votingId, {
    int? winnerOptionId,
  }) async {
    try {
      final data = winnerOptionId != null
          ? {'winnerOptionId': winnerOptionId}
          : null;
      final response = await dio.post(
        '$baseUrl/$communityId/votings/$votingId/approve',
        data: data,
      );
      return BookVotingModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception('Erro ao aprovar votação: ${e.message}');
    }
  }

  /// Rejeita resultado da votação (apenas proprietário)
  Future<BookVotingModel> rejectVoting(
    int communityId,
    int votingId,
    String reason,
  ) async {
    try {
      final response = await dio.post(
        '$baseUrl/$communityId/votings/$votingId/reject',
        data: {'reason': reason},
      );
      return BookVotingModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception('Erro ao rejeitar votação: ${e.message}');
    }
  }
}
