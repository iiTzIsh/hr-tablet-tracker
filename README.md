# HR Tablet Tracker

A web-based system to track tablet and pen usage in the HR Department using QR codes.

**Features:**
- 📱 QR code scanning — scan tablet QR to check out / return in seconds
- 📊 Live dashboard — see all tablet availability at a glance
- 👤 Phone recognition — remembers who you are after first-time setup
- 🔐 Admin panel — manage members, generate QR codes, view activity logs
- ☁️ Cloud-hosted — works from any device with a browser

---

## 🚀 Setup Guide (Step-by-Step)

### Step 1: Create a Supabase Account (Free Database)

1. Go to [supabase.com](https://supabase.com) and click **"Start your project"**
2. Sign up with GitHub (recommended) or email
3. Click **"New Project"**
   - Name: `hr-tablet-tracker`
   - Database Password: (save this somewhere safe)
   - Region: Choose closest to you
4. Wait for the project to be created (~2 minutes)

### Step 2: Set Up the Database

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy and paste the ENTIRE contents of `supabase-setup.sql` file
4. Click **"Run"** (or press Ctrl+Enter)
5. You should see "Success" — all tables are created!

### Step 3: Get Your Supabase Keys

1. In Supabase, go to **Settings → API** (left sidebar)
2. Copy these values:
   - **Project URL** → looks like: `https://abcdefg.supabase.co`
   - **anon public key** → a long string starting with `eyJ...`

### Step 4: Create a GitHub Account (if you don't have one)

1. Go to [github.com](https://github.com) and sign up
2. Create a **new repository** named `hr-tablet-tracker`
3. Push this project code to that repository:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/hr-tablet-tracker.git
git push -u origin main
```

### Step 5: Deploy to Vercel (Free Hosting)

1. Go to [vercel.com](https://vercel.com) and sign up with **GitHub**
2. Click **"Add New → Project"**
3. Import your `hr-tablet-tracker` repository
4. Before clicking "Deploy", add **Environment Variables**:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `ADMIN_PASSWORD` | Choose a strong password (e.g., `HRAdmin@2026`) |
| `JWT_SECRET` | A random 32+ character string (e.g., `my-super-secret-key-change-this-now-123`) |
| `NEXT_PUBLIC_APP_URL` | Leave blank for now (fill after deploy) |

5. Click **"Deploy"** — wait ~2 minutes
6. You'll get a URL like: `https://hr-tablet-tracker.vercel.app`
7. Go back to **Vercel → Settings → Environment Variables**
8. Set `NEXT_PUBLIC_APP_URL` = your Vercel URL (e.g., `https://hr-tablet-tracker.vercel.app`)
9. **Redeploy**: Vercel → Deployments → three dots → Redeploy

### Step 6: Initial Admin Setup

1. Open `https://your-app.vercel.app/admin/login`
2. Enter the admin password you set in Step 5
3. Go to **Members** → Update the 12 default members with real names, employee IDs, and PINs
4. Go to **QR Codes** → Click **"Print All QR Codes"**
5. Cut out and stick each QR code on the matching tablet

### Step 7: Done! 🎉

Members can now scan QR codes with their phone to check out and return tablets!

---

## 📱 How Members Use It

### First Time (One-time setup ~15 seconds):
1. Scan any tablet QR code with phone camera
2. Select your name from dropdown
3. Enter your PIN (given by admin)
4. Phone remembers you — no need to do this again!

### Every Day After (~3 seconds):
1. Scan tablet QR code
2. Tap "TAKE IT" or "RETURN IT"
3. Done!

---

## 🔧 Local Development

To run locally for testing:

```bash
# 1. Clone the repo
git clone https://github.com/YOUR-USERNAME/hr-tablet-tracker.git
cd hr-tablet-tracker

# 2. Install dependencies
npm install

# 3. Create .env.local file (copy from example)
cp .env.local.example .env.local

# 4. Edit .env.local with your Supabase credentials

# 5. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
├── app/
│   ├── page.js                  → Public dashboard
│   ├── layout.js                → Root layout
│   ├── globals.css              → Styles
│   ├── tablet/[id]/page.js      → QR scan page (mobile)
│   ├── admin/
│   │   ├── login/page.js        → Admin login
│   │   ├── layout.js            → Admin sidebar
│   │   ├── page.js              → Admin overview
│   │   ├── members/page.js      → Manage members
│   │   ├── qrcodes/page.js      → QR code generator
│   │   └── logs/page.js         → Activity log
│   └── api/
│       ├── tablets/route.js     → Get tablets
│       ├── checkout/route.js    → Take/return tablet
│       ├── members/route.js     → CRUD members (admin)
│       ├── members/active/      → Get active members (public)
│       ├── logs/route.js        → Activity logs (admin)
│       └── auth/                → Login, logout, PIN verify
├── lib/
│   ├── supabase.js              → Database connection
│   └── auth.js                  → JWT authentication
├── middleware.js                 → Admin route protection
├── supabase-setup.sql           → Database schema
└── package.json
```

---

## 🔒 Security

- Admin routes protected by JWT cookie + middleware
- Member identification via PIN + device (localStorage)
- API routes have role-based access control
- Supabase Row Level Security enabled

---

## 💰 Cost

**Completely FREE** for your use case:

| Service | Free Limit | Your Usage |
|---|---|---|
| Vercel | 100GB bandwidth/month | ~0.1GB |
| Supabase | 500MB database | ~1MB |
| Supabase | 50K monthly auth users | 12 users |
