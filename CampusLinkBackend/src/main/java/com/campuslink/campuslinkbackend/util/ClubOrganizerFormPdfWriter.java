package com.campuslink.campuslinkbackend.util;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Builds the UMT Club Advisor Verification form PDF (no external library).
 */
public final class ClubOrganizerFormPdfWriter {

    private static final float PAGE_W = 612f;
    private static final float PAGE_H = 792f;
    private static final float MARGIN = 50f;
    private static final float WIDTH = 512f;

    private ClubOrganizerFormPdfWriter() {}

    /** Blank template for static demo file bootstrap (no applicant pre-filled). */
    public static byte[] buildBlankTemplate() {
        return build("", "", "", "Setiausaha / Secretary", "", "", "");
    }

    /** @deprecated Demo seed only — use {@link #build} with requester details instead. */
    public static byte[] buildDemoSignedForm() {
        return build(
                "Muhammad Abu",
                "S50908",
                "Kelab Keusahawanan UMT",
                "Setiausaha / Secretary",
                "Dr. Ahmad Faizal bin Ismail",
                "Pensyarah Kanan, Fakulti Sains Komputer dan Matematik (FSKM)",
                "15 Jun 2026");
    }

    public static byte[] build(
            String fullName,
            String matricNumber,
            String clubName,
            String position,
            String advisorName,
            String advisorPosition,
            String advisorDate) {
        PdfCanvas canvas = new PdfCanvas();

        canvas.textCenterPage(42, 14, true, "UNIVERSITI MALAYSIA TERENGGANU");
        canvas.textCenterPage(58, 12, true, "BORANG PENGESAHAN PENASIHAT KELAB");
        canvas.line(MARGIN, 68, MARGIN + WIDTH, 68);

        float y = 82;
        canvas.text(MARGIN, y, 10, true, "A. MAKLUMAT PEMOHON");
        y += 14;

        float fieldW = WIDTH / 2f - 6f;
        float fieldH = 34f;
        canvas.fieldBox(MARGIN, y, fieldW, fieldH, "Nama Pemohon:", fullName);
        canvas.fieldBox(MARGIN + fieldW + 8f, y, fieldW, fieldH, "No. Matrik:", matricNumber);
        y += fieldH + 8f;
        canvas.fieldBox(MARGIN, y, fieldW, fieldH, "Nama Kelab:", clubName);
        canvas.fieldBox(MARGIN + fieldW + 8f, y, fieldW, fieldH, "Jawatan dalam Kelab:", position);
        y += fieldH + 14f;

        canvas.text(MARGIN, y, 10, true, "B. PENGESAHAN PENASIHAT KELAB");
        y += 14;
        canvas.fieldBox(MARGIN, y, fieldW, fieldH, "Nama Penasihat:", advisorName);
        canvas.fieldBox(MARGIN + fieldW + 8f, y, fieldW, fieldH, "Jawatan Penasihat:", advisorPosition);
        y += fieldH + 8f;

        float sigH = 48f;
        canvas.rect(MARGIN, y, WIDTH, sigH);
        canvas.text(MARGIN + 4, y + 12, 9, false, "Tandatangan Penasihat:");
        if (advisorName != null && !advisorName.isBlank()) {
            canvas.text(MARGIN + 4, y + 28, 11, true, advisorName);
        }
        canvas.text(MARGIN + WIDTH - 120, y + 12, 9, false, "Tarikh:");
        if (advisorDate != null && !advisorDate.isBlank()) {
            canvas.text(MARGIN + WIDTH - 120, y + 28, 10, false, advisorDate);
        }
        y += sigH + 16f;

        canvas.text(MARGIN, y, 9, true, "Nota:");
        y += 12;
        canvas.textWrapped(
                MARGIN,
                y,
                9,
                false,
                "Dokumen ini mesti dilengkapkan oleh pelajar dan penasihat kelab. Penandatanganan oleh penasihat kelab "
                        + "mengesahkan bahawa pelajar adalah wakil rasmi kelab UMT. Kelulusan HEPA dilakukan melalui "
                        + "sistem CampusLink+.");

        return canvas.toPdfBytes();
    }

    private static final class PdfCanvas {
        private final List<String> ops = new ArrayList<>();

        void text(float x, float topY, float size, boolean bold, String value) {
            if (value == null || value.isBlank()) {
                return;
            }
            ops.add(String.format(
                    "BT /F%d %.1f Tf %.1f %.1f Td (%s) Tj ET",
                    bold ? 2 : 1,
                    size,
                    x,
                    pdfY(topY),
                    escape(value)));
        }

        void textCenterPage(float topY, float size, boolean bold, String value) {
            if (value == null || value.isBlank()) {
                return;
            }
            float width = estimateTextWidth(value, size, bold);
            text((PAGE_W - width) / 2f, topY, size, bold, value);
        }

        private static float estimateTextWidth(String text, float fontSize, boolean bold) {
            float letterFactor = bold ? 0.62f : 0.54f;
            float total = 0f;
            for (int i = 0; i < text.length(); i++) {
                char c = text.charAt(i);
                if (c == ' ') {
                    total += fontSize * 0.28f;
                } else if (c == '/' || c == '-') {
                    total += fontSize * 0.36f;
                } else if (Character.isUpperCase(c)) {
                    total += fontSize * letterFactor;
                } else {
                    total += fontSize * (bold ? 0.52f : 0.46f);
                }
            }
            return total;
        }

        void textWrapped(float x, float topY, float size, boolean bold, String value) {
            if (value == null || value.isBlank()) {
                return;
            }
            int maxChars = 95;
            String[] words = value.split(" ");
            StringBuilder line = new StringBuilder();
            float y = topY;
            for (String word : words) {
                if (line.length() + word.length() + 1 > maxChars) {
                    text(x, y, size, bold, line.toString().trim());
                    y += size + 4;
                    line = new StringBuilder();
                }
                line.append(word).append(' ');
            }
            if (!line.isEmpty()) {
                text(x, y, size, bold, line.toString().trim());
            }
        }

        void line(float x1, float topY1, float x2, float topY2) {
            ops.add(String.format(
                    "%.1f %.1f m %.1f %.1f l S",
                    x1, pdfY(topY1), x2, pdfY(topY2)));
        }

        void rect(float x, float topY, float w, float h) {
            ops.add(String.format("%.1f %.1f %.1f %.1f re S", x, pdfY(topY + h), w, h));
        }

        void fieldBox(float x, float topY, float w, float h, String label, String value) {
            rect(x, topY, w, h);
            text(x + 4, topY + 10, 9, false, label);
            if (value != null && !value.isBlank()) {
                text(x + 4, topY + 22, 10, true, truncate(value, 42));
            }
        }

        byte[] toPdfBytes() {
            String stream = String.join("\n", ops);
            int streamLen = stream.getBytes(StandardCharsets.US_ASCII).length;

            StringBuilder pdf = new StringBuilder();
            pdf.append("%PDF-1.4\n");
            int[] offsets = new int[6];
            offsets[0] = 0;

            offsets[1] = pdf.length();
            pdf.append("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

            offsets[2] = pdf.length();
            pdf.append("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

            offsets[3] = pdf.length();
            pdf.append("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] ")
                    .append("/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n");

            offsets[4] = pdf.length();
            pdf.append("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");

            offsets[5] = pdf.length();
            pdf.append("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n");

            int contentsOffset = pdf.length();
            pdf.append("6 0 obj\n<< /Length ").append(streamLen).append(" >>\nstream\n")
                    .append(stream).append("\nendstream\nendobj\n");

            int xrefPos = pdf.length();
            pdf.append("xref\n0 7\n");
            pdf.append("0000000000 65535 f \n");
            pdf.append(String.format("%010d 00000 n \n", offsets[1]));
            pdf.append(String.format("%010d 00000 n \n", offsets[2]));
            pdf.append(String.format("%010d 00000 n \n", offsets[3]));
            pdf.append(String.format("%010d 00000 n \n", offsets[4]));
            pdf.append(String.format("%010d 00000 n \n", offsets[5]));
            pdf.append(String.format("%010d 00000 n \n", contentsOffset));
            pdf.append("trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n")
                    .append(xrefPos).append("\n%%EOF");

            return pdf.toString().getBytes(StandardCharsets.US_ASCII);
        }

        private static float pdfY(float topY) {
            return PAGE_H - topY;
        }

        private static String truncate(String value, int max) {
            if (value.length() <= max) {
                return value;
            }
            return value.substring(0, max - 3) + "...";
        }

        private static String escape(String value) {
            return value
                    .replace("\\", "\\\\")
                    .replace("(", "\\(")
                    .replace(")", "\\)");
        }
    }
}
