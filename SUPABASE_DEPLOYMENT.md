# Supabase + Vercel Deployment Guide (Free Tier Friendly)

## Why Supabase?
- ✅ Generous free tier (Postgres + dashboard)
- ✅ PostgreSQL included (no separate database setup)
- ✅ Auto-generated REST API
- ✅ No cold starts
- ✅ Built-in authentication
- ✅ No credit card required

---

## Part 1: Set Up Supabase Database (10 minutes)

### Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub
4. Create new organization (or use existing)

### Step 2: Create New Project

1. Click "New Project"
2. Fill in:
   - **Name**: `knowledge-platform`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to you (e.g., US West, EU West)
   - **Pricing Plan**: Free
3. Click "Create new project"
4. Wait 2-3 minutes for setup

### Step 3: Get Database Connection String

1. Go to **Project Settings** (gear icon) → **Database**
2. Scroll to "Connection string" → **URI**
3. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with your actual database password
5. Save this - you'll need it!

### Step 4: Run Database Migrations

1. Open your terminal
2. Update your local `.env` file:
   ```bash
   cd /Users/pradeepdahiya/Documents/knowledge-platform/backend
   echo "DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres" > .env
   ```

3. Run migrations:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

4. Verify in Supabase:
   - Go to **Table Editor** in Supabase dashboard
   - You should see: `User`, `Expert`, `Session`, `SessionFeedback`, `Report` tables

---

## Part 2: Deploy Backend to Render (Free Tier)

### Step 1: Sign Up for Render

1. Go to https://render.com
2. Click "Sign Up" → "Continue with GitHub"
3. Authorize Render

### Step 2: Create New Service

1. Click **New** → **Web Service**
2. Select `scorpionsPD/knowledge-platform`

### Step 3: Configure Backend Service

1. Set **Root Directory**: `backend`
2. Set **Build Command**:
   ```bash
   npm install && npm run prisma:generate && npm run build && npx prisma migrate deploy
   ```
3. Set **Start Command**:
   ```bash
   npm start
   ```
4. Add environment variables:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
   SESSION_SECRET=your-random-secret-key-here
   FRONTEND_ORIGIN=https://your-app.vercel.app
   NODE_ENV=production
   AUTH_DISABLED=true
   ```

### Step 4: Generate SESSION_SECRET

Run this in terminal:
```bash
openssl rand -base64 32
```

Copy the output and use it as `SESSION_SECRET` value in Render.

### Step 5: Deploy

1. Click "Deploy"
2. Wait 3-5 minutes for build
3. Copy your Render URL (e.g., `https://knowledge-platform-backend.onrender.com`)

---

## Part 3: Connect Frontend to Backend

### Step 1: Update Vercel Environment Variables

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```
4. Click "Save"

### Step 2: Update Render FRONTEND_ORIGIN

1. Go back to Render
2. Update `FRONTEND_ORIGIN` variable to your actual Vercel URL
3. Redeploy (Render auto-redeploys on variable change)

### Step 3: Redeploy Frontend

1. In Vercel, go to "Deployments"
2. Click "..." on latest deployment → "Redeploy"
3. Check "Use existing Build Cache" → Redeploy

---

## Part 4: Test Your Deployment

### Test Endpoints

1. **Backend Health Check**:
   ```
   https://your-backend.onrender.com/health
   ```
   Should return: `{"status":"ok"}`

2. **Get Sessions**:
   ```
   https://your-backend.onrender.com/api/sessions
   ```
   Should return JSON array

3. **Frontend**:
   ```
   https://your-app.vercel.app
   ```
   Should show your app with data!

---

## Part 5: Add Sample Data (Optional)

If tables are empty, add sample data via Supabase SQL Editor:

1. Go to Supabase → **SQL Editor**
2. Click "New query"
3. Run this:

```sql
-- Insert sample expert
INSERT INTO "Expert" (name, expertise, bio, "imageUrl", email, phone)
VALUES (
  'Dr. Sarah Johnson',
  'Machine Learning',
  'AI researcher with 10+ years experience in deep learning and neural networks.',
  'https://i.pravatar.cc/300?img=1',
  'sarah@example.com',
  '+1-555-0100'
);

-- Insert sample session
INSERT INTO "Session" (
  title,
  description,
  date,
  location,
  "maxAttendees",
  "registeredCount",
  status,
  "expertId"
)
VALUES (
  'Introduction to Machine Learning',
  'Learn the fundamentals of ML and build your first model.',
  NOW() + INTERVAL '7 days',
  'Virtual',
  50,
  12,
  'SCHEDULED',
  (SELECT id FROM "Expert" LIMIT 1)
);
```

4. Click "Run"
5. Refresh your frontend - you should see data!

---

## Summary

**What you have now:**
- ✅ Frontend: Vercel (free tier)
- ✅ Database: Supabase PostgreSQL (free tier)
- ✅ Backend: Render (free tier, sleeps when idle)

**Cost notes:**
- Vercel + Supabase are free tier friendly
- Render free tier sleeps after inactivity (expected for demo use)

---

## Environment Variables Checklist

### Render (Backend)
- [ ] `DATABASE_URL` - From Supabase
- [ ] `SESSION_SECRET` - Generate with `openssl rand -base64 32`
- [ ] `FRONTEND_ORIGIN` - Your Vercel URL
- [ ] `NODE_ENV=production`
- [ ] `AUTH_DISABLED=true` (optional for demo)

### Vercel (Frontend)
- [ ] `NEXT_PUBLIC_API_URL` - Your Render URL

### Supabase (Database)
- [ ] Tables created via Prisma migrations
- [ ] Connection string saved securely

---

## Troubleshooting

### "Failed to fetch sessions"
- Check `NEXT_PUBLIC_API_URL` is set in Vercel
- Verify Render backend is running (check logs)
- Test backend URL directly in browser

### "Database connection error"
- Verify `DATABASE_URL` has correct password
- Check Supabase project is active
- Ensure migrations ran: `npx prisma migrate deploy`

### "CORS error"
- Update `FRONTEND_ORIGIN` in Render to exact Vercel URL
- No trailing slash in URL
- Redeploy Render after changing

### Backend not starting on Render
- Check build logs for errors
- Verify Root Directory is set to `backend`
- Ensure `package.json` has `"start": "node dist/index.js"`

---

## Next Steps

1. ✅ Test all features on production
2. ✅ Add your production URLs to README.md
3. ✅ Take screenshots for visa evidence
4. ✅ Monitor Supabase free tier usage (should be well under limits)

**Your live URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`
- Database: Managed by Supabase
 
You now have a production-ready, mostly-free platform that is easy to demo.
