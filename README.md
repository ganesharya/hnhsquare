# HNHSquare - Interior Design Platform

## Informational Catalogue + VR Walkthrough + AI Design Studio

### What's Included
- Flask Python backend with SQLite database
- Full SEO-optimized frontend (7 pages)
- Admin Panel with authentication
- Editable site content from admin
- 6 Sample VR Design Houses pre-loaded
- 20 Sample Products pre-loaded
- AI-powered design studio with instant customization
- VR walkthrough with AI color palettes
- Contact & Design request tracking
- REST API for all data

### Pages
- **Home** (`/`) — Animated hero, features, categories, VR preview, testimonials
- **Catalogue** (`/catalogue`) — Full elaborated product catalogue with specs, materials, features
- **Products** (`/products`) — Filterable product grid (category, material)
- **VR Walkthrough** (`/vr-walkthrough`) — 3D room explorer with AI color palettes, custom color picker, furniture toggle, lighting moods
- **AI Design Studio** (`/design-studio`) — Step-by-step design generator with instant wall/floor/lighting/furniture customization
- **About** (`/about`) — Editable story, mission, team
- **Contact** (`/contact`) — Editable contact info, inquiry form
- **Enscape Viewer** (`/enscape-viewer`) — 3D architectural walkthrough viewer

### Quick Start (Local)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the server
python app.py

# 3. Open browser
Frontend:  http://localhost:5000/
Admin:     http://localhost:5000/admin/login
```

### Default Credentials
- **Admin:** admin@hnhsquare.com / admin123

### Admin Features
- **Dashboard** — Overview of products, users, contacts, design requests
- **Products** — Add/edit/delete products (name, category, material, dimensions, finish, description, features)
- **Site Content** — Edit any text on the website (hero title, about story, contact info, etc.)
- **VR Houses** — Manage VR walkthrough houses
- **Contacts** — View and manage inquiries
- **Design Requests** — View AI design consultation requests

### Database Tables
- users, products, contacts, design_requests, vr_houses, vr_rooms, site_content

### API Endpoints
- GET /api/products
- GET /api/product/<id>
- GET /api/vr-houses
- GET /api/vr-house/<id>
- GET /api/content/<key>
- POST /register, /login, /contact, /design-request

---

## Deployment

### Railway + GoDaddy (hnhsquare.com)

See the full **[DEPLOY.md](DEPLOY.md)** guide for step-by-step instructions.

**Quick Overview:**
1. Push code to GitHub
2. Create Railway project from GitHub repo
3. Set environment variables (`SECRET_KEY`, `PORT`, `DATABASE`)
4. Deploy (Railway auto-builds using `Procfile` and `railway.toml`)
5. Add custom domain `hnhsquare.com` in Railway settings
6. Configure GoDaddy DNS (A record + CNAME)
7. Railway auto-provisions SSL certificate

**Production Files:**
- `Procfile` — Gunicorn web server command
- `railway.toml` — Railway build/start configuration
- `requirements.txt` — Includes `gunicorn` and `psycopg2-binary`
- `app.py` — Production-ready (reads `PORT` from env, `debug=False`)

### Database Persistence Warning
Railway uses ephemeral storage by default. SQLite data will reset on full redeploy.

**Recommended:** Set up a Railway Volume or migrate to PostgreSQL for production.
See [DEPLOY.md](DEPLOY.md) for detailed instructions.

---

## Security
- Change `SECRET_KEY` environment variable in production (do NOT use default)
- Replace default admin password immediately after first login
- Railway auto-provides HTTPS once custom domain is connected
# Deployment trigger
