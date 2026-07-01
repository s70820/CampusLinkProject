# Deploying CampusLink+ to CURSOR (mapped to DeployingAppsOnCursor.pdf)

Official manual: **DeployingAppsOnCursor.pdf** (Version 2, May 2026).  
This guide maps each manual task to CampusLink+ (Spring Boot + React + MySQL).

## Manual → CampusLink+ mapping

| Manual task | JSP/Servlet project (manual) | CampusLink+ (your project) |
|-------------|------------------------------|----------------------------|
| **Task 2** | Edit DB connection file in source code | Copy `cursor-deploy.properties.example` → `cursor-deploy.properties`, set password, **then build WAR** |
| **Task 2 step 9** | Rename WAR to `s12345.war` | Maven builds `target/s70820.war` automatically |
| **Task 2 step 12–15** | Export SQL from localhost phpMyAdmin | Optional — you already imported; Flyway can also create tables |
| **Task 3 step 3–8** | File Manager → `/` → Upload WAR | Same — upload `s70820.war` at `/home/s70820` |
| **Task 3 step 9–15** | phpMyAdmin → create DB → Import SQL | DB: `s70820_cplink`, user: `s70820_cluser` |
| **Task 3 step 16** | Open `https://s70820.cursor.umt.edu.my` | Same URL |

**Important:** The manual puts database username/password **inside the project before build** (Task 2). There is **no** separate “environment variables” step. If you skip Task 2 for CampusLink+, the WAR still points at localhost `campuslink` / `root` and Tomcat cannot start the app → **404**.

## Account

| Item | Value |
|------|--------|
| Panel | https://cursor.umt.edu.my:2083 |
| Username | `s70820` |
| WAR file | **`s70820.war`** |
| Database | **`s70820_cplink`** |
| DB user | **`s70820_cluser`** (CWP format; manual example uses `s12345` as user) |
| Live URL | **https://s70820.cursor.umt.edu.my** |

---

## TASK 2 — Set database parameters (do this on your PC first)

Manual Task 2: change database name, username, password **before** Clean & Build.

### Steps

1. Copy:
   ```
   src/main/resources/cursor-deploy.properties.example
   → src/main/resources/cursor-deploy.properties
   ```
2. Edit `cursor-deploy.properties` — replace `YOUR_MYSQL_PASSWORD` with your real MySQL password for `s70820_cluser`.
3. Build:
   ```powershell
   cd C:\Users\user\Desktop\fyp\CampusLinkBackend
   mvn clean package -Pwith-frontend -DskipTests
   ```
4. Output: `target\s70820.war`

`cursor-deploy.properties` is gitignored (like passwords in the manual’s JSP connection file).

**Alternative (server file):** upload config to `/home/s70820/.conf/campuslink.properties` — see `cursor-server.properties.template`. Build-time config (above) matches the manual more closely.

---

## TASK 3 — Upload WAR and database

### WAR upload (manual steps 3–8)

1. Log in to https://cursor.umt.edu.my:2083
2. **File Management** → **File Manager**
3. Path must be **`/`** (home root — shows `.conf`, `public_html`, etc.)
4. **Upload** → select `target\s70820.war`
5. Confirm `s70820.war` appears in the file list — wait until the upload shows **success** (not a red X)

#### If upload fails (red X) — common on re-upload

The manual does not mention this, but Tomcat often **locks** `s70820.war` while the old app is deployed. You cannot replace a locked file.

**Do this in order:**

1. In File Manager at `/`, if an **`s70820` folder** exists → select it → **Delete**
2. Select **`s70820.war`** → **Delete**
3. **Wait 3–5 minutes** (refresh the page once or twice)
4. Confirm **both** are gone from the file list
5. Upload `s70820.war` again — wait until upload completes successfully before clicking Close

**Still failing?**

| Try | Action |
|-----|--------|
| Upload via `tmp` | Upload to **`tmp`** folder first → then **Move** to `/` |
| New browser | Edge or Chrome incognito; stable Wi‑Fi |
| Disk quota | Dashboard → check plan / disk space |
| Old session | Log out of CWP, log in again, then upload |
| FTP | CWP → **FTP Accounts** → upload with FileZilla to `/home/s70820/` |

Your WAR is ~45 MB — well under the 500 MB limit. A red X almost always means **replace blocked** or **connection dropped**, not file too large.

### Database (manual steps 9–15)

You already completed this:

- Database: `s70820_cplink`
- Import: 51 users in `user` table ✓

---

## TASK 3 step 16 — Test URL

Open: **https://s70820.cursor.umt.edu.my**

Demo login: `amirul.demo@gmail.com` / `amirul123`

---

## FAQ from manual (relevant to CampusLink+)

| Manual FAQ | CampusLink+ |
|------------|-------------|
| WAR must be `s12345.war` | Use `s70820.war` ✓ |
| Upload WAR at `/` only | Same ✓ |
| DB name `[username]_[name]` | `s70820_cplink` ✓ |
| Do not use `root` on server | Use `s70820_cluser` ✓ |
| Use `javax`, not `jakarta` | Spring Boot 2.5 uses `javax` ✓ |
| Case-sensitive on Linux | Match exact table/column names ✓ |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| 404, WAR uploaded, no `s70820` folder | DB config missing in WAR — complete **Task 2** (`cursor-deploy.properties`), rebuild, re-upload |
| 404 on both `/` and `/s70820` | App not running — not a React routing issue |
| DB import OK but site 404 | Expected — database does not start the web app |
| `Access denied for user` | Wrong password in `cursor-deploy.properties` |
| `Unknown database` | URL must use `s70820_cplink`, not `campuslink` |

## Manual checklist (item 30) — your status

| Check | You |
|-------|-----|
| WAR named `s70820.war` | ✓ |
| WAR uploaded to `/` | ✓ |
| Database created | ✓ |
| SQL imported | ✓ |
| DB config in project before build | **← do this, then re-upload** |
| App loads at `https://s70820.cursor.umt.edu.my` | Pending |

## Local dev (unchanged)

- Backend: `mvn spring-boot:run` → http://localhost:8080
- Frontend: `npm start` → http://localhost:3000
