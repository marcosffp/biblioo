package com.biblioo.infrastructure.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.time.Duration;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Slf4j
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

  @Value("${rate.limit.enabled:true}")
  private boolean enabled;

  private static final Set<String> TRUSTED_PROXIES = Set.of("127.0.0.1", "::1");

  private static final int REQUESTS_PER_MINUTE = 10;

  private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {

    if (!enabled) {
      filterChain.doFilter(request, response);
      return;
    }

    String clientIp = resolveClientIp(request);
    String endpoint = normalizeEndpoint(request.getRequestURI());

    String bucketKey = clientIp + ":" + endpoint;

    Bucket bucket = buckets.computeIfAbsent(bucketKey, key -> createNewBucket());

    if (bucket.tryConsume(1)) {
      filterChain.doFilter(request, response);
      return;
    }

    log.warn("Rate limit excedido | ip={} | endpoint={}", clientIp, endpoint);

    response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.setCharacterEncoding("UTF-8");

    response
        .getWriter()
        .write(
            """
            {
              "error": "Too many requests. Please try again later."
            }
            """);
  }

  private Bucket createNewBucket() {

    Bandwidth limit =
        Bandwidth.builder()
            .capacity(REQUESTS_PER_MINUTE)
            .refillGreedy(REQUESTS_PER_MINUTE, Duration.ofMinutes(1))
            .build();

    return Bucket.builder().addLimit(limit).build();
  }

  private String resolveClientIp(HttpServletRequest request) {

    String remoteAddr = request.getRemoteAddr();

    if (!TRUSTED_PROXIES.contains(remoteAddr)) {
      return remoteAddr;
    }

    String xForwardedFor = request.getHeader("X-Forwarded-For");

    if (xForwardedFor == null || xForwardedFor.isBlank()) {
      return remoteAddr;
    }

    String[] forwardedIps = xForwardedFor.split(",");

    if (forwardedIps.length == 0) {
      return remoteAddr;
    }

    String candidateIp = forwardedIps[forwardedIps.length - 1].trim();

    if (!isValidIp(candidateIp)) {

      log.warn("IP inválido recebido no X-Forwarded-For: {}", candidateIp);

      return remoteAddr;
    }

    return candidateIp;
  }

  private boolean isValidIp(String ip) {

    try {
      InetAddress.getByName(ip);
      return true;
    } catch (UnknownHostException e) {
      return false;
    }
  }

  private String normalizeEndpoint(String uri) {

    if (uri == null || uri.isBlank()) {
      return "unknown";
    }

    return uri.replaceAll("/\\d+", "/{id}").replaceAll("/[0-9a-fA-F\\-]{36}", "/{uuid}");
  }
}
