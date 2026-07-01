package com.campuslink.campuslinkbackend.security;

import java.util.Arrays;
import java.util.List;

public final class SecurityPaths {

    public static final List<String> PUBLIC_API = Arrays.asList(
            "/api/login",
            "/api/auth/login",
            "/api/register",
            "/api/users/register",
            "/api/auth/forgot-password",
            "/auth/forgot-password",
            "/api/auth/reset-password",
            "/auth/reset-password",
            "/api/students/matric/**",
            "/api/students/registry/**",
            "/api/programmes/browse",
            "/api/programmes/browse/**",
            "/api/advisor-approval/**"
    );

    private SecurityPaths() {
    }

    public static boolean isPublicApiPath(String path) {
        if (path == null) {
            return false;
        }
        String normalized = path.split("\\?")[0];
        for (String pattern : PUBLIC_API) {
            if (pattern.endsWith("/**")) {
                String prefix = pattern.substring(0, pattern.length() - 3);
                if (normalized.equals(prefix) || normalized.startsWith(prefix + "/")) {
                    return true;
                }
            } else if (normalized.equals(pattern)) {
                return true;
            }
        }
        return false;
    }
}
