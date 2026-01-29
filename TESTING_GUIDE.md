# Local Testing Guide - Knowledge Platform

## 🚀 Quick Start (5 Minutes)

### Prerequisites Check
```bash
node --version    # Should be 18+
npm --version     # Should be 9+
psql --version    # Should be 14+
```

---

## Step 1: Start PostgreSQL

```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# If not running, start it
brew services start postgresql@14

# Verify it's running
psql -U $(whoami) -d postgres -c "SELECT version();"
```

**Expected Output:** PostgreSQL version information

---

## Step 2: Set Up Database

```bash
# Navigate to project root
cd /Users/pradeepdahiya/Documents/knowledge-platform

# Create/reset main database
dropdb knowledge_platform 2>/dev/null || true
createdb knowledge_platform

# Create/reset test database
dropdb knowledge_platform_test 2>/dev/null || true
createdb knowledge_platform_test
```

---

## Step 3: Install Dependencies

```bash
# Install all dependencies (root + workspaces)
npm install

# Verify installation
npm list --depth=0
```

**Expected:** No errors, packages installed

---

## Step 4: Run Database Migrations

```bash
# Navigate to backend
cd backend

# Run migrations on main database
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed the database with sample data
npm run prisma:seed
```

**Expected Output:**
```
✅ Database seeding completed successfully!
Created:
- 3 users (admin, editor, member)
- 4 experts
- 3 sessions
- 3 invites
- 3 feedback entries
```

---

## Step 5: Run Tests

```bash
# Still in backend directory
# Run tests with test database
DATABASE_URL="postgresql://$(whoami)@localhost:5432/knowledge_platform_test" npm test
```

**Expected Output:**
```
✓ tests/app.test.ts (2 tests)
✓ tests/rbac.test.ts (10 tests)

Test Files  2 passed (2)
Tests  12 passed (12)
```

**If tests fail:**
```bash
# Reset test database
cd backend
DATABASE_URL="postgresql://$(whoami)@localhost:5432/knowledge_platform_test" npx prisma migrate deploy
DATABASE_URL="postgresql://$(whoami)@localhost:5432/knowledge_platform_test" npm test
```

---

## Step 6: Start Backend Server

```bash
# Open a new terminal tab/window
cd /Users/pradeepdahiya/Documents/knowledge-platform/backend

# Start backend in development mode
npm run dev
```

**Expected Output:**
```
> knowledge-platform-backend@0.1.0 dev
> tsx watch src/index.ts

Server running on http://localhost:4000
```

**Test the API:**
```bash
# In another terminal
curl http://localhost:4000/health
```

**Expected Response:**
```json
{"status":"ok","timestamp":"2026-01-27T..."}
```

---

## Step 7: Start Frontend Server

```bash
# Open another new terminal tab/window
cd /Users/pradeepdahiya/Documents/knowledge-platform/frontend

# Start frontend in development mode
npm run dev
```

**Expected Output:**
```
▲ Next.js 14.2.35
- Local:        http://localhost:3000

✓ Ready in 1-2s
```

---

## Step 8: Test the Application

### 8.1 Open Browser
```
http://localhost:3000
```

**What to see:**
- Hero section with purple gradient
- "Enterprise Knowledge Management Platform" title
- Feature grid (6 features)
- "Browse Sessions" and "View Experts" buttons

---

### 8.2 Test Sessions Page
```
http://localhost:3000/sessions
```

**What to see:**
- 3 session cards from seed data
- Each card shows:
  - Title
  - Date and time
  - Host organization
  - Description (truncated)
  - Tags
  - Invited experts avatars
  - "View Details →" button

**Sample sessions you should see:**
1. "Modern DevOps Practices for Startups"
2. "AI Ethics and Responsible Development"
3. "Data Architecture for Scale"

---

### 8.3 Test Session Detail Page
```
# Click on any session card OR
# Get a session ID from the API
curl http://localhost:4000/api/sessions | jq '.[0].id'

# Then visit (replace with actual ID)
http://localhost:3000/sessions/[copy-session-id-here]
```

**What to see:**
- Full session title
- Scheduled date and time
- Host organization
- Visibility badge (Public/Private)
- Full description
- Topics/tags
- Featured experts section with:
  - Expert avatars
  - Names and organizations
  - Expertise tags
  - LinkedIn links
- "Share Your Feedback" button

---

### 8.4 Test Experts Page
```
http://localhost:3000/experts
```

**What to see:**
- 4 expert cards from seed data
- Each card shows:
  - Avatar with initials
  - Name
  - Organization
  - Expertise tags
  - "✉️ Contact" button (email)
  - "in LinkedIn" button

**Sample experts you should see:**
1. Sarah Chen - SecureCloud Consulting
2. Mike Rodriguez - DevOps Unlimited
3. Emma Thompson - AI Research Institute
4. James Wilson - DataScale Solutions

---

### 8.5 Test Admin Session Management
```
http://localhost:3000/admin/sessions
```

**What to see:**
- "Manage Sessions" header
- "+ Create Session" button
- List of existing 3 sessions

**Test creating a session:**
1. Click "+ Create Session"
2. Fill in the form:
   - Title: "Test Session"
   - Description: "This is a test session for validation"
   - Scheduled Date & Time: Pick a future date
   - Visibility: Public
   - Host Organisation: "Test Company"
   - Tags: "Testing, Demo"
   - Select 1-2 experts from checkboxes
3. Click "Create Session"

**Expected:**
- Form closes
- Success (or error if auth disabled mode needs setup)
- New session appears in list

**Note:** Session creation requires authentication. If you see an error:
```bash
# In backend/.env, add:
AUTH_DISABLED=true
```
Then restart the backend server.

---

### 8.6 Test Feedback Form
```
# Get a session ID
curl http://localhost:4000/api/sessions | jq '.[0].id'

# Visit (replace with actual ID)
http://localhost:3000/feedback/[session-id]
```

**What to see:**
- Session title at top
- Star rating (1-5 stars)
- Interactive hover effects on stars
- Comment textarea
- "Submit Feedback" button

**Test submitting feedback:**
1. Hover over stars (should highlight up to hovered star)
2. Click on 5th star
3. Enter comment: "Great session! Very informative."
4. Click "Submit Feedback"

**Expected:**
- Success message appears
- Redirects to sessions list after 2 seconds

---

## Step 9: Test Backend API Directly

### 9.1 Health Check
```bash
curl http://localhost:4000/health
```

**Expected:**
```json
{"status":"ok","timestamp":"2026-01-27T..."}
```

---

### 9.2 Get All Sessions
```bash
curl http://localhost:4000/api/sessions | jq
```

**Expected:** JSON array of 3 sessions

---

### 9.3 Test Search
```bash
# Search by keyword
curl "http://localhost:4000/api/sessions?search=DevOps" | jq

# Filter by tags
curl "http://localhost:4000/api/sessions?tags=DevOps,CI/CD" | jq

# Filter by visibility
curl "http://localhost:4000/api/sessions?visibility=public" | jq

# Date range (adjust dates as needed)
curl "http://localhost:4000/api/sessions?from=2024-01-01&to=2024-12-31" | jq
```

**Expected:** Filtered results based on query parameters

---

### 9.4 Get Single Session
```bash
# Get session ID first
SESSION_ID=$(curl -s http://localhost:4000/api/sessions | jq -r '.[0].id')

# Get session details
curl "http://localhost:4000/api/sessions/$SESSION_ID" | jq
```

**Expected:** Full session object with invited experts

---

### 9.5 Get All Experts
```bash
curl http://localhost:4000/api/experts | jq
```

**Expected:** JSON array of 4 experts

---

### 9.6 Test Security Headers
```bash
curl -I http://localhost:4000/api/sessions
```

**Expected Headers:**
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

### 9.7 Test Rate Limiting
```bash
# Make 15 rapid requests
for i in {1..15}; do
  curl -s -o /dev/null -w "Request $i: %{http_code}\n" http://localhost:4000/auth/status
done
```

**Expected:**
- First 10 requests: `200`
- Requests 11-15: `429` (Too Many Requests)

---

### 9.8 Test UUID Validation
```bash
# Invalid UUID format
curl http://localhost:4000/api/sessions/invalid-id
```

**Expected:**
```json
{"message":"Invalid id format","url":"/api/sessions/invalid-id","method":"GET","statusCode":400}
```

---

## Step 10: Database Inspection

### 10.1 View Data in Database
```bash
psql knowledge_platform

# List all tables
\dt

# Count records
SELECT 'Users' as table, COUNT(*) FROM "User"
UNION ALL SELECT 'Experts', COUNT(*) FROM "Expert"
UNION ALL SELECT 'Sessions', COUNT(*) FROM "Session"
UNION ALL SELECT 'Invites', COUNT(*) FROM "SessionInvite"
UNION ALL SELECT 'Feedback', COUNT(*) FROM "SessionFeedback";

# View users and roles
SELECT "displayName", email, roles FROM "User";

# View sessions
SELECT title, "scheduledAt", visibility FROM "Session";

# Exit
\q
```

**Expected Counts:**
- Users: 3
- Experts: 4
- Sessions: 3
- Invites: 3
- Feedback: 3

---

### 10.2 Prisma Studio (GUI)
```bash
cd backend
npx prisma studio
```

**What happens:**
- Opens browser at `http://localhost:5555`
- Provides visual interface to browse/edit data

---

## Step 11: Run Full Test Suite

```bash
cd /Users/pradeepdahiya/Documents/knowledge-platform/backend

# Run all tests with coverage
DATABASE_URL="postgresql://$(whoami)@localhost:5432/knowledge_platform_test" npm test
```

**Expected Results:**
```
✓ tests/app.test.ts (2 tests) 
  ✓ health endpoint responds
  ✓ sessions CRUD works

✓ tests/rbac.test.ts (10 tests)
  ✓ User Management (3)
  ✓ Session Management (2)
  ✓ Feedback Management (2)
  ✓ Security Features (3)

Test Files  2 passed (2)
Tests  12 passed (12)
Duration  ~500ms
```

---

## Troubleshooting

### Backend won't start
```bash
# Check if port 4000 is in use
lsof -ti:4000

# Kill process using port 4000
lsof -ti:4000 | xargs kill -9

# Restart backend
cd backend && npm run dev
```

---

### Frontend won't start
```bash
# Check if port 3000 is in use
lsof -ti:3000

# Kill process
lsof -ti:3000 | xargs kill -9

# Restart frontend
cd frontend && npm run dev
```

---

### Database connection errors
```bash
# Check PostgreSQL is running
brew services list | grep postgresql

# Restart PostgreSQL
brew services restart postgresql@14

# Verify connection
psql -U $(whoami) -d knowledge_platform -c "SELECT 1"
```

---

### Prisma errors
```bash
cd backend

# Regenerate client
npx prisma generate

# Reset database
npx prisma migrate reset --force

# Seed again
npm run prisma:seed
```

---

### Tests failing
```bash
cd backend

# Clean test database
DATABASE_URL="postgresql://$(whoami)@localhost:5432/knowledge_platform_test" npx prisma migrate reset --force

# Run migrations
DATABASE_URL="postgresql://$(whoami)@localhost:5432/knowledge_platform_test" npx prisma migrate deploy

# Run tests
DATABASE_URL="postgresql://$(whoami)@localhost:5432/knowledge_platform_test" npm test
```

---

## Success Criteria Checklist

- [ ] PostgreSQL running
- [ ] Backend running on port 4000
- [ ] Frontend running on port 3000
- [ ] All 12 tests passing
- [ ] Home page loads
- [ ] Sessions page shows 3 sessions
- [ ] Session detail page loads
- [ ] Experts page shows 4 experts
- [ ] Admin page loads (with AUTH_DISABLED=true)
- [ ] Can create new session via form
- [ ] Feedback form works
- [ ] API responds to curl requests
- [ ] Search filtering works
- [ ] Rate limiting triggers at 11th request
- [ ] Database has seed data

---

## Quick Reset (Start Fresh)

```bash
cd /Users/pradeepdahiya/Documents/knowledge-platform

# Stop all servers (Ctrl+C in each terminal)

# Reset databases
dropdb knowledge_platform && createdb knowledge_platform
dropdb knowledge_platform_test && createdb knowledge_platform_test

# Backend setup
cd backend
npx prisma migrate deploy
npx prisma generate
npm run prisma:seed

# Run tests
DATABASE_URL="postgresql://$(whoami)@localhost:5432/knowledge_platform_test" npx prisma migrate deploy
DATABASE_URL="postgresql://$(whoami)@localhost:5432/knowledge_platform_test" npm test

# Start backend (terminal 1)
npm run dev

# Start frontend (terminal 2)
cd ../frontend
npm run dev

# Open browser
open http://localhost:3000
```

---

## Environment Variables Reference

### Backend (.env)
```env
PORT=4000
DATABASE_URL="postgresql://$(whoami)@localhost:5432/knowledge_platform"
SESSION_SECRET="your-secret-key-here"
FRONTEND_ORIGIN="http://localhost:3000"
AUTH_DISABLED="true"  # Only for local testing
```

### Frontend (.env.local) - Optional
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

**Testing Time:** ~10-15 minutes for full walkthrough
**Setup Time:** ~5 minutes for quick start

Happy testing! 🚀
