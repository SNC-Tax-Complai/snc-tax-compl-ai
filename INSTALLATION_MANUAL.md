# SNC-TAX Compl-Ai™ SA — Engineer/IT Installation Manual

**Version:** 2.0.0  
**Date:** 2026-05-17  
**Author:** SA-iLabs Holdings (Pty) Ltd  
**Platform:** Compl-Ai™ SA — South African SMME Compliance Management  
**AI Engine:** Emma-i™

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [System Requirements](#2-system-requirements)
3. [Project Structure](#3-project-structure)
4. [Installation — Development Environment](#4-installation--development-environment)
5. [Installation — Production (Docker)](#5-installation--production-docker)
6. [Installation — Production (Manual/PM2)](#6-installation--production-manualpm2)
7. [Database Setup and Migrations](#7-database-setup-and-migrations)
8. [Environment Configuration](#8-environment-configuration)
9. [Authentication & Security](#9-authentication--security)
10. [API Reference](#10-api-reference)
11. [AI Provider Configuration](#11-ai-provider-configuration)
12. [SARS eFiling Integration](#12-sars-efiling-integration)
13. [Email & WhatsApp Notifications](#13-email--whatsapp-notifications)
14. [Background Scheduler](#14-background-scheduler)
15. [Frontend Build & PWA Configuration](#15-frontend-build--pwa-configuration)
16. [Testing](#16-testing)
17. [Deployment Procedures](#17-deployment-procedures)
18. [Domain & SSL Configuration](#18-domain--ssl-configuration)
19. [Backup & Recovery](#19-backup--recovery)
20. [Monitoring & Logging](#20-monitoring--logging)
21. [Troubleshooting](#21-troubleshooting)
22. [Appendix A: Complete File Manifest](#appendix-a-complete-file-manifest)
23. [Appendix B: Environment Variables Reference](#appendix-b-environment-variables-reference)
24. [Appendix C: Compliance Modules Reference](#appendix-c-compliance-modules-reference)

---

## 1. System Overview

### What This Application Does

Compl-Ai™ SA is a compliance management platform purpose-built for South African SMMEs. It tracks 67 regulatory requirements across 10 compliance modules (CIPC, SARS, Labour, OHS, POPIA, B-BBEE, FICA, Municipal, Industry-specific, Tax Engine) and provides:

- Real-time compliance scoring and dashboard metrics
- Deadline tracking with automated alerts (email + WhatsApp)
- Document vault for storing compliance evidence
- AI-powered document analysis and recommendations
- SARS eFiling status integration
- Multi-company support with role-based access
- POPIA-compliant audit logging

### Architecture Summary

```
┌──────────────────────────────────────────────────────────────────────┐
│                        INTERNET / USERS                              │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    nginx (Port 80/443)   │
                    │    Reverse Proxy + SPA   │
                    └──────┬──────────┬────────┘
                           │          │
              ┌────────────▼──┐  ┌────▼───────────────┐
              │   Frontend    │  │     Backend API     │
              │  React + Vite │  │   Express.js:5000   │
              │   (Static)    │  │                     │
              └───────────────┘  └──────────┬──────────┘
                                            │
                    ┌───────────────────────┬┴───────────────────────┐
                    │                       │                         │
          ┌─────────▼──────┐   ┌───────────▼────────┐   ┌───────────▼──────┐
          │  PostgreSQL 15  │   │   AI Providers     │   │  External APIs   │
          │   (Port 5432)   │   │  Emma-i/OpenAI/    │   │  SARS/SMTP/WA    │
          │   8 Tables      │   │  Claude/Gemini     │   │                  │
          └────────────────┘   └────────────────────┘   └──────────────────┘
```

### Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React | 18.2.x |
| Build Tool | Vite | 5.x |
| State Management | Zustand | 4.4.x |
| HTTP Client | Axios | 1.6.x |
| Backend Framework | Express.js | 4.18.x |
| Runtime | Node.js | 20.x LTS |
| Database | PostgreSQL | 15.x |
| DB Driver | pg-promise | 11.5.x |
| Authentication | jsonwebtoken + bcryptjs | 9.x / 2.4.x |
| File Upload | multer | 1.4.x |
| Logging | Winston | 3.11.x |
| Scheduling | node-cron | 3.x |
| Email | nodemailer | 6.9.x |
| Containerization | Docker + Docker Compose | 24.x / 2.x |
| Web Server | nginx | 1.25.x |
| Process Manager | PM2 | 5.x |
| Testing (Backend) | Jest + supertest | 29.x / 6.x |
| Testing (Frontend) | Vitest + Testing Library | 1.x / 14.x |

---

## 2. System Requirements

### Minimum Hardware (Production)

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 2 GB | 4 GB |
| Storage | 20 GB SSD | 50 GB SSD |
| Network | 10 Mbps | 100 Mbps |

### Software Prerequisites

#### For Docker Deployment (Recommended)
- Docker Engine 24.0+
- Docker Compose v2.20+
- Git 2.40+

#### For Manual Deployment
- Node.js 20.x LTS
- npm 10.x
- PostgreSQL 15.x
- nginx 1.25+
- PM2 5.x (global install)
- Git 2.40+

#### For Development
- Node.js 20.x LTS
- npm 10.x
- PostgreSQL 15.x (local or Docker)
- Git 2.40+
- A code editor (VS Code recommended)

### Supported Operating Systems

| OS | Docker | Manual | Development |
|----|--------|--------|-------------|
| Ubuntu 22.04+ | Yes | Yes | Yes |
| Debian 12+ | Yes | Yes | Yes |
| RHEL/Rocky 9+ | Yes | Yes | Yes |
| Windows 11 + WSL2 | Yes | Limited | Yes |
| macOS 13+ | Yes | Yes | Yes |

---

## 3. Project Structure

```
SNC-TAX Compl-Ai™/
├── snc-tax-backend/                 # Express.js REST API
│   ├── src/
│   │   ├── app.js                   # Express application setup
│   │   ├── server.js                # Entry point (starts HTTP server)
│   │   ├── config/
│   │   │   ├── database.js          # PostgreSQL connection pool
│   │   │   └── logger.js            # Winston structured logging
│   │   ├── controllers/
│   │   │   ├── authController.js    # Login/register logic
│   │   │   └── complianceController.js  # Compliance business logic
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT verification + role-based access
│   │   │   ├── errorHandler.js      # Global error handler + AppError class
│   │   │   └── requestLogger.js     # Request duration/status logging
│   │   ├── routes/
│   │   │   ├── auth.js              # POST /api/auth/login, /register, GET /me
│   │   │   ├── compliance.js        # Compliance CRUD + reports + documents
│   │   │   ├── companies.js         # Company management
│   │   │   ├── notifications.js     # Notification queries
│   │   │   ├── ai.js                # AI analysis endpoints
│   │   │   ├── sars.js              # SARS eFiling integration
│   │   │   └── admin.js             # Admin panel endpoints
│   │   ├── services/
│   │   │   ├── complianceService.js # Score calculation, module queries
│   │   │   ├── notificationService.js # Alert generation
│   │   │   ├── documentService.js   # File upload/storage
│   │   │   ├── auditService.js      # POPIA audit trail
│   │   │   ├── schedulerService.js  # Cron job definitions
│   │   │   ├── ai/
│   │   │   │   ├── aiProviderFactory.js  # Multi-provider abstraction
│   │   │   │   └── providers/
│   │   │   │       ├── baseProvider.js   # Abstract interface
│   │   │   │       ├── emmaIProvider.js  # Emma-i™ (primary)
│   │   │   │       ├── openAIProvider.js # OpenAI GPT-4
│   │   │   │       ├── claudeProvider.js # Anthropic Claude
│   │   │   │       └── geminiProvider.js # Google Gemini
│   │   │   └── integrations/
│   │   │       ├── sarsService.js   # SARS eFiling API
│   │   │       ├── emailService.js  # SMTP email notifications
│   │   │       └── whatsappService.js # WhatsApp Business API
│   │   └── migrations/
│   │       ├── 001-users.js         # Users table
│   │       ├── 002-companies.js     # Companies table
│   │       ├── 003-compliance-requirements.js  # 67 requirements
│   │       ├── 004-compliance-statuses.js      # Per-company tracking
│   │       ├── 005-documents.js     # File metadata
│   │       ├── 006-notifications.js # Alert storage
│   │       ├── 007-compliance-scores.js # Historical scores
│   │       ├── 008-audit-log.js     # POPIA audit trail
│   │       └── 009-seed-requirements.js # Seed 67 SA requirements
│   ├── tests/
│   │   ├── setup.js                 # Test environment config
│   │   ├── fixtures/testData.js     # Shared test data
│   │   ├── unit/                    # Unit tests (6 suites)
│   │   └── integration/            # API route tests (3 suites)
│   ├── package.json
│   ├── jest.config.js
│   ├── Dockerfile
│   └── ecosystem.config.cjs         # PM2 cluster configuration
│
├── snc-tax-frontend/                # React 18 SPA
│   ├── src/
│   │   ├── App.jsx                  # Root component with routing
│   │   ├── main.jsx                 # React DOM entry point
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Login form
│   │   │   ├── RegisterPage.jsx     # Registration form
│   │   │   ├── Dashboard.jsx        # Main dashboard
│   │   │   ├── Compliance/          # Compliance module pages
│   │   │   ├── Vault.jsx            # Document vault
│   │   │   └── Admin.jsx            # Admin panel
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx   # Auth guard wrapper
│   │   │   ├── Navigation/          # Nav bar components
│   │   │   ├── Dashboard/           # Dashboard widgets
│   │   │   └── Notifications/       # Notification panel
│   │   ├── stores/
│   │   │   ├── authStore.js         # Auth state (Zustand)
│   │   │   └── complianceStore.js   # Compliance state (Zustand)
│   │   ├── services/
│   │   │   └── api.js               # Axios instance with interceptors
│   │   └── test/                    # Frontend test suites
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── nginx.conf                   # Production SPA routing
│   └── Dockerfile                   # Multi-stage Vite build + nginx
│
├── docker-compose.yml               # Full-stack orchestration
├── .env.production                  # Environment template
├── .gitignore
├── scripts/
│   ├── deploy.sh                    # Deployment CLI tool
│   └── backup-db.sh                # Database backup with retention
├── SYSTEM_DESIGN.md                 # Architecture design document
├── INSTALLATION_MANUAL.md           # THIS FILE
└── README.md                        # Quick reference
```

---

## 4. Installation — Development Environment

### Step 1: Extract Files

```bash
# Extract the zip from the flash drive
unzip SNC-TAX-Compl-Ai.zip -d ~/projects/
cd ~/projects/SNC-TAX-Compl-Ai
```

### Step 2: Install Node.js 20 LTS

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

**macOS (Homebrew):**
```bash
brew install node@20
```

**Windows:**
Download and install from https://nodejs.org/en/download (LTS 20.x)

### Step 3: Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql -c "CREATE USER snctax WITH PASSWORD 'devpassword';"
sudo -u postgres psql -c "CREATE DATABASE snc_tax_db OWNER snctax;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE snc_tax_db TO snctax;"
```

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
createuser snctax -P   # Enter password when prompted
createdb snc_tax_db -O snctax
```

**Windows:**
Download installer from https://www.postgresql.org/download/windows/
Use pgAdmin or command line to create database `snc_tax_db`.

### Step 4: Configure Backend Environment

```bash
cd snc-tax-backend

# Create .env from template
cat > .env << 'EOF'
NODE_ENV=development
PORT=5000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=snc_tax_db
DATABASE_USER=snctax
DATABASE_PASSWORD=devpassword
JWT_SECRET=dev-secret-change-this-in-production-use-64-chars-minimum
JWT_EXPIRY=24h
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=debug
AI_PROVIDER_DEFAULT=emma-i
EOF
```

### Step 5: Install Dependencies

```bash
# Backend
cd snc-tax-backend
npm install

# Frontend
cd ../snc-tax-frontend
npm install
```

### Step 6: Start the Application

**Terminal 1 — Backend (migrations run automatically on first start):**
```bash
cd snc-tax-backend
npm run dev
```

You should see:
```
[info] Running migration: 001-users.js
[info] Running migration: 002-companies.js
...
[info] Running migration: 009-seed-requirements.js
[info] Server running on port 5000
[info] Database connected successfully
[info] Scheduler started (Africa/Johannesburg)
```

**Terminal 2 — Frontend:**
```bash
cd snc-tax-frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in XXX ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

### Step 7: Verify Installation

1. Open http://localhost:5173 in your browser
2. Click "Register" to create an account
3. Fill in details and submit
4. You should land on the Dashboard with compliance metrics

**API Health Check:**
```bash
curl http://localhost:5000/health
# Expected: {"status":"ok","database":"connected","version":"2.0.0",...}
```

---

## 5. Installation — Production (Docker)

This is the **recommended** production deployment method.

### Prerequisites
- Docker Engine 24.0+
- Docker Compose v2.20+
- A server with at least 2GB RAM
- A domain name (for SSL)

### Step 1: Transfer Files to Server

```bash
# From your local machine
scp SNC-TAX-Compl-Ai.zip user@your-server:/opt/
ssh user@your-server

# On the server
cd /opt
unzip SNC-TAX-Compl-Ai.zip
cd SNC-TAX-Compl-Ai
```

### Step 2: Configure Environment

```bash
cp .env.production .env

# Edit with your production values
nano .env
```

**Critical settings to change:**
```env
DATABASE_PASSWORD=<generate-a-strong-64-char-password>
JWT_SECRET=<generate-a-different-strong-64-char-string>
FRONTEND_URL=https://your-domain.co.za
```

Generate secure secrets:
```bash
openssl rand -hex 32  # Use output for DATABASE_PASSWORD
openssl rand -hex 32  # Use output for JWT_SECRET
```

### Step 3: Build and Start

```bash
# Build all containers and start in background
docker compose up -d --build

# Verify all 3 containers are running
docker compose ps
```

Expected output:
```
NAME                    STATUS          PORTS
snc-tax-database        Up (healthy)    5432/tcp
snc-tax-backend         Up              0.0.0.0:5000->5000/tcp
snc-tax-frontend        Up              0.0.0.0:80->80/tcp
```

### Step 4: Verify Deployment

```bash
# Health check
curl http://localhost:5000/health

# Frontend should serve at port 80
curl -I http://localhost

# Check logs for any errors
docker compose logs backend --tail=50
```

### Step 5: Set Up SSL (Required for Production)

See [Section 18: Domain & SSL Configuration](#18-domain--ssl-configuration).

---

## 6. Installation — Production (Manual/PM2)

Use this method when Docker is not available.

### Step 1: Install System Dependencies

```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL 15
sudo apt install postgresql-15 postgresql-contrib-15

# nginx
sudo apt install nginx

# PM2 (global)
sudo npm install -g pm2
```

### Step 2: Create Application User

```bash
sudo useradd -m -s /bin/bash snctax
sudo mkdir -p /opt/snc-tax
sudo chown snctax:snctax /opt/snc-tax
```

### Step 3: Deploy Application Files

```bash
sudo -u snctax bash
cd /opt/snc-tax
unzip /path/to/SNC-TAX-Compl-Ai.zip .
```

### Step 4: Configure PostgreSQL

```bash
sudo -u postgres psql << 'SQL'
CREATE USER snctax_prod WITH PASSWORD 'your-strong-db-password';
CREATE DATABASE snc_tax_production OWNER snctax_prod;
GRANT ALL PRIVILEGES ON DATABASE snc_tax_production TO snctax_prod;
SQL
```

### Step 5: Install Dependencies and Configure

```bash
cd /opt/snc-tax/snc-tax-backend
npm install --production

# Create environment file
cp /opt/snc-tax/.env.production .env
# Edit .env with production values
nano .env
```

### Step 6: Build Frontend

```bash
cd /opt/snc-tax/snc-tax-frontend
npm install
npm run build
# Output goes to /opt/snc-tax/snc-tax-frontend/dist/
```

### Step 7: Configure nginx

```nginx
# /etc/nginx/sites-available/compl-ai
server {
    listen 80;
    server_name your-domain.co.za;

    # Frontend (SPA)
    root /opt/snc-tax/snc-tax-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:5000;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/compl-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 8: Start with PM2

```bash
cd /opt/snc-tax/snc-tax-backend
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup  # Follow the instructions it outputs
```

---

## 7. Database Setup and Migrations

### Automatic Migrations

The application runs migrations **automatically** on every server start. The migration runner:

1. Creates a `_migrations` table (if it doesn't exist) to track which migrations have run
2. Scans `src/migrations/` for numbered files
3. Executes any migrations not yet recorded
4. Records successful migrations with timestamp

### Migration Files

| File | Purpose |
|------|---------|
| 001-users.js | Users table with roles, email, password hash |
| 002-companies.js | Companies with registration, tax number, type |
| 003-compliance-requirements.js | 67 SA regulatory requirements |
| 004-compliance-statuses.js | Per-company compliance tracking |
| 005-documents.js | Uploaded file metadata |
| 006-notifications.js | Alerts and reminders |
| 007-compliance-scores.js | Historical score tracking |
| 008-audit-log.js | POPIA audit trail |
| 009-seed-requirements.js | Seeds all 67 requirements into DB |

### Manual Migration (if needed)

```bash
cd snc-tax-backend
NODE_ENV=production node -e "
  import('./src/config/database.js').then(async ({ default: db }) => {
    const migrations = require('fs').readdirSync('./src/migrations').sort();
    for (const file of migrations) {
      const { up } = await import('./src/migrations/' + file);
      await up(db);
      console.log('Ran:', file);
    }
    process.exit(0);
  });
"
```

### Database Schema Diagram

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────────────┐
│    users     │     │    companies      │     │ compliance_requirements │
├──────────────┤     ├──────────────────┤     ├─────────────────────────┤
│ id (UUID PK) │──┐  │ id (UUID PK)     │  ┌──│ id (UUID PK)            │
│ email        │  │  │ name             │  │  │ regulation_code          │
│ password_hash│  │  │ registration_num │  │  │ name                     │
│ name         │  │  │ tax_number       │  │  │ module                   │
│ role         │  │  │ company_type     │  │  │ description              │
│ company_id   │──┘  │ industry_sector  │  │  │ frequency                │
│ created_at   │     │ employee_count   │  │  │ penalty_amount           │
└──────────────┘     │ annual_turnover  │  │  │ company_types (array)    │
                     └──────────────────┘  │  └─────────────────────────┘
                              │            │
                     ┌────────▼────────────▼──────────┐
                     │     compliance_statuses         │
                     ├────────────────────────────────┤
                     │ id (UUID PK)                    │
                     │ company_id (FK → companies)     │
                     │ requirement_id (FK → reqs)      │
                     │ status (pending/compliant/etc)  │
                     │ due_date                        │
                     │ completed_date                  │
                     │ notes                           │
                     └────────────────────────────────┘
```

---

## 8. Environment Configuration

### Complete .env Reference

Create a `.env` file in `snc-tax-backend/` with these values:

```env
# ============================================
# APPLICATION
# ============================================
NODE_ENV=production          # production | development | test
PORT=5000                    # Backend API port
FRONTEND_URL=https://your-domain.co.za  # Used for CORS and email links
LOG_LEVEL=info               # error | warn | info | debug

# ============================================
# DATABASE
# ============================================
DATABASE_HOST=localhost       # Or 'database' in Docker
DATABASE_PORT=5432
DATABASE_NAME=snc_tax_db
DATABASE_USER=snctax
DATABASE_PASSWORD=           # REQUIRED: Strong password

# ============================================
# SECURITY
# ============================================
JWT_SECRET=                  # REQUIRED: 64+ char random string
JWT_EXPIRY=24h              # Token expiration (24h, 7d, etc.)

# ============================================
# AI PROVIDERS (all optional — uses mock data if not set)
# ============================================
AI_PROVIDER_DEFAULT=emma-i   # emma-i | openai | claude | gemini
EMMA_I_API_KEY=              # Emma-i™ API key
OPENAI_API_KEY=              # OpenAI API key (for GPT-4)
ANTHROPIC_API_KEY=           # Anthropic API key (for Claude)
GOOGLE_AI_API_KEY=           # Google AI API key (for Gemini)

# ============================================
# SARS eFiling (optional — uses mock data if not set)
# ============================================
SARS_EFILING_URL=https://api.sarsefiling.co.za/v1
SARS_CLIENT_ID=              # SARS vendor client ID
SARS_CLIENT_SECRET=          # SARS vendor client secret

# ============================================
# EMAIL NOTIFICATIONS (optional)
# ============================================
SMTP_HOST=                   # e.g., smtp.gmail.com, smtp.sendgrid.net
SMTP_PORT=587                # 587 (TLS) or 465 (SSL)
SMTP_USER=                   # SMTP username/email
SMTP_PASS=                   # SMTP password/app password
EMAIL_FROM=noreply@your-domain.co.za

# ============================================
# WHATSAPP NOTIFICATIONS (optional)
# ============================================
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_TOKEN=              # WhatsApp Business API token
WHATSAPP_PHONE_NUMBER_ID=    # WhatsApp sender phone number ID

# ============================================
# FILE STORAGE
# ============================================
UPLOAD_DIR=./uploads         # Or /app/uploads in Docker
MAX_FILE_SIZE=52428800       # 50MB in bytes
```

### Security Notes

- **Never commit `.env` files to git** — they are in `.gitignore`
- **JWT_SECRET** must be unique per environment and at least 64 characters
- **DATABASE_PASSWORD** should be generated with `openssl rand -hex 32`
- All API keys (AI, SARS, SMTP, WhatsApp) are optional — the app runs with mock data without them

---

## 9. Authentication & Security

### Authentication Flow

```
1. User submits email + password → POST /api/auth/login
2. Server validates credentials (bcrypt compare)
3. Server generates JWT token (24h expiry)
4. Client stores token in localStorage
5. Client sends token on every request: Authorization: Bearer <token>
6. Server verifies token on protected routes via requireAuth middleware
```

### Role-Based Access Control

| Role | Access Level |
|------|-------------|
| `admin` | Full access — manage users, companies, all compliance data |
| `manager` | Manage own company's compliance data |
| `officer` | Update compliance statuses and upload documents |
| `viewer` | Read-only access to dashboard and reports |

### Password Requirements
- Minimum 8 characters
- Hashed with bcryptjs (10 salt rounds)
- Never stored in plaintext

### Security Features
- JWT tokens expire after 24 hours
- Company-scoped data isolation (users only see their company's data)
- Full audit trail on all data modifications (POPIA compliance)
- CORS restricted to configured frontend URL
- File upload type and size restrictions
- Request rate logging for anomaly detection

---

## 10. API Reference

### Authentication Endpoints

```
POST /api/auth/register
  Body: { email, password, fullName, companyName }
  Returns: { token, user }

POST /api/auth/login
  Body: { email, password }
  Returns: { token, user }

GET /api/auth/me
  Headers: Authorization: Bearer <token>
  Returns: { id, email, name, role, companyId }
```

### Compliance Endpoints

```
GET /api/compliance/dashboard
  Returns: { complianceScore, pendingFilings, dueThisMonth, allUpToDate, ... }

GET /api/compliance/report/generate
  Returns: { report: { score, modules[], overdue[], pending[] } }

GET /api/compliance/:module
  Params: module = income_tax | vat | paye | cipc | labour | ohs | popia | bbbee | fica | municipal
  Returns: { module, requirements[], statuses[] }

GET /api/compliance/requirement/:id
  Returns: { requirement, status, documents[], history[] }

PUT /api/compliance/:id
  Body: { status, notes, completedDate }
  Returns: { updated status }

POST /api/compliance/:id/documents
  Body: multipart/form-data { file, category, description }
  Returns: { document metadata }
```

### SARS Endpoints

```
GET /api/sars/validate/:taxRef
  Returns: { valid, taxReference, taxpayerName, registeredForVAT, ... }

GET /api/sars/filing-status?taxRef=XXX&filingType=EMP201
  Returns: { submissions[], nextDue }

GET /api/sars/tcs/:taxRef
  Returns: { status, pinNumber, issueDate, expiryDate, valid }

GET /api/sars/outstanding/:taxRef
  Returns: { outstanding[], totalOutstanding }

GET /api/sars/status
  Returns: { configured, message }
```

### AI Endpoints

```
GET /api/ai/providers
  Returns: { providers: [{ id, name, status, isDefault }] }

POST /api/ai/analyze-document
  Body: multipart/form-data { file, provider? }
  Returns: { analysis results }

POST /api/ai/generate-recommendations
  Body: { provider? }
  Returns: { recommendations[] }

POST /api/ai/classify
  Body: { text, provider? }
  Returns: { module, confidence, ... }
```

### Other Endpoints

```
GET /api/companies                    # List companies
POST /api/companies                   # Create company (admin)
GET /api/notifications                # User notifications
PUT /api/notifications/:id/read       # Mark notification read
GET /health                           # Server health check
```

---

## 11. AI Provider Configuration

### Overview

The AI system uses a **factory pattern** supporting four providers. All providers share the same interface and can be swapped at runtime per request.

### Provider Setup

**Emma-i™ (Default — SA-iLabs proprietary):**
```env
AI_PROVIDER_DEFAULT=emma-i
EMMA_I_API_KEY=your-emma-i-key
EMMA_I_API_URL=https://api.emma-i.co.za/v1  # Optional
```

**OpenAI GPT-4:**
```env
AI_PROVIDER_DEFAULT=openai
OPENAI_API_KEY=sk-...
```

**Anthropic Claude:**
```env
AI_PROVIDER_DEFAULT=claude
ANTHROPIC_API_KEY=sk-ant-...
```

**Google Gemini:**
```env
AI_PROVIDER_DEFAULT=gemini
GOOGLE_AI_API_KEY=...
```

### Mock Mode

When no API key is configured, providers return intelligent mock responses. This allows full development and testing without incurring API costs.

---

## 12. SARS eFiling Integration

### Overview

The SARS integration connects to the South African Revenue Service eFiling API for:
- Tax reference validation
- Filing status checks
- Tax Compliance Status (TCS) certificate verification
- Outstanding returns lookup

### Configuration

```env
SARS_EFILING_URL=https://api.sarsefiling.co.za/v1
SARS_CLIENT_ID=your-vendor-client-id
SARS_CLIENT_SECRET=your-vendor-secret
```

### Vendor Registration

To use live SARS data (not mocks), you must:
1. Register as an approved SARS eFiling vendor
2. Obtain OAuth2 client credentials from SARS
3. Configure the credentials in your `.env`

Until credentials are obtained, the service operates in **mock mode** with realistic test data.

---

## 13. Email & WhatsApp Notifications

### Email Setup (SMTP)

**Gmail (for development):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password    # Generate at myaccount.google.com/apppasswords
EMAIL_FROM=noreply@your-domain.co.za
```

**SendGrid (for production):**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxx            # SendGrid API key
EMAIL_FROM=noreply@your-domain.co.za
```

### WhatsApp Business API Setup

1. Create a Meta Business account at business.facebook.com
2. Set up WhatsApp Business API in the Meta dashboard
3. Create message templates (must be approved by Meta):
   - `compliance_overdue_alert` — for overdue notifications
   - `compliance_deadline_reminder` — for upcoming deadlines
4. Configure:

```env
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_TOKEN=your-permanent-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
```

### Notification Types

| Type | Channel | Trigger |
|------|---------|---------|
| Overdue Alert | Email + WhatsApp | Compliance item past due date |
| Deadline Reminder | Email + WhatsApp | 7 days before due date |
| Weekly Summary | Email | Every Monday at 8:00 AM |

---

## 14. Background Scheduler

### Scheduled Jobs

| Schedule | Job | Description |
|----------|-----|-------------|
| Daily 02:00 SAST | `recalculateScores` | Recalculates compliance scores for all companies |
| Daily 06:00 SAST | `checkOverdue` | Identifies newly overdue items and generates alerts |
| Daily 08:00 SAST | `sendReminders` | Sends notifications for items due within 7 days |

### Timezone

All schedules run on **Africa/Johannesburg** (SAST, UTC+2).

### Manual Trigger

```bash
# Trigger score recalculation immediately
curl -X POST http://localhost:5000/api/admin/recalculate-scores \
  -H "Authorization: Bearer <admin-token>"
```

---

## 15. Frontend Build & PWA Configuration

### Development Build

```bash
cd snc-tax-frontend
npm run dev
# Runs at http://localhost:5173 with hot-reload
```

### Production Build

```bash
cd snc-tax-frontend
npm run build
# Outputs optimized static files to dist/
```

### PWA Setup

To enable Progressive Web App functionality, add these files:

**`snc-tax-frontend/public/manifest.json`:**
```json
{
  "name": "Compl-Ai™ SA",
  "short_name": "Compl-Ai",
  "description": "South African SMME Compliance Management",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#0066cc",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**`snc-tax-frontend/public/sw.js`** (Service Worker):
```javascript
const CACHE_NAME = 'compl-ai-v2';
const urlsToCache = ['/', '/index.html'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
```

**Register in `src/main.jsx`:**
```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
```

Add to `index.html`:
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#0066cc">
```

---

## 16. Testing

### Backend Tests (Jest)

```bash
cd snc-tax-backend

# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run in watch mode (development)
npm run test:watch
```

### Frontend Tests (Vitest)

```bash
cd snc-tax-frontend

# Run all tests
npm test

# Run once (CI mode)
npm run test:run

# Run with coverage
npm run test:coverage
```

### Test Structure

```
Backend Tests:
  Unit Tests (tests/unit/)
    - auth.test.js             → JWT validation, role middleware
    - errorHandler.test.js     → Error formatting, AppError class
    - sarsService.test.js      → SARS mock data, validation logic
    - emailService.test.js     → Email template building
    - whatsappService.test.js  → WhatsApp message formatting
    - aiProviderFactory.test.js → Provider creation, caching

  Integration Tests (tests/integration/)
    - auth.routes.test.js      → Login/register/me endpoints
    - sars.routes.test.js      → All SARS API endpoints
    - ai.routes.test.js        → AI provider endpoints

Frontend Tests (src/test/)
    - authStore.test.js        → Login/logout/session state
    - complianceStore.test.js  → Dashboard/module/notification state
    - ProtectedRoute.test.jsx  → Auth guard component
```

---

## 17. Deployment Procedures

### Using the Deployment Script

```bash
chmod +x scripts/deploy.sh

# Start/rebuild everything
./scripts/deploy.sh up

# View logs (all services or specific)
./scripts/deploy.sh logs
./scripts/deploy.sh logs backend

# Check status
./scripts/deploy.sh status

# Restart a service
./scripts/deploy.sh restart backend

# Stop everything
./scripts/deploy.sh down

# Database backup
./scripts/deploy.sh backup
```

### Zero-Downtime Updates

```bash
# 1. Pull new code
git pull origin master

# 2. Rebuild only the changed service
docker compose build backend
docker compose up -d backend

# 3. Verify health
curl http://localhost:5000/health
```

### Rollback Procedure

```bash
# 1. Find previous working commit
git log --oneline -5

# 2. Checkout that version
git checkout <commit-hash>

# 3. Rebuild and restart
docker compose up -d --build
```

---

## 18. Domain & SSL Configuration

### With Certbot (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate (nginx must be running on port 80)
sudo certbot --nginx -d your-domain.co.za -d www.your-domain.co.za

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

### Update Docker nginx for SSL

Update `snc-tax-frontend/nginx.conf`:
```nginx
server {
    listen 443 ssl;
    server_name your-domain.co.za;

    ssl_certificate /etc/letsencrypt/live/your-domain.co.za/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.co.za/privkey.pem;

    # ... rest of config
}

server {
    listen 80;
    server_name your-domain.co.za;
    return 301 https://$host$request_uri;
}
```

### DNS Configuration

Set these DNS records at your registrar:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | your-server-ip | 3600 |
| A | www | your-server-ip | 3600 |
| CNAME | api | your-domain.co.za | 3600 |

---

## 19. Backup & Recovery

### Automated Database Backups

```bash
# Run the backup script
./scripts/backup-db.sh

# Backups are stored in ./backups/ with 30-day retention
# Format: snc_tax_backup_YYYYMMDD_HHMMSS.sql.gz
```

### Manual Backup

```bash
# Docker
docker compose exec database pg_dump -U postgres snc_tax_db | gzip > backup.sql.gz

# Non-Docker
pg_dump -U snctax snc_tax_db | gzip > backup.sql.gz
```

### Restore from Backup

```bash
# Docker
gunzip -c backup.sql.gz | docker compose exec -T database psql -U postgres snc_tax_db

# Non-Docker
gunzip -c backup.sql.gz | psql -U snctax snc_tax_db
```

### Backup Schedule (Recommended)

| Frequency | Retention | Location |
|-----------|-----------|----------|
| Daily | 30 days | Local server |
| Weekly | 90 days | Off-site storage |
| Monthly | 1 year | Archive |

Set up daily backup with cron:
```bash
crontab -e
# Add:
0 3 * * * /opt/snc-tax/scripts/backup-db.sh >> /var/log/snc-tax-backup.log 2>&1
```

---

## 20. Monitoring & Logging

### Log Locations

| Service | Location | Format |
|---------|----------|--------|
| Backend (Docker) | `docker compose logs backend` | JSON (structured) |
| Backend (PM2) | `~/.pm2/logs/snc-tax-backend-*.log` | JSON |
| Frontend (nginx) | `/var/log/nginx/access.log` | Combined |
| PostgreSQL | `docker compose logs database` | PostgreSQL default |

### Log Levels

```
error  → Failures requiring immediate attention
warn   → Potential issues (e.g., deprecated features used)
info   → Normal operations (requests, auth events, scheduler runs)
debug  → Detailed troubleshooting (only in development)
```

### Health Monitoring

```bash
# Simple health check (add to monitoring system)
curl -sf http://localhost:5000/health | jq '.status'
# Expected: "ok"

# Check database connectivity
curl -sf http://localhost:5000/health | jq '.database'
# Expected: "connected"
```

### Recommended Monitoring Stack

| Tool | Purpose |
|------|---------|
| UptimeRobot | External uptime monitoring (free tier) |
| Grafana + Prometheus | Metrics and dashboards |
| Loki | Log aggregation |
| PgHero | PostgreSQL performance |

---

## 21. Troubleshooting

### Common Issues

#### "Database connection refused"
```bash
# Check PostgreSQL is running
docker compose ps database
# OR
sudo systemctl status postgresql

# Check connection string
echo $DATABASE_HOST $DATABASE_PORT $DATABASE_NAME
```

#### "JWT token invalid/expired"
- Clear browser localStorage: `localStorage.removeItem('token')`
- Verify JWT_SECRET is the same across restarts
- Check system clock synchronization

#### "CORS error in browser console"
- Verify FRONTEND_URL in `.env` matches exactly (including protocol)
- Check no trailing slash: `https://your-domain.co.za` (not `https://your-domain.co.za/`)

#### "Migrations failed"
```bash
# Check migration table status
docker compose exec database psql -U postgres snc_tax_db -c "SELECT * FROM _migrations;"

# Run migrations manually
docker compose exec backend node -e "import('./src/server.js')"
```

#### "Port already in use"
```bash
# Find process using port 5000
lsof -i :5000
# OR on Windows
netstat -ano | findstr :5000

# Kill the process or change PORT in .env
```

#### "File upload fails"
- Check `uploads/` directory exists and is writable
- Verify `MAX_FILE_SIZE` in `.env` (default 50MB)
- Check nginx `client_max_body_size` matches

#### "Docker build fails"
```bash
# Clear Docker cache and rebuild
docker compose down
docker system prune -f
docker compose up -d --build
```

---

## Appendix A: Complete File Manifest

Total tracked files: **122**

Key file counts by directory:
- `snc-tax-backend/src/` — 29 source files
- `snc-tax-backend/tests/` — 10 test files
- `snc-tax-frontend/src/` — 25 source files
- Root config/docs — 8 files

---

## Appendix B: Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NODE_ENV | Yes | development | Runtime environment |
| PORT | No | 5000 | Backend port |
| DATABASE_HOST | Yes | localhost | PostgreSQL host |
| DATABASE_PORT | No | 5432 | PostgreSQL port |
| DATABASE_NAME | Yes | snc_tax_db | Database name |
| DATABASE_USER | Yes | postgres | Database user |
| DATABASE_PASSWORD | Yes | — | Database password |
| JWT_SECRET | Yes | — | Token signing key (64+ chars) |
| JWT_EXPIRY | No | 24h | Token lifespan |
| FRONTEND_URL | Yes | http://localhost:5173 | Frontend URL for CORS |
| LOG_LEVEL | No | info | Winston log level |
| AI_PROVIDER_DEFAULT | No | emma-i | Default AI provider |
| EMMA_I_API_KEY | No | — | Emma-i API key |
| OPENAI_API_KEY | No | — | OpenAI API key |
| ANTHROPIC_API_KEY | No | — | Anthropic API key |
| GOOGLE_AI_API_KEY | No | — | Google AI API key |
| SARS_EFILING_URL | No | https://api.sarsefiling.co.za/v1 | SARS API base |
| SARS_CLIENT_ID | No | — | SARS OAuth client ID |
| SARS_CLIENT_SECRET | No | — | SARS OAuth secret |
| SMTP_HOST | No | — | SMTP server host |
| SMTP_PORT | No | 587 | SMTP port |
| SMTP_USER | No | — | SMTP username |
| SMTP_PASS | No | — | SMTP password |
| EMAIL_FROM | No | noreply@compl-ai.co.za | Sender address |
| WHATSAPP_API_URL | No | — | WhatsApp API URL |
| WHATSAPP_TOKEN | No | — | WhatsApp bearer token |
| WHATSAPP_PHONE_NUMBER_ID | No | — | WhatsApp phone ID |
| UPLOAD_DIR | No | ./uploads | File storage path |
| MAX_FILE_SIZE | No | 52428800 | Max upload (bytes) |

---

## Appendix C: Compliance Modules Reference

### Module: CIPC (Companies and Intellectual Property Commission)

| Code | Requirement | Frequency | Penalty |
|------|-------------|-----------|---------|
| CIPC-001 | Annual Return (CoR30.1) | Annual | R4,800 |
| CIPC-002 | Director Change (CoR39) | Event-driven | R2,500 |
| CIPC-003 | Registered Address Change | Event-driven | R500 |
| CIPC-004 | Memorandum of Incorporation | Once-off | R5,000 |
| CIPC-005 | Beneficial Ownership Declaration | Annual | R10,000 |

### Module: SARS (Tax)

| Code | Requirement | Frequency | Penalty |
|------|-------------|-----------|---------|
| ITA-001 | Annual Income Tax (ITR14) | Annual | R16,000 |
| VAT-001 | VAT201 Return | Bimonthly | R10,000 |
| PAYE-001 | EMP201 Monthly Return | Monthly | R8,000 |
| PAYE-002 | EMP501 Annual Reconciliation | Annual | R12,000 |
| ITA-002 | Provisional Tax (IRP6) | Biannual | R8,000 |
| TCS-001 | Tax Compliance Status | Annual | R5,000 |

### Module: Labour

| Code | Requirement | Frequency | Penalty |
|------|-------------|-----------|---------|
| COIDA-001 | COIDA Registration & Returns | Annual | R50,000 |
| UIF-001 | UIF Monthly Contributions | Monthly | R20,000 |
| EEA-001 | Employment Equity Report (EEA2) | Annual | R1,500,000 |
| SDL-001 | Skills Development Levy | Monthly | R10,000 |
| WSP-001 | Workplace Skills Plan | Annual | R5,000 |
| NMW-001 | National Minimum Wage Compliance | Ongoing | R100,000 |
| BCEA-001 | Basic Conditions of Employment | Ongoing | R50,000 |

### Module: OHS (Occupational Health & Safety)

| Code | Requirement | Frequency | Penalty |
|------|-------------|-----------|---------|
| OHS-001 | Health & Safety Policy | Annual | R50,000 |
| OHS-002 | Risk Assessment | Annual | R25,000 |
| OHS-003 | Safety Representative Appointment | Once-off | R10,000 |
| OHS-004 | Fire Certificate | Annual | R15,000 |
| OHS-005 | Incident Reporting | Event-driven | R100,000 |
| OHS-006 | First Aid Compliance | Ongoing | R5,000 |

### Module: POPIA (Protection of Personal Information)

| Code | Requirement | Frequency | Penalty |
|------|-------------|-----------|---------|
| POPIA-001 | Information Officer Registration | Once-off | R10,000,000 |
| POPIA-002 | PAIA Section 51 Manual | Once-off | R2,000,000 |
| POPIA-003 | Privacy Impact Assessment | Annual | R5,000,000 |
| POPIA-004 | Data Breach Notification Plan | Once-off | R10,000,000 |
| POPIA-005 | Consent Management | Ongoing | R1,000,000 |

### Module: B-BBEE

| Code | Requirement | Frequency | Penalty |
|------|-------------|-----------|---------|
| BBBEE-001 | EME Sworn Affidavit | Annual | R0 |
| BBBEE-002 | QSE Verification | Annual | R15,000 |
| BBBEE-003 | Generic Verification | Annual | R50,000 |

### Module: FICA (Financial Intelligence Centre)

| Code | Requirement | Frequency | Penalty |
|------|-------------|-----------|---------|
| FICA-001 | Risk Management Compliance Programme | Annual | R50,000,000 |
| FICA-002 | KYC/CDD Procedures | Ongoing | R10,000,000 |
| FICA-003 | Suspicious Transaction Reports | Event-driven | R15,000,000 |
| FICA-004 | Cash Threshold Reports | Event-driven | R10,000,000 |
| FICA-005 | Compliance Officer Appointment | Once-off | R5,000,000 |

### Module: Municipal

| Code | Requirement | Frequency | Penalty |
|------|-------------|-----------|---------|
| MUN-001 | Business Operating License | Annual | R10,000 |
| MUN-002 | Municipal Rates & Taxes | Monthly | R5,000 |
| MUN-003 | Health Certificate | Annual | R8,000 |
| MUN-004 | Signage Permit | Once-off | R3,000 |
| MUN-005 | Zoning Compliance | Once-off | R50,000 |

### Module: Industry-Specific

| Code | Requirement | Frequency | Penalty |
|------|-------------|-----------|---------|
| IND-001 | FSCA License (Financial Services) | Annual | R100,000 |
| IND-002 | CIDB Registration (Construction) | Annual | R50,000 |
| IND-003 | NHBRC Registration (Home Builders) | Annual | R25,000 |
| IND-004 | HPCSA Registration (Healthcare) | Annual | R50,000 |
| IND-005 | Liquor License | Annual | R10,000 |

### Module: Tax Engine

| Code | Requirement | Frequency | Penalty |
|------|-------------|-----------|---------|
| TAX-001 | SBC Election Assessment | Annual | R0 |
| TAX-002 | Turnover Tax Registration | Annual | R0 |
| TAX-003 | Capital Gains Tax Computation | Annual | R8,000 |
| TAX-004 | Transfer Pricing Documentation | Annual | R16,000 |
| TAX-005 | Dividends Tax (DT) Withholding | Event-driven | R10,000 |

---

**END OF DOCUMENT**

*This manual accompanies the project files on the flash drive as a complete reference for building, installing, configuring, deploying, and maintaining the Compl-Ai™ SA platform.*

*For questions or support: wernerbotha199@gmail.com*
