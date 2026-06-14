package com.biblioo.infrastructure.messaging.consumer;

import com.biblioo.infrastructure.messaging.config.RabbitMQConfig;
import com.biblioo.infrastructure.messaging.model.EventMessage;
import com.biblioo.infrastructure.messaging.service.OutboxEventService;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.annotation.PostConstruct;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailConsumer {

  @Value("${sendgrid.api.key}")
  private String sendGridApiKey;

  @Value("${sendgrid.from.email}")
  private String fromEmail;

  @Value("${spring.mail.username}")
  private String gmailFrom;

  private final OutboxEventService outboxEventService;
  private final RestClient.Builder restClientBuilder;
  private final JavaMailSender mailSender;

  private RestClient restClient;

  @PostConstruct
  void init() {
    this.restClient = restClientBuilder.build();
  }

  @RabbitListener(queues = RabbitMQConfig.EMAIL_QUEUE, containerFactory = "emailListenerFactory")
  public void handle(EventMessage message) {
    String eventId = message.getEventId();
    MDC.put("event_id", eventId);
    MDC.put("trail", "EMAIL");

    try {
      if (outboxEventService.isAlreadyProcessed(eventId)) {
        return;
      }

      JsonNode payload = message.getPayload();

      switch (message.getEventType()) {
        case RabbitMQConfig.EVENT_PASSWORD_RESET_REQUESTED -> handlePasswordResetEmail(payload);
        case RabbitMQConfig.EVENT_PASSWORD_CHANGED -> handlePasswordChangedEmail(payload);
        default ->
            log.warn(
                "[Email-Consumer] Tipo de evento desconhecido '{}' — ignorando",
                message.getEventType());
      }

      outboxEventService.markAsProcessed(eventId);

    } catch (Exception ex) {
      log.error(
          "[Email-Consumer] Falha ao processar event_id={}: {}", eventId, ex.getMessage(), ex);
      outboxEventService.markAsFailed(eventId, ex.getMessage());
      throw new RuntimeException("Falha ao enviar e-mail", ex);
    } finally {
      MDC.clear();
    }
  }

  private void handlePasswordResetEmail(JsonNode payload) {
    String toEmail = payload.get("toEmail").asText();
    String username = payload.get("username").asText();
    String resetLink = payload.get("resetLink").asText();
    sendEmail(toEmail, "Redefinição de senha — Biblioo", username, resetLink, "reset");
  }

  private void handlePasswordChangedEmail(JsonNode payload) {
    String toEmail = payload.get("toEmail").asText();
    String username = payload.get("username").asText();
    sendEmail(toEmail, "Sua senha foi alterada — Biblioo", username, null, "changed");
  }

  private void sendEmail(
      String toEmail, String subject, String username, String resetLink, String type) {
    String html = buildHtml(type, username, resetLink, "cid:logo");
    try {
      sendViaSendGrid(toEmail, subject, html);
    } catch (Exception ex) {
      log.warn(
          "[Email-Consumer] SendGrid falhou ({}), tentando fallback Gmail...", ex.getMessage());
      sendViaGmail(toEmail, subject, html);
    }
  }

  private void sendViaSendGrid(String toEmail, String subject, String html) {
    Map<String, Object> body =
        Map.of(
            "personalizations", List.of(Map.of("to", List.of(Map.of("email", toEmail)))),
            "from", Map.of("email", fromEmail, "name", "Biblioo"),
            "subject", subject,
            "content", List.of(Map.of("type", "text/html", "value", html)));

    restClient
        .post()
        .uri("https://api.sendgrid.com/v3/mail/send")
        .header("Authorization", "Bearer " + sendGridApiKey)
        .contentType(MediaType.APPLICATION_JSON)
        .body(body)
        .retrieve()
        .toBodilessEntity();
  }

  private void sendViaGmail(String toEmail, String subject, String html) {
    try {
      MimeMessage mime = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
      helper.setFrom(gmailFrom);
      helper.setTo(toEmail);
      helper.setSubject(subject);
      helper.setText(html, true);
      helper.addInline("logo", new ClassPathResource("static/Logo_Biblioo_Branca.png"));
      mailSender.send(mime);
    } catch (MessagingException e) {
      log.error(
          "[Email-Consumer] Fallback Gmail também falhou para {}: {}", toEmail, e.getMessage());
      throw new RuntimeException("Ambos os provedores de e-mail falharam", e);
    }
  }

  private String buildHtml(String type, String username, String resetLink, String logoSrc) {
    return switch (type) {
      case "reset" -> buildPasswordResetHtml(username, resetLink, logoSrc);
      case "changed" -> buildPasswordChangedHtml(username, logoSrc);
      default -> throw new IllegalArgumentException("Tipo de e-mail desconhecido: " + type);
    };
  }

  private String buildPasswordResetHtml(String username, String resetLink, String logoSrc) {
    return """
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light dark">
          <meta name="supported-color-schemes" content="light dark">
          <title>Redefinição de senha — Biblioo</title>
          <style>
            :root { color-scheme: light dark; }
            * { -webkit-text-size-adjust: none; box-sizing: border-box; }

            @media (prefers-color-scheme: dark) {
              body, .bg          { background-color: #0f0e17 !important; }
              .card              { background-color: #1a1a2e !important; border-color: #2a2a4a !important; }
              .info-box          { background-color: #0d0c15 !important; border-color: #2a3a30 !important; }
              .warn-box          { background-color: #2d1010 !important; border-color: #5c1c1c !important; }
              .title             { color: #fffffe !important; }
              .body-txt          { color: #a7a9be !important; }
              .accent            { color: #7ed9b6 !important; }
              .warn-txt          { color: #fca5a5 !important; }
              .footer-txt        { color: #5a5a7a !important; }
              .link-txt          { color: #7ed9b6 !important; }
              .divider           { background-color: #2a2a4a !important; }
            }

            [data-ogsc] body, [data-ogsc] .bg { background-color: #0f0e17 !important; }
            [data-ogsc] .card                 { background-color: #1a1a2e !important; border-color: #2a2a4a !important; }
            [data-ogsc] .info-box             { background-color: #0d0c15 !important; border-color: #2a3a30 !important; }
            [data-ogsc] .warn-box             { background-color: #2d1010 !important; border-color: #5c1c1c !important; }
            [data-ogsc] .title                { color: #fffffe !important; }
            [data-ogsc] .body-txt             { color: #a7a9be !important; }
            [data-ogsc] .accent               { color: #7ed9b6 !important; }
            [data-ogsc] .warn-txt             { color: #fca5a5 !important; }
            [data-ogsc] .footer-txt           { color: #5a5a7a !important; }
            [data-ogsc] .link-txt             { color: #7ed9b6 !important; }
            [data-ogsc] .divider              { background-color: #2a2a4a !important; }
          </style>
        </head>
        <body class="bg" style="margin:0;padding:0;background-color:#f0f2f5;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%%" cellpadding="0" cellspacing="0" class="bg" style="background-color:#f0f2f5;padding:40px 16px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;">

                  <!-- Logo header — fundo sempre escuro para logo branca ser visível -->
                  <tr>
                    <td align="center" style="background-color:#1f3d3a;border-radius:16px 16px 0 0;padding:28px 40px;">
                      <img src="%s" alt="Biblioo" style="height:38px;display:block;" />
                    </td>
                  </tr>

                  <!-- Card principal -->
                  <tr>
                    <td class="card" style="background:#ffffff;border-radius:0 0 16px 16px;padding:40px 40px 48px;border:1px solid #e2e8f0;border-top:none;">
                      <table width="100%%" cellpadding="0" cellspacing="0">

                        <!-- Barra de destaque -->
                        <tr>
                          <td style="padding-bottom:28px;">
                            <div style="height:4px;background:linear-gradient(90deg,#3bbe9e,#7ed9b6);border-radius:4px;"></div>
                          </td>
                        </tr>

                        <!-- Título -->
                        <tr>
                          <td style="padding-bottom:10px;">
                            <h1 class="title" style="margin:0;font-size:22px;font-weight:700;color:#1a1a2e;letter-spacing:-0.3px;">
                              Redefinição de senha
                            </h1>
                          </td>
                        </tr>

                        <!-- Corpo -->
                        <tr>
                          <td style="padding-bottom:24px;">
                            <p class="body-txt" style="margin:0;font-size:15px;color:#4a4a6a;line-height:1.7;">
                              Olá, <strong class="title" style="color:#1a1a2e;">%s</strong>!
                              Recebemos uma solicitação para redefinir a senha da sua conta na Biblioo.
                              Clique no botão abaixo para criar uma nova senha.
                            </p>
                          </td>
                        </tr>

                        <!-- Info box -->
                        <tr>
                          <td style="padding-bottom:28px;">
                            <table width="100%%" cellpadding="0" cellspacing="0"
                                   class="info-box" style="background:#f4faf8;border-radius:10px;border:1px solid #c8e6d8;">
                              <tr>
                                <td style="padding:16px 20px;">
                                  <table cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td class="body-txt" style="padding:4px 0;font-size:13px;color:#4a4a6a;line-height:1.8;">
                                        <span class="accent" style="color:#2a9d7f;font-weight:600;">Validade</span>
                                        &nbsp;&mdash;&nbsp; O link expira em <strong class="title" style="color:#1a1a2e;">30 minutos</strong>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td class="body-txt" style="padding:4px 0;font-size:13px;color:#4a4a6a;line-height:1.8;">
                                        <span class="accent" style="color:#2a9d7f;font-weight:600;">Uso</span>
                                        &nbsp;&mdash;&nbsp; Link de uso único, inválido após o primeiro clique
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>

                        <!-- Botão -->
                        <tr>
                          <td align="center" style="padding-bottom:28px;">
                            <a href="%s"
                               style="display:inline-block;background:linear-gradient(135deg,#3bbe9e,#2a9d7f);
                                      color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;
                                      padding:15px 40px;border-radius:10px;letter-spacing:0.3px;">
                              Redefinir minha senha
                            </a>
                          </td>
                        </tr>

                        <!-- Link fallback -->
                        <tr>
                          <td align="center" style="padding-bottom:32px;">
                            <p class="body-txt" style="margin:0;font-size:12px;color:#4a4a6a;">
                              Botão não funcionou? Cole este link no navegador:<br>
                              <a href="%s" class="link-txt" style="color:#2a9d7f;word-break:break-all;font-size:11px;">%s</a>
                            </p>
                          </td>
                        </tr>

                        <!-- Divisor -->
                        <tr>
                          <td style="padding-bottom:24px;">
                            <div class="divider" style="height:1px;background:#e2e8f0;"></div>
                          </td>
                        </tr>

                        <!-- Aviso -->
                        <tr>
                          <td>
                            <table width="100%%" cellpadding="0" cellspacing="0"
                                   class="warn-box" style="background:#fff5f5;border-radius:8px;border:1px solid #fecaca;">
                              <tr>
                                <td class="warn-txt" style="padding:14px 18px;font-size:12px;color:#dc2626;line-height:1.7;">
                                  Se você <strong>não solicitou</strong> a redefinição de senha,
                                  ignore este e-mail. Sua senha permanece a mesma e nenhuma
                                  alteração será feita na sua conta.
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>

                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding-top:24px;">
                      <p class="footer-txt" style="margin:0;font-size:12px;color:#9a9ab0;line-height:1.8;">
                        &copy; 2026 Biblioo &middot; Todos os direitos reservados<br>
                        Este é um e-mail automático, não responda.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        """
        .formatted(logoSrc, username, resetLink, resetLink, resetLink);
  }

  private String buildPasswordChangedHtml(String username, String logoSrc) {
    String changedAt =
        LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm"));
    return """
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light dark">
          <meta name="supported-color-schemes" content="light dark">
          <title>Senha alterada — Biblioo</title>
          <style>
            :root { color-scheme: light dark; }
            * { -webkit-text-size-adjust: none; box-sizing: border-box; }

            @media (prefers-color-scheme: dark) {
              body, .bg          { background-color: #0f0e17 !important; }
              .card              { background-color: #1a1a2e !important; border-color: #2a2a4a !important; }
              .info-box          { background-color: #0d0c15 !important; border-color: #2a3a30 !important; }
              .warn-box          { background-color: #2d1010 !important; border-color: #5c1c1c !important; }
              .title             { color: #fffffe !important; }
              .body-txt          { color: #a7a9be !important; }
              .accent            { color: #7ed9b6 !important; }
              .warn-txt          { color: #fca5a5 !important; }
              .footer-txt        { color: #5a5a7a !important; }
              .divider           { background-color: #2a2a4a !important; }
            }

            [data-ogsc] body, [data-ogsc] .bg { background-color: #0f0e17 !important; }
            [data-ogsc] .card                 { background-color: #1a1a2e !important; border-color: #2a2a4a !important; }
            [data-ogsc] .info-box             { background-color: #0d0c15 !important; border-color: #2a3a30 !important; }
            [data-ogsc] .warn-box             { background-color: #2d1010 !important; border-color: #5c1c1c !important; }
            [data-ogsc] .title                { color: #fffffe !important; }
            [data-ogsc] .body-txt             { color: #a7a9be !important; }
            [data-ogsc] .accent               { color: #7ed9b6 !important; }
            [data-ogsc] .warn-txt             { color: #fca5a5 !important; }
            [data-ogsc] .footer-txt           { color: #5a5a7a !important; }
            [data-ogsc] .divider              { background-color: #2a2a4a !important; }
          </style>
        </head>
        <body class="bg" style="margin:0;padding:0;background-color:#f0f2f5;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%%" cellpadding="0" cellspacing="0" class="bg" style="background-color:#f0f2f5;padding:40px 16px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;">

                  <!-- Logo header — fundo sempre escuro para logo branca ser visível -->
                  <tr>
                    <td align="center" style="background-color:#1f3d3a;border-radius:16px 16px 0 0;padding:28px 40px;">
                      <img src="%s" alt="Biblioo" style="height:38px;display:block;" />
                    </td>
                  </tr>

                  <!-- Card principal -->
                  <tr>
                    <td class="card" style="background:#ffffff;border-radius:0 0 16px 16px;padding:40px 40px 48px;border:1px solid #e2e8f0;border-top:none;">
                      <table width="100%%" cellpadding="0" cellspacing="0">

                        <!-- Barra de destaque -->
                        <tr>
                          <td style="padding-bottom:28px;">
                            <div style="height:4px;background:linear-gradient(90deg,#3bbe9e,#7ed9b6);border-radius:4px;"></div>
                          </td>
                        </tr>

                        <!-- Título -->
                        <tr>
                          <td style="padding-bottom:10px;">
                            <h1 class="title" style="margin:0;font-size:22px;font-weight:700;color:#1a1a2e;letter-spacing:-0.3px;">
                              Senha alterada com sucesso
                            </h1>
                          </td>
                        </tr>

                        <!-- Corpo -->
                        <tr>
                          <td style="padding-bottom:24px;">
                            <p class="body-txt" style="margin:0;font-size:15px;color:#4a4a6a;line-height:1.7;">
                              Olá, <strong class="title" style="color:#1a1a2e;">%s</strong>!
                              A senha da sua conta na Biblioo foi atualizada com sucesso.
                            </p>
                          </td>
                        </tr>

                        <!-- Info box -->
                        <tr>
                          <td style="padding-bottom:32px;">
                            <table width="100%%" cellpadding="0" cellspacing="0"
                                   class="info-box" style="background:#f4faf8;border-radius:10px;border:1px solid #c8e6d8;">
                              <tr>
                                <td style="padding:16px 20px;">
                                  <table cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td class="body-txt" style="padding:4px 0;font-size:13px;color:#4a4a6a;line-height:1.8;">
                                        <span class="accent" style="color:#2a9d7f;font-weight:600;">Data</span>
                                        &nbsp;&mdash;&nbsp; <strong class="title" style="color:#1a1a2e;">%s</strong>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td class="body-txt" style="padding:4px 0;font-size:13px;color:#4a4a6a;line-height:1.8;">
                                        <span class="accent" style="color:#2a9d7f;font-weight:600;">Sessões</span>
                                        &nbsp;&mdash;&nbsp; Todas as sessões ativas foram encerradas
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>

                        <!-- Divisor -->
                        <tr>
                          <td style="padding-bottom:24px;">
                            <div class="divider" style="height:1px;background:#e2e8f0;"></div>
                          </td>
                        </tr>

                        <!-- Aviso -->
                        <tr>
                          <td>
                            <table width="100%%" cellpadding="0" cellspacing="0"
                                   class="warn-box" style="background:#fff5f5;border-radius:8px;border:1px solid #fecaca;">
                              <tr>
                                <td class="warn-txt" style="padding:14px 18px;font-size:12px;color:#dc2626;line-height:1.7;">
                                  Se você <strong>não realizou</strong> essa alteração,
                                  entre em contato com nosso suporte imediatamente, pois
                                  sua conta pode ter sido acessada por terceiros.
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>

                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding-top:24px;">
                      <p class="footer-txt" style="margin:0;font-size:12px;color:#9a9ab0;line-height:1.8;">
                        &copy; 2026 Biblioo &middot; Todos os direitos reservados<br>
                        Este é um e-mail automático, não responda.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        """
        .formatted(logoSrc, username, changedAt);
  }
}
