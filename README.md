# Knowledge Platform

> An enterprise-grade knowledge management system for facilitating expert-led learning sessions with advanced role-based access control, OAuth integration, and comprehensive security features.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

## 🎯 Project Overview

Knowledge Platform is a sophisticated full-stack application designed to streamline the organization and management of expert-led knowledge sharing sessions. Built with enterprise security in mind, it implements granular role-based access control (RBAC), OAuth2 authentication, and production-ready features suitable for large-scale organizational deployment.

### Key Capabilities

- **🔐 Advanced RBAC**: Three-tier role system (Admin, Editor, Member) with fine-grained permissions
- **👥 User Management**: Automated user provisioning via OAuth with persistent role management
- **📅 Session Management**: Create, schedule, and manage knowledge sessions with expert invitations
- **✉️ Invitation System**: Track participant RSVPs with status management
- **⭐ Feedback Collection**: Gather and analyze session feedback with ratings and comments
- **🔒 Enterprise Security**: Rate limiting, input sanitization, CSRF protection, and secure headers
- **📊 Role Mapping**: Advanced role assignment based on email domains and patterns

## 🏗️ Technical Architecture

### Technology Stack

**Backend**
```
- Runtime:        Node.js 18+ with TypeScript (ES Modules)
- Framework:      Express.js 4.x
- Database:       PostgreSQL 14+ with Prisma ORM 5.x
- Authentication: Passport.js with OAuth2 Strategy
- Session Store:  PostgreSQL (connect-pg-simple)
- Security:       Helmet, express-rate-limit, Zod validation
- Testing:        Vitest with Supertest
```

**Frontend**
```
- Framework:      Next.js 14 (App Router)
- Language:       TypeScript 5.3
- Styling:        CSS Modules with CSS Custom Properties
- State:          React Hooks (useState, useEffect, useMemo)
```

### Architecture Highlights

**Type-Safe Full Stack**: End-to-end TypeScript from database schema to UI components, ensuring compile-time safety and excellent developer experience.

**Flexible Data Model**: Leverages PostgreSQL's JSON fields for tags, outcomes, and expertise—allowing schema evolution without migrations while maintaining relational integrity.

**Stateless API Design**: Session data stored in PostgreSQL enables horizontal scaling and zero-downtime deployments.

**Security-First Approach**: Multiple layers of defense including Helmet.js headers, rate limiting, input sanitization, and RBAC at both route and data levels.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/scorpionsPD/knowledge-platform.git
cd knowledge-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up PostgreSQL database**
```bash
# macOS (using Homebrew)
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb knowledge_platform
```

4. **Configure environment variables**

Backend (`backend/.env`):
```env
PORT=4000
DATABASE_URL="postgresql://your-username@localhost:5432/knowledge_platform"
SESSION_SECRET="<generate-strong-random-string>"
FRONTEND_ORIGIN="http://localhost:3000"

# Optional: OAuth Configuration
# OAUTH_CLIENT_ID="your-oauth-client-id"
# OAUTH_CLIENT_SECRET="your-oauth-client-secret"
# OAUTH_AUTH_URL="https://your-provider.com/authorize"
# OAUTH_TOKEN_URL="https://your-provider.com/oauth/token"
# OAUTH_CALLBACK_URL="http://localhost:4000/auth/callback"
# OAUTH_USERINFO_URL="https://your-provider.com/userinfo"

# Development mode (bypass OAuth for testing)
AUTH_DISABLED=true
```

Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

5. **Run database migrations**
```bash
npm run prisma:migrate --workspace backend
```

6. **Seed the database with demo data**
```bash
npm run prisma:seed --workspace backend
```

This creates:
- 3 users (admin, editor, member)
- 4 expert profiles
- 3 knowledge sessions
- 3 participant invites
- 3 feedback entries

7. **Start development servers**
```bash
# Terminal 1 - Backend
npm run dev --workspace backend

# Terminal 2 - Frontend
npm run dev --workspace frontend
```

8. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Health Check: http://localhost:4000/health

## 🔑 Demo Accounts

With `AUTH_DISABLED=true` in development:

| Role | Email | Capabilities |
|------|-------|--------------|
| **Admin** | admin@example.com | Full access: user management, all CRUD operations |
| **Editor** | editor@example.com | Session & expert management, invites, view feedback |
| **Member** | member@example.com | Read-only access, submit feedback |

## 📚 API Documentation

### Authentication

```http
GET  /auth/login          # Initiate OAuth flow
GET  /auth/callback       # OAuth callback handler
GET  /auth/profile        # Get current user
POST /auth/logout         # Destroy session
```

### Users (Admin only)

```http
GET  /api/users           # List all users
PUT  /api/users/:id       # Update user roles
```

### Sessions

```http
GET  /api/sessions        # List sessions (public or all if authenticated)
POST /api/sessions        # Create session (admin/editor)
GET  /api/sessions/:id    # Get session details
PUT  /api/sessions/:id    # Update session (admin/editor)
```

### Experts

```http
GET  /api/experts         # List all experts
POST /api/experts         # Create expert (admin/editor)
GET  /api/experts/:id     # Get expert details
PUT  /api/experts/:id     # Update expert (admin/editor)
```

### Invites (Admin/Editor only)

```http
GET  /api/invites         # List invites (filter by ?sessionId=xxx)
POST /api/invites         # Create participant invite
PUT  /api/invites/:id     # Update invite status
```

### Feedback

```http
GET  /api/feedback        # List feedback (admin/editor)
POST /api/feedback        # Submit feedback (authenticated)
```

### Role Mappings (Admin only)

```http
GET  /api/role-mappings   # List role mapping rules
POST /api/role-mappings   # Create mapping rule
PUT  /api/role-mappings/:id   # Update mapping rule
DELETE /api/role-mappings/:id # Delete mapping rule
```

## 🔒 Security Features

### Multi-Layer Security Implementation

1. **HTTP Security Headers** (via Helmet.js)
   - Content Security Policy (CSP)
   - X-Frame-Options (clickjacking prevention)
   - X-Content-Type-Options (MIME sniffing prevention)
   - X-XSS-Protection

2. **Rate Limiting**
   - API endpoints: 100 requests per 15 minutes per IP
   - Authentication endpoints: 10 requests per 15 minutes per IP
   - Prevents brute force and DoS attacks

3. **Input Validation & Sanitization**
   - Zod schema validation for all inputs
   - Null byte removal
   - SQL injection prevention via Prisma parameterized queries
   - UUID format validation

4. **Session Security**
   - HTTP-only cookies
   - SameSite: lax
   - Secure flag in production
   - PostgreSQL-backed sessions (prevents memory leaks)

5. **RBAC Implementation**
   - Route-level authorization
   - Data-level filtering
   - Automatic first-user admin provisioning
   - Persistent role management

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Backend integration tests
npm run test --workspace backend

# Run with coverage
npm run test:coverage --workspace backend
```

Tests cover:
- ✅ RBAC authorization for all roles
- ✅ API endpoint validation
- ✅ Security headers and rate limiting
- ✅ Database operations
- ✅ Error handling

## 🎨 Key Features & Innovations

### 1. Automatic Role Provisioning
Users are automatically assigned roles based on email patterns or domains defined in role mappings. First user gets admin access automatically.

### 2. Flexible JSON Schema
Tags, outcomes, and expertise use PostgreSQL JSON fields, allowing dynamic schema evolution without migrations while maintaining relational integrity.

### 3. OAuth Abstraction
Works with any OAuth2 provider (Auth0, Okta, Azure AD, Google, etc.) with minimal configuration changes.

### 4. Centralized Error Handling
Custom `ApiError` class with async handler wrapper provides consistent error responses and proper HTTP status codes across all endpoints.

### 5. Type-Safe Development
End-to-end TypeScript with Prisma generates types from database schema, ensuring compile-time safety.

## 🏭 Production Deployment

### Environment Checklist

- [ ] `SESSION_SECRET` is cryptographically random (32+ characters)
- [ ] `AUTH_DISABLED` is set to `false`
- [ ] OAuth credentials configured
- [ ] Database backups automated
- [ ] SSL/TLS certificates installed
- [ ] `FRONTEND_ORIGIN` set to production domain
- [ ] Rate limiting enabled
- [ ] Error monitoring configured (Sentry, Datadog, etc.)

### Scaling Considerations

**Horizontal Scaling**: Stateless API design allows multiple instances behind a load balancer. Sessions stored in PostgreSQL, not memory.

**Database Optimization**: 
- Connection pooling configured
- Indexes on frequently queried fields (email, externalId)
- Read replicas for analytics queries

## 📊 Database Schema

```sql
User
  ├── id (UUID, PK)
  ├── externalId (OAuth ID, unique)
  ├── email (unique)
  ├── roles (String[])
  └── timestamps

Expert
  ├── id (UUID, PK)
  ├── name, title, bio
  ├── expertise (JSON)
  └── sessions (relation)

Session
  ├── id (UUID, PK)
  ├── title, description
  ├── tags (JSON)
  ├── outcomes (JSON)
  ├── invites (relation)
  ├── participantInvites (relation)
  └── feedback (relation)

SessionParticipantInvite
  ├── id (UUID, PK)
  ├── sessionId (FK)
  ├── email, name
  └── status (pending|sent|accepted|declined)

SessionFeedback
  ├── id (UUID, PK)
  ├── sessionId (FK)
  ├── rating (1-5)
  └── comment

RoleMapping
  ├── id (UUID, PK)
  ├── email/domain pattern
  └── roles (String[])
```

## Roadmap

- [x] Core RBAC implementation
- [x] Session management
- [x] OAuth integration
- [x] Feedback system
- [x] Role mapping
- [ ] Email notifications
- [ ] Calendar integration
- [ ] File attachments
- [ ] Analytics dashboard
- [ ] API versioning

## 📝 License

MIT License

## 👤 Author

**Pradeep Dahiya**  
Senior Software Engineer specializing in full-stack TypeScript, enterprise architecture, and security

- GitHub: [@scorpionsPD](https://github.com/scorpionsPD)
- Project: [knowledge-platform](https://github.com/scorpionsPD/knowledge-platform)

### Technical Contributions

This project demonstrates:
- ✅ **Enterprise Security**: Multi-layer security with rate limiting, CSRF protection, and secure headers
- ✅ **Advanced TypeScript**: End-to-end type safety from database to UI
- ✅ **Scalable Architecture**: Stateless API design enabling horizontal scaling
- ✅ **Production Quality**: Comprehensive error handling, validation, and testing
- ✅ **RBAC Innovation**: Granular role-based authorization with automatic provisioning
- ✅ **Database Design**: Flexible JSON schema with relational integrity
- ✅ **OAuth Abstraction**: Provider-agnostic authentication implementation

---

**Technical Documentation**: See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed technical decisions and design rationale.

**Last Updated**: January 2026
