import 'models/community_list_model.dart';
import 'models/community_model.dart';

/// Datasource mockado — backend ainda não disponível.
///
/// Quando o backend estiver pronto, substituir o corpo dos três métodos
/// por chamadas Dio reais. A assinatura pública não muda.
///
/// Migração:
///   1. Adicionar `final Dio _dio;` e constructor `CommunityRemoteDatasource(this._dio);`
///   2. Substituir os `Future.delayed` por `_dio.get/post(...)`
///   3. Mapear a resposta via `CommunityListModel.fromJson` / `CommunityModel.fromJson`
class CommunityRemoteDatasource {
  Future<CommunityListModel> getCommunities() async {
    await Future.delayed(const Duration(milliseconds: 400));
    return CommunityListModel(
      mine: [
        CommunityModel(
          id: 1,
          name: 'Clube do 1984',
          bookTitle: '1984',
          bookAuthor: 'George Orwell',
          bookCoverUrl: null,
          memberCount: 234,
          visibility: 'PUBLIC',
          isMember: true,
          createdAt: DateTime.now().subtract(const Duration(minutes: 10)),
        ),
        CommunityModel(
          id: 2,
          name: 'Leitores de Machado',
          bookTitle: 'Dom Casmurro',
          bookAuthor: 'Machado de Assis',
          bookCoverUrl: null,
          memberCount: 89,
          visibility: 'PRIVATE',
          isMember: true,
          createdAt: DateTime.now().subtract(const Duration(hours: 2)),
        ),
        CommunityModel(
          id: 3,
          name: 'Fantasia Brasileira',
          bookTitle: 'A Batalha do Apocalipse',
          bookAuthor: 'Eduardo Spohr',
          bookCoverUrl: null,
          memberCount: 156,
          visibility: 'PUBLIC',
          isMember: true,
          createdAt: DateTime.now().subtract(const Duration(minutes: 30)),
        ),
      ],
      suggestions: [
        CommunityModel(
          id: 4,
          name: 'Cem Anos de Solidão',
          bookTitle: 'Cem Anos de Solidão',
          bookAuthor: 'Gabriel García Márquez',
          bookCoverUrl: null,
          memberCount: 412,
          visibility: 'PUBLIC',
          isMember: false,
          createdAt: DateTime.now().subtract(const Duration(days: 30)),
        ),
        CommunityModel(
          id: 5,
          name: 'Amantes de Clarice',
          bookTitle: 'A Paixão Segundo G.H.',
          bookAuthor: 'Clarice Lispector',
          bookCoverUrl: null,
          memberCount: 278,
          visibility: 'PUBLIC',
          isMember: false,
          createdAt: DateTime.now().subtract(const Duration(days: 15)),
        ),
      ],
    );
  }

  Future<CommunityModel> createCommunity({
    required String name,
    required int bookId,
    required String visibility,
    String bookTitle = 'Livro selecionado',
    String bookAuthor = '',
    String? bookCoverUrl,
  }) async {
    await Future.delayed(const Duration(milliseconds: 400));
    return CommunityModel(
      id: DateTime.now().millisecondsSinceEpoch,
      name: name,
      bookTitle: bookTitle,
      bookAuthor: bookAuthor,
      bookCoverUrl: bookCoverUrl,
      memberCount: 1,
      visibility: visibility,
      isMember: true,
      createdAt: DateTime.now(),
    );
  }

  Future<void> joinCommunity(int communityId) =>
      Future.delayed(const Duration(milliseconds: 200));
}
