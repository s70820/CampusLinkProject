-- Normalize absolute Windows/Linux upload paths to web-relative /uploads/... paths

UPDATE programme
SET poster_path = CONCAT('/uploads/', SUBSTRING(REPLACE(poster_path, '\\', '/'), LOCATE('uploads/', REPLACE(poster_path, '\\', '/')) + 8))
WHERE poster_path IS NOT NULL
  AND poster_path NOT LIKE 'http%'
  AND poster_path NOT LIKE '/uploads/%'
  AND poster_path NOT LIKE 'uploads/%'
  AND LOCATE('uploads/', REPLACE(poster_path, '\\', '/')) > 0;

UPDATE programme
SET payment_qr_path = CONCAT('/uploads/', SUBSTRING(REPLACE(payment_qr_path, '\\', '/'), LOCATE('uploads/', REPLACE(payment_qr_path, '\\', '/')) + 8))
WHERE payment_qr_path IS NOT NULL
  AND payment_qr_path NOT LIKE 'http%'
  AND payment_qr_path NOT LIKE '/uploads/%'
  AND payment_qr_path NOT LIKE 'uploads/%'
  AND LOCATE('uploads/', REPLACE(payment_qr_path, '\\', '/')) > 0;

UPDATE programme
SET advisor_signed_form_path = CONCAT('/uploads/', SUBSTRING(REPLACE(advisor_signed_form_path, '\\', '/'), LOCATE('uploads/', REPLACE(advisor_signed_form_path, '\\', '/')) + 8))
WHERE advisor_signed_form_path IS NOT NULL
  AND advisor_signed_form_path NOT LIKE 'http%'
  AND advisor_signed_form_path NOT LIKE '/uploads/%'
  AND advisor_signed_form_path NOT LIKE 'uploads/%'
  AND LOCATE('uploads/', REPLACE(advisor_signed_form_path, '\\', '/')) > 0;

UPDATE programme
SET advisor_signature_path = CONCAT('/uploads/', SUBSTRING(REPLACE(advisor_signature_path, '\\', '/'), LOCATE('uploads/', REPLACE(advisor_signature_path, '\\', '/')) + 8))
WHERE advisor_signature_path IS NOT NULL
  AND advisor_signature_path NOT LIKE 'http%'
  AND advisor_signature_path NOT LIKE '/uploads/%'
  AND advisor_signature_path NOT LIKE 'uploads/%'
  AND LOCATE('uploads/', REPLACE(advisor_signature_path, '\\', '/')) > 0;

UPDATE programme_document
SET file_path = CONCAT('/uploads/', SUBSTRING(REPLACE(file_path, '\\', '/'), LOCATE('uploads/', REPLACE(file_path, '\\', '/')) + 8))
WHERE file_path IS NOT NULL
  AND file_path NOT LIKE 'http%'
  AND file_path NOT LIKE '/uploads/%'
  AND file_path NOT LIKE 'uploads/%'
  AND LOCATE('uploads/', REPLACE(file_path, '\\', '/')) > 0;

UPDATE programme_speaker
SET cv_path = CONCAT('/uploads/', SUBSTRING(REPLACE(cv_path, '\\', '/'), LOCATE('uploads/', REPLACE(cv_path, '\\', '/')) + 8))
WHERE cv_path IS NOT NULL
  AND cv_path NOT LIKE 'http%'
  AND cv_path NOT LIKE '/uploads/%'
  AND cv_path NOT LIKE 'uploads/%'
  AND LOCATE('uploads/', REPLACE(cv_path, '\\', '/')) > 0;
