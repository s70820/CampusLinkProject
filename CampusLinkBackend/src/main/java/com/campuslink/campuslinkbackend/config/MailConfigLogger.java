package com.campuslink.campuslinkbackend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class MailConfigLogger implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(MailConfigLogger.class);

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void run(ApplicationArguments args) {
        boolean passwordReady = StringUtils.hasText(mailPassword)
                && !mailPassword.contains("YOUR_GMAIL_APP_PASSWORD")
                && !mailPassword.contains("YOUR_16_CHAR_GMAIL_APP_PASSWORD");

        if (StringUtils.hasText(mailUsername) && passwordReady) {
            log.info("Mail configured for forgot-password: {} (reset links -> {})", mailUsername, frontendUrl);
        } else {
            log.warn(
                    "Mail NOT configured. Edit application-local.properties and set spring.mail.password "
                            + "to your Gmail App Password (https://myaccount.google.com/apppasswords)."
            );
        }
    }
}
