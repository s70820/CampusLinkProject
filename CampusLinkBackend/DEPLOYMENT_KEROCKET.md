# Deploying CampusLink+ on Kerocket

Kerocket is a good alternative to CURSOR when you want **GitHub → live URL** hosting with **Tomcat 9 + javax** (same stack CURSOR expects).

Your project uses **Spring Boot 2.5.4** with **`javax.*`** (not Jakarta). That matches Kerocket’s Java Servlet guide and CURSOR’s Tomcat — you do **not** need Jakarta for this codebase.

Official Kerocket Java guide: https://kerocket.com/docs/java-servlet

---

## What you deploy

| Piece | How |
|--------|-----|
| Backend | Spring Boot WAR (`s70820.war`) → Tomcat `ROOT.war` |
| Frontend | Bundled into WAR via `mvn -Pwith-frontend` (same as CURSOR) |
| Database | Kerocket MySQL data service (or external MySQL) |
| Config | Environment variables — **no** `cursor-deploy.properties` on Kerocket |

Files added for Kerocket:

- `Dockerfile`
- `docker-entrypoint.sh`
- `src/main/resources/application-kerocket.properties`

---

## Before you start (one-time prep)

### 1. Put code on GitHub

Kerocket deploys from GitHub. Use a repo whose **root** contains both projects:

```
your-repo/
├── CampusLinkBackend/
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   └── pom.xml
└── CampusLinkFrontend/
    └── campuslink-frontend/
```

Push to GitHub (private repo is fine).

### 2. Export your database

On your PC (local MySQL / phpMyAdmin):

1. Export database `campuslink` (or `s70820_cplink`) as `.sql`
2. You will import this into Kerocket’s MySQL after the data service is created

Flyway is **off** in the Kerocket profile (same as CURSOR prod) — schema comes from your SQL export.

### 3. Do **not** commit secrets

- `cursor-deploy.properties` — CURSOR only; stay gitignored
- Set mail passwords only in Kerocket **Settings → Environment variables**

---

## Step-by-step on Kerocket

### Step 1 — Sign in and create a project

1. Open https://kerocket.com/dashboard (you are logged in as `@s70820`)
2. Click **New project**
3. Name it e.g. `campuslink` → Create

### Step 2 — Connect GitHub

1. Inside the project, connect **GitHub** (install Kerocket GitHub App if prompted)
2. Select the repository that contains `CampusLinkBackend` + `CampusLinkFrontend`
3. Branch: `main` (or your deploy branch)

### Step 3 — Add MySQL (data service)

1. Go to **Settings**
2. **Data services** → Add **MySQL**
3. Note the variables Kerocket provides, e.g.:
   - `MYSQLHOST`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`

Kerocket’s `docker-entrypoint.sh` reads these automatically (or use one `DATABASE_URL`).

### Step 4 — Import your schema

1. In MySQL service settings, enable **external access** (if offered)
2. Connect with **MySQL Workbench** or **DBeaver** using the external host/port/user/password
3. Run your exported `.sql` file to create tables and seed data

### Step 5 — Environment variables

In project **Settings → Environment variables**, add:

| Variable | Example | Notes |
|----------|---------|--------|
| `SPRING_PROFILES_ACTIVE` | `kerocket` | Optional — entrypoint also sets this |
| `FRONTEND_URL` | `https://your-app.kerocket.host` | Set after first deploy when you know the URL |
| `MAIL_USERNAME` | your Gmail | For password reset |
| `MAIL_PASSWORD` | Gmail App Password | 16-char app password |
| `MAIL_FROM` | same as username | |
| `UPLOAD_DIR` | `/tmp/campuslink-uploads` | Uploads reset on container restart unless you add persistent storage |

MySQL vars are usually injected when you attach the data service — verify they appear in Settings.

### Step 6 — Point build to Dockerfile

1. **Settings** → build / deploy section
2. **Dockerfile path**: `CampusLinkBackend/Dockerfile`
3. **Build context / root directory**: repository root (the folder that contains both `CampusLinkBackend` and `CampusLinkFrontend`)

If Kerocket only builds from repo root with `Dockerfile` at root, either:

- Move/copy `Dockerfile` + `docker-entrypoint.sh` to repo root and adjust `COPY` paths, or
- Set subdirectory to `CampusLinkBackend` and use a **backend-only** build (API only, no React in WAR)

### Step 7 — Deploy

1. Click **Deploy** (Settings or Overview)
2. Open **Build output** — wait for Maven + Docker to finish
3. When status is **Running**, open the live URL

### Step 8 — Verify

1. Open the Kerocket URL in the browser — React app should load from the WAR
2. Test login: `amirul.demo@gmail.com` / `amirul123` (if you imported demo data)
3. Test API: `https://your-url/api/login` should not return 404

---

## Local test (optional, before Kerocket)

From the `fyp` folder (parent of both projects):

```powershell
cd C:\Users\user\Desktop\fyp
docker build -f CampusLinkBackend/Dockerfile -t campuslink .
docker run --rm -p 8080:8080 `
  -e "DATABASE_URL=mysql://root:root123@host.docker.internal:3306/campuslink" `
  campuslink
```

Open http://localhost:8080

(`host.docker.internal` reaches MySQL on your Windows machine.)

---

## CURSOR vs Kerocket

| | CURSOR | Kerocket |
|---|--------|----------|
| Deploy method | Upload `s70820.war` via File Manager | GitHub + Docker |
| DB config | `cursor-deploy.properties` baked into WAR | Runtime env / JNDI |
| Java stack | Tomcat, **javax** | Tomcat 9, **javax** |
| URL | `https://s70820.cursor.umt.edu.my` | `https://….kerocket.host` |
| Frontend | `-Pwith-frontend` WAR | Same |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Build fails: frontend not found | Build context must include `CampusLinkFrontend/campuslink-frontend` |
| Build fails: Java version | Dockerfile uses Java 17 — matches `pom.xml` |
| App 404 | Check Build output; Tomcat may not have started — often DB/JNDI misconfig |
| DB connection error | Check `MYSQLHOST` / `DATABASE_URL` in Settings; import SQL |
| Login works locally, not on Kerocket | Re-import SQL; check `user` table has demo accounts |
| Uploads disappear after redeploy | Expected with `/tmp` — use object storage or persistent volume if Kerocket offers it |
| CORS errors | Only if frontend is hosted separately — bundled WAR avoids this |

---

## Quick checklist

- [ ] GitHub repo with `CampusLinkBackend` + `CampusLinkFrontend`
- [ ] `Dockerfile` + `docker-entrypoint.sh` committed
- [ ] Kerocket project created, repo connected
- [ ] MySQL data service attached
- [ ] SQL schema imported
- [ ] Mail env vars set (optional)
- [ ] Deploy succeeded → live URL opens
- [ ] Demo login works
