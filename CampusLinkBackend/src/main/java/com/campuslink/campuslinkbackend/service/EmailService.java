package com.campuslink.campuslinkbackend.service;

import com.campuslink.campuslinkbackend.exception.MailDeliveryException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.from:}")
    private String fromAddress;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    public void sendPasswordResetEmail(String recipientEmail, String recipientName, String resetLink) {
        String subject = "CampusLink+ Password Reset";
        String body = "Hello " + recipientName + ",\n\n"
                + "We received a request to reset your CampusLink+ password.\n\n"
                + "Click the link below:\n\n"
                + resetLink + "\n\n"
                + "If you did not request this, ignore this email.";

        String sender = StringUtils.hasText(fromAddress) ? fromAddress : mailUsername;
        boolean passwordReady = StringUtils.hasText(mailPassword)
                && !mailPassword.contains("YOUR_GMAIL_APP_PASSWORD")
                && !mailPassword.contains("YOUR_16_CHAR_GMAIL_APP_PASSWORD");

        if (mailSender == null || !StringUtils.hasText(sender) || !passwordReady) {
            log.warn("Mail is not configured. Password reset link for {}: {}", recipientEmail, resetLink);
            throw new MailDeliveryException(
                    "Email is not configured on the server. Add your Gmail App Password to application-local.properties."
            );
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(sender);
            message.setTo(recipientEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Password reset email sent to {}", recipientEmail);
        } catch (Exception ex) {
            log.error("Failed to send password reset email to {}", recipientEmail, ex);
            throw new MailDeliveryException(
                    "Failed to send reset email. Check Gmail App Password in application-local.properties.",
                    ex
            );
        }
    }
}
