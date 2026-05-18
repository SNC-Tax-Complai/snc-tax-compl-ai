# SNC-TAX Compl-Ai™ — Server Startup Guide

## Prerequisites
- PostgreSQL 15 running on port 5432 (database: `snc_tax_db`)
- Node.js installed at `C:\Users\yello\nodejs\`
- ngrok installed at `C:\Users\yello\nodejs\ngrok.exe` (already authenticated)

---

## Step 1: Set PATH (run once per terminal session)

```powershell
$env:PATH = "C:\Users\yello\nodejs;$env:PATH"
```

---

## Step 2: Start the Backend (Express API + Frontend)

```powershell
cd "C:\Users\yello\Documents\Claude\Projects\SNC-TAX Compl-Ai™\snc-tax-backend"
node src/server.js
```

You should see:
```
✓ Database connected successfully
✓ All migrations completed successfully!
✓ SNC-TAX Backend running on http://localhost:5000
✓ Scheduler started with 3 jobs (timezone: Africa/Johannesburg)
```

**Local access:** http://localhost:5000

---

## Step 3: Start the Frontend Dev Server (optional, for development only)

Open a **second terminal** and run:

```powershell
$env:PATH = "C:\Users\yello\nodejs;$env:PATH"
cd "C:\Users\yello\Documents\Claude\Projects\SNC-TAX Compl-Ai™\snc-tax-frontend"
node node_modules/vite/bin/vite.js
```

**Dev access:** http://localhost:5173

> Note: The backend already serves the built frontend at port 5000.
> You only need the Vite dev server if you're actively editing frontend code.

---

## Step 4: Start ngrok Public Tunnel

Open a **new terminal** and run:

```powershell
$env:PATH = "C:\Users\yello\nodejs;$env:PATH"
ngrok http 5000
```

ngrok will display a public URL like:
```
Forwarding   https://xxxx-xxxx-xxxx.ngrok-free.dev -> http://localhost:5000
```

Share that `https://....ngrok-free.dev` URL with anyone — they can access the full app.

> First-time visitors see an ngrok interstitial page — click "Visit Site" to proceed.

---

## Quick Start (All-in-One)

Run backend + ngrok in one terminal using background jobs:

```powershell
$env:PATH = "C:\Users\yello\nodejs;$env:PATH"
cd "C:\Users\yello\Documents\Claude\Projects\SNC-TAX Compl-Ai™\snc-tax-backend"
Start-Process -NoNewWindow -FilePath "C:\Users\yello\nodejs\node.exe" -ArgumentList "src/server.js"
Start-Sleep -Seconds 5
ngrok http 5000
```

---

## Rebuild Frontend (after code changes)

If you edit frontend files, rebuild before serving via the backend:

```powershell
$env:PATH = "C:\Users\yello\nodejs;$env:PATH"
cd "C:\Users\yello\Documents\Claude\Projects\SNC-TAX Compl-Ai™\snc-tax-frontend"
$env:VITE_API_URL = "/api"
node node_modules/vite/bin/vite.js build
```

Then restart the backend to serve the updated build.

---

## Test Credentials

| Email | Password | Role |
|-------|----------|------|
| test@snctax.co.za | Test1234! | Manager |

---

## Ports Summary

| Service | Port | Purpose |
|---------|------|---------|
| Express Backend | 5000 | API + Built Frontend |
| Vite Dev Server | 5173 | Frontend HMR (dev only) |
| PostgreSQL | 5432 | Database |
| ngrok Inspector | 4040 | http://localhost:4040 (tunnel dashboard) |

---

## Stopping Services

- **Backend**: `Ctrl+C` in the terminal running `node src/server.js`
- **ngrok**: `Ctrl+C` in the terminal running `ngrok http 5000`
- **Kill all Node**: `Get-Process node | Stop-Process -Force`
