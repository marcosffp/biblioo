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
                auth.requestMatchers("/ws/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/auth/create-password")
                    .authenticated()
                    .requestMatchers("/auth/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/users")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/books/**")
                    .permitAll()
                    .requestMatchers("/actuator/health", "/actuator/prometheus")
                    .permitAll()
                    .requestMatchers(
                        HttpMethod.GET, "/communities/mine", "/communities/invites/pending")
                    .authenticated()
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
                    .requestMatchers(HttpMethod.GET, "/users/me")
                    .authenticated()
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
    return new BCryptPasswordEncoder(8);
  }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
      throws Exception {
    return config.getAuthenticationManager();
  }
}
