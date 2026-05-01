ALTER TABLE books ADD FULLTEXT INDEX ft_search_text (search_text);

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
