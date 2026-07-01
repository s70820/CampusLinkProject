package com.campuslink.campuslinkbackend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.nio.file.Paths;

@Component
@ConfigurationProperties(prefix = "app.upload")
public class UploadProperties {

    private String baseDir = "uploads";

    public String getBaseDir() {
        return baseDir;
    }

    public void setBaseDir(String baseDir) {
        this.baseDir = baseDir;
    }

    public Path rootPath() {
        return Paths.get(baseDir).toAbsolutePath().normalize();
    }
}
