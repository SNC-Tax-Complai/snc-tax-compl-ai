# SNC-TAX Compliance Platform - Standalone Application

A comprehensive South African SMME compliance management and automation platform built with React and Express.js, extracted from Base44 vendor lock-in.

## Project Status

**Phase 2: Code Extraction & Architecture Documentation** (In Progress)

- ✅ Complete Base44 application structure analysis
- ✅ Created Phase 2 Architecture Documentation
- ✅ Git repository initialized
- ✅ Frontend (React) project structure created
- ✅ Backend (Express.js) project structure created
- 🔄 Beginning Phase 2B: Component Recreation and API Implementation
- 📅 Estimated Completion: Week 6 (2026-05-24)

## Directory Structure

```
snc-tax-frontend/           # React frontend application
├── src/
│   ├── components/         # Reusable React components
│   ├── pages/              # Page components
│   ├── stores/             # Zustand state management
│   ├── services/           # API service layer
│   ├── hooks/              # Custom React hooks
│   ├── context/            # React context providers
│   ├── utils/              # Utility functions
│   ├── styles/             # Global styles
│   └── App.jsx             # Main app component
├── public/                 # Static assets
└── package.json

snc-tax-backend/            # Express.js backend application
├── src/
│   ├── routes/             # API route definitions
│   ├── controllers/        # Route controllers
│   ├── models/             # Database models
│   ├── middleware/         # Express middleware
│   ├── services/           # Business logic services
│   ├── config/             # Configuration files
│   ├── jobs/               # Background jobs
│   ├── app.js              # Express app setup
│   └── server.js           # Server entry point
├── tests/                  # Test files
└── package.json

PHASE_2_CODE_EXTRACTION_ARCHITECTURE.md  # Complete architecture documentation
.env.example                             # Environment variables template
.gitignore                               # Git ignore rules
```

## Features Implemented

### Frontend (React)
- [x] Project structure and build configuration
- [x] State management (Zustand) setup
- [x] API service layer with axios
- [x] Authentication store
- [x] Compliance data store
- [x] Routing setup
- [x] Dashboard page skeleton
- [ ] Dashboard components (in progress)
- [ ] Compliance modules
- [ ] Document vault
- [ ] Admin panel

### Backend (Express.js)
- [x] Express server setup
- [x] CORS and middleware configuration
- [x] Authentication routes and controllers
- [x] Compliance routes and controllers
- [x] Error handling middleware
- [x] JWT authentication middleware
- [x] Role-based access control
- [ ] Database integration (PostgreSQL)
- [ ] SARS eFiling integration
- [ ] AI provider factory pattern
- [ ] Background jobs (compliance checking, notifications)

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL 12+
- Git

### Setup

1. **Clone and install dependencies**
   ```bash
   cd snc-tax-frontend
   npm install

   cd ../snc-tax-backend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development servers**
   ```bash
   # Terminal 1: Frontend
   cd snc-tax-frontend
   npm run dev

   # Terminal 2: Backend
   cd snc-tax-backend
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api
   - Health check: http://localhost:5000/health

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user

### Compliance
- `GET /api/compliance/dashboard` - Dashboard metrics
- `GET /api/compliance/:module` - Module compliance status
- `PUT /api/compliance/:id` - Update compliance status

### Companies
- `GET /api/companies` - List companies
- `POST /api/companies` - Create company
- `GET /api/companies/:id` - Get company details
- `PUT /api/companies/:id` - Update company

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read

### AI
- `POST /api/ai/analyze-document` - Analyze document
- `POST /api/ai/generate-recommendations` - Get recommendations
- `GET /api/ai/providers` - List available AI providers

### Admin
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

## Technology Stack

### Frontend
- React 18
- Vite
- Zustand (State Management)
- Axios (HTTP Client)
- React Router
- Tailwind CSS
- Recharts (Data Visualization)

### Backend
- Express.js
- Node.js
- PostgreSQL
- JWT (Authentication)
- Joi (Validation)
- Winston (Logging)
- Node-cron (Scheduled Jobs)

## Compliance Requirements

The platform addresses South African SMME compliance for:
- CIPC (Companies and IP Registration)
- SARS Tax (eFiling, VAT, Income Tax)
- Labour Law (PAYE, SDL, UIF, COIDA)
- OHS (Occupational Health & Safety)
- POPIA & PAIA (Data Protection)
- B-BBEE (Black Economic Empowerment)
- FICA (Know-Your-Customer)
- Municipal (Local Taxes & Licenses)

## AI Integration

Multi-model AI provider support:
- Emma-i™ (Primary)
- OpenAI GPT-4
- Anthropic Claude
- Google Gemini
- Meta AI
- Self-hosted LLMs

Configurable through environment variables.

## Documentation

- `PHASE_2_CODE_EXTRACTION_ARCHITECTURE.md` - Complete architecture documentation
- `SNC_TAX_PRODUCTION_DEPLOYMENT_STRATEGY.md` - Deployment and implementation roadmap

## Legal & IP

- Code extracted per Annexure A legal agreement
- Full intellectual property ownership: SNC-TAX
- No vendor lock-in (independent deployment)
- South African legal framework compliance (POPIA, CPA, Copyright Act)

## Support

For implementation questions and updates, refer to:
- Phase 2 Architecture Documentation
- Production Deployment Strategy
- Feature parity checklist

## License

Proprietary - SNC-TAX Compliance Platform
