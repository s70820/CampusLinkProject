package com.campuslink.campuslinkbackend.service;

import com.campuslink.campuslinkbackend.entity.StudentNotification;
import com.campuslink.campuslinkbackend.entity.User;
import com.campuslink.campuslinkbackend.repository.StudentNotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final StudentNotificationRepository notificationRepository;

    public NotificationService(StudentNotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public StudentNotification notify(
            User user,
            String type,
            String title,
            String message,
            String referenceType,
            Long referenceId) {
        if (user == null) {
            return null;
        }
        StudentNotification notification = new StudentNotification();
        notification.setUser(user);
        notification.setNotificationType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setReferenceType(referenceType != null ? referenceType : "GENERAL");
        notification.setReferenceId(referenceId != null ? referenceId : 0L);
        notification.setIsRead(false);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(notification -> !Boolean.TRUE.equals(notification.getIsRead()))
                .forEach(notification -> {
                    notification.setIsRead(true);
                    notificationRepository.save(notification);
                });
    }
}
