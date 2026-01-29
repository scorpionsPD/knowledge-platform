# Vercel Deployment Guide

## Quick Deploy to Vercel (10 minutes)

### Prerequisites
- GitHub account with repository pushed
- Vercel account (free tier works)

---

## Step 1: Sign up for Vercel

1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account

---

## Step 2: Import Your Project

1. Click "Add New..." → "Project"
2. Find your repository: `scorpionsPD/knowledge-platform`
3. Click "Import"
4. Set **Production Branch** to `clean-main`

---

## Step 3: Configure Build Settings

**Framework Preset**: Next.js  
**Root Directory**: `frontend`  
**Build Command**: `npm run build`  
**Output Directory**: `.next`  
**Install Command**: `npm install`

### Environment Variables

Add these in the "Environment Variables" section:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

**Note**: You'll need to deploy your backend first (see Backend Deployment below), then come back and update this variable. Avoid referencing non-existent secrets (set the URL directly if needed).

---

## Step 4: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://knowledge-platform-xyz.vercel.app`

---

## Step 5: Set Up Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

---

## Backend Deployment Options

Since Vercel is primarily for frontend, you need to deploy your backend separately:

### Option A: Render.com (Free Tier - 20 min)

1. **Sign up**: https://render.com
2. **New** → "Web Service"
3. **Connect GitHub** → Select your repo
4. **Settings**:
   - Name: `knowledge-platform-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install && npm run prisma:generate && npm run build && npx prisma migrate deploy`
   - Start Command: `npm start`
5. **Add PostgreSQL**:
   - Use Supabase (recommended) or Render Postgres
   - Copy Database URL
6. **Environment Variables**:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
   SESSION_SECRET=your-random-secret-key-here
   FRONTEND_ORIGIN=https://knowledge-platform-xyz.vercel.app
   NODE_ENV=production
   AUTH_DISABLED=true
   ```
7. **Deploy**: Takes 5-10 minutes
8. **Copy URL**: `https://your-backend.onrender.com`
9. **Update Vercel**: Go back to Vercel → Settings → Environment Variables
   - Update `NEXT_PUBLIC_API_URL` to your Render backend URL
   - Redeploy frontend

### Option B: Railway.app (Alternate)

Use Railway if you already have credits. Setup is similar to Render:
- Root Directory: `backend`
- Build: `npm install && npm run prisma:generate && npm run build && npx prisma migrate deploy`
- Start: `npm start`
- Env vars: `DATABASE_URL`, `SESSION_SECRET`, `FRONTEND_ORIGIN`, `NODE_ENV`, `AUTH_DISABLED`

### Option C: Heroku (Classic - 25 min)

1. **Install Heroku CLI**: `brew install heroku/brew/heroku`
2. **Login**: `heroku login`
3. **Create app**: 
   ```bash
   cd backend
   heroku create knowledge-platform-api
   heroku addons:create heroku-postgresql:mini
   ```
4. **Set env vars**:
   ```bash
   heroku config:set SESSION_SECRET=$(openssl rand -base64 32)
   heroku config:set FRONTEND_ORIGIN=https://knowledge-platform-xyz.vercel.app
   heroku config:set NODE_ENV=production
   ```
5. **Deploy**:
   ```bash
   git subtree push --prefix backend heroku main
   ```
6. **Run migrations**:
   ```bash
   heroku run npx prisma migrate deploy
   heroku run npx prisma db seed
   ```

---

## Final Steps

### 1. Update CORS in Backend

In `backend/src/app.ts`, update:
```typescript
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'https://knowledge-platform-xyz.vercel.app';
```

### 2. Test Your Deployment

Visit your Vercel URL and test:
- ✅ Home page loads
- ✅ Sessions page shows data
- ✅ Expert directory works
- ✅ Can create sessions (if authenticated)

### 3. Update README

Add your live demo URL to README.md:
```markdown
## 🚀 Live Demo

**Frontend**: https://knowledge-platform-xyz.vercel.app
**Backend API**: https://your-backend-url.com/api
```

---

## Troubleshooting

### Frontend won't build
- Check build logs in Vercel dashboard
- Ensure `frontend` is set as root directory
- Verify all dependencies are in `package.json`

### API calls failing
- Check `NEXT_PUBLIC_API_URL` is set correctly
- Verify backend CORS allows your Vercel domain
- Check Network tab in browser DevTools

### Database connection errors
- Verify `DATABASE_URL` format is correct
- Check SSL mode: `?sslmode=require` at end of URL
- Ensure migrations ran: `npx prisma migrate deploy`

### Session/Auth not working
- Set `SESSION_SECRET` environment variable
- Check `FRONTEND_ORIGIN` matches your Vercel URL exactly
- Verify cookies are set to `secure: true` in production

---

## Environment Variables Checklist

### Vercel (Frontend)
- [ ] `NEXT_PUBLIC_API_URL`

### Backend (Railway/Render/Heroku)
- [ ] `DATABASE_URL`
- [ ] `SESSION_SECRET`
- [ ] `FRONTEND_ORIGIN`
- [ ] `NODE_ENV=production`

---

## Continuous Deployment

Both Vercel and Render auto-deploy when you push to `clean-main`:

```bash
git add .
git commit -m "Update feature"
git push origin clean-main
```

✅ Vercel rebuilds frontend automatically  
✅ Render rebuilds backend automatically

---

## Cost Estimate

- **Vercel**: Free (100GB bandwidth, unlimited builds)
- **Render**: Free (spins down after 15min inactivity)
- **Heroku**: $7/month for PostgreSQL, $5/month for web dyno

**Recommended for portfolio**: Vercel (free) + Render (free tier) + Supabase (free DB)
