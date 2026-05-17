# SNC-TAX Compl-Ai™ SA — System Design Document

**Version**: 2.0  
**Date**: 2026-05-17  
**Author**: System Architecture  
**Status**: Active — Phase 2D onwards  

---

## 1. Requirements

### 1.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| FR-01 | User authentication (login/register/logout) | P0 | Done (Phase 2C) |
| FR-02 | Role-based access control (Admin, Manager, Officer, Viewer) | P0 | Partial |
| FR-03 | Dashboard with real-time compliance metrics | P0 | UI Done, DB Pending |
| FR-04 | 10 compliance modules (CIPC, SARS, Labour, OHS, POPIA, B-BBEE, FICA, Municipal, Industry, Tax Engine) | P0 | Routes Defined |
| FR-05 | Notification system with overdue alerts | P1 | Route Only |
| FR-06 | Document vault with upload/download | P1 | Route Only |
| FR-07 | AI-powered document analysis (Emma-i™, multi-provider) | P1 | Stub Only |
| FR-08 | Compliance report generation (PDF/CSV) | P2 | Stub Only |
| FR-09 | SARS eFiling integration | P2 | Not Started |
| FR-10 | WhatsApp notification delivery | P3 | Not Started |
| FR-11 | Admin panel (user/settings management) | P1 | Route Only |
| FR-12 | Background compliance checking (cron jobs) | P2 | Not Started |

### 1.2 Non-Functional Requirements

| Requirement | Target | Rationale |
|-------------|--------|-----------|
| Response Time (P95) | < 500ms | Dashboard must feel instant |
| Availability | 99.5% (43h downtime/year) | SMME users tolerate brief outages |
| Concurrent Users | 500 simultaneous | Initial target market is ~200 SMMEs |
| Data Retention | 7 years | SA tax record-keeping requirement |
| Backup RPO | 1 hour | Compliance data is business-critical |
| Security | POPIA-compliant | Legal requirement for SA data |
| Max File Upload | 50 MB | Supports most compliance docs |
| Time to First Meaningful Paint | < 2s | SPA with code splitting |

### 1.3 Constraints

| Constraint | Impact |
|-----------|--------|
| Solo developer (early stage) | Must automate heavily, keep complexity low |
| Budget-limited | PostgreSQL over managed services, self-host where possible |
| SA-based users | Latency to local hosting matters; POPIA data residency |
| Base44 feature parity | Must replicate all existing features before adding new ones |
| Annexure A legal agreement | Full IP ownership required — no vendor lock-in allowed |

---

## 2. High-Level Architecture

### 2.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  React 18 SPA (Vite)                                         │   │
│  │  ┌─────────┐ ┌───────────┐ ┌─────────┐ ┌────────────────┐   │   │
│  │  │ Auth    │ │ Dashboard │ │Compliance│ │ Admin/Vault    │   │   │
│  │  │ Pages   │ │ + Widgets │ │ Modules  │ │ Pages          │   │   │
│  │  └─────────┘ └───────────┘ └─────────┘ └────────────────┘   │   │
│  │  ┌────────────────────────────────────────────────────────┐   │   │
│  │  │  Zustand Stores (auth, compliance, notifications)      │   │   │
│  │  └────────────────────────────────────────────────────────┘   │   │
│  │  ┌────────────────────────────────────────────────────────┐   │   │
│  │  │  Axios API Layer (interceptors, token refresh)         │   │   │
│  │  └────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY LAYER                             │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Express.js Server (port 5000)                                │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐   │   │
│  │  │   CORS   │ │Rate Limit│ │Body Parse│ │ Error Handler │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └───────────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                                   │
│                                                                     │
│  ┌───────────┐ ┌─────────────┐ ┌────────────┐ ┌───────────────┐   │
│  │  Auth     │ │ Compliance  │ │ Notification│ │  AI Provider  │   │
│  │  Service  │ │  Service    │ │  Service    │ │  Factory      │   │
│  └───────────┘ └─────────────┘ └────────────┘ └───────────────┘   │
│  ┌───────────┐ ┌─────────────┐ ┌────────────┐ ┌───────────────┐   │
│  │  Document │ │   Report    │ │  Scheduler  │ │  Integration  │   │
│  │  Service  │ │  Generator  │ │  (node-cron)│ │  Service      │   │
│  └───────────┘ └─────────────┘ └────────────┘ └───────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                     │
│                                                                     │
│  ┌───────────────────┐  ┌──────────────────┐  ┌────────────────┐   │
│  │   PostgreSQL 15    │  │  File Storage    │  │  Redis Cache   │   │
│  │   (pg-promise)     │  │  (local/S3)      │  │  (optional)    │   │
│  │                    │  │                  │  │                │   │
│  │  - users           │  │  - documents     │  │  - sessions    │   │
│  │  - companies       │  │  - reports       │  │  - rate limits │   │
│  │  - requirements    │  │  - uploads       │  │  - cache       │   │
│  │  - statuses        │  │                  │  │                │   │
│  │  - notifications   │  │                  │  │                │   │
│  │  - audit_log       │  │                  │  │                │   │
│  └───────────────────┘  └──────────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                                 │
│                                                                     │
│  ┌─────────────┐ ┌───────────┐ ┌────────────┐ ┌────────────────┐  │
│  │ SARS eFiling│ │ Emma-i™   │ │  WhatsApp  │ │ Email (SMTP)   │  │
│  │ API         │ │ AI Engine │ │  Business  │ │                │  │
│  └─────────────┘ └───────────┘ └────────────┘ └────────────────┘  │
│  ┌─────────────┐ ┌───────────┐ ┌────────────┐                     │
│  │ CIPC API    │ │ OpenAI /  │ │ Dept of    │                     │
│  │             │ │ Claude /  │ │ Labour     │                     │
│  │             │ │ Gemini    │ │            │                     │
│  └─────────────┘ └───────────┘ └────────────┘                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
[User Action] ──→ [React Component] ──→ [Zustand Store] ──→ [Axios API Call]
                                                                    │
                                                                    ▼
[UI Update] ←── [Store Update] ←── [JSON Response] ←── [Express Controller]
                                                                    │
                                                                    ▼
                                                        [Service Layer Logic]
                                                                    │
                                                                    ▼
                                                        [Database Query (pg-promise)]
```

**Compliance Score Calculation Flow:**
```
node-cron (daily 2AM) ──→ ComplianceService.recalculate()
    │
    ├── Query all active requirements for company
    ├── Check due dates against current date
    ├── Calculate: (completed / total) × 100
    ├── Update compliance_statuses table
    ├── Generate notifications for overdue items
    └── Store historical score in compliance_scores table
```

### 2.3 API Contract Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /api/auth/login | Public | Issue JWT |
| POST | /api/auth/register | Public | Create user |
| GET | /api/auth/me | JWT | Session recovery |
| GET | /api/compliance/dashboard | JWT | Dashboard metrics |
| GET | /api/compliance/:module | JWT | Module requirements |
| GET | /api/compliance/requirement/:id | JWT | Requirement details |
| PUT | /api/compliance/:id | JWT | Update status |
| POST | /api/compliance/:id/documents | JWT | Upload evidence |
| GET | /api/compliance/report/generate | JWT | Generate report |
| GET | /api/companies | JWT | List companies |
| POST | /api/companies | JWT + Admin | Create company |
| GET | /api/notifications | JWT | User notifications |
| PUT | /api/notifications/:id/read | JWT | Mark as read |
| POST | /api/ai/analyze-document | JWT | AI document analysis |
| POST | /api/ai/generate-recommendations | JWT | AI recommendations |
| GET | /api/ai/providers | JWT | Available AI providers |
| GET | /api/admin/users | JWT + Admin | List users |
| GET | /health | Public | Server health check |

---

## 3. Deep Dive: Database Schema

### 3.1 Entity Relationship Diagram

```
┌──────────────┐       ┌───────────────────┐       ┌──────────────────┐
│   companies  │       │       users       │       │  compliance_     │
│              │       │                   │       │  requirements    │
│  id (PK)     │◄──────│  company_id (FK)  │       │                  │
│  name        │       │  id (PK)          │       │  id (PK)         │
│  reg_number  │       │  email            │       │  name            │
│  tax_ref     │       │  password_hash    │       │  regulation_code │
│  type        │       │  first_name       │       │  module          │
│  sector      │       │  last_name        │       │  frequency       │
│  employees   │       │  role             │       │  applicable_to   │
│  turnover    │       │  is_active        │       │  penalty_amount  │
└──────┬───────┘       └───────────────────┘       └────────┬─────────┘
       │                                                     │
       │              ┌───────────────────┐                  │
       └──────────────│  compliance_      │──────────────────┘
                      │  statuses         │
                      │                   │
                      │  id (PK)          │
                      │  company_id (FK)  │
                      │  requirement_id(FK│
                      │  status           │
                      │  due_date         │
                      │  completion_date  │
                      │  assigned_to      │
                      │  documents[]      │
                      └────────┬──────────┘
                               │
               ┌───────────────┼────────────────┐
               │               │                │
               ▼               ▼                ▼
┌──────────────────┐ ┌─────────────────┐ ┌────────────────┐
│  notifications   │ │  documents      │ │ compliance_    │
│                  │ │                 │ │ scores         │
│  id (PK)         │ │  id (PK)        │ │                │
│  company_id (FK) │ │  status_id (FK) │ │  id (PK)       │
│  requirement_id  │ │  filename       │ │  company_id    │
│  type            │ │  file_path      │ │  score         │
│  message         │ │  file_size      │ │  calculated_at │
│  severity        │ │  uploaded_by    │ │  breakdown{}   │
│  is_read         │ │  uploaded_at    │ │                │
└──────────────────┘ └─────────────────┘ └────────────────┘
                                          
                      ┌─────────────────┐
                      │  audit_log      │
                      │                 │
                      │  id (PK)        │
                      │  user_id        │
                      │  action         │
                      │  entity_type    │
                      │  entity_id      │
                      │  old_value      │
                      │  new_value      │
                      │  ip_address     │
                      │  created_at     │
                      └─────────────────┘
```

### 3.2 Full SQL Schema

```sql
-- Core Tables (in migration order)

-- 001: users (DONE - see 001_create_users_table.sql)

-- 002: companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(50), -- CIPC registration
  tax_reference VARCHAR(50),       -- SARS tax number
  company_type VARCHAR(50),        -- Sole Prop, CC, Pty Ltd, etc.
  industry_sector VARCHAR(100),
  employee_count INTEGER DEFAULT 0,
  annual_turnover DECIMAL(15, 2),
  physical_address TEXT,
  postal_address TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 003: compliance_requirements (seed data)
CREATE TABLE compliance_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  regulation_code VARCHAR(50),     -- e.g., "EMP201", "COIDA", "POPIA-REG"
  module VARCHAR(50) NOT NULL,     -- cipc, sars, labour, ohs, popia, bbbee, fica, municipal, industry, tax_engine
  compliance_type VARCHAR(50),     -- Filing, Registration, Reporting, Certificate
  frequency VARCHAR(50),           -- Annual, Quarterly, Monthly, Biannual, Once-off
  applicable_company_types TEXT[], -- Array of applicable types
  applicable_sectors TEXT[],       -- Array of applicable sectors
  min_employees INTEGER DEFAULT 0, -- Minimum employees to apply
  penalty_description TEXT,
  penalty_amount DECIMAL(12, 2),
  reference_url TEXT,              -- Link to legislation/regulation
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 004: compliance_statuses
CREATE TABLE compliance_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  requirement_id UUID NOT NULL REFERENCES compliance_requirements(id),
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
    -- CHECK (status IN ('completed','pending','overdue','at_risk','not_applicable','in_progress'))
  due_date DATE,
  completion_date DATE,
  next_due_date DATE,             -- Calculated from frequency
  assigned_to UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(company_id, requirement_id, due_date)
);

-- 005: documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  status_id UUID REFERENCES compliance_statuses(id),
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  category VARCHAR(50),            -- evidence, certificate, report, correspondence
  uploaded_by UUID REFERENCES users(id),
  description TEXT,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 006: notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  user_id UUID REFERENCES users(id),
  requirement_id UUID REFERENCES compliance_requirements(id),
  type VARCHAR(50) NOT NULL,       -- reminder, overdue, alert, info, system
  title VARCHAR(255) NOT NULL,
  message TEXT,
  severity VARCHAR(20) DEFAULT 'medium',
    -- CHECK (severity IN ('low','medium','high','critical'))
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 007: compliance_scores (historical tracking)
CREATE TABLE compliance_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  score DECIMAL(5, 2) NOT NULL,    -- e.g., 87.00
  total_requirements INTEGER,
  completed_requirements INTEGER,
  pending_requirements INTEGER,
  overdue_requirements INTEGER,
  breakdown JSONB,                 -- Per-module breakdown
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 008: audit_log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  company_id UUID REFERENCES companies(id),
  action VARCHAR(50) NOT NULL,     -- create, update, delete, login, logout, view
  entity_type VARCHAR(50),         -- user, company, compliance_status, document
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_statuses_company ON compliance_statuses(company_id);
CREATE INDEX idx_statuses_requirement ON compliance_statuses(requirement_id);
CREATE INDEX idx_statuses_status ON compliance_statuses(status);
CREATE INDEX idx_statuses_due_date ON compliance_statuses(due_date);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_company ON notifications(company_id);
CREATE INDEX idx_documents_company ON documents(company_id);
CREATE INDEX idx_documents_status ON documents(status_id);
CREATE INDEX idx_scores_company ON compliance_scores(company_id, calculated_at DESC);
CREATE INDEX idx_audit_user ON audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_requirements_module ON compliance_requirements(module);
```

### 3.3 Storage Strategy

| Data Type | Storage | Reason |
|-----------|---------|--------|
| User data | PostgreSQL | Relational, ACID |
| Compliance requirements | PostgreSQL + JSON seed | Master data with configurable rules |
| Compliance statuses | PostgreSQL | Transactional, queryable |
| Documents | Local filesystem (dev) / S3 (prod) | Binary files, CDN-friendly |
| Compliance scores | PostgreSQL (time-series) | Historical trends, date queries |
| Notifications | PostgreSQL | ACID, user-specific queries |
| Audit log | PostgreSQL (partitioned by month) | Compliance requirement, high-write |
| Session cache | Redis (optional, later) | Performance optimization |

---

## 4. Deep Dive: Service Layer

### 4.1 Compliance Service Design

```
src/services/
├── complianceService.js      ← Core compliance logic
├── scoreCalculator.js        ← Score computation engine
├── notificationService.js    ← Alert generation and delivery
├── documentService.js        ← File upload/download management
├── reportService.js          ← PDF/CSV report generation
├── schedulerService.js       ← Cron job management
└── aiProviderFactory.js      ← Multi-model AI abstraction
```

**ComplianceService — Core Methods:**
```javascript
class ComplianceService {
  // Calculate dashboard metrics for a company
  async getDashboardMetrics(companyId)
  
  // Get all requirements for a specific module
  async getModuleRequirements(companyId, module)
  
  // Update status of a compliance item
  async updateStatus(statusId, newStatus, userId)
  
  // Calculate next due date based on frequency
  calculateNextDueDate(currentDue, frequency)
  
  // Check which items are overdue and generate notifications
  async checkOverdueItems(companyId)
  
  // Seed initial requirements for a new company
  async initializeCompanyCompliance(companyId, companyType, sector)
}
```

**ScoreCalculator — Algorithm:**
```
Score = (completed / applicable_total) × 100

Where:
- completed = statuses with status='completed' AND due_date >= current_period_start
- applicable_total = requirements where:
  - is_active = true
  - company_type matches requirement.applicable_company_types
  - sector matches requirement.applicable_sectors (or requirement has no sector filter)
  - status != 'not_applicable'

Trend = current_score - previous_period_score
```

### 4.2 AI Provider Factory Pattern

```javascript
// src/services/aiProviderFactory.js

class AIProviderFactory {
  static create(providerId) {
    switch (providerId) {
      case 'emma-i':    return new EmmaIProvider();
      case 'openai':    return new OpenAIProvider();
      case 'claude':    return new ClaudeProvider();
      case 'gemini':    return new GeminiProvider();
      default:          return new EmmaIProvider(); // fallback
    }
  }
}

// Common interface all providers implement:
interface AIProvider {
  analyzeDocument(file, context): Promise<DocumentAnalysis>
  generateRecommendations(companyData): Promise<Recommendation[]>
  classifyRequirement(text): Promise<ClassificationResult>
}
```

### 4.3 Notification Service

```
Notification Triggers:
├── OVERDUE: requirement.due_date < today AND status != 'completed'
├── APPROACHING: requirement.due_date - 7 days (weekly warning)
├── APPROACHING: requirement.due_date - 3 days (urgent warning)  
├── SCORE_DROP: current_score < previous_score - 5%
├── NEW_REQUIREMENT: new regulation added to compliance matrix
└── SYSTEM: maintenance, feature updates, etc.

Delivery Channels:
├── In-app (notifications table + real-time via polling/SSE)
├── Email (SMTP via nodemailer)
└── WhatsApp (future - via WhatsApp Business API webhook)
```

### 4.4 Background Scheduler

```javascript
// Cron jobs running via node-cron

Schedule:
├── Daily 02:00 AM  → Recalculate all compliance scores
├── Daily 06:00 AM  → Check for overdue items, generate notifications
├── Daily 08:00 AM  → Send email/WhatsApp reminders for items due in 3 days
├── Weekly Mon 03:00 AM → Generate weekly compliance summary
├── Monthly 1st 04:00 AM → Archive old notifications, rotate audit log
└── Quarterly → Check for regulation changes (manual trigger initially)
```

---

## 5. Deep Dive: Compliance Modules

### 5.1 Module Data Architecture

Each of the 10 compliance modules follows the same pattern:

```
Module Schema:
├── requirements[] → Seeded from compliance_requirements WHERE module = '{module_id}'
├── statuses[] → Queried from compliance_statuses JOIN requirements
├── documents[] → Queried from documents JOIN statuses
└── score → Calculated from statuses for this module only

Module IDs:
├── cipc        → Companies & IP Commission
├── sars        → SA Revenue Service (Tax)
├── labour      → Labour Law
├── ohs         → Occupational Health & Safety
├── popia       → POPIA & PAIA (Data Protection)
├── bbbee       → B-BBEE (Economic Empowerment)
├── fica        → FICA (Financial Intelligence)
├── municipal   → Municipal Compliance
├── industry    → Industry & Sector Specific
└── tax_engine  → Tax Calculation Engine
```

### 5.2 Seed Data (Critical for MVP)

**Example: SARS Module Requirements:**
```json
[
  {
    "name": "EMP201 Monthly Submission",
    "regulation_code": "EMP201",
    "module": "sars",
    "compliance_type": "Filing",
    "frequency": "Monthly",
    "penalty_amount": 10000,
    "applicable_company_types": ["pty_ltd", "cc", "sole_prop"],
    "min_employees": 1
  },
  {
    "name": "Annual Income Tax Return (ITR14)",
    "regulation_code": "ITR14",
    "module": "sars",
    "compliance_type": "Filing",
    "frequency": "Annual",
    "penalty_amount": 16000,
    "applicable_company_types": ["pty_ltd", "cc"]
  },
  {
    "name": "VAT201 Return",
    "regulation_code": "VAT201",
    "module": "sars",
    "compliance_type": "Filing",
    "frequency": "Bimonthly",
    "penalty_amount": 5000,
    "applicable_company_types": ["pty_ltd", "cc", "sole_prop"]
  },
  {
    "name": "COIDA Return of Earnings",
    "regulation_code": "COIDA-ROE",
    "module": "labour",
    "compliance_type": "Filing",
    "frequency": "Annual",
    "penalty_amount": 10000,
    "applicable_company_types": ["pty_ltd", "cc"],
    "min_employees": 1
  }
]
```

Total seed data required: ~60-80 compliance requirements across all 10 modules.

### 5.3 Module Frontend Component Pattern

Each module follows an identical component structure:
```
src/pages/Compliance/
├── ComplianceRouter.jsx         ← Route switcher for /compliance/:module
├── ModulePage.jsx               ← Shared template (receives module prop)
├── components/
│   ├── RequirementList.jsx      ← Table of requirements with status
│   ├── RequirementDetail.jsx    ← Single requirement expanded view
│   ├── StatusBadge.jsx          ← Colored status indicator
│   ├── DocumentUpload.jsx       ← File upload for evidence
│   ├── ModuleSummaryCard.jsx    ← Module-level score card
│   └── ComplianceTimeline.jsx   ← Timeline of upcoming due dates
└── hooks/
    └── useComplianceModule.js   ← Shared data fetching hook
```

---

## 6. Scale & Reliability

### 6.1 Load Estimation

```
Users: 200 companies × 3 users average = 600 registered users
Daily Active: ~40% = 240 users
Peak Concurrent: ~25% of daily = 60 users
Average API calls per session: 15
Peak API calls/minute: 60 × 15 / 30min avg session = 30 req/min

This is LOW scale. A single Express instance on a 2-core VPS handles this easily.
```

### 6.2 Scaling Strategy

**Phase 1 (Current — up to 500 users):**
- Single Express instance
- Single PostgreSQL instance
- Local file storage
- No caching layer needed

**Phase 2 (500–5,000 users):**
- Add Redis for session caching and rate limiting
- Move file storage to S3-compatible (e.g., Backblaze B2)
- Add PM2 cluster mode (4 workers)
- PostgreSQL read replicas if needed

**Phase 3 (5,000+ users):**
- Container orchestration (Docker Compose → Kubernetes)
- Horizontal Express scaling behind load balancer
- PostgreSQL connection pooling (PgBouncer)
- CDN for static assets
- Background job queue (Bull/BullMQ with Redis)

### 6.3 Reliability

| Component | Strategy | Recovery |
|-----------|----------|----------|
| Express server | PM2 auto-restart | < 5s automatic |
| PostgreSQL | Daily pg_dump + WAL archiving | 1h RPO via restore |
| File uploads | Redundant storage | Depends on provider |
| External APIs | Circuit breaker pattern | Graceful degradation |
| Entire system | Docker Compose with health checks | `docker-compose up` |

### 6.4 Monitoring & Alerting

```
Health Endpoints:
├── GET /health → { status: "ok", db: true, uptime: 12345 }
├── GET /health/db → Database connectivity check
└── GET /health/detailed → All service status (admin only)

Logging (Winston):
├── Level: info (production), debug (development)
├── Format: JSON (structured, parseable)
├── Output: stdout + rotating file (14-day retention)
└── Key fields: timestamp, level, message, userId, requestId, duration

Metrics to Track:
├── Request count and latency (P50, P95, P99)
├── Error rate by endpoint
├── Database query duration
├── Background job success/failure
├── Active user count
└── Compliance score distribution
```

---

## 7. Security Design

### 7.1 Authentication & Authorization

```
Authentication:
├── JWT tokens (24h expiry, RS256 in production)
├── Token stored in localStorage (SPA constraint)
├── Refresh token mechanism (future: httpOnly cookie)
└── Password: bcryptjs with 10 salt rounds

Authorization:
├── Role-based: Admin > Manager > Officer > Viewer
├── Company-scoped: Users only see their company's data
├── Middleware chain: requireAuth → requireRole → controller
└── Fine-grained: Per-module access control (future)

Role Permissions:
├── Admin: Full CRUD on all entities, user management, settings
├── Manager: Full CRUD on company data, view all modules
├── Officer: CRUD on assigned modules, view all
└── Viewer: Read-only access to all modules
```

### 7.2 POPIA Compliance (Data Protection)

```
Requirements:
├── Data minimization: Only collect what's necessary
├── Purpose limitation: Data used only for compliance management
├── Retention: 7-year retention for tax records, clear after
├── Right to access: GET /api/users/me/data-export
├── Right to deletion: POST /api/users/me/delete-request
├── Data breach notification: Audit log + alert mechanism
├── Consent: Recorded at registration time
└── Cross-border transfer: Data stays in SA hosting

Implementation:
├── Audit log captures all data access
├── PII fields encrypted at rest (AES-256)
├── Password hashing (bcryptjs, irreversible)
├── HTTPS enforced in production
└── Database access restricted to service account
```

### 7.3 Input Validation

```
Strategy: Validate at EVERY boundary

Frontend:
├── Form-level validation (real-time feedback)
├── HTML5 input types (email, number, date)
└── Custom regex patterns (SA phone, registration numbers)

Backend:
├── Joi schema validation on every endpoint
├── SQL injection prevention (parameterized queries via pg-promise)
├── XSS prevention (no raw HTML rendering, Content-Security-Policy)
├── File upload validation (type whitelist, size limit, virus scan future)
└── Rate limiting (express-rate-limit: 100 req/15min per IP)
```

---

## 8. Trade-off Analysis

### 8.1 Key Decisions Made

| Decision | Chose | Over | Rationale |
|----------|-------|------|-----------|
| State management | Zustand | Redux, Context | Minimal boilerplate, fast for small team |
| Database | PostgreSQL | MongoDB, Supabase | Relational data, ACID for compliance, no vendor lock |
| ORM | pg-promise (raw queries) | Prisma, TypeORM | Full SQL control, lower abstraction overhead |
| Auth | JWT in localStorage | Cookies, NextAuth | SPA architecture, simpler CORS |
| Styling | CSS Modules + Tailwind config | Styled-components, MUI | Performance, no runtime cost |
| Build tool | Vite | CRA, Webpack | Fast HMR, modern defaults |
| File storage | Local filesystem (dev) | S3 from day 1 | Simplicity for solo dev, migrate later |
| Caching | None initially | Redis from day 1 | Premature optimization at 60 concurrent users |

### 8.2 Technical Debt Accepted

| Debt | Why | Revisit When |
|------|-----|--------------|
| No test coverage yet | Speed to feature parity | After MVP demo |
| Placeholder controllers | Need DB before real implementation | Phase 2D |
| No CI/CD pipeline | Solo developer, manual deploy | Before first customer |
| JWT in localStorage | Acceptable for internal tool | If XSS risk increases |
| No rate limiting | Low traffic | Before public access |
| Monolithic backend | Simple at this scale | > 5 services or > 5 devs |

### 8.3 Future Architecture Considerations

**When to split the monolith:**
- If AI processing becomes heavy → separate AI service
- If SARS integration has different uptime needs → separate integration service
- If notification volume grows → event-driven with message queue

**When to add caching:**
- Dashboard response > 200ms consistently
- Same compliance requirements queried > 100 times/hour unchanged
- Score calculation takes > 1s

---

## 9. Implementation Roadmap

### Phase 2D: Database Integration (Next — 3-5 days)

```
Day 1: Database Setup
├── Install PostgreSQL locally
├── Create snc_tax_db database
├── Run migration 001 (users table)
├── Create migrations 002-008
├── Seed compliance_requirements (60+ records)
└── Verify schema with test queries

Day 2: Service Layer
├── Create ComplianceService class
├── Create ScoreCalculator
├── Create NotificationService
├── Wire services to controllers (replace TODOs)
└── Implement getDashboard with real DB queries

Day 3: Auth + Company Integration
├── Complete authController with bcryptjs + DB queries
├── Implement company CRUD with real DB
├── Implement user-company relationship
├── Test login/register flow end-to-end
└── Test protected routes with real tokens

Day 4: Compliance Module Backend
├── Implement getComplianceByModule with DB
├── Implement updateComplianceStatus
├── Implement document upload (multer + local storage)
├── Test status transitions
└── Test notification generation for overdue items

Day 5: Testing & Polish
├── Manual end-to-end testing
├── API testing with Thunder Client / Postman
├── Fix edge cases and error handling
├── Update documentation
└── Git commit and tag v0.2.0
```

### Phase 2E: Compliance Module Pages (5-7 days)

```
├── Create ComplianceRouter.jsx for /compliance/:module routing
├── Create shared ModulePage.jsx template
├── Create RequirementList with table + filtering
├── Create RequirementDetail with status update form
├── Create DocumentUpload component
├── Style all compliance module pages
├── Implement compliance score chart (recharts)
├── Create NotificationsPanel component
└── Test all 10 modules display correctly
```

### Phase 2F: AI Integration (3-5 days)

```
├── Design AIProviderFactory interface
├── Implement Emma-i™ provider (primary)
├── Implement OpenAI fallback provider
├── Create document analysis pipeline
├── Create recommendation generation
├── Build AI settings UI in admin panel
└── Test AI responses with sample documents
```

### Phase 3: Production Readiness (5-7 days)

```
├── Docker containerization (Dockerfile + docker-compose)
├── Environment configuration for production
├── HTTPS with Let's Encrypt
├── PM2 process management
├── Database backup strategy (pg_dump cron)
├── Basic monitoring (health checks + Winston logs)
├── Deploy to VPS (DigitalOcean / Hetzner SA)
├── DNS configuration
├── Smoke tests on production
└── Tag v1.0.0 release
```

---

## 10. Assumptions & Risks

### Assumptions
1. PostgreSQL will be hosted locally or on a SA-based VPS
2. File storage volume will be < 10GB for first year
3. AI providers have stable APIs and reasonable rate limits
4. SARS eFiling API access can be obtained (may require SARS vendor registration)
5. 60-80 compliance requirements cover 90% of SMME needs
6. Users access the system primarily on desktop (mobile is secondary)

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| SARS API access denied | Medium | High | Manual filing support, mock SARS data |
| AI provider costs spike | Low | Medium | Provider switching via factory pattern |
| Data loss (no backups) | Medium | Critical | Implement automated pg_dump in Phase 2D |
| POPIA audit failure | Low | High | Audit log, encryption, retention policy |
| Solo developer burnout | Medium | High | Clear prioritization, MVP-first mindset |
| Regulation changes | High | Medium | Configurable requirements (DB-driven, not hardcoded) |

---

## 11. Success Criteria

### MVP (v1.0 — Target: 4 weeks)
- [ ] User can register, login, and access dashboard
- [ ] Dashboard shows real compliance score from database
- [ ] All 10 compliance modules display their requirements
- [ ] User can update requirement status (pending → completed)
- [ ] User can upload evidence documents
- [ ] Overdue items generate notifications
- [ ] Admin can manage users
- [ ] System deployed and accessible via HTTPS URL

### v2.0 (Target: 8 weeks)
- [ ] AI document analysis working with at least 1 provider
- [ ] Compliance report generation (PDF)
- [ ] Background score recalculation (daily cron)
- [ ] Email notifications for overdue items
- [ ] Company onboarding wizard (guided setup)
- [ ] Basic SARS integration (or mock)

---

*This document will be revisited as the system grows. Key inflection points: first paying customer, 100 companies, integration with live SARS API.*
