# 🚀 SETUP GUIDE - AI Commerce Platform

Complete guide to set up your development environment.

---

## ⚡ Quick Start (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/yourusername/ai-commerce.git
cd ai-commerce

# 2. Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh

# 3. Start development server
npm run dev

# 4. Open browser
# http://localhost:3000
```

---

## 📋 Prerequisites

### Required

- ✅ **Node.js 18+** - [Download](https://nodejs.org/)
- ✅ **npm or yarn** - Comes with Node.js
- ✅ **Git** - [Download](https://git-scm.com/)

### Accounts Needed

- ✅ **Supabase** - [Sign up](https://supabase.com) (Free tier OK)
- ✅ **Anthropic** - [Get API key](https://console.anthropic.com) ($5 credit free)
- ⚠️ **Stripe** - Optional, for payments
- ⚠️ **Resend** - Optional, for emails

---

## 🔧 Step-by-Step Setup

### Step 1: Clone Repository

```bash
# HTTPS
git clone https://github.com/yourusername/ai-commerce.git

# OR SSH
git clone git@github.com:yourusername/ai-commerce.git

cd ai-commerce
```

### Step 2: Install Dependencies

```bash
# Using npm
npm install

# OR using yarn
yarn install

# OR using pnpm
pnpm install
```

**Expected output:**
```
added 342 packages in 45s
```

### Step 3: Environment Variables

```bash
# Copy example file
cp .env.example .env.local

# Edit with your credentials
code .env.local  # Or use any editor
```

**Fill in these required values:**

```bash
# === REQUIRED ===

# Supabase (Get from: https://supabase.com/dashboard/project/_/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Anthropic AI (Get from: https://console.anthropic.com/settings/keys)
ANTHROPIC_API_KEY=sk-ant-api03-...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# === OPTIONAL ===

# Stripe (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
```

### Step 4: Database Setup

#### 4.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in:
   - Name: `ai-commerce-dev`
   - Database Password: *(save this!)*
   - Region: `Singapore` (closest to Vietnam)
4. Click **"Create new project"**
5. Wait ~2 minutes for provisioning

#### 4.2 Get Connection Details

1. In Supabase dashboard, go to **Settings → API**
2. Copy these values:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`
3. Paste into `.env.local`

#### 4.3 Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy content from `migrations/001_initial_schema.sql`
4. Paste and click **"Run"**
5. Should see: `Success. No rows returned`

#### 4.4 Seed Test Data (Optional)

1. In SQL Editor, click **"New query"**
2. Copy content from `scripts/seed.sql`
3. Paste and click **"Run"**
4. Should see: `Success. Rows affected: X`

**Test credentials:**
- Email: `demo@aicommerce.vn`
- You'll need to set password via Supabase auth

### Step 5: Verify Setup

```bash
# Run type check
npm run type-check

# Expected: No errors

# Run linter
npm run lint

# Expected: No errors or warnings
```

### Step 6: Start Development Server

```bash
npm run dev
```

**Expected output:**
```
  ▲ Next.js 14.1.0
  - Local:        http://localhost:3000
  - Network:      http://192.168.1.x:3000

 ✓ Ready in 2.3s
```

### Step 7: Test in Browser

Open: http://localhost:3000

**Test checklist:**
- [ ] Landing page loads
- [ ] Can click "Sign Up"
- [ ] Can create account
- [ ] Redirects to dashboard
- [ ] Can add product URL
- [ ] Product appears in list
- [ ] AI insights generate

---

## 🧪 Testing Setup

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
# Install Playwright
npx playwright install

# Run E2E tests
npm run test:e2e
```

---

## 🐛 Troubleshooting

### Issue: "Module not found"

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### Issue: "Supabase connection failed"

1. Check `.env.local` has correct values
2. Verify Supabase project is active
3. Check database schema is created
4. Test connection in Supabase dashboard

### Issue: "Anthropic API error"

1. Verify API key in `.env.local`
2. Check you have credits: https://console.anthropic.com/settings/billing
3. Try making a test request in Anthropic console

### Issue: Port 3000 already in use

```bash
# Use different port
PORT=3001 npm run dev

# OR kill process on port 3000
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: Build fails

```bash
# Check Node.js version
node -v  # Should be 18+

# Update Next.js
npm install next@latest react@latest react-dom@latest

# Clear build cache
rm -rf .next
npm run build
```

---

## 🔑 Getting API Keys

### Anthropic (Claude AI)

1. Go to https://console.anthropic.com
2. Sign up (Google/GitHub)
3. Settings → API Keys
4. Click "Create Key"
5. Copy key (starts with `sk-ant-api03-`)
6. Paste into `.env.local`

**Free tier:** $5 credits  
**Pricing:** ~$3 per 1M input tokens

### Supabase

Already covered in Step 4 above.

**Free tier:**
- 500MB database
- 50K monthly active users
- 2GB bandwidth

### Stripe (Optional)

1. Go to https://stripe.com
2. Sign up
3. Get test keys from Dashboard
4. Use test keys (start with `pk_test_` and `sk_test_`)

**Free:** Test mode is always free

### Resend (Optional)

1. Go to https://resend.com
2. Sign up
3. API Keys → Create
4. Use in `.env.local`

**Free tier:** 100 emails/day

---

## 📁 Project Structure

```
ai-commerce/
├── app/              # Next.js pages & API
├── components/       # React components
├── lib/              # Utilities, helpers
│   ├── supabase/     # Database client
│   ├── ai/           # AI integration
│   ├── scraper/      # Web scraping
│   └── hooks/        # React hooks
├── public/           # Static files
├── docs/             # Documentation
└── scripts/          # Utility scripts
```

**Key files:**
- `app/layout.tsx` - Root layout
- `app/page.tsx` - Landing page
- `app/api/*/route.ts` - API endpoints
- `lib/supabase/client.ts` - Supabase setup
- `lib/ai/claude.ts` - AI integration

---

## 🔄 Development Workflow

### Daily Development

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Start dev server
npm run dev

# 4. Make changes

# 5. Test
npm run lint
npm run type-check
npm run test

# 6. Commit
git add .
git commit -m "feat: your feature"
git push origin your-branch
```

### Before Committing

```bash
# Format code
npm run format

# Run all checks
npm run lint && npm run type-check && npm run test

# Build to verify
npm run build
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production
vercel --prod
```

**Or use GitHub integration:**
1. Push to GitHub
2. Import in Vercel dashboard
3. Auto-deploys on push

### Environment Variables

Add these in Vercel dashboard:
- All variables from `.env.local`
- Set `NODE_ENV=production`

---

## 📚 Next Steps

After setup, read:

1. **[API Documentation](API.md)** - Learn API endpoints
2. **[Database Schema](DATABASE.md)** - Understand data model
3. **[Contributing Guide](CONTRIBUTING.md)** - How to contribute

---

## 💬 Get Help

- **Issues:** https://github.com/yourusername/ai-commerce/issues
- **Discussions:** https://github.com/yourusername/ai-commerce/discussions
- **Email:** support@aicommerce.vn

---

## ✅ Setup Checklist

Copy this checklist to track your progress:

```
Setup Checklist:
[ ] Node.js 18+ installed
[ ] Repository cloned
[ ] Dependencies installed (npm install)
[ ] .env.local created and filled
[ ] Supabase project created
[ ] Database schema created
[ ] Seed data loaded (optional)
[ ] Anthropic API key added
[ ] Development server starts (npm run dev)
[ ] Landing page loads
[ ] Can create account
[ ] Can add product
[ ] AI insights generate
[ ] All tests pass
```

**Estimated setup time:** 20-30 minutes

---

**Ready to code? Start with:**
```bash
npm run dev
```

Happy building! 🎉