package com.biblioo.notification.infrastructure.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Base64;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class FirebaseConfig {

  public FirebaseConfig(@Value("${firebase.service-account-base64}") String serviceAccountBase64) {
    if (FirebaseApp.getApps().isEmpty()) {
      if (serviceAccountBase64 == null || serviceAccountBase64.isBlank()) {
        log.warn(
            "[Firebase] FIREBASE_SERVICE_ACCOUNT_BASE64 não configurado — push FCM desativado");
        return;
      }
      try {
        byte[] decoded = Base64.getDecoder().decode(serviceAccountBase64.trim());
        FirebaseOptions options =
            FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(new ByteArrayInputStream(decoded)))
                .build();
        FirebaseApp.initializeApp(options);
        log.info("[Firebase] App inicializado com sucesso");
      } catch (IOException | IllegalArgumentException e) {
        log.warn(
            "[Firebase] Não foi possível inicializar o Firebase (push FCM desativado): {}",
            e.getMessage());
      }
    }
  }
}
