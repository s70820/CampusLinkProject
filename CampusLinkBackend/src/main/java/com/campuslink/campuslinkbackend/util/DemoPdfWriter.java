package com.campuslink.campuslinkbackend.util;

import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Builds minimal valid PDF 1.4 files for demo uploads (no external library).
 */
public final class DemoPdfWriter {

    private DemoPdfWriter() {}

    public static byte[] build(String title, List<String> bodyLines) {
        String safeTitle = escape(title);
        StringBuilder textOps = new StringBuilder();
        textOps.append("BT\n/F1 16 Tf\n50 750 Td\n(").append(safeTitle).append(") Tj\n");
        textOps.append("/F1 11 Tf\n0 -28 Td\n(").append(safeTitle).append(") Tj\n");
        for (String line : bodyLines) {
            textOps.append("0 -18 Td\n(").append(escape(line)).append(") Tj\n");
        }
        textOps.append("ET");
        String stream = textOps.toString();
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
                .append("/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n");

        offsets[4] = pdf.length();
        pdf.append("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");

        offsets[5] = pdf.length();
        pdf.append("5 0 obj\n<< /Length ").append(streamLen).append(" >>\nstream\n")
                .append(stream).append("\nendstream\nendobj\n");

        int xrefPos = pdf.length();
        pdf.append("xref\n0 6\n");
        pdf.append("0000000000 65535 f \n");
        for (int i = 1; i < offsets.length; i++) {
            pdf.append(String.format("%010d 00000 n \n", offsets[i]));
        }
        pdf.append("trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n")
                .append(xrefPos).append("\n%%EOF");

        return pdf.toString().getBytes(StandardCharsets.US_ASCII);
    }

    private static String escape(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("\\", "\\\\")
                .replace("(", "\\(")
                .replace(")", "\\)");
    }
}
