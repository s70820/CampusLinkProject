package com.campuslink.campuslinkbackend.controller;

import com.campuslink.campuslinkbackend.service.FileStorageService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
public class FileServeController {

    private static final String UPLOADS_PREFIX = "/uploads/";

    private final FileStorageService fileStorageService;

    public FileServeController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/uploads/**")
    public ResponseEntity<Resource> serveUpload(HttpServletRequest request) throws Exception {
        String requestUri = URLDecoder.decode(request.getRequestURI(), StandardCharsets.UTF_8);
        int uploadsPos = requestUri.indexOf(UPLOADS_PREFIX);
        if (uploadsPos < 0) {
            return ResponseEntity.notFound().build();
        }

        String relativePath = requestUri.substring(uploadsPos + UPLOADS_PREFIX.length());
        if (relativePath.isBlank()) {
            return ResponseEntity.notFound().build();
        }

        Path file = fileStorageService.resolveStoredFile(relativePath);
        if (!Files.exists(file) || !Files.isRegularFile(file)) {
            return ResponseEntity.notFound().build();
        }

        String contentType = Files.probeContentType(file);
        if (contentType == null) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        String fileName = file.getFileName().toString();
        boolean asDownload = "1".equals(request.getParameter("download"))
                || "true".equalsIgnoreCase(request.getParameter("download"));
        String disposition = asDownload ? "attachment" : "inline";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition + "; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(new FileSystemResource(file));
    }
}
