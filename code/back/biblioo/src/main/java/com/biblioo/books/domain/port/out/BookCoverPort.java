package com.biblioo.books.domain.port.out;

public interface BookCoverPort {
    /**
     * Sobe a capa do livro e retorna a URL segura do Cloudinary.
     */
    String uploadBookCover(byte[] imageBytes, String isbn);
}