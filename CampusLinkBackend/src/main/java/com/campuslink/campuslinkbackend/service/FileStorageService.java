package com.campuslink.campuslinkbackend.service;

import com.campuslink.campuslinkbackend.config.UploadProperties;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

@Service
public class FileStorageService {

    private final Path uploadRoot;

    public FileStorageService(UploadProperties uploadProperties) {
        this.uploadRoot = uploadProperties.rootPath();
    }

    public String store(MultipartFile file, String subDirectory) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required.");
        }

        try {
            Path uploadDir = uploadRoot.resolve(subDirectory).normalize();
            Files.createDirectories(uploadDir);

            if (!uploadDir.startsWith(uploadRoot)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid upload directory.");
            }

            String safeName = sanitizeFileName(file.getOriginalFilename());
            String fileName = System.currentTimeMillis() + "_" + safeName;
            Path destination = uploadDir.resolve(fileName).normalize();

            if (!destination.startsWith(uploadRoot)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file name.");
            }

            try (var inputStream = file.getInputStream()) {
                Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
            }
            return toStoredPath(destination);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to save file.", ex);
        }
    }

    public Path resolveStoredFile(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File path is required.");
        }
        String normalized = relativePath.replace("\\", "/").replaceFirst("^/+", "");
        if (normalized.toLowerCase().startsWith("uploads/")) {
            normalized = normalized.substring("uploads/".length());
        }
        Path file = uploadRoot.resolve(normalized).normalize();
        if (!file.startsWith(uploadRoot)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file path.");
        }
        return file;
    }

    private String toStoredPath(Path destination) {
        Path relative = uploadRoot.relativize(destination.normalize());
        String stored = relative.toString().replace('\\', '/');
        return stored.startsWith("uploads/") ? stored : "uploads/" + stored;
    }

    public Path resolvePublicFile(String subdir, String filename) {
        Path file = uploadRoot.resolve(subdir).resolve(filename).normalize();
        if (!file.startsWith(uploadRoot)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file path.");
        }
        return file;
    }

    private String sanitizeFileName(String originalName) {
        if (originalName == null || originalName.isBlank()) {
            return "upload.bin";
        }
        String cleaned = StringUtils.cleanPath(originalName.trim());
        String baseName = java.nio.file.Paths.get(cleaned).getFileName().toString();
        if (baseName.isBlank()) {
            return "upload.bin";
        }
        return baseName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
