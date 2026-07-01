# Kerocket — full demo data (all users & programmes)

The `kerocket-fix-demo-login.sql` script **does not create users**. It only repairs login fields (`role`, `approval_status`) on accounts that **already exist** after import.

If Workbench shows `SELECT COUNT(*) FROM user` → **1 row**, you do **not** have the full demo database on Kerocket yet. Sarah can log in, but organisers, MPP, HEPA, programmes, registrations, and merit data will be missing.

---

## What you need on Kerocket

| Data | Rough expectation (full local demo) |
|------|-------------------------------------|
| `user` | ~130+ accounts (students, organisers, MPP, HEPA) |
| `student_registry` | Matric lookup for registration |
| `programme` | Approved + pending workflow programmes |
| `programme_registration` | Sarah/Amirul demo registrations |
| `role_request` | Syed / role-upgrade demo rows |
| `club`, `merit_record`, etc. | Portal dashboards & reports |

**Source of truth:** your **local MySQL** database that already works on `localhost` (after Flyway migrations).

---

## Step 1 — Export from your PC (local MySQL)

Use the database name you use locally (often `campuslink`, `app`, or `s70820_cplink`).

### Option A — MySQL Workbench

1. Connect to **local** MySQL (not Kerocket).
2. **Server → Data Export**
3. Select your `campuslink` (or equivalent) schema.
4. Export to **Single file**, include **Create schema** + **Data**.
5. Save as e.g. `campuslink-full-demo.sql`.

### Option B — Command line (PowerShell)

```powershell
mysqldump -u root -p --databases campuslink --single-transaction --routines --triggers > C:\Users\user\Desktop\fyp\campuslink-full-demo.sql
```

Replace `campuslink` and `root` with your local DB name and user.

---

## Step 2 — Prepare Kerocket MySQL

1. Kerocket dashboard → your project → **MySQL data service** → enable **external access**.
2. Connect in Workbench to Kerocket (host/port/user/password from Kerocket settings).
3. Check which schema the app uses — often `app` (from `DATABASE_URL`).

```sql
SHOW DATABASES;
USE app;
SELECT COUNT(*) AS user_count FROM user;
SELECT COUNT(*) AS programme_count FROM programme;
```

If counts are tiny (e.g. 1 user), proceed with import.

### Clean re-import (recommended)

```sql
-- Drops everything in schema app and recreates empty — only if you want a fresh start
DROP DATABASE IF EXISTS app;
CREATE DATABASE app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE app;
```

Then run your exported `.sql` file:

- **File → Open SQL Script** → select `campuslink-full-demo.sql`
- Execute (lightning icon). Large files may take several minutes.

If the dump creates a different schema name (e.g. `campuslink`), either:

- Import into that schema and point Kerocket `DATABASE_URL` at it, **or**
- After import: `RENAME` / re-export into `app`.

---

## Step 3 — Verify import

```sql
USE app;

SELECT COUNT(*) AS users FROM user;
SELECT COUNT(*) AS programmes FROM programme;
SELECT COUNT(*) AS registrations FROM programme_registration;
SELECT COUNT(*) AS registry FROM student_registry;

SELECT role, COUNT(*) AS cnt
FROM user
GROUP BY role;

SELECT status, COUNT(*) AS cnt
FROM programme
GROUP BY status;
```

**Healthy demo targets (approximate):**

- `user` ≥ 100
- `programme` ≥ 20
- Several rows with `status = 'APPROVED'` (student browse)
- Several `PENDING_MPP_REVIEW` / `PENDING_HEPA` (MPP/HEPA portals)

---

## Step 4 — Restart Kerocket app

Kerocket → **Restart** (or redeploy).

On startup, `DemoAccountPasswordBootstrap` resets known demo passwords (Flyway is off on Kerocket).

---

## Step 5 — Optional repair script (all demo logins)

Only if some accounts still return **403** after import:

Run `kerocket-fix-demo-login.sql` in Workbench (use `WHERE email = '...'` lines, not `LOWER(email)`).

Then restart the app again.

---

## Demo accounts for FYP presentation

| Portal | Email | Password |
|--------|-------|----------|
| Student (Sarah) | `sarahdemo335@gmail.com` | `sarah123` |
| Student (Amirul) | `amirul.demo@gmail.com` | `amirul123` |
| Student (Syed) | `syed.demo@gmail.com` | `syed12345` |
| Organizer | `organizer1.demo@gmail.com` … `organizer8.demo@gmail.com` | `demo123` |
| MPP | `mpp1.demo@gmail.com` … `mpp5.demo@gmail.com` | `demo123` |
| HEPA | `hepa.demo@gmail.com` | `demo123` |

Committee / bulk students: `s70001.demo@gmail.com` … `s70030.demo@gmail.com` → `demo123`

---

## Uploads / posters / PDFs (important)

Kerocket uses `UPLOAD_DIR=/tmp/campuslink-uploads`. Uploaded files are **lost when the container restarts**.

After a fresh deploy:

- Programme **posters and documents** in the DB may point to paths that no longer exist on disk.
- **Browse programmes** and **workflow review** may work; some **images/PDFs** may 404 until you re-upload or copy uploads into persistent storage.

For FYP demo, prioritise:

1. Login for all roles
2. Approved programmes visible in student browse
3. MPP/HEPA pending queues non-empty

Re-seed document paths locally and re-export SQL if you need every PDF to open on Kerocket.

---

## Quick checklist

- [ ] Local app works with full data
- [ ] Full `.sql` export from local MySQL
- [ ] Kerocket MySQL import completed (`user` count ≫ 1)
- [ ] Kerocket app restarted
- [ ] Student, Organizer, MPP, HEPA logins tested
- [ ] Student browse shows programmes
- [ ] MPP pending reviews / HEPA approvals lists not empty
