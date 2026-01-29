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

**Note**: You'll need to deploy your backend first (see Backend Deployment below), then come back and update this variable.

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

### Option A: Railway.app (Recommended - 15 min)

1. **Sign up**: https://railway.app
2. **New Project** → "Deploy from GitHub repo"
3. **Select**: `scorpionsPD/knowledge-platform`
4. **Root Directory**: `backend`
5. **Add PostgreSQL**: Click "New" → "Database" → "PostgreSQL"
6. **Environment Variables**:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   SESSION_SECRET=your-random-secret-key-here
   FRONTEND_ORIGIN=https://knowledge-platform-xyz.vercel.app
   NODE_ENV=production
   ```
7. **Deploy**: Railway auto-deploys on push
8. **Copy URL**: `https://your-app.up.railway.app`
9. **Update Vercel**: Go back to Vercel → Settings → Environment Variables
   - Update `NEXT_PUBLIC_API_URL` to your Railway backend URL
   - Redeploy frontend

### Option B: Render.com (Free Tier - 20 min)

1. **Sign up**: https://render.com
2. **New** → "Web Service"
3. **Connect GitHub** → Select your repo
4. **Settings**:
   - Name: `knowledge-platform-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
   - Start Command: `npm start`
5. **Add PostgreSQL**:
   - New → "PostgreSQL"
   - Copy Database URL
6. **Environment Variables**:
   ```
   DATABASE_URL=your-postgres-url
   SESSION_SECRET=generate-random-string
   FRONTEND_ORIGIN=https://knowledge-platform-xyz.vercel.app
   NODE_ENV=production
   ```
7. **Deploy**: Takes 5-10 minutes
8. **Update Vercel** with backend URL

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

Both Vercel and Railway auto-deploy when you push to `main`:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

✅ Vercel rebuilds frontend automatically  
✅ Railway/Render rebuilds backend automatically

---

## Cost Estimate

- **Vercel**: Free (100GB bandwidth, unlimited builds)
- **Railway**: Free tier ($5 credit/month, ~500 hours)
- **Render**: Free (spins down after 15min inactivity)
- **Heroku**: $7/month for PostgreSQL, $5/month for web dyno

**Recommended for portfolio**: Vercel (free) + Railway (free tier)

---

## Next: Set Default Branch on GitHub

To make `main` the default branch:

1. Go to: https://github.com/scorpionsPD/knowledge-platform/settings/branches
2. Under "Default branch", click the pencil icon
3. Select `main` from dropdown
4. Click "Update"
5. Confirm the change

This ensures anyone visiting your repo sees the clean history first!
