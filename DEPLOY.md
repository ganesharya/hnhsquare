# HNHSquare Deployment Guide

Deploy HNHSquare to **Railway** with custom domain **hnhsquare.com** from GoDaddy.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Push to GitHub](#push-to-github)
3. [Create Railway Project](#create-railway-project)
4. [Set Environment Variables](#set-environment-variables)
5. [Deploy](#deploy)
6. [Connect Custom Domain (GoDaddy)](#connect-custom-domain-godaddy)
7. [Enable HTTPS (SSL)](#enable-https-ssl)
8. [Database Persistence Warning](#database-persistence-warning)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- GitHub account
- Railway account (free tier available at https://railway.app)
- GoDaddy account with **hnhsquare.com** purchased
- Git installed locally

---

## Push to GitHub

### 1. Create a new repository on GitHub
- Go to https://github.com/new
- Name: `hnhsquare`
- Visibility: Public or Private
- Do NOT initialize with README (we already have one)

### 2. Push your local code

```bash
cd hnhsquare-fullstack

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - HNHSquare ready for Railway deploy"

# Connect to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/hnhsquare.git

# Push
git branch -M main
git push -u origin main
```

---

## Create Railway Project

### 1. Log in to Railway
- Go to https://railway.app and log in
- Click **"New Project"**
- Choose **"Deploy from GitHub repo"**

### 2. Connect GitHub Repository
- Find and select your `hnhsquare` repository
- Railway will auto-detect the project type (Python)
- Click **"Deploy"**

### 3. Verify Build & Start Commands
Railway should auto-detect from your project files, but verify:

| File | Purpose |
|------|---------|
| `requirements.txt` | Installs Flask, Gunicorn, etc. |
| `Procfile` | Tells Railway to use Gunicorn |
| `railway.toml` | Railway-specific build/start config |

If Railway doesn't auto-detect, manually set:
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 60`

---

## Set Environment Variables

In Railway Dashboard:
1. Go to your project → Variables tab
2. Add these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `SECRET_KEY` | `your-very-random-secret-key-here-2026` | Flask session encryption key |
| `PORT` | `5000` | Port (Railway auto-overrides with `$PORT`) |
| `DATABASE` | `hnhsquare.db` | SQLite database file path |

**IMPORTANT:** Generate a strong random `SECRET_KEY`. You can use:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

3. Click **"Deploy"** again to apply changes

---

## Deploy

Railway will automatically build and deploy. Wait for the deployment to finish (usually 1-2 minutes).

### Check Deployment Status
- Go to **Deployments** tab in Railway
- Look for green checkmark = success
- Click the deployment URL (looks like `https://hnhsquare-production.up.railway.app`)

### Verify It's Working
Open the Railway URL in browser. You should see the HNHSquare homepage.

---

## Connect Custom Domain (GoDaddy)

### Step 1: Add Domain in Railway
1. In Railway Dashboard → go to **Settings** tab
2. Scroll to **Domains**
3. Click **"Generate Domain"** or **"Custom Domain"**
4. Enter: `hnhsquare.com`
5. Railway will show you DNS records to add

Railway will provide:
- **A Record:** Points your root domain (`hnhsquare.com`) to Railway's IP
- **CNAME Record:** Points `www.hnhsquare.com` to Railway

### Step 2: Configure GoDaddy DNS
1. Log in to https://dcc.godaddy.com (GoDaddy Domain Control Center)
2. Find **hnhsquare.com** → click **DNS**
3. You are now in the **DNS Management** page

#### Add A Record
- Click **Add** under Records section
- Type: **A**
- Name: **@** (means root domain)
- Value: **Railway's IP address** (from Railway dashboard, e.g., `34.120.XX.XX`)
- TTL: **600 seconds** (10 minutes)
- Click **Save**

#### Add CNAME Record
- Click **Add**
- Type: **CNAME**
- Name: **www**
- Value: **Your Railway app domain** (e.g., `hnhsquare-production.up.railway.app`)
- TTL: **600 seconds**
- Click **Save**

#### (Optional) Delete old/conflicting records
- Remove any existing A records pointing to old IPs
- Remove any existing CNAME records for `www` that point elsewhere

### Step 3: Wait for DNS Propagation
- DNS changes can take **5 minutes to 48 hours** (usually within 1 hour)
- Check with: https://dnschecker.org
- Enter `hnhsquare.com` and select **A record**

### Step 4: Verify in Railway
1. Go back to Railway → Settings → Domains
2. Railway will automatically detect when DNS propagates
3. Status will change to **"Active"**

---

## Enable HTTPS (SSL)

Railway automatically provisions **free SSL certificates** via Let's Encrypt once your domain is connected.

### Steps:
1. Ensure your domain shows **Active** in Railway
2. Railway will auto-request SSL certificate
3. Within a few minutes, `https://hnhsquare.com` will work
4. Test: Open `https://hnhsquare.com` — you should see a lock icon

### Force HTTPS (Recommended)
Once SSL is active, you may want to redirect HTTP to HTTPS. Add this to `app.py` (inside `before_request` or middleware) if needed in the future.

For now, Railway handles this automatically.

---

## Database Persistence Warning

**CRITICAL:** Railway's default deployment uses ephemeral storage. This means:
- Your SQLite database (`hnhsquare.db`) will reset to defaults on every full redeploy
- Data (contacts, design requests, admin changes) will be lost

### Solutions:

#### Option A: Railway Volume (Recommended)
1. In Railway Dashboard → go to **Volumes**
2. Click **"New Volume"**
3. Mount path: `/app/data`
4. Update `DATABASE` env variable to: `/app/data/hnhsquare.db`
5. Redeploy

#### Option B: Migrate to PostgreSQL
1. Railway provides managed PostgreSQL
2. Add **New** → **Database** → **Add PostgreSQL**
3. Update `DATABASE` env variable to the PostgreSQL connection string
4. Update `app.py` database connection to use PostgreSQL instead of SQLite

#### Option C: Regular Backups
Export your SQLite database periodically:
```bash
# From Railway CLI or dashboard
railway run -- python -c "import shutil; shutil.copy('hnhsquare.db', 'backup.db')"
```

---

## Troubleshooting

### Build Fails
- Check `requirements.txt` has `gunicorn` listed
- Verify `Procfile` exists with: `web: gunicorn app:app --bind 0.0.0.0:$PORT`

### App Crashes on Start
- Check Railway **Logs** tab for errors
- Ensure `PORT` env var is being used (Railway sets `$PORT` automatically)
- Verify `app.py` uses `os.environ.get('PORT', 5000)`

### Domain Not Working
- Use https://dnschecker.org to verify DNS propagation
- Ensure no conflicting DNS records in GoDaddy
- Wait at least 30 minutes after DNS changes

### Database Reset After Deploy
- See [Database Persistence Warning](#database-persistence-warning) above
- Set up a Railway Volume for persistent storage

### Admin Password Reset
If you need to reset the admin password after a fresh deploy:
```bash
# Run in Railway (via CLI or SSH)
railway run -- python -c "
import sqlite3, hashlib
db = sqlite3.connect('hnhsquare.db')
pw = hashlib.sha256('admin123'.encode()).hexdigest()
db.execute('UPDATE users SET password=? WHERE email=?', (pw, 'admin@hnhsquare.com'))
db.commit()
print('Admin password reset to: admin123')
"
```

---

## Summary Checklist

- [ ] Code pushed to GitHub
- [ ] Railway project created from GitHub repo
- [ ] Environment variables set (`SECRET_KEY` is strong)
- [ ] App successfully deployed on Railway URL
- [ ] GoDaddy DNS: A record pointing to Railway IP
- [ ] GoDaddy DNS: CNAME record for www
- [ ] Domain shows Active in Railway
- [ ] HTTPS working with SSL certificate
- [ ] (Recommended) Railway Volume configured for database persistence

---

**Need help?**
- Railway Docs: https://docs.railway.app
- GoDaddy DNS Help: https://www.godaddy.com/help/dns-records-680
