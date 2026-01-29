# Knowledge Platform - Technical Architecture

## Overview

This is a full-stack knowledge management platform designed for organizations to facilitate expert knowledge sharing sessions. The system implements enterprise-grade security with Role-Based Access Control (RBAC), secure session management, and comprehensive data validation.

## Technical Stack

### Backend
- **Runtime**: Node.js with TypeScript (ES Modules)
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Authentication**: Passport.js with OAuth2 support
- **Session Management**: express-session with PostgreSQL store
- **Security**: Helmet, rate limiting, input sanitization
- **Validation**: Zod schemas for type-safe validation
- **Testing**: Vitest with Supertest

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules with CSS custom properties
- **State Management**: React hooks (useState, useEffect, useMemo)

## Architecture Decisions

### 1. Role-Based Access Control (RBAC)

**Design**: Three-tier role system with hierarchical permissions
- **Admin**: Full system access, user management, all CRUD operations
- **Editor**: Session and expert management, invite management, feedback viewing
- **Member**: Read-only access, can submit feedback

**Implementation**:
```typescript
// middleware/requireRole.ts
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRoles = req.user?.roles ?? [];
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}
```

**Why**: Provides fine-grained access control for different organizational roles while maintaining simplicity and scalability.

### 2. Database Design

**PostgreSQL with Prisma ORM**:
- Type-safe database access
- Automatic migrations
- JSON fields for flexible data (tags, outcomes, expertise)
- Cascading deletes for data integrity
- Unique constraints to prevent duplicates

**Key Models**:
```prisma
model User {
  id          String   @id @default(uuid())
  externalId  String   @unique  // From OAuth provider
  displayName String
  email       String?  @unique
  roles       String[] @default(["member"])
}

model Session {
  id               String   @id @default(uuid())
  tags             Json     // Flexible metadata
  invites          SessionInvite[]
  participantInvites SessionParticipantInvite[]
  feedback         SessionFeedback[]
}
```

**Why**: PostgreSQL provides ACID compliance, JSON support for flexible schemas, and robust indexing for performance.

### 3. Security Implementation

**Multi-Layer Security**:

1. **Helmet.js**: Sets secure HTTP headers
   - CSP (Content Security Policy)
   - X-Frame-Options (clickjacking prevention)
   - X-Content-Type-Options (MIME sniffing prevention)

2. **Rate Limiting**: Prevents abuse
   - API endpoints: 100 req/15min per IP
   - Auth endpoints: 10 req/15min per IP

3. **Input Sanitization**: Removes malicious input
   - Null byte removal
   - SQL injection prevention via Prisma
   - XSS prevention via Content Security Policy

4. **Session Security**:
   - HTTP-only cookies
   - SameSite: lax
   - PostgreSQL-backed sessions (prevents memory leaks)

**Why**: Defense in depth approach ensures multiple layers of protection against common web vulnerabilities.

### 4. Error Handling

**Centralized Error Handling**:
```typescript
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true,
    public details?: unknown
  ) {
    super(message);
  }
}
```

**Benefits**:
- Consistent error responses across API
- Proper HTTP status codes
- Detailed logging for debugging
- Separation of operational vs programming errors

### 5. OAuth Integration

**Flexible Authentication**:
- Supports any OAuth2 provider (Auth0, Okta, Azure AD, etc.)
- Automatic user provisioning on first login
- First user automatically becomes admin
- Dev mode bypass for testing

**Implementation**: User records persist OAuth provider IDs and maintain local roles for RBAC.

## Data Flow

### Session Creation Flow
1. User submits session data via frontend form
2. Request hits rate limiter → sanitization → authentication → authorization
3. Zod schema validates input data
4. Prisma creates session with associated invites
5. Response returns created session with relationships
6. Frontend updates UI with new session

### Authentication Flow
1. User clicks "Login" → redirected to OAuth provider
2. After successful auth, callback receives user info
3. System upserts user in database (creates if new, updates if exists)
4. User object with roles stored in session
5. Subsequent requests use session cookie for authentication

## Performance Optimizations

1. **Database Indexing**: Unique indexes on email and externalId
2. **Eager Loading**: Include relationships in queries to avoid N+1
3. **Connection Pooling**: PostgreSQL connection pool for efficiency
4. **Pagination**: Built-in pagination support for large datasets

## Testing Strategy

1. **Unit Tests**: Individual function testing
2. **Integration Tests**: API endpoint testing with test database
3. **RBAC Tests**: Permission verification for all roles
4. **Security Tests**: Rate limiting, input validation, XSS prevention

## Deployment Considerations

### Environment Variables
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
SESSION_SECRET=<strong-random-string>
FRONTEND_ORIGIN=https://app.example.com
OAUTH_CLIENT_ID=<provider-client-id>
OAUTH_CLIENT_SECRET=<provider-secret>
AUTH_DISABLED=false  # Never true in production
```

### Production Checklist
- [ ] SESSION_SECRET is cryptographically random
- [ ] AUTH_DISABLED is false
- [ ] Database backups configured
- [ ] SSL/TLS certificates installed
- [ ] CORS origins restricted
- [ ] Rate limiting enabled
- [ ] Logging configured (e.g., Winston, Datadog)
- [ ] Error monitoring (e.g., Sentry)

## Scalability

**Horizontal Scaling**:
- Stateless API (session in PostgreSQL, not memory)
- Load balancer distributes traffic
- Database can be scaled with read replicas

**Vertical Scaling**:
- Connection pool size tuning
- Indexes for query performance
- Caching layer (Redis) can be added

## Innovation Highlights

1. **Type-Safe Full Stack**: TypeScript across frontend, backend, and database
2. **Flexible Data Model**: JSON fields allow evolving requirements without migrations
3. **Granular RBAC**: Role-based authorization at route and data level
4. **OAuth Abstraction**: Works with any OAuth2 provider
5. **Developer Experience**: Hot reload, type checking, comprehensive error messages

## Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] Email notifications for invites
- [ ] Calendar integration (Google Cal, Outlook)
- [ ] File attachments for sessions
- [ ] Advanced analytics dashboard
- [ ] API versioning (/v1/, /v2/)
- [ ] GraphQL API option
- [ ] Microservices architecture for larger scale

---

**Author**: Pradeep Dahiya  
**Last Updated**: January 2026  
**License**: Proprietary
