package com.biblioo.user.infrastructure.auth;

import com.biblioo.user.domain.exception.GoogleAuthException;
import com.biblioo.user.domain.model.GoogleUserInfo;
import com.biblioo.user.domain.port.out.GoogleAuthPort;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.util.Collections;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class GoogleTokenVerifierAdapter implements GoogleAuthPort {

  private final GoogleIdTokenVerifier verifier;

  public GoogleTokenVerifierAdapter(@Value("${google.client-id}") String clientId) {
    this.verifier =
        new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
            .setAudience(Collections.singletonList(clientId))
            .build();
  }

  @Override
  public GoogleUserInfo verify(String idToken) {
    GoogleIdToken token;
    try {
      token = verifier.verify(idToken);
    } catch (Exception e) {
      log.warn("Falha ao verificar token Google: {}", e.getMessage());
      throw new GoogleAuthException("Token Google inválido ou expirado");
    }

    if (token == null) {
      throw new GoogleAuthException("Token Google inválido ou expirado");
    }

    GoogleIdToken.Payload payload = token.getPayload();

    if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
      throw new GoogleAuthException("E-mail não verificado pelo Google");
    }

    return new GoogleUserInfo(
        payload.getSubject(),
        payload.getEmail(),
        (String) payload.get("name"),
        (String) payload.get("picture"));
  }
}
