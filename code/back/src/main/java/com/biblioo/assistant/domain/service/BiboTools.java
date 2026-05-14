package com.biblioo.assistant.domain.service;

import com.biblioo.assistant.domain.model.BookResult;
import com.biblioo.assistant.domain.model.CollectionResult;
import com.biblioo.assistant.domain.model.CommunityResult;
import com.biblioo.assistant.domain.model.ShelfItemBasic;
import com.biblioo.assistant.domain.model.ShelfItemResult;
import com.biblioo.assistant.domain.model.ShelfResult;
import com.biblioo.assistant.domain.model.UserDnaProfile;
import com.biblioo.assistant.domain.port.out.AssistantActionLogPort;
import com.biblioo.assistant.domain.port.out.AssistantBookPort;
import com.biblioo.assistant.domain.port.out.AssistantCollectionPort;
import com.biblioo.assistant.domain.port.out.AssistantCommunityPort;
import com.biblioo.assistant.domain.port.out.AssistantDnaPort;
import com.biblioo.assistant.domain.port.out.AssistantShelfPort;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

/**
 * Ferramentas do assistente Bibo disponíveis para o Gemini via function calling.
 *
 * <p>SEGURANÇA: userId é lido exclusivamente do {@link UserIdHolder} (ThreadLocal injetado pelo
 * AssistantService antes de cada chamada). Nunca é parâmetro de ferramenta — o modelo não pode
 * alterar para qual usuário está agindo.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BiboTools {

  private final AssistantBookPort bookPort;
  private final AssistantShelfPort shelfPort;
  private final AssistantCollectionPort collectionPort;
  private final AssistantCommunityPort communityPort;
  private final AssistantDnaPort dnaPort;
  private final AssistantActionLogPort logPort;
  private final ObjectMapper objectMapper;

  @Tool(
      description =
          "Busca livros por título, autor ou palavra-chave. Retorna no máximo 5 resultados.")
  public List<BookResult> searchBooks(String query) {
    List<BookResult> results = bookPort.search(query, 5);
    log("searchBooks", Map.of("query", query), results.size() + " livros encontrados");
    return results;
  }

  @Tool(description = "Lista todas as estantes do usuário autenticado.")
  public List<ShelfResult> listShelves() {
    List<ShelfResult> results = shelfPort.listShelves(UserIdHolder.get());
    log("listShelves", Map.of(), results.size() + " estantes retornadas");
    return results;
  }

  @Tool(
      description =
          "Cria uma nova estante para o usuário. name: nome da estante (obrigatório, máx 100"
              + " chars). description: descrição opcional. "
              + "Se a operação retornar erro (ex.: nome duplicado), informe o usuário com a mensagem recebida.")
  public String createShelf(String name, String description) {
    try {
      ShelfResult result = shelfPort.createShelf(UserIdHolder.get(), name, description);
      log("createShelf", Map.of("name", name, "description", description), "Estante criada com id=" + result.id());
      return "Estante criada com sucesso. id=" + result.id() + ", nome=" + result.name();
    } catch (RuntimeException e) {
      log("createShelf", Map.of("name", name, "description", description), "Erro: " + e.getMessage());
      return "Erro: " + e.getMessage();
    }
  }

  @Tool(
      description =
          "Adiciona um livro a uma estante. "
              + "IMPORTANTE: antes de chamar esta ferramenta, use listShelves para obter o shelfId "
              + "correto e searchBooks para obter o bookId. Nunca invente ou assuma esses IDs. "
              + "Se a operação retornar um erro, informe o usuário com a mensagem recebida. "
              + "status: WANT_TO_READ | READING | REREADING | COMPLETED | ABANDONED")
  public String addBookToShelf(Long shelfId, Long bookId, String status) {
    String result = shelfPort.addBookToShelf(UserIdHolder.get(), shelfId, bookId, status);
    log("addBookToShelf", Map.of("shelfId", shelfId, "bookId", bookId, "status", status), result);
    return result;
  }

  @Tool(
      description =
          "Lista os livros (itens) de uma estante específica, com itemId, bookId, título, status e progresso. "
              + "Use para obter o itemId necessário em changeItemStatus e updateReadingProgress. "
              + "Antes, chame listShelves para descobrir o shelfId correto.")
  public List<ShelfItemResult> listShelfItems(Long shelfId) {
    List<ShelfItemBasic> basics = shelfPort.listShelfItems(UserIdHolder.get(), shelfId);
    List<Long> bookIds = basics.stream().map(ShelfItemBasic::bookId).distinct().toList();
    java.util.Map<Long, String> titleByBookId =
        bookPort.getByIds(bookIds).stream()
            .collect(java.util.stream.Collectors.toMap(BookResult::id, BookResult::title));
    List<ShelfItemResult> results =
        basics.stream()
            .map(
                b ->
                    new ShelfItemResult(
                        b.itemId(),
                        b.bookId(),
                        titleByBookId.get(b.bookId()),
                        b.status(),
                        b.currentPage(),
                        b.totalPages()))
            .toList();
    log("listShelfItems", Map.of("shelfId", shelfId), results.size() + " itens retornados");
    return results;
  }

  @Tool(
      description =
          "Atualiza o status de leitura de um item na estante. "
              + "IMPORTANTE: use listShelves para obter o shelfId e listShelfItems(shelfId) para obter o itemId "
              + "(filtrando pelo bookId quando o usuário se referir ao livro pelo nome). "
              + "Nunca invente ou assuma esses IDs. "
              + "newStatus: WANT_TO_READ | READING | REREADING | COMPLETED | ABANDONED")
  public String changeItemStatus(Long shelfId, Long itemId, String newStatus) {
    String result = shelfPort.changeItemStatus(UserIdHolder.get(), shelfId, itemId, newStatus);
    log("changeItemStatus", Map.of("shelfId", shelfId, "itemId", itemId, "newStatus", newStatus), result);
    return result;
  }

  @Tool(
      description =
          "Atualiza a página atual de leitura de um livro em uma estante. "
              + "IMPORTANTE: use listShelves para obter o shelfId e listShelfItems(shelfId) para obter o itemId "
              + "(filtrando pelo bookId quando o usuário se referir ao livro pelo nome). "
              + "Nunca invente ou assuma esses IDs.")
  public String updateReadingProgress(Long shelfId, Long itemId, Integer currentPage) {
    String result = shelfPort.updateReadingProgress(UserIdHolder.get(), shelfId, itemId, currentPage);
    log("updateReadingProgress", Map.of("shelfId", shelfId, "itemId", itemId, "currentPage", currentPage), result);
    return result;
  }

  @Tool(description = "Lista todas as coleções do usuário. Coleções agrupam estantes.")
  public List<CollectionResult> listCollections() {
    List<CollectionResult> results = collectionPort.listCollections(UserIdHolder.get());
    log("listCollections", Map.of(), results.size() + " coleções retornadas");
    return results;
  }

  @Tool(
      description =
          "Cria uma nova coleção para agrupar estantes. name: nome da coleção (obrigatório)."
              + " description: descrição opcional. "
              + "Se a operação retornar erro (ex.: nome duplicado), informe o usuário com a mensagem recebida.")
  public String createCollection(String name, String description) {
    try {
      CollectionResult result = collectionPort.createCollection(UserIdHolder.get(), name, description);
      log("createCollection", Map.of("name", name, "description", description), "Coleção criada com id=" + result.id());
      return "Coleção criada com sucesso. id=" + result.id() + ", nome=" + result.name();
    } catch (RuntimeException e) {
      log("createCollection", Map.of("name", name, "description", description), "Erro: " + e.getMessage());
      return "Erro: " + e.getMessage();
    }
  }

  @Tool(
      description =
          "Adiciona uma estante a uma coleção existente. "
              + "IMPORTANTE: use listCollections para obter o collectionId e listShelves para obter o shelfId. "
              + "Nunca invente ou assuma esses IDs.")
  public String addShelfToCollection(Long collectionId, Long shelfId) {
    String result = collectionPort.addShelfToCollection(UserIdHolder.get(), collectionId, shelfId);
    log("addShelfToCollection", Map.of("collectionId", collectionId, "shelfId", shelfId), result);
    return result;
  }

  @Tool(
      description =
          "Remove uma estante de uma coleção. "
              + "IMPORTANTE: use listCollections para obter o collectionId e listShelves para obter o shelfId. "
              + "Nunca invente ou assuma esses IDs.")
  public String removeShelfFromCollection(Long collectionId, Long shelfId) {
    String result = collectionPort.removeShelfFromCollection(UserIdHolder.get(), collectionId, shelfId);
    log("removeShelfFromCollection", Map.of("collectionId", collectionId, "shelfId", shelfId), result);
    return result;
  }

  @Tool(description = "Lista as comunidades das quais o usuário faz parte.")
  public List<CommunityResult> listUserCommunities() {
    List<CommunityResult> results = communityPort.listUserCommunities(UserIdHolder.get());
    log("listUserCommunities", Map.of(), results.size() + " comunidades retornadas");
    return results;
  }

  @Tool(
      description =
          "Cria uma nova comunidade vinculada a um livro. type: PUBLIC ou PRIVATE. "
              + "bookId: ID do livro — use searchBooks para encontrar o ID antes de chamar esta ferramenta. "
              + "Nunca invente um bookId. Se a operação retornar erro, informe o usuário.")
  public CommunityResult createCommunity(String name, String description, String type, Long bookId) {
    try {
      CommunityResult result = communityPort.createCommunity(UserIdHolder.get(), name, description, type, bookId);
      log("createCommunity", Map.of("name", name, "type", type, "bookId", bookId), "Comunidade criada com id=" + result.id());
      return result;
    } catch (RuntimeException e) {
      log("createCommunity", Map.of("name", name, "type", type, "bookId", bookId), "Erro: " + e.getMessage());
      return null;
    }
  }

  @Tool(
      description =
          "Retorna o perfil literário do usuário: arquétipo dominante, temas centrais, complexidade preferida "
              + "e gênero mais abandonado. Use APENAS ao recomendar livros ou quando precisar entender os gostos do usuário. "
              + "Se o status retornado for IN_FORMATION ou COMPUTING, informe ao usuário que seu DNA ainda não tem dados suficientes.")
  public UserDnaProfile getUserLiteraryProfile() {
    UserDnaProfile profile = dnaPort.getProfile(UserIdHolder.get());
    log("getUserLiteraryProfile", Map.of(), "status=" + profile.status() + ", booksRead=" + profile.booksRead());
    return profile;
  }

  private void log(String toolName, Map<String, Object> params, String resultSummary) {
    String paramsJson = null;
    try {
      paramsJson = objectMapper.writeValueAsString(params);
    } catch (Exception e) {
      log.warn("Falha ao serializar params de log para toolName={}", toolName);
    }
    logPort.log(UserIdHolder.get(), ConversationIdHolder.get(), toolName, paramsJson, resultSummary);
  }
}
