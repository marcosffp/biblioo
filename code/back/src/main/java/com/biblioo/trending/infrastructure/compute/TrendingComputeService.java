package com.biblioo.trending.infrastructure.compute;

import com.biblioo.trending.domain.model.TrendingBookItem;
import com.biblioo.trending.domain.model.TrendingCommunityItem;
import com.biblioo.trending.domain.port.out.TrendingComputePort;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrendingComputeService implements TrendingComputePort {

  private final NamedParameterJdbcTemplate jdbc;

  @Value("${trending.limit:10}")
  private int limit;

  @Value("${trending.window-hours:48}")
  private int windowHours;

  @Value("${trending.book.min-interactions:3}")
  private int minBookInteractions;

  private static final String COMMUNITIES_SQL =
      """
      SELECT
          c.id                                   AS community_id,
          c.name,
          c.description,
          c.type,
          c.member_count,
          COALESCE(msg.msg_count, 0)             AS recent_messages,
          COALESCE(mb.new_members, 0)            AS new_members,
          COALESCE(rct.reaction_count, 0)        AS reactions,
          (
            COALESCE(msg.msg_score, 0.0)  * 1.0 +
            COALESCE(mb.member_score, 0.0) * 2.0 +
            COALESCE(rct.react_score, 0.0) * 0.5
          ) * 0.7
          +
          (
            (
              COALESCE(msg.msg_score, 0.0)  * 1.0 +
              COALESCE(mb.member_score, 0.0) * 2.0 +
              COALESCE(rct.react_score, 0.0) * 0.5
            ) / SQRT(GREATEST(c.member_count, 1))
          ) * 0.3                                AS total_score
      FROM communities c
      LEFT JOIN (
          SELECT community_id,
                 COUNT(*)                                                                    AS msg_count,
                 SUM(1.0 - LEAST(TIMESTAMPDIFF(MINUTE, created_at, NOW()), :windowMinutes)
                           / :windowMinutes)                                                AS msg_score
          FROM community_messages
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL :windowHours HOUR)
            AND is_deleted = false
          GROUP BY community_id
      ) msg ON msg.community_id = c.id
      LEFT JOIN (
          SELECT community_id,
                 COUNT(*)                                                                    AS new_members,
                 SUM(1.0 - LEAST(TIMESTAMPDIFF(MINUTE, joined_at, NOW()), :windowMinutes)
                           / :windowMinutes)                                                AS member_score
          FROM community_members
          WHERE joined_at >= DATE_SUB(NOW(), INTERVAL :windowHours HOUR)
          GROUP BY community_id
      ) mb ON mb.community_id = c.id
      LEFT JOIN (
          SELECT cm.community_id,
                 COUNT(mr.id)                                                               AS reaction_count,
                 SUM(1.0 - LEAST(TIMESTAMPDIFF(MINUTE, mr.created_at, NOW()), :windowMinutes)
                           / :windowMinutes)                                                AS react_score
          FROM community_message_reactions mr
          JOIN community_messages cm ON cm.id = mr.message_id AND cm.is_deleted = false
          WHERE mr.created_at >= DATE_SUB(NOW(), INTERVAL :windowHours HOUR)
          GROUP BY cm.community_id
      ) rct ON rct.community_id = c.id
      WHERE c.is_deleted = false
      HAVING total_score > 0
      ORDER BY total_score DESC
      LIMIT :limit
      """;

  private static final String BOOKS_SQL =
      """
      SELECT
          ab.book_id,
          b.title,
          b.cover_url,
          COALESCE(rv.review_count, 0)     AS new_reviews,
          COALESCE(si.shelf_count, 0)      AS shelf_additions,
          COALESCE(pg.progress_count, 0)   AS progress_updates,
          COALESCE(lk.like_count, 0)       AS review_likes,
          (
            COALESCE(rv.review_score, 0.0)   * 3.0 +
            COALESCE(si.shelf_score, 0.0)    * 2.0 +
            COALESCE(pg.progress_score, 0.0) * 1.0 +
            COALESCE(lk.like_score, 0.0)     * 1.5
          )                                AS total_score,
          (
            COALESCE(rv.review_count, 0) +
            COALESCE(si.shelf_count, 0)  +
            COALESCE(pg.progress_count, 0) +
            COALESCE(lk.like_count, 0)
          )                                AS total_interactions
      FROM (
          SELECT book_id FROM shelf_items
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL :windowHours HOUR)
            AND deleted_at IS NULL
          UNION
          SELECT rvx.book_id
          FROM reviews rvx
          JOIN content cx ON cx.id = rvx.id
          WHERE cx.created_at >= DATE_SUB(NOW(), INTERVAL :windowHours HOUR)
            AND cx.is_deleted = false
            AND rvx.is_published = true
          UNION
          SELECT book_id FROM shelf_items
          WHERE updated_at >= DATE_SUB(NOW(), INTERVAL :windowHours HOUR)
            AND created_at < DATE_SUB(NOW(), INTERVAL :windowHours HOUR)
            AND deleted_at IS NULL
            AND status IN ('READING', 'REREADING')
      ) ab
      JOIN books b ON b.id = ab.book_id
      LEFT JOIN (
          SELECT rvs.book_id,
                 COUNT(*)                                                                    AS review_count,
                 SUM(1.0 - LEAST(TIMESTAMPDIFF(MINUTE, cs.created_at, NOW()), :windowMinutes)
                           / :windowMinutes)                                                AS review_score
          FROM reviews rvs
          JOIN content cs ON cs.id = rvs.id
          WHERE cs.created_at >= DATE_SUB(NOW(), INTERVAL :windowHours HOUR)
            AND cs.is_deleted = false
            AND rvs.is_published = true
          GROUP BY rvs.book_id
      ) rv ON rv.book_id = ab.book_id
      LEFT JOIN (
          SELECT book_id,
                 COUNT(*)                                                                    AS shelf_count,
                 SUM(1.0 - LEAST(TIMESTAMPDIFF(MINUTE, created_at, NOW()), :windowMinutes)
                           / :windowMinutes)                                                AS shelf_score
          FROM shelf_items
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL :windowHours HOUR)
            AND deleted_at IS NULL
          GROUP BY book_id
      ) si ON si.book_id = ab.book_id
      LEFT JOIN (
          SELECT book_id,
                 COUNT(*)                                                                    AS progress_count,
                 SUM(1.0 - LEAST(TIMESTAMPDIFF(MINUTE, updated_at, NOW()), :windowMinutes)
                           / :windowMinutes)                                                AS progress_score
          FROM shelf_items
          WHERE updated_at >= DATE_SUB(NOW(), INTERVAL :windowHours HOUR)
            AND created_at < DATE_SUB(NOW(), INTERVAL :windowHours HOUR)
            AND deleted_at IS NULL
            AND status IN ('READING', 'REREADING')
          GROUP BY book_id
      ) pg ON pg.book_id = ab.book_id
      LEFT JOIN (
          SELECT rvl.book_id,
                 COUNT(l.id)                                                                AS like_count,
                 SUM(1.0 - LEAST(TIMESTAMPDIFF(MINUTE, l.created_at, NOW()), :windowMinutes)
                           / :windowMinutes)                                               AS like_score
          FROM likes l
          JOIN reviews rvl ON rvl.id = l.content_id
          JOIN content cl ON cl.id = rvl.id
          WHERE l.created_at >= DATE_SUB(NOW(), INTERVAL :windowHours HOUR)
            AND cl.is_deleted = false
          GROUP BY rvl.book_id
      ) lk ON lk.book_id = ab.book_id
      HAVING total_score > 0 AND total_interactions >= :minInteractions
      ORDER BY total_score DESC
      LIMIT :limit
      """;

  @Override
  public List<TrendingCommunityItem> computeTopCommunities() {
    int windowMinutes = windowHours * 60;
    Map<String, Object> params =
        Map.of("windowHours", windowHours, "windowMinutes", windowMinutes, "limit", limit);

    return jdbc.query(
        COMMUNITIES_SQL,
        params,
        (rs, rowNum) ->
            new TrendingCommunityItem(
                rs.getLong("community_id"),
                rs.getString("name"),
                rs.getString("description"),
                rs.getString("type"),
                rs.getInt("member_count"),
                rs.getLong("recent_messages"),
                rs.getLong("new_members"),
                rs.getLong("reactions"),
                rs.getDouble("total_score")));
  }

  @Override
  public List<TrendingBookItem> computeTopBooks() {
    int windowMinutes = windowHours * 60;
    Map<String, Object> params =
        Map.of(
            "windowHours", windowHours,
            "windowMinutes", windowMinutes,
            "minInteractions", minBookInteractions,
            "limit", limit);

    return jdbc.query(
        BOOKS_SQL,
        params,
        (rs, rowNum) ->
            new TrendingBookItem(
                rs.getLong("book_id"),
                rs.getString("title"),
                rs.getString("cover_url"),
                rs.getLong("new_reviews"),
                rs.getLong("shelf_additions"),
                rs.getLong("progress_updates"),
                rs.getLong("review_likes"),
                rs.getDouble("total_score")));
  }
}
