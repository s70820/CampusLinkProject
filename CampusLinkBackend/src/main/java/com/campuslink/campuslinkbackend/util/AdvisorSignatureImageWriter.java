package com.campuslink.campuslinkbackend.util;

import javax.imageio.ImageIO;
import java.awt.AlphaComposite;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

/**
 * Generates a transparent PNG signature image for demo certificates.
 */
public final class AdvisorSignatureImageWriter {

    private static final Color INK = new Color(6, 46, 89);

    private AdvisorSignatureImageWriter() {}

    public static byte[] build(String displayName) throws IOException {
        int width = 240;
        int height = 60;
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = image.createGraphics();
        try {
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
            g.setComposite(AlphaComposite.Clear);
            g.fillRect(0, 0, width, height);
            g.setComposite(AlphaComposite.SrcOver);

            String sigLine = signatureLine(displayName);
            Font font = resolveScriptFont(20);
            g.setFont(font);
            FontMetrics fm = g.getFontMetrics();
            int textWidth = fm.stringWidth(sigLine);
            int x = Math.max(8, (width - textWidth) / 2);
            int y = height / 2 + fm.getAscent() / 2 - 4;

            g.setColor(INK);
            g.drawString(sigLine, x, y);

            int lineY = y + 6;
            g.setStroke(new BasicStroke(1.2f));
            g.drawLine(x, lineY, x + textWidth, lineY + 1);
        } finally {
            g.dispose();
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(image, "png", out);
        return out.toByteArray();
    }

    static String signatureLine(String name) {
        if (name == null || name.isBlank()) {
            return "Advisor";
        }
        String trimmed = name
                .replaceFirst("^(Dr\\.|Prof\\. Dr\\.|Prof\\.|Pn\\.|Encik\\.|Puan\\.)\\s*", "")
                .replaceAll("\\s+binti\\s+", " ")
                .replaceAll("\\s+bin\\s+", " ")
                .trim();
        String[] parts = trimmed.split("\\s+");
        if (parts.length >= 2) {
            return parts[0].charAt(0) + ". " + parts[parts.length - 2] + " " + parts[parts.length - 1];
        }
        return trimmed;
    }

    private static Font resolveScriptFont(int size) {
        String[] families = {"Segoe Script", "Brush Script MT", "Lucida Handwriting", "Monotype Corsiva"};
        for (String family : families) {
            Font font = new Font(family, Font.PLAIN, size);
            if (font.getFamily().equalsIgnoreCase(family)) {
                return font;
            }
        }
        return new Font(Font.SERIF, Font.ITALIC, size);
    }
}
