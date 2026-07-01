package com.campuslink.campuslinkbackend.controller;

import com.campuslink.campuslinkbackend.entity.StudentNotification;
import com.campuslink.campuslinkbackend.entity.User;
import com.campuslink.campuslinkbackend.repository.StudentNotificationRepository;
import com.campuslink.campuslinkbackend.repository.UserRepository;
import com.campuslink.campuslinkbackend.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequestMapping("/api/notifications")
public class NotificationController {

    private final StudentNotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public NotificationController(
            StudentNotificationRepository notificationRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<Map<String, Object>> list(@RequestParam Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toMap)
                .collect(Collectors.toList());
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(@RequestParam Long userId) {
        return Map.of("count", notificationRepository.countByUserIdAndIsReadFalse(userId));
    }

    @PatchMapping("/{id}/read")
    public void markRead(@PathVariable Long id, @RequestParam Long userId) {
        StudentNotification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        if (notification.getUser() == null || !userId.equals(notification.getUser().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own notifications.");
        }
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @PatchMapping("/read-all")
    public void markAllRead(@RequestParam Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        notificationService.markAllRead(userId);
    }

    private Map<String, Object> toMap(StudentNotification n) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", n.getId());
        map.put("type", n.getNotificationType());
        map.put("title", n.getTitle());
        map.put("message", n.getMessage());
        map.put("referenceType", n.getReferenceType());
        map.put("referenceId", n.getReferenceId());
        map.put("isRead", n.getIsRead());
        map.put("createdAt", n.getCreatedAt());
        return map;
    }
}
