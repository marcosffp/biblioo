ALTER TABLE books ADD FULLTEXT INDEX ft_search_text (search_text);

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