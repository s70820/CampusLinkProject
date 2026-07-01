# CampusLink+ Authentication (Prototype)

## Current prototype behaviour

- Registration validates matric numbers against the `student_registry` table before an account is created.
- Users register with a **personal email** (Gmail, Outlook, Yahoo, etc.), not `@ocean.umt.edu.my`.
- Passwords are stored as BCrypt hashes.
- Forgot-password emails are sent via `JavaMailSender` when mail credentials are configured.

## Future production enhancement

**UMT SSO integration** should replace manual `student_registry` validation for automatic identity verification at login and registration. The registry check in this prototype is a stand-in until SSO is available.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `MAIL_USERNAME` | SMTP username |
| `MAIL_PASSWORD` | SMTP password |
| `MAIL_HOST` | SMTP host (default: `smtp.gmail.com`) |
| `MAIL_PORT` | SMTP port (default: `587`) |
| `MAIL_FROM` | From address (defaults to `MAIL_USERNAME`) |
| `FRONTEND_URL` | Base URL for reset links (default: `http://localhost:3000`) |
| `PASSWORD_RESET_EXPIRY_MINUTES` | Token lifetime (default: `60`) |

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/login` | Sign in |
| POST | `/api/register` | Create account |
| GET | `/api/students/registry/{matric}` | Check matric in UMT registry |
| POST | `/api/auth/forgot-password` | Request reset email |
| POST | `/api/auth/reset-password` | Reset password with token |

## Student registry (V8)

`student_registry` columns: `id`, `matric_number`, `full_name`, `faculty`, `study_level`, `is_active`.

Only active matric numbers may register. Canonical prototype matrics: **S70001–S70030**.

| Matric | Name | Study level |
|--------|------|-------------|
| S70001 | Nur Aisyah binti Abdullah | Degree |
| S70007 | Nurul Izzati binti Kamal | Foundation |
| S70017 | Chen Pei Ling | PhD |

## Forgot-password demo (Sarah)

| Field | Value |
|-------|-------|
| Email | `sarahdemo335@gmail.com` |
| Current password | `sarah123` |
| Matric | S70462 |
| Gmail SMTP sender | `sarahdemo335@gmail.com` |

### One-time Gmail setup

1. Enable **2-Step Verification** on the Google account.
2. Create an **App Password** at [Google App Passwords](https://myaccount.google.com/apppasswords).
3. Edit `CampusLinkBackend/application-local.properties` and replace `YOUR_GMAIL_APP_PASSWORD` with the 16-character app password.
4. Restart the backend: `mvn spring-boot:run`
5. Open `http://localhost:3000/forgot-password`, enter `sarahdemo335@gmail.com`.
6. Check the Gmail inbox for **CampusLink+ Password Reset**, click the link, set a new password.

## Other demo login accounts

| Matric | Email | Password |
|--------|-------|----------|
| S70877 | amirul.demo@gmail.com | amirul123 |
| S70846 | syed.demo@gmail.com | syed12345 |

Use **S70001–S70030** for new registration tests after V8.

If mail is not configured, the reset link is logged to the backend console.
