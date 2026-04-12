import { describe, expect, it } from "vitest";

import {
  addBookToShelfWithoutDuplicate,
  computeBookSuggestions,
  filterBooksByStatusAndSearch,
  filterCollectionsBySearch,
} from "../utils/bookcase-filters";

const books = [
  { id: "b1", title: "1984", author: "George Orwell", readingStatus: "lendo" as const },
  { id: "b2", title: "O Pequeno Principe", author: "Antoine de Saint-Exupery", readingStatus: "quero-ler" as const },
  { id: "b3", title: "A Metamorfose", author: "Franz Kafka", readingStatus: "lido" as const },
];

const collections = [
  { id: "c1", title: "Distopias favoritas" },
  { id: "c2", title: "Classicos" },
];

describe("bookcase-filters", () => {
  it("filtra livros por status e busca combinados", () => {
    const result = filterBooksByStatusAndSearch(books, "quero-ler", "principe");
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("b2");
  });

  it("busca livros por titulo ou autor ignorando caixa", () => {
    const byTitle = filterBooksByStatusAndSearch(books, "todos", "METAMORFOSE");
    const byAuthor = filterBooksByStatusAndSearch(books, "todos", "orwell");

    expect(byTitle[0]?.id).toBe("b3");
    expect(byAuthor[0]?.id).toBe("b1");
  });

  it("busca colecoes por titulo ignorando caixa", () => {
    const result = filterCollectionsBySearch(collections, "DISTOPIAS");
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("c1");
  });

  it("Não exibe Sugestões com menos de 2 caracteres", () => {
    expect(computeBookSuggestions(books, "a")).toHaveLength(0);
  });

  it("exibe Sugestões com 2 ou mais caracteres", () => {
    const result = computeBookSuggestions(books, "19");
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("b1");
  });

  it("evita duplicidade ao adicionar livro na estante", () => {
    const initialShelf = [books[0], books[1]];
    const unchanged = addBookToShelfWithoutDuplicate(initialShelf, books[1]);
    const appended = addBookToShelfWithoutDuplicate(initialShelf, books[2]);

    expect(unchanged).toHaveLength(2);
    expect(appended).toHaveLength(3);
    expect(appended[2]?.id).toBe("b3");
  });
});

