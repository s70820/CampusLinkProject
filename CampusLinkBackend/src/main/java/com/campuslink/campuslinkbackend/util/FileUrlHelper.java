package com.campuslink.campuslinkbackend.util;

public final class FileUrlHelper {

    private FileUrlHelper() {}

    public static String toPublicUrl(String storedPath) {
        if (storedPath == null || storedPath.isBlank()) {
            return null;
        }
        if (storedPath.startsWith("http://") || storedPath.startsWith("https://")) {
            return storedPath;
        }

        String normalized = storedPath.replace("\\", "/").trim();
        int uploadsIndex = normalized.toLowerCase().indexOf("/uploads/");
        if (uploadsIndex >= 0) {
            return normalized.substring(uploadsIndex);
        }

        int bareUploadsIndex = normalized.toLowerCase().indexOf("uploads/");
        if (bareUploadsIndex >= 0) {
            return "/" + normalized.substring(bareUploadsIndex);
        }

        if (!normalized.contains("://") && !normalized.matches("^[A-Za-z]:[/\\\\].*")) {
            return "/uploads/" + normalized.replaceFirst("^/+", "");
        }

        return normalized.startsWith("/") ? normalized : "/" + normalized;
    }
}
