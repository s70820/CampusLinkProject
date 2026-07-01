# Kerocket full data import (already prepared for you)

Your **local** database `campuslink` was exported to:

- `campuslink-full-demo.sql` — **130 users**, **30 programmes**, all demo data

## Option A — One command (easiest)

1. Open **Kerocket** → your **CampusLink** project → **MySQL** → **External access**
2. Copy: **Host**, **Port**, **User**, **Password** (database is usually `app`)
3. Open PowerShell:

```powershell
cd C:\Users\user\Desktop\fyp\CampusLinkBackend\kerocket-import

.\import-to-kerocket.ps1 `
  -DbHost "PASTE_HOST_HERE" `
  -DbPort 3306 `
  -DbUser "PASTE_USER_HERE" `
  -DbPassword "PASTE_PASSWORD_HERE" `
  -Database app
```

4. **Kerocket** → **Restart** the app
5. Login: `sarahdemo335@gmail.com` / `sarah123`

## Option B — MySQL Workbench (if you prefer GUI)

1. Connect to **Kerocket** MySQL (external access credentials)
2. **File → Run SQL Script** → select `00-use-app.sql` → Execute
3. **File → Run SQL Script** → select `campuslink-full-demo.sql` → Execute (wait until finished)
4. Verify:

```sql
USE app;
SELECT COUNT(*) FROM user;        -- expect ~130
SELECT COUNT(*) FROM programme;   -- expect ~30
```

5. Restart Kerocket app

## Re-export later (if local data changes)

```powershell
cmd /c "C:\xampp\mysql\bin\mysqldump.exe -u root -proot123 campuslink --single-transaction --routines --triggers --add-drop-table --result-file=C:\Users\user\Desktop\fyp\CampusLinkBackend\kerocket-import\campuslink-full-demo.sql"
```

Then import again using Option A or B.
