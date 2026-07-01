package com.campuslink.campuslinkbackend.util;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Builds a formatted UMT faculty endorsement letter for MPP role requests.
 */
public final class FacultyEndorsementLetterPdfWriter {

    private static final float PAGE_W = 612f;
    private static final float PAGE_H = 792f;
    private static final float MARGIN = 50f;
    private static final float WIDTH = 512f;

    private FacultyEndorsementLetterPdfWriter() {}

    public static byte[] buildDemoLetter() {
        return build(
                "Ahmad Ali",
                "S70489",
                "Faculty of Computer Science and Mathematics (FSKM)",
                "MPP Reviewer - CampusLink+",
                "2025/2026",
                "FSKM/HEP/MPP/2026/031",
                "03 Jun 2026",
                "Prof. Dr. Norhazlin binti Mohd Rashid",
                "Dean, Faculty of Computer Science and Mathematics (FSKM)");
    }

    public static byte[] buildDemoLetterForAmirul() {
        return build(
                "Muhammad Amirul bin Hassan",
                "S70877",
                "Faculty of Computer Science and Mathematics (FSKM)",
                "MPP Reviewer - CampusLink+",
                "2025/2026",
                "FSKM/HEP/MPP/2026/047",
                "21 Jun 2026",
                "Prof. Dr. Norhazlin binti Mohd Rashid",
                "Dean, Faculty of Computer Science and Mathematics (FSKM)");
    }

    public static byte[] build(
            String studentName,
            String matricNumber,
            String facultyName,
            String requestedRole,
            String academicSession,
            String referenceNo,
            String letterDate,
            String signatoryName,
            String signatoryTitle) {
        PdfCanvas canvas = new PdfCanvas();

        canvas.textCenterPage(38, 14, true, "UNIVERSITI MALAYSIA TERENGGANU");
        canvas.textCenterPage(54, 11, true, facultyName.toUpperCase());
        canvas.textCenterPage(70, 12, true, "SURAT SOKONGAN FAKULTI");
        canvas.line(MARGIN, 78, MARGIN + WIDTH, 78);

        float y = 92;
        canvas.text(MARGIN, y, 10, false, "Rujukan:");
        canvas.text(MARGIN + 58, y, 10, true, referenceNo);
        canvas.text(MARGIN + WIDTH - 150, y, 10, false, "Tarikh:");
        canvas.text(MARGIN + WIDTH - 108, y, 10, true, letterDate);
        y += 22;

        canvas.text(MARGIN, y, 10, true, "Kepada:");
        y += 14;
        canvas.text(MARGIN + 12, y, 10, false, "Pengarah Hal Ehwal Pelajar (HEPA)");
        y += 12;
        canvas.text(MARGIN + 12, y, 10, false, "Universiti Malaysia Terengganu");
        y += 12;
        canvas.text(MARGIN + 12, y, 10, false, "21030 Kuala Nerus, Terengganu");
        y += 20;

        canvas.text(MARGIN, y, 10, true, "Perkara:");
        canvas.text(MARGIN + 52, y, 10, false, "SOKONGAN PERMOHONAN PERANAN " + requestedRole.toUpperCase());
        y += 20;

        canvas.text(MARGIN, y, 10, false, "Dengan hormatnya,");
        y += 18;

        y = canvas.textWrapped(
                MARGIN,
                y,
                10,
                false,
                "Merujuk kepada perkara di atas, fakulti ini dengan sukacitanya mengesahkan sokongan bagi "
                        + "permohonan pelajar berikut untuk dilantik sebagai semakan MPP pada platform CampusLink+ "
                        + "bagi sesi akademik " + academicSession + ".");
        y += 10;

        float fieldW = WIDTH / 2f - 6f;
        float fieldH = 34f;
        canvas.fieldBox(MARGIN, y, fieldW, fieldH, "Nama Pelajar:", studentName);
        canvas.fieldBox(MARGIN + fieldW + 8f, y, fieldW, fieldH, "No. Matrik:", matricNumber);
        y += fieldH + 10f;
        canvas.fieldBox(MARGIN, y, WIDTH, fieldH, "Fakulti:", facultyName);
        y += fieldH + 14f;

        y = canvas.textWrapped(
                MARGIN,
                y,
                10,
                false,
                "Pelajar tersebut adalah pelajar aktif fakulti, berkelakuan baik, dan dipercayai memiliki "
                        + "integriti serta keupayaan untuk menjalankan tugas semakan program kokurikulum melalui "
                        + "sistem CampusLink+.");
        y += 10;

        y = canvas.textWrapped(
                MARGIN,
                y,
                10,
                false,
                "Sokongan ini dikeluarkan untuk pertimbangan dan kelulusan pihak HEPA melalui sistem CampusLink+. "
                        + "Kerjasama dan pertimbangan tuan/puan amatlah dihargai.");
        y += 14;

        canvas.text(MARGIN, y, 10, false, "Sekian, terima kasih.");
        y += 16;
        canvas.text(MARGIN, y, 10, true, "\"BERKHIDMAT UNTUK NEGARA\"");
        y += 28;

        canvas.text(MARGIN, y, 10, false, "Yang benar,");
        y += 42;

        canvas.line(MARGIN, y, MARGIN + 180, y);
        y += 22;
        canvas.text(MARGIN, y, 10, true, signatoryName);
        y += 12;
        canvas.text(MARGIN, y, 10, false, signatoryTitle);
        y += 12;
        canvas.text(MARGIN, y, 9, false, "Universiti Malaysia Terengganu");

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

        float textWrapped(float x, float topY, float size, boolean bold, String value) {
            if (value == null || value.isBlank()) {
                return topY;
            }
            int maxChars = 88;
            String[] words = value.split(" ");
            StringBuilder line = new StringBuilder();
            float y = topY;
            float lineHeight = size + 6f;
            for (String word : words) {
                if (line.length() + word.length() + 1 > maxChars) {
                    text(x, y, size, bold, line.toString().trim());
                    y += lineHeight;
                    line = new StringBuilder();
                }
                line.append(word).append(' ');
            }
            if (!line.isEmpty()) {
                text(x, y, size, bold, line.toString().trim());
                y += lineHeight;
            }
            return y;
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
                text(x + 4, topY + 22, 10, true, truncate(value, 58));
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
            for (int i = 1; i < offsets.length; i++) {
                pdf.append(String.format("%010d 00000 n \n", offsets[i]));
            }
            pdf.append(String.format("%010d 00000 n \n", contentsOffset));
            pdf.append("trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n")
                    .append(xrefPos).append("\n%%EOF");

            return pdf.toString().getBytes(StandardCharsets.US_ASCII);
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
