package com.biblioo.books.domain.model;

// IMPORTANTE: a ordem dos valores NUNCA deve ser alterada.
// O mapeamento usa EnumType.STRING (não ORDINAL), mas manter a ordem
// documenta o fluxo natural do ciclo de vida de uma leitura.
public enum ReadingStatus {

    WANT_TO_READ, // Intenção registrada. startedAt = null, currentPage = 0.
    READING,      // Leitura em andamento. startedAt obrigatório. Progresso habilitado.
    REREADING,    // Releitura. Apenas a partir de COMPLETED. Novo startedAt; histórico anterior preservado.
    COMPLETED,    // Leitura finalizada. finishedAt obrigatório, progress = 100. Avaliação habilitada.
    ABANDONED     // Leitura interrompida. finishedAt ausente. Progresso congelado. Avaliação desabilitada.
}