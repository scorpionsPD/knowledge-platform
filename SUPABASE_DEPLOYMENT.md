# Supabase + Vercel Deployment Guide (100% Free Forever)

## Why Supabase?
- ✅ **Free forever** (500MB database, 2GB bandwidth)
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

## Part 2: Deploy Backend to Vercel (10 minutes)

Vercel can host both frontend AND backend (as API routes)!

### Option A: Move Backend to Vercel Serverless Functions

We'll create a single Vercel deployment with both:
- Frontend: `/` 
- Backend API: `/api/*`

**Quick setup:**

1. Create `api` folder in root:
   ```bash
   cd /Users/pradeepdahiya/Documents/knowledge-platform
   mkdir -p api
   ```

2. The backend will be deployed as serverless functions

3. Update `vercel.json` to handle both frontend and API

### Option B: Keep Backend Separate on Railway (Simpler)

Use Railway's free trial for backend, Supabase for database only.

**We'll go with Option B for simplicity.**

---

## Part 3: Deploy Backend to Railway (Free Trial)

### Step 1: Sign Up for Railway

1. Go to https://railway.app
2. Click "Login" → "Login with GitHub"
3. Authorize Railway

### Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `scorpionsPD/knowledge-platform`
4. Railway will detect your repo

### Step 3: Configure Backend Service

1. Click "Add variables" or go to "Variables" tab
2. Add environment variables:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
   SESSION_SECRET=your-random-secret-key-here
   FRONTEND_ORIGIN=https://your-app.vercel.app
   NODE_ENV=production
   PORT=4000
   ```

3. Set **Root Directory**:
   - Go to Settings → "Root Directory"
   - Enter: `backend`
   - Save

4. Set **Start Command**:
   - Go to Settings → "Deploy"
   - Start Command: `npm start`
   - Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
   - Save

### Step 4: Generate SESSION_SECRET

Run this in terminal:
```bash
openssl rand -base64 32
```

Copy the output and use it as `SESSION_SECRET` value in Railway.

### Step 5: Deploy

1. Click "Deploy"
2. Wait 3-5 minutes for build
3. Once done, click on your service
4. Go to "Settings" → "Networking" → "Generate Domain"
5. Copy your Railway URL (e.g., `https://knowledge-platform-production.up.railway.app`)

### Step 6: Update CORS

The backend will automatically use `FRONTEND_ORIGIN` for CORS.

---

## Part 4: Connect Frontend to Backend

### Step 1: Update Vercel Environment Variables

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app
   ```
4. Click "Save"

### Step 2: Update Railway FRONTEND_ORIGIN

1. Go back to Railway
2. Update `FRONTEND_ORIGIN` variable to your actual Vercel URL
3. Redeploy (Railway auto-redeploys on variable change)

### Step 3: Redeploy Frontend

1. In Vercel, go to "Deployments"
2. Click "..." on latest deployment → "Redeploy"
3. Check "Use existing Build Cache" → Redeploy

---

## Part 5: Test Your Deployment

### Test Endpoints

1. **Backend Health Check**:
   ```
   https://your-railway-url.up.railway.app/api/health
   ```
   Should return: `{"status":"ok"}`

2. **Get Sessions**:
   ```
   https://your-railway-url.up.railway.app/api/sessions
   ```
   Should return JSON array

3. **Frontend**:
   ```
   https://your-app.vercel.app
   ```
   Should show your app with data!

---

## Part 6: Add Sample Data (Optional)

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
- ✅ Frontend: Vercel (free forever)
- ✅ Database: Supabase PostgreSQL (free forever)
- ✅ Backend: Railway ($5 free credit, then ~$5/month)

**Cost breakdown:**
- Months 1-2: **$0** (Railway free trial)
- After trial: **~$5/month** (Railway only)
- Supabase + Vercel: **$0 forever**

**Alternative 100% Free Option:**
After Railway trial ends, you can:
1. Move backend to Vercel Serverless Functions (free)
2. Or use Render free tier (with cold starts)
3. Or keep Railway if you want to pay $5/month for better performance

---

## Environment Variables Checklist

### Railway (Backend)
- [ ] `DATABASE_URL` - From Supabase
- [ ] `SESSION_SECRET` - Generate with `openssl rand -base64 32`
- [ ] `FRONTEND_ORIGIN` - Your Vercel URL
- [ ] `NODE_ENV=production`
- [ ] `PORT=4000`

### Vercel (Frontend)
- [ ] `NEXT_PUBLIC_API_URL` - Your Railway URL

### Supabase (Database)
- [ ] Tables created via Prisma migrations
- [ ] Connection string saved securely

---

## Troubleshooting

### "Failed to fetch sessions"
- Check `NEXT_PUBLIC_API_URL` is set in Vercel
- Verify Railway backend is running (check logs)
- Test backend URL directly in browser

### "Database connection error"
- Verify `DATABASE_URL` has correct password
- Check Supabase project is active
- Ensure migrations ran: `npx prisma migrate deploy`

### "CORS error"
- Update `FRONTEND_ORIGIN` in Railway to exact Vercel URL
- No trailing slash in URL
- Redeploy Railway after changing

### Backend not starting on Railway
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
- Backend: `https://your-railway-url.up.railway.app`
- Database: Managed by Supabase

You now have a production-ready, mostly-free platform that will impress visa assessors! 🚀
