# Phase 2: Code Extraction & Architecture Documentation
## SNC-TAX Compliance Platform - Standalone Migration

**Date:** 2026-05-15  
**Status:** In Progress (Method A: Manual Reverse Engineering)  
**Scope:** Complete Base44 application architecture documentation for React/Node.js recreation

---

## 1. APPLICATION OVERVIEW

**App Name:** Compl-Ai™ SA  
**Current Platform:** Base44 (vendor: base44.app)  
**Original Published URL:** https://snc-compl-ai.base44.app/  
**Clone Published URL:** https://compl-ai-satm-copy-ee2c244.base44.app/  
**Tagline:** "A product of SNC-TAX - Developed by SA-iLabs™ - Emma-i™ AI Engine - Re-imagining Compliance Intelligence"  
**Mission:** All-in-one South African SMME compliance command center powered by Emma-i™ AI

---

## 2. APPLICATION STRUCTURE

### 2.1 Main Navigation Pages

The application has a hierarchical navigation structure with primary and secondary pages:

#### Primary Pages (Main Navigation)
1. **Dashboard** - Main landing page with compliance overview
2. **COMPLIANCE** - Compliance management section (parent category)
   - CIPC - Companies and Intellectual Property Commission
   - SARS Tax - South African Revenue Service Tax compliance
   - Labour Law - Employment compliance and regulations
   - OHS - Occupational Health & Safety
   - POPIA & PAIA - Personal Information Protection & Promotion of Access to Information
   - B-BBEE - Broad-Based Black Economic Empowerment
   - FICA - Financial Intelligence Centre Act
   - Municipal - Municipal compliance (rates, licenses, etc.)
   - Industry & Sector - Sector-specific compliance requirements
   - Tax Engine - Tax calculation and optimization engine
3. **Vault** - Secure document/data storage

---

## 3. DASHBOARD PAGE ARCHITECTURE

### 3.1 Dashboard Components

**Header Section**
- App Logo/Branding: "Compl-Ai™ SA"
- Navigation Menu (Hamburger): Opens main navigation sidebar
- User Account Menu (top right)

**Welcome Banner**
- ZA Proudly South African badge
- Title: "Welcome to Compl-Ai™ SA"
- Subtitle: Product attribution and AI engine branding
- Description: SMME compliance command center pitch
- Notifications Button: Links to notifications panel (shows unread count)
- "Customize Dashboard" option: User preference for widget arrangement

**Dashboard Widgets (4-column responsive grid)**

1. **Compliance Score Card**
   - Icon: Shield/Protection symbol
   - Primary Metric: 87% (percentage)
   - Label: "Compliance Score"
   - Secondary Info: "Up from 80% last month"
   - Change Indicator: +7% (green, positive)
   - Functionality: Click to drill down into compliance details

2. **Pending Filings Card**
   - Icon: Document/File symbol
   - Primary Metric: 3 (count)
   - Label: "Pending Filings"
   - Change Indicator: -15% (orange/warning, negative trend)
   - Functionality: Click to view pending filing list

3. **Due This Month Card**
   - Icon: Clock/Calendar symbol
   - Primary Metric: 2 (count)
   - Label: "Due this month"
   - Status Label: "Action required" (red warning)
   - Functionality: Click to view overdue items

4. **All Up to Date Card**
   - Icon: Checkmark/Success symbol
   - Primary Metric: 14 (count)
   - Label: "All up to date"
   - Change Indicator: +2% (green, positive)
   - Functionality: Click to view completed compliance items

**Notifications Panel (Right Sidebar or Modal)**
- Shows compliance-related notifications
- Notification items contain:
  - Notification type/category (e.g., "Overdue: EMP201")
  - Compliance requirement code (e.g., "PAYE/SDL/UIF")
  - Time indicator (e.g., "2 days overdue")
  - Dismiss/Action button
- Examples observed:
  - "Overdue: EMP201 - PAYE/SDL/UIF (2 days overdue)"
  - "Overdue: COIDA Return of Earnings (Estimated 4 days ago)"

---

## 4. DATA MODEL & ENTITIES

### 4.1 Core Entities

**Company/Organization Entity**
- company_id (PK)
- company_name
- registration_number (CIPC)
- tax_reference_number (SARS)
- company_type (SMME classification)
- industry_sector
- employee_count
- turnover
- compliance_profile (reference to ComplianceProfile)
- created_at
- updated_at

**Compliance Requirement Entity**
- requirement_id (PK)
- requirement_name
- regulation_code (e.g., "EMP201", "COIDA")
- compliance_type (e.g., "Filing", "Registration", "Reporting")
- applicable_to (company type/sector filters)
- frequency (Annual, Quarterly, Monthly, Ad-hoc)
- due_date_calculation
- penalty_amount
- documentation_requirements
- integration_apis (SARS, Department of Labour, etc.)
- created_at
- updated_at

**Compliance Status Entity**
- status_id (PK)
- requirement_id (FK)
- company_id (FK)
- status (Completed, Pending, Overdue, At Risk, Not Applicable)
- due_date
- completion_date
- documents_uploaded (array of document references)
- notes
- assigned_to (user/team)
- created_at
- updated_at

**Notification Entity**
- notification_id (PK)
- company_id (FK)
- requirement_id (FK)
- notification_type (Reminder, Overdue, Alert, Info)
- message
- severity (Low, Medium, High, Critical)
- days_overdue (calculated)
- is_read
- created_at
- updated_at

**User Entity**
- user_id (PK)
- email
- password_hash
- full_name
- role (Admin, Manager, Compliance Officer, Viewer)
- company_id (FK)
- permissions (array of permission codes)
- preferences (dashboard customization, notifications settings)
- created_at
- updated_at

---

## 5. KEY FEATURES & FUNCTIONALITY

### 5.1 Compliance Tracking
- Real-time compliance score calculation (87% example)
- Trend analysis (Up from 80%, +7% improvement)
- Multi-category compliance monitoring (CIPC, SARS, Labour, etc.)
- Automated due date tracking and alerts

### 5.2 Notification System
- Unread notification counter
- Notification severity levels (Overdue, Alert, Info)
- Time-based notifications (e.g., "2 days overdue")
- Dismissible notifications

### 5.3 Dashboard Customization
- Widget arrangement (drag-and-drop likely)
- Widget visibility toggle
- Custom dashboard layouts (possibly multiple saved layouts)

### 5.4 AI Integration (Emma-i™)
- AI-powered compliance recommendations
- Document analysis
- Automated compliance status updates
- Predictive compliance alerts
- Multi-model AI provider support (per Annexure A):
  - Emma-i™ (primary)
  - OpenAI GPT-4
  - Anthropic Claude
  - Google Gemini
  - Meta AI
  - Self-hosted LLMs

### 5.5 SARS Integration
- Tax reference number validation
- eFiling status tracking
- Tax calculation assistance
- Return preparation

### 5.6 Multi-compliance Module Support
- CIPC: Company registration and IP management
- Labour Law: Employment compliance
- OHS: Workplace safety
- POPIA & PAIA: Data protection and information access
- B-BBEE: Black economic empowerment compliance
- FICA: Know-your-customer compliance
- Municipal: Local council tax and license compliance
- Industry & Sector: Sector-specific rules
- Vault: Document secure storage

---

## 6. INTEGRATION POINTS

### 6.1 External APIs

**SARS eFiling API**
- Purpose: Tax filing submission and status
- Authentication: Company tax reference + credentials
- Endpoints: Filing creation, status check, return submission
- Data flow: Two-way (company → SARS, SARS → company)

**Emma-i™ AI API** (or alternative providers)
- Purpose: AI-powered compliance analysis and recommendations
- Functionality: Document OCR, compliance requirement matching, predictive alerts
- Endpoints: Process document, get recommendations, generate compliance report

**WhatsApp Webhook** (implied from strategy)
- Purpose: Notifications delivery via WhatsApp
- Trigger: Compliance alerts, reminders, notifications
- Format: Webhook POST requests from app to WhatsApp Business API

**Department of Labour APIs**
- Purpose: Employment compliance, UIF, COIDA verification
- Endpoints: Employer registration check, payroll validation

**CIPC API**
- Purpose: Company registration verification
- Endpoints: Company lookup, registration status

---

## 7. TECHNOLOGY STACK (BASE44 - CURRENT)

### Current Architecture (Being Extracted)
- **Frontend Framework:** Base44 no-code builder (proprietary)
- **UI Components:** Base44 component library
- **Styling:** Base44 theme system (TailwindCSS-based)
- **Backend:** Base44 cloud infrastructure
- **Database:** Base44 managed data layer
- **Hosting:** Base44 managed hosting (base44.app)
- **AI Integration:** Emma-i™ API integration
- **Version Control:** Not accessible (vendor lock-in)
- **Deployment:** Base44 one-click publishing

---

## 8. TARGET ARCHITECTURE (STANDALONE - GOAL)

### Frontend (React-based)
```
snc-tax-frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ComplianceScoreCard.jsx
│   │   │   ├── PendingFilingsCard.jsx
│   │   │   ├── DueThisMonthCard.jsx
│   │   │   ├── AllUpToDateCard.jsx
│   │   │   └── NotificationsPanel.jsx
│   │   ├── Compliance/
│   │   │   ├── CompliancePage.jsx
│   │   │   ├── CIPCModule.jsx
│   │   │   ├── SARSModule.jsx
│   │   │   ├── LabourLawModule.jsx
│   │   │   ├── OHSModule.jsx
│   │   │   ├── POPIAModule.jsx
│   │   │   ├── BbbeModule.jsx
│   │   │   ├── FICAModule.jsx
│   │   │   ├── MunicipalModule.jsx
│   │   │   ├── IndustryModule.jsx
│   │   │   ├── TaxEngineModule.jsx
│   │   │   └── ComplianceMatrix.jsx
│   │   ├── Navigation/
│   │   │   ├── MainMenu.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Header.jsx
│   │   ├── Vault/
│   │   │   ├── VaultPage.jsx
│   │   │   ├── DocumentUploader.jsx
│   │   │   └── DocumentViewer.jsx
│   │   ├── Notifications/
│   │   │   ├── NotificationCenter.jsx
│   │   │   └── NotificationItem.jsx
│   │   ├── Common/
│   │   │   ├── Card.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Loading.jsx
│   │   │   └── Breadcrumb.jsx
│   │   └── Admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── UserManagement.jsx
│   │       ├── ComplianceSettingss.jsx
│   │       └── ReportGenerator.jsx
│   ├── pages/
│   ├── styles/
│   │   ├── global.css
│   │   ├── themes.css
│   │   └── components.css
│   ├── hooks/
│   │   ├── useComplianceData.js
│   │   ├── useNotifications.js
│   │   └── useAuth.js
│   ├── context/
│   │   ├── AuthContext.js
│   │   ├── ComplianceContext.js
│   │   └── NotificationContext.js
│   ├── services/
│   │   ├── api.js
│   │   ├── aiProvider.js
│   │   └── sarsIntegration.js
│   ├── utils/
│   │   ├── complianceCalculations.js
│   │   ├── dateUtils.js
│   │   └── formatters.js
│   └── App.jsx
├── public/
├── package.json
└── tailwind.config.js
```

### Backend (Express.js-based)
```
snc-tax-backend/
├── src/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── compliance.js
│   │   ├── companies.js
│   │   ├── notifications.js
│   │   ├── documents.js
│   │   ├── ai.js
│   │   ├── admin.js
│   │   └── integrations.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── complianceController.js
│   │   ├── companyController.js
│   │   ├── notificationController.js
│   │   ├── documentController.js
│   │   ├── aiController.js
│   │   └── adminController.js
│   ├── models/
│   │   ├── Company.js
│   │   ├── ComplianceRequirement.js
│   │   ├── ComplianceStatus.js
│   │   ├── Notification.js
│   │   ├── User.js
│   │   ├── Document.js
│   │   └── AuditLog.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── validation.js
│   │   └── logging.js
│   ├── services/
│   │   ├── aiProviderFactory.js
│   │   ├── sarsIntegrationService.js
│   │   ├── notificationService.js
│   │   ├── complianceCalculationService.js
│   │   ├── documentStorageService.js
│   │   └── emailService.js
│   ├── config/
│   │   ├── database.js
│   │   ├── env.js
│   │   └── aiProviders.js
│   ├── jobs/
│   │   ├── complianceChecker.js
│   │   ├── notificationScheduler.js
│   │   └── reportGenerator.js
│   └── app.js
├── tests/
├── .env.example
├── package.json
└── server.js
```

---

## 9. FEATURE PARITY CHECKLIST

### Phase 1: Core MVP (Weeks 3-4)
- [ ] Dashboard page with metric cards
- [ ] Compliance Score calculation algorithm
- [ ] Navigation menu and sidebar
- [ ] Basic user authentication
- [ ] Company profile setup
- [ ] SARS Tax module (basic)
- [ ] Notification system

### Phase 2: Compliance Modules (Weeks 5-6)
- [ ] CIPC module
- [ ] Labour Law module
- [ ] OHS module
- [ ] POPIA & PAIA module
- [ ] B-BBEE module
- [ ] FICA module
- [ ] Municipal module
- [ ] Industry & Sector module

### Phase 3: Advanced Features (Week 7-8)
- [ ] Tax Engine module
- [ ] AI integration with provider switching
- [ ] Document Vault with secure storage
- [ ] Multi-user dashboard customization
- [ ] Admin panel and user management
- [ ] Compliance reporting and analytics
- [ ] WhatsApp notification integration
- [ ] SARS eFiling integration

### Phase 4: Integration & Testing (Week 9)
- [ ] API integration testing
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Load testing
- [ ] User acceptance testing

---

## 10. SCREENSHOTS & UI DOCUMENTATION

### Dashboard Layout (Observed 2026-05-15)
```
┌─────────────────────────────────────────────────────────────┐
│ Logo     Dashboard  Preview  ...  Upgrade  Publish  Account │
├─────────────────────────────────────────────────────────────┤
│ ☰  Compl-Ai™ SA                                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ZA Proudly South African                                   │
│                                                               │
│  Welcome to Compl-Ai™ SA                                   │
│  A product of SNC-TAX...                                   │
│  Your all-in-one South African SMME compliance...         │
│                                                               │
│  🔔 Notifications (1)  🎛️ Customize Dashboard            │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│ │ 🛡️ 87% +7%  │  │ 📄 3 -15%    │  │ ⏰ 2 !       │       │
│ │ Compliance   │  │ Pending      │  │ Due this    │       │
│ │ Score        │  │ Filings      │  │ month       │       │
│ └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│ ┌──────────────┐                                            │
│ │ ✓ 14 +2%    │                                            │
│ │ All up to    │                                            │
│ │ date         │                                            │
│ └──────────────┘                                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. DATA FLOW DIAGRAMS

### Compliance Score Calculation Flow
```
Company Profile
    ↓
Compliance Requirements (by company type/sector)
    ↓
Compliance Status (for each requirement)
    ↓
Calculate: (Completed / Total) × 100 = %
    ↓
Apply Trend: Current % vs Previous Month
    ↓
Dashboard Card Widget
```

### Notification Generation Flow
```
ComplianceStatus Changes
    ↓
Due Date Check
    ↓
Is Overdue? → Create Notification
    ↓
Calculate Days Overdue
    ↓
Determine Severity (Low/Medium/High/Critical)
    ↓
Queue Notification (Email/WhatsApp/In-App)
    ↓
User Sees Badge Counter
```

### AI-Assisted Compliance Flow
```
Document Upload (Vault)
    ↓
Send to Emma-i™ / Selected AI Provider
    ↓
AI Extracts Information
    ↓
Match Against Compliance Requirements
    ↓
Generate Recommendations
    ↓
Update Compliance Status
    ↓
Display in Dashboard
```

---

## 12. EXTRACTION METHODOLOGY (METHOD A)

### Phase 2A: Documentation (Current - Days 1-2)
1. ✅ Screenshot all Base44 pages
2. ✅ Document navigation structure
3. ✅ Extract component layouts
4. 🔄 Document data entities
5. 🔄 Map external integrations
6. 🔄 Identify business logic

### Phase 2B: Code Structure Setup (Days 3-4)
1. Initialize Git repository
2. Create React project structure
3. Create Express.js project structure
4. Set up package.json files
5. Configure webpack/build tools
6. Set up development environment

### Phase 2C: Component Recreation (Days 5-14)
1. Recreate React components from Base44 layouts
2. Implement data models in Express.js
3. Build API endpoints
4. Integrate external APIs (SARS, Department of Labour, etc.)
5. Implement AI provider factory pattern
6. Set up authentication/authorization

---

## 13. NEXT IMMEDIATE ACTIONS

1. **Initialize Git repository** for code version control
2. **Create React project** using Vite/Create React App
3. **Create Express.js project** for backend API
4. **Set up database schema** (PostgreSQL recommended)
5. **Begin Dashboard component recreation** in React
6. **Implement API routes** for compliance data

---

## 14. RISKS & MITIGATION

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Base44 UI peculiarities hard to replicate | Medium | Document thoroughly, test with user |
| Missing business logic in exported data | High | Reverse engineer from API calls, interview client |
| Integration APIs (SARS) require live access | High | Use sandbox/test environments, coordinate with client |
| Data migration complexity | Medium | Plan comprehensive data import scripts |
| Performance parity (87% compliance score) | Medium | Profile Base44 app, optimize algorithms |

---

## 15. COMPLIANCE & LEGAL NOTES

- All code extracted per Annexure A legal agreement
- No Base44 proprietary code reused
- Full intellectual property ownership to SNC-TAX
- Vendor lock-in removed
- Multi-model AI provider support per agreement
- SA legal framework compliance (POPIA, CPA, Copyright Act)

---

**Status:** Phase 2 Code Extraction - In Progress  
**Next Review:** 2026-05-16 (after Phase 2B completion)  
**Prepared by:** Claude Code (AI Assistant)  
**For:** SNC-TAX Compliance Platform Project
