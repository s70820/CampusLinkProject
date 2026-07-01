package com.campuslink.campuslinkbackend.config;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;

/**
 * Writes a marker file when Tomcat deploys this WAR (diagnostic for CURSOR hosting).
 */
@WebListener
public class CursorDeployProbeListener implements ServletContextListener {

    private static final Path MARKER = Path.of("/home/s70820/uploads/tomcat-deployed.txt");

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        try {
            Files.createDirectories(MARKER.getParent());
            Files.writeString(
                    MARKER,
                    "Tomcat deployed s70820.war at " + Instant.now() + System.lineSeparator(),
                    StandardCharsets.UTF_8
            );
        } catch (Exception ignored) {
            // Best-effort probe only
        }
    }
}
