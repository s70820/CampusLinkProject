-- Optional participant communication link (Telegram / WhatsApp group)

ALTER TABLE programme
    ADD COLUMN communication_link VARCHAR(500) NULL AFTER google_maps_link;
