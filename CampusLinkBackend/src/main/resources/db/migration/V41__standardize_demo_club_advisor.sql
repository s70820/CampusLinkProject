-- Use one UMT club advisor across all demo programmes (advisor does not vary by club).
UPDATE advisor_approval
SET advisor_name = 'Dr. Siti Aminah binti Yusof',
    advisor_email = 'siti.aminah@umt.edu.my'
WHERE advisor_name IS NOT NULL
  AND advisor_name <> 'Dr. Siti Aminah binti Yusof';
