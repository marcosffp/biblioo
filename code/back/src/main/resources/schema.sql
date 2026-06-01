ALTER TABLE books ADD FULLTEXT INDEX ft_search_text (search_text);

-- Garante que a coluna source (legacy sem DEFAULT) aceite NULL para não bloquear INSERTs do Hibernate
ALTER TABLE books MODIFY COLUMN source VARCHAR(255) NULL DEFAULT NULL;

-- Índices para collaborative filtering (similar-authors)
-- (book_id, status, shelf_id): cobre o join da CTE similar_users sem tocar em linhas desnecessárias
CREATE INDEX IF NOT EXISTS idx_si_book_status_shelf ON shelf_items (book_id, status, shelf_id);
-- (shelf_id, status, book_id): cobre o join inverso (shelf → items) no nível 2 de discovered_authors
CREATE INDEX IF NOT EXISTS idx_si_shelf_status_book ON shelf_items (shelf_id, status, book_id);
-- author: elimina full scan no match de VARCHAR entre book_authors e a CTE de autores confirmados/descobertos
CREATE INDEX IF NOT EXISTS idx_ba_author ON book_authors (author);

ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE AFTER email;

CREATE TABLE IF NOT EXISTS feed_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    content_id BIGINT NOT NULL,
    content_type VARCHAR(50) NOT NULL DEFAULT 'REVIEW',
    author_id BIGINT NOT NULL,
    score BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    UNIQUE KEY uq_feed_user_content (user_id, content_id, content_type),
    INDEX idx_feed_user_score (user_id, score DESC, id DESC)
);

ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS book_id BIGINT NULL;

CREATE TABLE IF NOT EXISTS feed_fanout_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id VARCHAR(255) NOT NULL,
    content_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    last_processed_follower_id BIGINT NOT NULL DEFAULT 0,
    total_processed INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    UNIQUE KEY uq_fanout_event (event_id),
    INDEX idx_fanout_status (status)
);

-- DNA Literário: colunas adicionais na tabela books
ALTER TABLE books ADD COLUMN IF NOT EXISTS complexity_score INT NULL;

-- DNA Literário: reread_count no ShelfItem
ALTER TABLE shelf_items ADD COLUMN IF NOT EXISTS reread_count INT NOT NULL DEFAULT 0;

-- Dias ativos de leitura: cada livro atualizado por dia conta como +1 (mesmo livro 2x no mesmo dia = 1)
CREATE TABLE IF NOT EXISTS reading_active_days (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    book_id     BIGINT NOT NULL,
    active_date DATE   NOT NULL,
    UNIQUE KEY uk_user_book_date (user_id, book_id, active_date),
    INDEX idx_rad_user_id (user_id)
);

-- DNA Literário: índice composto para consulta de histórico de leitura por usuário
CREATE INDEX IF NOT EXISTS idx_si_user_status
    ON shelf_items (shelf_id, status, book_id);

-- DNA Literário: índice de busca no dna_event_log
CREATE INDEX IF NOT EXISTS idx_dna_event_log_event_id ON dna_event_log (event_id);

-- DNA Literário: total de páginas lidas e breakdown por ano
ALTER TABLE literary_dna ADD COLUMN IF NOT EXISTS total_pages_read INT NOT NULL DEFAULT 0;
ALTER TABLE literary_dna ADD COLUMN IF NOT EXISTS pages_by_year_json TEXT NULL;

-- Assistente Bibo: conversas persistidas (fallback quando Redis expira)
CREATE TABLE IF NOT EXISTS assistant_conversation (
    id           VARCHAR(36)   PRIMARY KEY,
    user_id      BIGINT        NOT NULL,
    title        VARCHAR(100)  NOT NULL,
    history_json MEDIUMTEXT    NOT NULL,
    created_at   DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at   DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX idx_conv_user_updated (user_id, updated_at DESC)
);

-- Assistente Bibo: log de auditoria de ações executadas pelo agente
CREATE TABLE IF NOT EXISTS assistant_action_log (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    conversation_id VARCHAR(36)     NOT NULL,
    tool_name       VARCHAR(100)    NOT NULL,
    params_json     TEXT,
    result_summary  VARCHAR(500),
    created_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX idx_assistant_log_user (user_id),
    INDEX idx_assistant_log_conv (conversation_id)
);

-- Sistema de Votação de Livros
CREATE TABLE IF NOT EXISTS community_votings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    community_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    tie_break_rule VARCHAR(20) NOT NULL,
    starts_at DATETIME NOT NULL,
    ends_at DATETIME NOT NULL,
    closed_at DATETIME NULL,
    winner_option_id BIGINT NULL,
    rejection_reason VARCHAR(500) NULL,
    created_by BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    INDEX idx_cv_community (community_id),
    INDEX idx_cv_status (community_id, status),
    INDEX idx_cv_ends_at (ends_at, status)
);

CREATE TABLE IF NOT EXISTS community_voting_options (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    voting_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    book_title VARCHAR(500) NOT NULL,
    book_cover_url VARCHAR(1000) NULL,
    vote_count INT NOT NULL DEFAULT 0,
    INDEX idx_cvo_voting (voting_id)
);

CREATE TABLE IF NOT EXISTS community_votes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    voting_id BIGINT NOT NULL,
    option_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    voted_at DATETIME NOT NULL,
    UNIQUE KEY uk_cv_user_voting (voting_id, user_id),
    INDEX idx_cvote_option (option_id)
);