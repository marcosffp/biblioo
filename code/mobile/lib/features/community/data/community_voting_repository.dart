import 'package:biblioo/features/community/domain/book_voting.dart';
import 'community_voting_remote_datasource.dart';

class CommunityVotingFailure implements Exception {
  final String message;
  const CommunityVotingFailure(this.message);

  @override
  String toString() => message;
}

class CommunityVotingRepository {
  final CommunityVotingRemoteDatasource _remote;

  CommunityVotingRepository(this._remote);

  Future<BookVoting> createVoting(
    int communityId,
    Map<String, dynamic> payload,
  ) async {
    try {
      final model = await _remote.createVoting(communityId, payload);
      return model.toEntity();
    } catch (e) {
      throw CommunityVotingFailure('Erro ao criar votação: $e');
    }
  }

  Future<BookVoting> publishVoting(int communityId, int votingId) async {
    try {
      final model = await _remote.publishVoting(communityId, votingId);
      return model.toEntity();
    } catch (e) {
      throw CommunityVotingFailure('Erro ao publicar votação: $e');
    }
  }

  /// Lista votações de uma comunidade
  Future<List<BookVoting>> listVotings(int communityId) async {
    try {
      final models = await _remote.listVotings(communityId);
      return models.map((m) => m.toEntity()).toList();
    } catch (e) {
      throw CommunityVotingFailure('Erro ao listar votações: $e');
    }
  }

  /// Obtém votação ativa (se houver)
  Future<BookVoting?> getActiveVoting(int communityId) async {
    try {
      final model = await _remote.getActiveVoting(communityId);
      return model?.toEntity();
    } catch (e) {
      throw CommunityVotingFailure('Erro ao buscar votação ativa: $e');
    }
  }

  /// Obtém votação específica
  Future<BookVoting> getVoting(int communityId, int votingId) async {
    try {
      final model = await _remote.getVoting(communityId, votingId);
      return model.toEntity();
    } catch (e) {
      throw CommunityVotingFailure('Erro ao buscar votação: $e');
    }
  }

  /// Vota em uma opção
  Future<BookVoting> castVote(
    int communityId,
    int votingId,
    int optionId,
  ) async {
    try {
      final model = await _remote.castVote(communityId, votingId, optionId);
      return model.toEntity();
    } catch (e) {
      throw CommunityVotingFailure('Erro ao votar: $e');
    }
  }

  /// Desfaz o voto
  Future<BookVoting> undoVote(
    int communityId,
    int votingId,
    int optionId,
  ) async {
    try {
      final model = await _remote.undoVote(communityId, votingId, optionId);
      return model.toEntity();
    } catch (e) {
      throw CommunityVotingFailure('Erro ao desfazer voto: $e');
    }
  }

  /// Encerra votação
  Future<BookVoting> closeVoting(int communityId, int votingId) async {
    try {
      final model = await _remote.closeVoting(communityId, votingId);
      return model.toEntity();
    } catch (e) {
      throw CommunityVotingFailure('Erro ao encerrar votação: $e');
    }
  }

  /// Aprova resultado
  Future<BookVoting> approveVoting(
    int communityId,
    int votingId, {
    int? winnerOptionId,
  }) async {
    try {
      final model = await _remote.approveVoting(
        communityId,
        votingId,
        winnerOptionId: winnerOptionId,
      );
      return model.toEntity();
    } catch (e) {
      throw CommunityVotingFailure('Erro ao aprovar votação: $e');
    }
  }

  /// Rejeita resultado
  Future<BookVoting> rejectVoting(
    int communityId,
    int votingId,
    String reason,
  ) async {
    try {
      final model = await _remote.rejectVoting(communityId, votingId, reason);
      return model.toEntity();
    } catch (e) {
      throw CommunityVotingFailure('Erro ao rejeitar votação: $e');
    }
  }
}
