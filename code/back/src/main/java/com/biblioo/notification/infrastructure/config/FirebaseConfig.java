package com.biblioo.notification.infrastructure.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import java.io.IOException;
import java.io.InputStream;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

@Slf4j
@Configuration
public class FirebaseConfig {

  public FirebaseConfig(
      @Value("${firebase.service-account-path:classpath:firebase-service-account.json}")
          Resource serviceAccountResource) {
    if (FirebaseApp.getApps().isEmpty()) {
      try (InputStream serviceAccount = serviceAccountResource.getInputStream()) {
        FirebaseOptions options =
            FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();
        FirebaseApp.initializeApp(options);
        log.info("[Firebase] App inicializado com sucesso");
      } catch (IOException e) {
        log.warn(
            "[Firebase] Não foi possível inicializar o Firebase (push FCM desativado): {}",
            e.getMessage());
      }
    }
  }
}
