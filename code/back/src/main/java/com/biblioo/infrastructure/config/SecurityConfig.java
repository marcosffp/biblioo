package com.biblioo.infrastructure.config;

import com.biblioo.user.infrastructure.security.JwtAuthenticationFilter;
import com.biblioo.user.infrastructure.security.UserDetailsServiceAdapter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

  private final JwtAuthenticationFilter jwtAuthFilter;
  private final UserDetailsServiceAdapter userDetailsService;

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http.cors(Customizer.withDefaults())
        .csrf(AbstractHttpConfigurer::disable)
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth ->
                auth
                    // WebSocket handshake — autenticação ocorre no STOMP CONNECT via
                    // JwtChannelInterceptor
                    .requestMatchers("/ws/**")
                    .permitAll()
                    .requestMatchers("/auth/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/users")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/books/**")
                    .permitAll()
                    .requestMatchers("/actuator/health", "/actuator/prometheus").permitAll()
                    // Communities: endpoints autenticados ANTES dos wildcards
                    .requestMatchers(
                        HttpMethod.GET, "/communities/mine", "/communities/invites/pending")
                    .authenticated()
                    // Communities: endpoints públicos
                    .requestMatchers(
                        HttpMethod.GET,
                        "/communities",
                        "/communities/*",
                        "/communities/book/*",
                        "/communities/*/members",
                        "/communities/*/posts",
                        "/communities/*/posts/*")
                    .permitAll()
                    .requestMatchers(
                        "/auth/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/swagger-ui/index.html",
                        "/v3/api-docs",
                        "/v3/api-docs/**")
                    .permitAll()
                    // /me deve ser autenticado — declarado ANTES do wildcard abaixo
                    .requestMatchers(HttpMethod.GET, "/users/me")
                    .authenticated()
                    // Perfis públicos acessíveis sem login; controller trata restrição de privados
                    .requestMatchers(
                        HttpMethod.GET, "/users/*", "/users/*/followers", "/users/*/following")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .userDetailsService(userDetailsService)
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
      throws Exception {
    return config.getAuthenticationManager();
  }
}
