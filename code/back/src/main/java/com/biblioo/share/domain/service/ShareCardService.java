package com.biblioo.share.domain.service;

import com.biblioo.dna.domain.model.DnaStatus;
import com.biblioo.share.domain.model.ShareCardData;
import com.biblioo.share.domain.model.ShareCardData.DisplayBook;
import com.biblioo.share.domain.port.in.ShareCardUseCase;
import jakarta.annotation.PostConstruct;
import java.awt.*;
import java.awt.geom.RoundRectangle2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import javax.imageio.ImageIO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ShareCardService implements ShareCardUseCase {

  private static final int SCALE = 3;
  private static final int W = 320 * SCALE;

  private static final int HEADER_H = 190 * SCALE;
  private static final int PAD_X = 16 * SCALE;
  private static final int PAD_Y = 12 * SCALE;
  private static final int COVER_W = 86 * SCALE;
  private static final int COVER_H = 128 * SCALE;
  private static final int SIDE_COVER_W = 68 * SCALE;
  private static final int SIDE_COVER_H = 104 * SCALE;
  private static final int LOGO_H = 18 * SCALE;

  private static final Color C_BG = new Color(0x121212);
  private static final Color C_BODY = new Color(0x181818);
  private static final Color C_BRAND_500 = new Color(0x3FC3A7);
  private static final Color C_BRAND_600 = new Color(0x13937A);
  private static final Color C_HEADER_TOP = new Color(0x0A4034);
  private static final Color C_TEXT_PRI = new Color(0xFFFFFF);
  private static final Color C_TEXT_SEC = new Color(255, 255, 255, 102);
  private static final Color C_HDR_SEC = new Color(255, 255, 255, 180);

  private static final Font F_DATE = new Font(Font.SANS_SERIF, Font.PLAIN, 11 * SCALE);
  private static final Font F_LABEL = new Font(Font.SANS_SERIF, Font.BOLD, 9 * SCALE);
  private static final Font F_USER = new Font(Font.SANS_SERIF, Font.PLAIN, 12 * SCALE);
  private static final Font F_ARCH = new Font(Font.SANS_SERIF, Font.BOLD, 22 * SCALE);
  private static final Font F_COMP = new Font(Font.SANS_SERIF, Font.PLAIN, 12 * SCALE);
  private static final Font F_STATS_INLINE_B = new Font(Font.SANS_SERIF, Font.BOLD, 20 * SCALE);
  private static final Font F_STATS_INLINE_N = new Font(Font.SANS_SERIF, Font.PLAIN, 11 * SCALE);
  private static final Font F_GRID_H = new Font(Font.SANS_SERIF, Font.PLAIN, 10 * SCALE);
  private static final Font F_GRID_I = new Font(Font.SANS_SERIF, Font.PLAIN, 12 * SCALE);
  private static final Font F_GRID_NUM = new Font(Font.SANS_SERIF, Font.PLAIN, 10 * SCALE);
  private static final Font F_BOOK_TITLE = new Font(Font.SANS_SERIF, Font.PLAIN, 13 * SCALE);

  private static final Duration CARD_TTL = Duration.ofHours(1);
  private static final Locale PT_BR = new Locale.Builder()
    .setLanguage("pt")
    .setRegion("BR")
    .build();

  private final ShareCardDataService shareCardDataService;
  private final RedisTemplate<String, byte[]> shareCardRedisTemplate;

  private BufferedImage bibliooLogo;

  public ShareCardService(
      ShareCardDataService shareCardDataService,
      @Qualifier("shareCardRedisTemplate") RedisTemplate<String, byte[]> shareCardRedisTemplate) {
    this.shareCardDataService = shareCardDataService;
    this.shareCardRedisTemplate = shareCardRedisTemplate;
  }

  @PostConstruct
  void loadAssets() {
    try {
      bibliooLogo =
          ImageIO.read(new ClassPathResource("static/Logo_Biblioo_Branca.png").getInputStream());
    } catch (Exception e) {
      log.warn("Logo Biblioo não encontrado, usando fallback textual");
    }
  }

  @Override
  public byte[] generateDnaCard(Long userId) {
    String key = "biblioo:share-card-dna:mobile:" + userId;
    try {
      byte[] cached = shareCardRedisTemplate.opsForValue().get(key);
      if (cached != null) return cached;
    } catch (Exception e) {
      log.warn("Redis indisponível, gerando card sem cache userId={}", userId);
    }

    ShareCardData data = shareCardDataService.buildCardData(userId);

    try {
      byte[] card = render(data);
      try {
        shareCardRedisTemplate.opsForValue().set(key, card, CARD_TTL);
      } catch (Exception e) {
        log.warn("Falha ao cachear share card userId={}", userId);
      }
      return card;
    } catch (IOException e) {
      log.error("Falha ao renderizar share card userId={}", userId, e);
      throw new RuntimeException("Falha ao gerar card de compartilhamento", e);
    }
  }

  // ─── Rendering ────────────────────────────────────────────────────────────

  private byte[] render(ShareCardData data) throws IOException {
    var tempImg = new BufferedImage(1, 1, BufferedImage.TYPE_INT_ARGB);
    var tempG = tempImg.createGraphics();
    hq(tempG);

    int yCalc = HEADER_H + PAD_Y;

    yCalc +=
        Math.max(
                tempG.getFontMetrics(F_USER).getHeight(),
                tempG.getFontMetrics(F_LABEL).getHeight())
            + 6 * SCALE;

    boolean computed = DnaStatus.COMPUTED == data.dna().getStatus();
    String arch =
        computed && data.dna().getDominantArchetype() != null
            ? data.dna().getDominantArchetype().getLabel()
            : "Em Formação";
    FontMetrics fma = tempG.getFontMetrics(F_ARCH);
    int cW = W - PAD_X * 2;
    yCalc += fma.stringWidth(arch) <= cW ? fma.getHeight() + 6 * SCALE : fma.getHeight() * 2 + 6 * SCALE;

    yCalc += tempG.getFontMetrics(F_COMP).getHeight() + 8 * SCALE;
    yCalc += tempG.getFontMetrics(F_STATS_INLINE_B).getHeight() + 10 * SCALE;
    yCalc += tempG.getFontMetrics(F_GRID_H).getHeight() + 8 * SCALE;

    int maxT = Math.min(5, data.themes().size());
    int maxB = Math.min(5, data.displayBooks().size());
    int rows = Math.max(maxT, maxB);

    int rowH =
        Math.max(
                Math.max(
                    tempG.getFontMetrics(F_GRID_I).getHeight(),
                    tempG.getFontMetrics(F_BOOK_TITLE).getHeight()),
                tempG.getFontMetrics(F_GRID_NUM).getHeight())
            + 6 * SCALE;
    yCalc += rows * rowH;
    tempG.dispose();

    int finalH = yCalc + 16 * SCALE;

    var img = new BufferedImage(W, finalH, BufferedImage.TYPE_INT_ARGB);
    var g = img.createGraphics();
    hq(g);

    Shape oldClip = g.getClip();
    g.setClip(new RoundRectangle2D.Float(0, 0, W, finalH, 12 * SCALE, 12 * SCALE));
    g.setColor(C_BODY);
    g.fillRect(0, 0, W, finalH);

    paintHeader(g, data);
    paintBody(g, data);

    g.setClip(oldClip);
    g.dispose();

    var baos = new ByteArrayOutputStream();
    ImageIO.write(img, "PNG", baos);
    return baos.toByteArray();
  }

  private void paintHeader(Graphics2D g, ShareCardData data) {
    g.setPaint(new GradientPaint(0, 0, C_HEADER_TOP, 0, HEADER_H, C_BG));
    g.fillRect(0, 0, W, HEADER_H);

    if (bibliooLogo != null) {
      int logoW =
          Math.min(
              100 * SCALE,
              (int)
                  Math.round(
                      (double) bibliooLogo.getWidth() / bibliooLogo.getHeight() * LOGO_H));
      g.drawImage(bibliooLogo, PAD_X, PAD_Y, logoW, LOGO_H, null);
    } else {
      g.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 14 * SCALE));
      g.setColor(Color.WHITE);
      g.drawString("Biblioo", PAD_X, PAD_Y + LOGO_H);
    }

    LocalDateTime ref =
        data.dna().getCalculatedAt() != null ? data.dna().getCalculatedAt() : LocalDateTime.now();
    String month = ref.getMonth().getDisplayName(TextStyle.SHORT, PT_BR);
    String dateStr =
        Character.toUpperCase(month.charAt(0)) + month.substring(1) + " " + ref.getYear();
    g.setFont(F_DATE);
    g.setColor(C_HDR_SEC);
    FontMetrics fmd = g.getFontMetrics();
    g.drawString(dateStr, W - PAD_X - fmd.stringWidth(dateStr), PAD_Y + LOGO_H);

    Shape oldClip = g.getClip();
    g.setClip(0, 0, W, HEADER_H);

    List<BufferedImage> covers = data.covers();
    int n = covers.size();
    int cyC = HEADER_H - COVER_H + 5 * SCALE;
    int cySide = HEADER_H - SIDE_COVER_H + 5 * SCALE;
    int cxC = (W - COVER_W) / 2;
    int cxLeft = (int) (W * 0.15) - 10 * SCALE;
    int cxRight = (int) (W * 0.85) - SIDE_COVER_W + 10 * SCALE;

    if (n >= 3) {
      drawRotatedCover(g, covers.get(1), cxLeft, cySide, SIDE_COVER_W, SIDE_COVER_H, -8.0);
      drawRotatedCover(g, covers.get(2), cxRight, cySide, SIDE_COVER_W, SIDE_COVER_H, 8.0);
      drawRotatedCover(g, covers.get(0), cxC, cyC, COVER_W, COVER_H, 0.0);
    } else if (n == 2) {
      drawRotatedCover(g, covers.get(1), cxLeft, cySide, SIDE_COVER_W, SIDE_COVER_H, -8.0);
      drawRotatedCover(g, covers.get(0), cxC, cyC, COVER_W, COVER_H, 0.0);
    } else if (n == 1) {
      drawRotatedCover(g, covers.get(0), cxC, cyC, COVER_W, COVER_H, 0.0);
    }

    g.setClip(oldClip);
  }

  private void drawRotatedCover(
      Graphics2D g, BufferedImage cover, int x, int y, int cW, int cH, double deg) {
    var oldTransform = g.getTransform();
    g.rotate(Math.toRadians(deg), x + cW / 2.0, y + cH / 2.0);

    Shape oldClip = g.getClip();
    var coverShape = new RoundRectangle2D.Float(x, y, cW, cH, 8 * SCALE, 8 * SCALE);

    g.setColor(new Color(0, 0, 0, 40));
    for (int i = 1; i <= 6; i++) {
      g.fillRoundRect(
          x - i * SCALE / 2,
          y + i * SCALE,
          cW + i * SCALE,
          cH + i * SCALE,
          8 * SCALE,
          8 * SCALE);
    }

    g.setClip(coverShape);

    if (cover != null) {
      g.setRenderingHint(
          RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
      double scale = Math.max((double) cW / cover.getWidth(), (double) cH / cover.getHeight());
      int sw = (int) Math.ceil(cover.getWidth() * scale);
      int sh = (int) Math.ceil(cover.getHeight() * scale);
      g.drawImage(cover, x + (cW - sw) / 2, y + (cH - sh) / 2, sw, sh, null);
    } else {
      g.setColor(C_BRAND_600);
      g.fill(coverShape);
    }

    g.setPaint(
        new GradientPaint(
            x, y, new Color(255, 255, 255, 40), x + cW / 3.0f, y, new Color(255, 255, 255, 0)));
    g.fillRect(x, y, cW, cH);

    g.setColor(new Color(0, 0, 0, 80));
    g.fillRect(x, y, 4 * SCALE, cH);

    g.setColor(new Color(255, 255, 255, 40));
    g.draw(coverShape);

    g.setClip(oldClip);
    g.setTransform(oldTransform);
  }

  private void paintBody(Graphics2D g, ShareCardData data) {
    boolean computed = DnaStatus.COMPUTED == data.dna().getStatus();
    int x = PAD_X;
    int cW = W - PAD_X * 2;
    int y = HEADER_H + PAD_Y;

    g.setFont(F_USER);
    g.setColor(C_TEXT_SEC);
    FontMetrics fmu = g.getFontMetrics();
    String username =
        "@" + (data.user().getUsername() != null ? data.user().getUsername() : "leitor");
    g.drawString(username, x, y + fmu.getAscent());

    g.setFont(F_LABEL);
    g.setColor(C_BRAND_500);
    FontMetrics fml = g.getFontMetrics();
    String label = "DNA LITERÁRIO";
    int labelW = fml.stringWidth(label) + (int) (1.5 * (label.length() - 1) * SCALE);
    int curX = x + cW - labelW;
    for (char c : label.toCharArray()) {
      g.drawString(String.valueOf(c), curX, y + fml.getAscent());
      curX += fml.charWidth(c) + (int) (1.5 * SCALE);
    }
    y += Math.max(fmu.getHeight(), fml.getHeight()) + 6 * SCALE;

    String arch =
        computed && data.dna().getDominantArchetype() != null
            ? data.dna().getDominantArchetype().getLabel()
            : "Em Formação";
    g.setFont(F_ARCH);
    g.setColor(C_TEXT_PRI);
    FontMetrics fma = g.getFontMetrics();
    if (fma.stringWidth(arch) <= cW) {
      g.drawString(arch, x, y + fma.getAscent());
      y += fma.getHeight() + 6 * SCALE;
    } else {
      int split = findSplit(arch, fma, cW);
      g.drawString(arch.substring(0, split).trim(), x, y + fma.getAscent());
      y += fma.getHeight();
      g.drawString(arch.substring(split).trim(), x, y + fma.getAscent());
      y += fma.getHeight() + 6 * SCALE;
    }

    String complexity =
        computed && data.dna().getComplexityLabel() != null
            ? data.dna().getComplexityLabel()
            : "Analisando";
    g.setFont(F_COMP);
    FontMetrics fmc = g.getFontMetrics();
    int dotD = 8 * SCALE;
    int dotY = y + (fmc.getHeight() - dotD) / 2;
    g.setColor(C_BRAND_500);
    g.fillOval(x, dotY, dotD, dotD);
    g.setColor(C_TEXT_PRI);
    g.drawString(complexity, x + dotD + 6 * SCALE, y + fmc.getAscent());
    y += fmc.getHeight() + 8 * SCALE;

    int booksRead = data.dna().getBooksReadCount() != null ? data.dna().getBooksReadCount() : 0;
    g.setFont(F_STATS_INLINE_B);
    FontMetrics fmInB = g.getFontMetrics();
    g.setFont(F_STATS_INLINE_N);
    FontMetrics fmInN = g.getFontMetrics();

    int curYs = y;
    int curXs = x;

    String vBooks = String.valueOf(booksRead);
    g.setFont(F_STATS_INLINE_B);
    g.setColor(C_TEXT_PRI);
    g.drawString(vBooks, curXs, curYs + fmInB.getAscent());
    curXs += fmInB.stringWidth(vBooks) + 4 * SCALE;

    String lBooks = "livros lidos";
    g.setFont(F_STATS_INLINE_N);
    g.setColor(new Color(255, 255, 255, 102));
    g.drawString(lBooks, curXs, curYs + fmInB.getAscent());
    curXs += fmInN.stringWidth(lBooks) + 6 * SCALE;

    g.setColor(new Color(255, 255, 255, 64));
    g.drawString("·", curXs, curYs + fmInB.getAscent());
    curXs += fmInN.stringWidth("·") + 6 * SCALE;

    String vPages = String.valueOf(data.totalPages());
    g.setFont(F_STATS_INLINE_B);
    g.setColor(C_BRAND_500);
    g.drawString(vPages, curXs, curYs + fmInB.getAscent());
    curXs += fmInB.stringWidth(vPages) + 4 * SCALE;

    g.setFont(F_STATS_INLINE_N);
    g.setColor(new Color(255, 255, 255, 102));
    g.drawString("páginas", curXs, curYs + fmInB.getAscent());

    y += fmInB.getHeight() + 10 * SCALE;

    int gapCol = 16 * SCALE;
    int colW1 = (int) ((cW - gapCol) * 0.4);
    int colW2 = cW - gapCol - colW1;
    int col2X = x + colW1 + gapCol;

    g.setFont(F_GRID_H);
    g.setColor(new Color(255, 255, 255, 102));
    FontMetrics fgh = g.getFontMetrics();
    g.drawString("Gêneros favoritos", x, y + fgh.getAscent());
    g.drawString("Livros favoritos", col2X, y + fgh.getAscent());
    y += fgh.getHeight() + 8 * SCALE;

    List<Map<String, Object>> themes = data.themes();
    List<DisplayBook> displayBooks = data.displayBooks();
    int maxT = Math.min(5, themes.size());
    int maxB = Math.min(5, displayBooks.size());
    int rows = Math.max(maxT, maxB);

    g.setFont(F_GRID_I);
    FontMetrics fgi = g.getFontMetrics();
    g.setFont(F_BOOK_TITLE);
    FontMetrics fgbk = g.getFontMetrics();
    g.setFont(F_GRID_NUM);
    FontMetrics fgn = g.getFontMetrics();

    int rowH = Math.max(Math.max(fgi.getHeight(), fgbk.getHeight()), fgn.getHeight()) + 6 * SCALE;
    Color cNum = new Color(255, 255, 255, 64);
    Color cItem = new Color(255, 255, 255, 217);
    int numWidth = 16 * SCALE;

    for (int i = 0; i < rows; i++) {
      int itemY = y + i * rowH;

      if (i < maxT) {
        var themeObj = themes.get(i);
        String genre =
            themeObj.containsKey("theme")
                ? String.valueOf(themeObj.get("theme"))
                : themeObj.isEmpty() ? "" : String.valueOf(themeObj.values().iterator().next());
        if (genre == null || genre.isEmpty() || genre.equals("null")) genre = "Tema " + (i + 1);

        g.setFont(F_GRID_NUM);
        g.setColor(cNum);
        g.drawString(String.valueOf(i + 1), x, itemY + fgn.getAscent());

        g.setFont(F_GRID_I);
        g.setColor(cItem);
        g.drawString(truncate(genre, fgi, colW1 - numWidth), x + numWidth, itemY + fgi.getAscent());
      }

      if (i < maxB) {
        String title = displayBooks.get(i).title();
        g.setFont(F_GRID_NUM);
        g.setColor(cNum);
        g.drawString(String.valueOf(i + 1), col2X, itemY + fgn.getAscent());

        g.setFont(F_BOOK_TITLE);
        g.setColor(cItem);
        g.drawString(
            truncate(title, fgbk, colW2 - numWidth), col2X + numWidth, itemY + fgbk.getAscent());
      }
    }
  }


  private String truncate(String text, FontMetrics fm, int maxW) {
    if (fm.stringWidth(text) <= maxW) return text;
    String dots = "...";
    int dotW = fm.stringWidth(dots);
    if (maxW <= dotW) return dots;
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < text.length(); i++) {
      if (fm.stringWidth(sb.toString() + text.charAt(i)) + dotW > maxW) {
        return sb.toString() + dots;
      }
      sb.append(text.charAt(i));
    }
    return sb.toString() + dots;
  }

  private int findSplit(String text, FontMetrics fm, int maxW) {
    for (int i = text.length() - 1; i > 0; i--) {
      if (text.charAt(i) == ' ' && fm.stringWidth(text.substring(0, i)) <= maxW) return i;
    }
    return text.length() / 2;
  }

  private static void hq(Graphics2D g) {
    g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
    g.setRenderingHint(
        RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
    g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
    g.setRenderingHint(
        RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
    g.setRenderingHint(
        RenderingHints.KEY_COLOR_RENDERING, RenderingHints.VALUE_COLOR_RENDER_QUALITY);
    g.setRenderingHint(
        RenderingHints.KEY_FRACTIONALMETRICS, RenderingHints.VALUE_FRACTIONALMETRICS_ON);
  }
}
