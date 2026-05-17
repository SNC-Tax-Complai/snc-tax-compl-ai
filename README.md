# SNC-TAX Compl-Ai™ SA

South African SMME compliance management platform powered by Emma-i™ AI.  
Fully standalone React/Express.js application — zero vendor lock-in.

## Quick Start

### Option A: Docker (Recommended)

```bash
# 1. Copy environment file and set your secrets
cp .env.production .env

# 2. Start everything
docker compose up -d --build

# 3. Open browser
# Frontend: http://localhost
# Backend:  http://localhost:5000/health
```

### Option B: Local Development

```bash
# 1. Install dependencies
cd snc-tax-backend && npm install && cd ..
cd snc-tax-frontend && npm install && cd ..

# 2. Set up PostgreSQL (install if needed)
createdb snc_tax_db

# 3. Configure environment
cp snc-tax-backend/.env.example snc-tax-backend/.env
# Edit .env with your DATABASE_PASSWORD and JWT_SECRET

# 4. Start backend (migrations run automatically)
cd snc-tax-backend && npm run dev

# 5. Start frontend (new terminal)
cd snc-tax-frontend && npm run dev

# 6. Open http://localhost:5173
```

## Architecture

```
snc-tax-frontend/          React 18 + Vite SPA
  src/
    pages/                 Login, Register, Dashboard, Compliance, Vault, Admin
    components/            Navigation, Dashboard cards, Notifications
    stores/                Zustand (auth, compliance)
    services/              Axios API layer

snc-tax-backend/           Express.js REST API
  src/
    routes/                Auth, Compliance, Companies, Notifications, AI, SARS, Admin
    controllers/           Request handling with validation
    services/              Business logic (compliance, notifications, documents, audit)
    services/ai/           AI provider factory (Emma-i, OpenAI, Claude, Gemini)
    services/integrations/ SARS eFiling, Email (SMTP), WhatsApp Business API
    middleware/             Auth (JWT), error handling, request logging
    config/                Database (pg-promise), Winston logger
    migrations/            PostgreSQL schema (001-009)
  tests/
    unit/                  Service and middleware unit tests (Jest)
    integration/           API route integration tests (supertest)
    fixtures/              Shared test data

docker-compose.yml         Full-stack orchestration (Postgres + Backend + Frontend)
scripts/                   deploy.sh, backup-db.sh
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Zustand, Axios, react-hot-toast |
| Styling | CSS Modules + Tailwind config |
| Backend | Express.js, Node.js 20 |
| Database | PostgreSQL 15 (pg-promise) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| AI Engine | Multi-provider factory (Emma-i, OpenAI, Claude, Gemini) |
| SARS Integration | eFiling API with mock fallback |
| Notifications | Email (nodemailer SMTP), WhatsApp Business API |
| File Upload | multer |
| Logging | Winston |
| Scheduling | node-cron |
| Testing | Jest + supertest (backend), Vitest + Testing Library (frontend) |
| Containerization | Docker, Docker Compose, nginx |
| Process Management | PM2 (non-Docker) |

## Compliance Modules (10)

| Module | Code | Key Requirements |
|--------|------|-----------------|
| CIPC | cipc | Annual Returns, Director Changes, MOI |
| SARS Tax | sars | EMP201, ITR14, VAT201, IRP6, TCS |
| Labour Law | labour | COIDA, UIF, EEA2, WSP, NMW |
| OHS | ohs | H&S Policy, Risk Assessment, Fire Cert |
| POPIA & PAIA | popia | Information Officer, PAIA Manual, Breach Plan |
| B-BBEE | bbbee | EME/QSE/Generic Verification |
| FICA | fica | RMCP, KYC/CDD, STR, CTR |
| Municipal | municipal | Business License, Rates, Health Cert |
| Industry | industry | FSCA, CIDB, NHBRC, HPCSA |
| Tax Engine | tax_engine | SBC Election, Turnover Tax, CGT |

**67 South African compliance requirements** seeded across all modules.

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | Public | Create account |
| POST | /api/auth/login | Public | Sign in |
| GET | /api/auth/me | JWT | Current user |
| GET | /api/compliance/dashboard | JWT | Dashboard metrics |
| GET | /api/compliance/report/generate | JWT | Full compliance report |
| GET | /api/compliance/:module | JWT | Module requirements |
| GET | /api/compliance/requirement/:id | JWT | Requirement details |
| PUT | /api/compliance/:id | JWT | Update status |
| POST | /api/compliance/:id/documents | JWT | Upload evidence |
| GET | /api/companies | JWT | List companies |
| POST | /api/companies | JWT+Admin | Create company |
| GET | /api/notifications | JWT | User notifications |
| PUT | /api/notifications/:id/read | JWT | Mark read |
| POST | /api/ai/analyze-document | JWT | AI document analysis |
| POST | /api/ai/generate-recommendations | JWT | AI compliance recommendations |
| POST | /api/ai/classify | JWT | Classify requirement text |
| GET | /api/ai/providers | JWT | List AI providers |
| GET | /api/sars/validate/:taxRef | JWT | Validate tax reference |
| GET | /api/sars/filing-status | JWT | Filing status lookup |
| GET | /api/sars/tcs/:taxRef | JWT | Tax Compliance Status |
| GET | /api/sars/outstanding/:taxRef | JWT | Outstanding returns |
| GET | /api/sars/status | JWT | SARS integration status |
| GET | /health | Public | Server health |

## Database Schema

8 tables with automatic migrations:

```
users → companies → compliance_requirements
                  → compliance_statuses (tracks per-company status)
                  → documents (uploaded evidence)
                  → notifications (alerts and reminders)
                  → compliance_scores (historical tracking)
                  → audit_log (POPIA compliance trail)
```

## Deployment

```bash
# Full deploy
./scripts/deploy.sh up

# View logs
./scripts/deploy.sh logs backend

# Check status
./scripts/deploy.sh status

# Database backup
./scripts/deploy.sh backup

# Stop everything
./scripts/deploy.sh down
```

### PM2 (without Docker)

```bash
cd snc-tax-backend
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup
```

## Background Jobs

| Schedule | Job | Timezone |
|----------|-----|----------|
| Daily 2:00 AM | Recalculate compliance scores | Africa/Johannesburg |
| Daily 6:00 AM | Check for overdue items | Africa/Johannesburg |
| Daily 8:00 AM | Generate reminder notifications | Africa/Johannesburg |

## Security

- JWT authentication with 24h expiry
- bcryptjs password hashing (10 salt rounds)
- Role-based access (Admin, Manager, Officer, Viewer)
- Company-scoped data isolation
- Full audit trail for POPIA compliance
- Input validation (frontend + backend)
- File upload type/size restrictions
- CORS configured per environment

## Testing

```bash
# Backend unit + integration tests
cd snc-tax-backend
npm test

# With coverage report
npm run test:coverage

# Frontend component + store tests
cd snc-tax-frontend
npm test
```

### Test Coverage

| Area | Tests | Type |
|------|-------|------|
| Auth middleware | JWT validation, role-based access | Unit |
| Error handler | Status codes, AppError class, env-specific stack | Unit |
| SARS service | Tax validation, filing status, TCS, outstanding returns | Unit |
| Email service | SMTP config, overdue/reminder/summary templates | Unit |
| WhatsApp service | Template messages, overdue/deadline alerts | Unit |
| AI provider factory | Provider creation, caching, delegation, listing | Unit |
| Auth routes | Login, register, /me endpoint, health check | Integration |
| SARS routes | All 5 endpoints with auth + mock data | Integration |
| AI routes | Provider listing, classification, recommendations | Integration |
| Auth store | Login/logout/fetchUser/clearError state management | Frontend |
| Compliance store | Dashboard/module/notification/report flows | Frontend |
| ProtectedRoute | Auth guard redirect behavior | Frontend Component |

## Project Status

- [x] Phase 2A: Project structure and configuration
- [x] Phase 2B: UI components and CSS styling
- [x] Phase 2C: Authentication (login, register, protected routes)
- [x] Phase 2D: Database schema, service layer, compliance modules
- [x] Phase 3: Docker, logging, deployment scripts, production config
- [x] Phase 4: AI integration (Emma-i™ multi-provider factory)
- [x] Phase 5: External API integration (SARS eFiling)
- [x] Phase 6: Email/WhatsApp notification services
- [x] Phase 7: Automated testing (Jest + Vitest)

## Legal

All code is original work created during vendor lock-in removal from Base44.  
Full intellectual property ownership per Annexure A legal agreement.  
Developed by SA-iLabs™ — Emma-i™ AI Engine.

---

**Version**: 2.0.0 | **License**: Proprietary | **Contact**: wernerbotha199@gmail.com
