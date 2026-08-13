from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify, Response
from functools import wraps
from datetime import datetime
import sqlite3
import hashlib
import os
import json
import base64
import mimetypes
from jinja2 import DictLoader

# Embedded assets - no external template/static folders needed
try:
    from embedded import TEMPLATES, STATIC_FILES
except ImportError:
    TEMPLATES = {}
    STATIC_FILES = {}

app = Flask(__name__)

# Setup Jinja2 with embedded templates
app.jinja_loader = DictLoader(TEMPLATES)
app.jinja_env.loader = app.jinja_loader

app.secret_key = os.environ.get('SECRET_KEY', 'hnhsquare-secret-key-2026-change-in-production')

DATABASE = os.environ.get('DATABASE', 'hnhsquare.db')

# ===================== DATABASE =====================
def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()

    # Users
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, phone TEXT,
            password TEXT NOT NULL, role TEXT DEFAULT 'customer',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Products (informational catalogue - no commerce)
    c.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL, category TEXT NOT NULL,
            material TEXT, dimensions TEXT, finish TEXT,
            description TEXT, features TEXT, emoji TEXT,
            rating REAL DEFAULT 4.5,
            active INTEGER DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Contacts
    c.execute("""
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
            email TEXT NOT NULL, phone TEXT, subject TEXT, message TEXT NOT NULL,
            status TEXT DEFAULT 'new', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Design requests
    c.execute("""
        CREATE TABLE IF NOT EXISTS design_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
            email TEXT NOT NULL, phone TEXT, room_type TEXT, room_size TEXT,
            style TEXT, budget TEXT, notes TEXT,
            status TEXT DEFAULT 'new', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # VR Design Houses
    c.execute("""
        CREATE TABLE IF NOT EXISTS vr_houses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            size_sqft INTEGER,
            rooms INTEGER,
            style TEXT,
            description TEXT,
            wall_color TEXT DEFAULT '#f5f0e8',
            floor_color TEXT DEFAULT '#c9a96e',
            furniture_json TEXT,
            active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # VR House Rooms
    c.execute("""
        CREATE TABLE IF NOT EXISTS vr_rooms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            house_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            room_type TEXT NOT NULL,
            size TEXT,
            wall_color TEXT DEFAULT '#f5f0e8',
            floor_color TEXT DEFAULT '#c9a96e',
            furniture_json TEXT,
            lighting TEXT DEFAULT 'Daylight',
            FOREIGN KEY (house_id) REFERENCES vr_houses(id)
        )
    """)

    # Editable Site Content
    c.execute("""
        CREATE TABLE IF NOT EXISTS site_content (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            title TEXT,
            content TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Insert default admin
    admin_pass = hashlib.sha256('admin123'.encode()).hexdigest()
    c.execute("INSERT OR IGNORE INTO users (id, name, email, password, role) VALUES (1, 'Admin', 'admin@hnhsquare.com', ?, 'admin')", (admin_pass,))

    # Sample products (informational - no prices)
    sample_products = [
        ('Royal Oak Main Door', 'doors', 'Solid Oak Wood', '84" x 36" x 2"', 'Natural Polish',
         'Premium solid oak main door with intricate hand-carved detailing. Features a robust mortise lock system and weather-resistant coating.',
         'Hand-carved,Weather-resistant,Mortise lock ready,Sound insulation',
         '🚪', 4.9),
        ('Brass Elite Handle Set', 'hardware', 'Antique Brass', '6" x 2.5"', 'Antique Finish',
         'Antique brass door handle set with a timeless design. Includes matching escutcheon plates and screws.',
         'Corrosion-resistant,Ergonomic grip,Easy installation,Lifetime warranty',
         '🔒', 4.8),
        ('Modular Kitchen Island', 'kitchen', 'Marine Plywood + Quartz', '72" x 36" x 36"', 'Gloss White',
         'Complete kitchen island with soft-close drawers, pull-out pantry, and integrated power outlets. Countertop in premium quartz.',
         'Soft-close drawers,Quartz countertop,Power integration,Water-resistant',
         '🍳', 4.9),
        ('Sliding Wardrobe System', 'wardrobe', 'Engineered Wood', '96" x 24" x 84"', 'Walnut Finish',
         'Full-height sliding wardrobe with mirror panels, LED internal lighting, and customizable shelf configurations.',
         'Mirror panels,LED lighting,Custom shelves,Soft-close sliders',
         '👔', 4.7),
        ('Glass Partition Door', 'doors', 'Tempered Glass + SS Frame', '84" x 36"', 'Clear Glass',
         'Tempered glass partition door with brushed stainless steel frame. Perfect for office and home dividers.',
         'Tempered safety glass,SS 304 frame,Noise reduction,Privacy options',
         '🪟', 4.6),
        ('Smart Digital Lock', 'hardware', 'Zinc Alloy', '7" x 3"', 'Matte Black',
         'Fingerprint + PIN + RFID + Key smart lock with auto-lock and break-in alarm. Mobile app connectivity.',
         'Fingerprint unlock,PIN access,Mobile app,Break-in alarm',
         '🔐', 4.9),
        ('Minimalist Coffee Table', 'furniture', 'Solid Teak', '48" x 24" x 16"', 'Natural Oil',
         'Scandinavian-inspired solid wood coffee table with tapered legs and a lower storage shelf.',
         'Solid teak,Tapered legs,Storage shelf,Scratch-resistant',
         '🪑', 4.5),
        ('Designer Ceiling Light', 'furniture', 'Metal + Acrylic', '24" diameter', 'Gold + White',
         'Modern LED chandelier with dimmable settings and remote control. Energy-efficient with warm-to-cool white range.',
         'Dimmable LED,Remote control,Energy efficient,3-color temp',
         '💡', 4.7),
        ('Teak Entry Door', 'doors', 'Burma Teak', '84" x 42" x 2.5"', 'Teak Oil',
         'Solid teak entry door with traditional panel design. Naturally resistant to termites and weather.',
         'Termite resistant,Weather proof,Traditional panel,Sound dampening',
         '🚪', 4.8),
        ('Chrome Pull Handle', 'hardware', 'SS 304', '12" x 1"', 'Mirror Chrome',
         'Premium chrome handle set for main doors. Corrosion-proof with a mirror-like finish.',
         'SS 304 grade,Mirror finish,Rust-proof,Heavy-duty',
         '🔧', 4.5),
        ('L-Shape Kitchen Unit', 'kitchen', 'BWP Plywood', '120" x 60" x 36"', 'Matte Grey',
         'Complete L-shape modular kitchen with chimney-ready hood, bottle pull-out, and corner carousel.',
         'Chimney ready,Bottle pull-out,Corner carousel,Dado tiling',
         '🍽️', 4.8),
        ('Walk-in Closet System', 'wardrobe', 'Melamine Board', 'Custom', 'White Oak',
         'Luxury walk-in closet with island dresser, tie rack, shoe carousel, and full-length mirror.',
         'Island dresser,Tie rack,Shoe carousel,Full mirror',
         '🧥', 4.9),
        ('French Glass Door', 'doors', 'Tempered Glass + Wood', '84" x 72"', 'White + Clear',
         'French style double glass door with wooden grid mullions. Ideal for patios and balconies.',
         'Double door,Tempered glass,Grid mullions,Weather strip',
         '🚪', 4.7),
        ('Mortise Lock Set', 'hardware', 'Brass + Steel', '6" x 3"', 'Satin Nickel',
         'Heavy-duty mortise lock set with 3 keys, cylinder guard, and anti-pick mechanism.',
         'Anti-pick,Cylinder guard,3 keys,Fire rated',
         '🔐', 4.6),
        ('U-Shape Kitchen', 'kitchen', 'HDHMR', '144" x 84" x 36"', 'Woodgrain',
         'Premium U-shape kitchen with breakfast counter, under-cabinet lighting, and pull-out pantry.',
         'Breakfast counter,Under-cabinet lights,Pull-out pantry,Soft-close',
         '🍳', 4.9),
        ('Hinged Wardrobe', 'wardrobe', 'Plywood + Veneer', '72" x 22" x 78"', 'Wenge',
         'Classic hinged wardrobe with internal drawers, hanging rods, and overhead storage.',
         'Internal drawers,Hanging rods,Overhead storage,Soft hinges',
         '👗', 4.5),
        ('Velvet Accent Chair', 'furniture', 'Velvet + Wood', '28" x 28" x 32"', 'Emerald Green',
         'Luxury velvet accent chair with solid wood legs and high-density foam cushioning.',
         'Velvet fabric,Solid wood legs,High-density foam,Ergonomic',
         '🛋️', 4.7),
        ('LED Mirror Light', 'furniture', 'Aluminum + Glass', '24" x 36"', 'Silver',
         'Backlit LED bathroom mirror with anti-fog, touch sensor, and 3 color temperatures.',
         'Anti-fog,Touch sensor,3 color temps,IP44 rated',
         '💡', 4.4),
        ('Pivot Main Door', 'doors', 'Engineered Wood + SS', '96" x 48" x 3"', 'Dark Walnut',
         'Statement pivot main door with concealed pivot hinge and flush handle. Modern architectural appeal.',
         'Concealed pivot,Flush handle,Architectural grade,Soundproof core',
         '🚪', 4.9),
        ('Concealed Hinges Set', 'hardware', 'Steel', '4" x 1"', 'Satin',
         'Soft-close concealed hinges set of 4. 3-way adjustable for perfect door alignment.',
         'Soft-close,3-way adjust,Concealed mount,Load 40kg',
         '🔩', 4.3)
    ]
    for p in sample_products:
        c.execute("INSERT OR IGNORE INTO products (name, category, material, dimensions, finish, description, features, emoji, rating) VALUES (?,?,?,?,?,?,?,?,?)", p)

    # Sample VR Houses (no price_estimate)
    sample_houses = [
        ('Modern Villa - Bangalore', 'villa', 3200, 4, 'Modern Minimal', 'A stunning 4BHK modern villa with open floor plan, floor-to-ceiling windows, and smart home integration. Features modular kitchen, walk-in wardrobes, and premium hardware throughout.', '#f5f0e8', '#c9a96e', json.dumps([{"name":"Sectional Sofa","emoji":"🛋️"},{"name":"Dining Table","emoji":"🍽️"},{"name":"Smart Lighting","emoji":"💡"}])),
        ('Luxury Apartment - Mumbai', 'apartment', 1800, 3, 'Classic Luxury', 'Premium 3BHK sea-facing apartment with Italian marble flooring, custom wardrobes, and designer doors. Includes modular kitchen with quartz countertops.', '#e8e4df', '#8b6f4e', json.dumps([{"name":"King Bed","emoji":"🛏️"},{"name":"Wardrobe System","emoji":"🧥"},{"name":"Chandelier","emoji":"💎"}])),
        ('Scandinavian Home - Pune', 'bungalow', 2400, 4, 'Scandinavian', 'Bright and airy 4BHK bungalow with light wood finishes, large windows, and minimalist furniture. Features open kitchen, study room, and garden-facing living area.', '#f8f4e8', '#d4c4a8', json.dumps([{"name":"Oak Dining Set","emoji":"🪑"},{"name":"Bookshelf","emoji":"📚"},{"name":"Pendant Lights","emoji":"💡"}])),
        ('Industrial Loft - Delhi', 'loft', 1500, 2, 'Industrial', 'Converted 2BHK industrial loft with exposed brick walls, metal fixtures, and raw concrete floors. Features open kitchen island and custom metal shelving.', '#4a4a4a', '#3a3a3a', json.dumps([{"name":"Metal Shelving","emoji":"🏗️"},{"name":"Bar Stools","emoji":"🪑"},{"name":"Track Lighting","emoji":"💡"}])),
        ('Japandi Retreat - Hyderabad', 'villa', 2800, 3, 'Japandi', 'Peaceful 3BHK villa blending Japanese wabi-sabi with Scandinavian hygge. Features tatami-inspired flooring, shoji screens, and natural wood furniture.', '#e8d5d0', '#b8c9d9', json.dumps([{"name":"Low Table","emoji":"🪑"},{"name":"Floor Cushions","emoji":"🧘"},{"name":"Paper Lanterns","emoji":"🏮"}])),
        ('Bohemian Studio - Goa', 'studio', 800, 1, 'Bohemian', 'Vibrant 1BHK beach studio with colorful textiles, macrame decor, and rattan furniture. Features open kitchenette and balcony with sea view.', '#e8d5c4', '#c9a96e', json.dumps([{"name":"Rattan Chair","emoji":"🪑"},{"name":"Hammock","emoji":"🌴"},{"name":"Boho Rug","emoji":"🧶"}]))
    ]
    for h in sample_houses:
        c.execute("INSERT OR IGNORE INTO vr_houses (name, type, size_sqft, rooms, style, description, wall_color, floor_color, furniture_json) VALUES (?,?,?,?,?,?,?,?,?)", h)

    # Sample VR Rooms for House 1
    house1 = c.execute("SELECT id FROM vr_houses WHERE name = 'Modern Villa - Bangalore'").fetchone()
    if house1:
        hid = house1['id']
        rooms = [
            (hid, 'Grand Living Room', 'living', '18 x 16 ft', '#f5f0e8', '#c9a96e', json.dumps([{"name":"L-Shape Sofa","emoji":"🛋️","x":200,"y":180},{"name":"Coffee Table","emoji":"🪑","x":280,"y":220},{"name":"TV Unit","emoji":"📺","x":250,"y":100}]), 'Daylight'),
            (hid, 'Master Bedroom', 'bedroom', '16 x 14 ft', '#e8e4df', '#a08050', json.dumps([{"name":"King Bed","emoji":"🛏️","x":220,"y":150},{"name":"Nightstand","emoji":"🪑","x":120,"y":180},{"name":"Wardrobe","emoji":"🧥","x":400,"y":120}]), 'Warm Evening'),
            (hid, 'Modular Kitchen', 'kitchen', '14 x 12 ft', '#f8f4e8', '#d4c4a8', json.dumps([{"name":"Kitchen Island","emoji":"🍳","x":200,"y":200},{"name":"Bar Stools","emoji":"🪑","x":250,"y":240},{"name":"Refrigerator","emoji":"❄️","x":450,"y":100}]), 'Cool White'),
            (hid, 'Dining Room', 'dining', '14 x 12 ft', '#f5f0e8', '#c9a96e', json.dumps([{"name":"Dining Table","emoji":"🍽️","x":250,"y":180},{"name":"Chairs x6","emoji":"🪑","x":200,"y":200},{"name":"Sideboard","emoji":"🗄️","x":450,"y":150}]), 'Daylight')
        ]
        for r in rooms:
            c.execute("INSERT OR IGNORE INTO vr_rooms (house_id, name, room_type, size, wall_color, floor_color, furniture_json, lighting) VALUES (?,?,?,?,?,?,?,?)", r)

    # Sample VR Rooms for House 2
    house2 = c.execute("SELECT id FROM vr_houses WHERE name = 'Luxury Apartment - Mumbai'").fetchone()
    if house2:
        hid = house2['id']
        rooms = [
            (hid, 'Sea View Living', 'living', '16 x 14 ft', '#e8e4df', '#8b6f4e', json.dumps([{"name":"Velvet Sofa","emoji":"🛋️","x":200,"y":170},{"name":"Marble Coffee Table","emoji":"🪑","x":280,"y":210},{"name":"Floor Lamp","emoji":"💡","x":120,"y":150}]), 'Warm Evening'),
            (hid, 'Master Suite', 'bedroom', '18 x 16 ft', '#d4c4a8', '#a08050', json.dumps([{"name":"King Bed","emoji":"🛏️","x":250,"y":140},{"name":"Dresser","emoji":"🪑","x":420,"y":180},{"name":"Chandelier","emoji":"💎","x":300,"y":80}]), 'Cozy Dim'),
            (hid, 'Gourmet Kitchen', 'kitchen', '12 x 10 ft', '#f8f4e8', '#c9a96e', json.dumps([{"name":"Quartz Countertop","emoji":"🍳","x":200,"y":200},{"name":"Bar Stools x3","emoji":"🪑","x":220,"y":240},{"name":"Wine Rack","emoji":"🍷","x":450,"y":120}]), 'Daylight')
        ]
        for r in rooms:
            c.execute("INSERT OR IGNORE INTO vr_rooms (house_id, name, room_type, size, wall_color, floor_color, furniture_json, lighting) VALUES (?,?,?,?,?,?,?,?)", r)

    # Default editable content
    default_content = [
        ('hero_title', 'Hero Title', 'Design Your Dream Space with AI & VR'),
        ('hero_subtitle', 'Hero Subtitle', 'Premium interior solutions, doors, and hardware. Experience your home before it is built with our immersive VR walkthrough and AI-powered design studio.'),
        ('about_story', 'About Story', 'HNHSquare was born from a simple belief: everyone deserves a beautiful home. Founded in 2020, we set out to bridge the gap between traditional interior design and modern technology.'),
        ('about_mission', 'Our Mission', 'To democratize premium interior design by making world-class tools, products, and expertise accessible to every homeowner in India.'),
        ('contact_email', 'Contact Email', 'hello@hnhsquare.com'),
        ('contact_phone', 'Contact Phone', '+91 00000 00000'),
    ]
    for key, title, content in default_content:
        c.execute("INSERT OR IGNORE INTO site_content (key, title, content) VALUES (?, ?, ?)", (key, title, content))

    conn.commit()
    conn.close()
    print("Database initialized!")

# ===================== CONTENT HELPERS =====================
def get_content(key, default=''):
    conn = get_db()
    row = conn.execute("SELECT content FROM site_content WHERE key = ?", (key,)).fetchone()
    conn.close()
    return row['content'] if row else default

def get_all_content():
    conn = get_db()
    rows = conn.execute("SELECT * FROM site_content ORDER BY key").fetchall()
    conn.close()
    return rows

# ===================== AUTH HELPERS =====================
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please login first', 'warning')
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('admin_login'))
        conn = get_db()
        user = conn.execute("SELECT role FROM users WHERE id = ?", (session['user_id'],)).fetchone()
        conn.close()
        if not user or user['role'] != 'admin':
            flash('Admin access required', 'danger')
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated

# ===================== FRONTEND ROUTES =====================

@app.route('/static/<path:filename>')
def serve_static(filename):
    if filename in STATIC_FILES:
        content = base64.b64decode(STATIC_FILES[filename])
        mime = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
        return Response(content, mimetype=mime)
    return 'Not found', 404

@app.route('/')
def home():
    conn = get_db()
    products = conn.execute("SELECT * FROM products WHERE active = 1 ORDER BY rating DESC LIMIT 8").fetchall()
    houses = conn.execute("SELECT * FROM vr_houses WHERE active = 1 LIMIT 3").fetchall()
    conn.close()
    return render_template('index.html', products=products, houses=houses,
                           hero_title=get_content('hero_title'),
                           hero_subtitle=get_content('hero_subtitle'))

@app.route('/products')
def products_page():
    category = request.args.get('category', '')
    conn = get_db()
    if category:
        products = conn.execute("SELECT * FROM products WHERE active = 1 AND category = ?", (category,)).fetchall()
    else:
        products = conn.execute("SELECT * FROM products WHERE active = 1").fetchall()
    cats = conn.execute("SELECT category, COUNT(*) as cnt FROM products WHERE active = 1 GROUP BY category").fetchall()
    conn.close()
    return render_template('products.html', products=products, category=category, categories=cats)

@app.route('/catalogue')
def catalogue_page():
    conn = get_db()
    products = conn.execute("SELECT * FROM products WHERE active = 1 ORDER BY category, name").fetchall()
    cats = conn.execute("SELECT category, COUNT(*) as cnt FROM products WHERE active = 1 GROUP BY category").fetchall()
    conn.close()
    return render_template('catalogue.html', products=products, categories=cats)

@app.route('/vr-walkthrough')
def vr_walkthrough():
    house_id = request.args.get('house', '')
    conn = get_db()
    houses = conn.execute("SELECT * FROM vr_houses WHERE active = 1").fetchall()
    current_house = None
    rooms = []
    if house_id:
        current_house = conn.execute("SELECT * FROM vr_houses WHERE id = ?", (house_id,)).fetchone()
        rooms = conn.execute("SELECT * FROM vr_rooms WHERE house_id = ?", (house_id,)).fetchall()
    else:
        current_house = conn.execute("SELECT * FROM vr_houses WHERE active = 1 LIMIT 1").fetchone()
        if current_house:
            rooms = conn.execute("SELECT * FROM vr_rooms WHERE house_id = ?", (current_house['id'],)).fetchall()
    conn.close()
    return render_template('vr-walkthrough.html', houses=houses, current_house=current_house, rooms=rooms)

@app.route('/design-studio')
def design_studio():
    return render_template('design-studio.html')

@app.route('/about')
def about_page():
    return render_template('about.html',
                           about_story=get_content('about_story'),
                           about_mission=get_content('about_mission'))

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        data = request.get_json() or request.form
        conn = get_db()
        conn.execute("INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)",
                     (data.get('name'), data.get('email'), data.get('phone'), data.get('subject', 'General'), data.get('message')))
        conn.commit()
        conn.close()
        if request.is_json:
            return jsonify({'success': True, 'message': 'Thank you! We will contact you soon.'})
        flash('Message sent successfully!', 'success')
        return redirect(url_for('contact'))
    return render_template('contact.html',
                           contact_email=get_content('contact_email'),
                           contact_phone=get_content('contact_phone'))

# ===================== API ROUTES =====================
@app.route('/api/products')
def api_products():
    conn = get_db()
    products = conn.execute("SELECT * FROM products WHERE active = 1").fetchall()
    conn.close()
    return jsonify([dict(p) for p in products])

@app.route('/api/product/<int:product_id>')
def api_product(product_id):
    conn = get_db()
    product = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    conn.close()
    if product: return jsonify(dict(product))
    return jsonify({'error': 'Not found'}), 404

@app.route('/api/vr-houses')
def api_vr_houses():
    conn = get_db()
    houses = conn.execute("SELECT * FROM vr_houses WHERE active = 1").fetchall()
    conn.close()
    return jsonify([dict(h) for h in houses])

@app.route('/api/vr-house/<int:house_id>')
def api_vr_house(house_id):
    conn = get_db()
    house = conn.execute("SELECT * FROM vr_houses WHERE id = ?", (house_id,)).fetchone()
    rooms = conn.execute("SELECT * FROM vr_rooms WHERE house_id = ?", (house_id,)).fetchall()
    conn.close()
    if house:
        result = dict(house)
        result['rooms'] = [dict(r) for r in rooms]
        return jsonify(result)
    return jsonify({'error': 'Not found'}), 404

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json() or request.form
    password = hash_password(data.get('password', ''))
    conn = get_db()
    try:
        c = conn.cursor()
        c.execute("INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)",
                  (data.get('name'), data.get('email'), data.get('phone', ''), password))
        conn.commit()
        user_id = c.lastrowid
        session['user_id'] = user_id
        session['user_name'] = data.get('name')
        session['user_email'] = data.get('email')
        return jsonify({'success': True, 'message': 'Registered successfully'})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 400
    finally:
        conn.close()

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json() or request.form
    password = hash_password(data.get('password', ''))
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email = ? AND password = ?", (data.get('email'), password)).fetchone()
    conn.close()
    if user:
        session['user_id'] = user['id']
        session['user_name'] = user['name']
        session['user_email'] = user['email']
        session['user_role'] = user['role']
        return jsonify({'success': True, 'role': user['role'], 'name': user['name']})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('home'))

@app.route('/design-request', methods=['POST'])
def design_request():
    data = request.get_json() or request.form
    conn = get_db()
    conn.execute("""
        INSERT INTO design_requests (name, email, phone, room_type, room_size, style, budget, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (data.get('name'), data.get('email'), data.get('phone'), data.get('room_type'),
          data.get('room_size'), data.get('style'), data.get('budget'), data.get('notes')))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Design request submitted!'})

@app.route('/enscape-viewer')
def enscape_viewer():
    project = request.args.get('project', '')
    return render_template('enscape-viewer.html', project=project)

# ===================== ADMIN ROUTES =====================
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = hash_password(request.form.get('password', ''))
        conn = get_db()
        user = conn.execute("SELECT * FROM users WHERE email = ? AND password = ? AND role = 'admin'", (email, password)).fetchone()
        conn.close()
        if user:
            session['user_id'] = user['id']
            session['user_name'] = user['name']
            session['user_role'] = 'admin'
            return redirect(url_for('admin_dashboard'))
        flash('Invalid admin credentials', 'danger')
    return render_template('admin/login.html')

@app.route('/admin')
@app.route('/admin/dashboard')
@admin_required
def admin_dashboard():
    conn = get_db()
    stats = {
        'total_products': conn.execute("SELECT COUNT(*) as c FROM products WHERE active = 1").fetchone()['c'],
        'total_users': conn.execute("SELECT COUNT(*) as c FROM users WHERE role = 'customer'").fetchone()['c'],
        'new_contacts': conn.execute("SELECT COUNT(*) as c FROM contacts WHERE status = 'new'").fetchone()['c'],
        'read_contacts': conn.execute("SELECT COUNT(*) as c FROM contacts WHERE status = 'read'").fetchone()['c'],
        'new_designs': conn.execute("SELECT COUNT(*) as c FROM design_requests WHERE status = 'new'").fetchone()['c'],
        'read_designs': conn.execute("SELECT COUNT(*) as c FROM design_requests WHERE status = 'read'").fetchone()['c'],
        'total_houses': conn.execute("SELECT COUNT(*) as c FROM vr_houses WHERE active = 1").fetchone()['c']
    }

    # Weekly stats (last 7 days)
    from datetime import datetime, timedelta
    weekly_stats = []
    max_val = 1
    for i in range(6, -1, -1):
        day = datetime.now() - timedelta(days=i)
        day_start = day.strftime('%Y-%m-%d 00:00:00')
        day_end = day.strftime('%Y-%m-%d 23:59:59')
        contacts = conn.execute(
            "SELECT COUNT(*) as c FROM contacts WHERE created_at BETWEEN ? AND ?",
            (day_start, day_end)
        ).fetchone()['c']
        designs = conn.execute(
            "SELECT COUNT(*) as c FROM design_requests WHERE created_at BETWEEN ? AND ?",
            (day_start, day_end)
        ).fetchone()['c']
        weekly_stats.append({
            'label': day.strftime('%a'),
            'contacts': contacts,
            'designs': designs
        })
        max_val = max(max_val, contacts, designs)
    for s in weekly_stats:
        s['contact_pct'] = min(100, int(s['contacts'] / max_val * 100)) if max_val else 0
        s['design_pct'] = min(100, int(s['designs'] / max_val * 100)) if max_val else 0

    # Category breakdown with emoji mapping
    cat_emojis = {'doors': '🚪', 'hardware': '🔧', 'kitchen': '🍳', 'wardrobe': '👔', 'furniture': '🪑'}
    cats = conn.execute("SELECT category, COUNT(*) as cnt FROM products WHERE active = 1 GROUP BY category").fetchall()
    total_cat = sum(c['cnt'] for c in cats) or 1
    category_stats = []
    for c in cats:
        category_stats.append({
            'category': c['category'],
            'count': c['cnt'],
            'emoji': cat_emojis.get(c['category'], '📦'),
            'pct': int(c['cnt'] / total_cat * 100)
        })
    category_stats.sort(key=lambda x: -x['count'])

    # Recent activity feed (combined contacts + designs)
    recent_contacts = conn.execute("SELECT * FROM contacts ORDER BY created_at DESC LIMIT 5").fetchall()
    recent_designs = conn.execute("SELECT * FROM design_requests ORDER BY created_at DESC LIMIT 5").fetchall()

    activity_items = []
    for c in recent_contacts:
        dt = datetime.strptime(c['created_at'], '%Y-%m-%d %H:%M:%S')
        diff = datetime.now() - dt
        if diff.days > 0:
            time_ago = f"{diff.days}d ago"
        elif diff.seconds // 3600 > 0:
            time_ago = f"{diff.seconds // 3600}h ago"
        else:
            time_ago = f"{diff.seconds // 60}m ago"
        activity_items.append({
            'type': 'contact',
            'icon': '✉️',
            'title': c['name'],
            'subtitle': c['subject'] or 'General Inquiry',
            'status': c['status'],
            'time_ago': time_ago,
            'ts': c['created_at']
        })
    for d in recent_designs:
        dt = datetime.strptime(d['created_at'], '%Y-%m-%d %H:%M:%S')
        diff = datetime.now() - dt
        if diff.days > 0:
            time_ago = f"{diff.days}d ago"
        elif diff.seconds // 3600 > 0:
            time_ago = f"{diff.seconds // 3600}h ago"
        else:
            time_ago = f"{diff.seconds // 60}m ago"
        activity_items.append({
            'type': 'design',
            'icon': '🎨',
            'title': d['name'],
            'subtitle': f"{d['room_type']} - {d['style']}",
            'status': d['status'],
            'time_ago': time_ago,
            'ts': d['created_at']
        })
    activity_items.sort(key=lambda x: x['ts'], reverse=True)
    recent_activity = activity_items[:10]

    conn.close()
    return render_template('admin/dashboard.html', stats=stats, weekly_stats=weekly_stats,
                           category_stats=category_stats, recent_activity=recent_activity)

@app.route('/admin/products')
@admin_required
def admin_products():
    conn = get_db()
    products = conn.execute("SELECT * FROM products ORDER BY id DESC").fetchall()
    conn.close()
    return render_template('admin/products.html', products=products)

@app.route('/admin/product/add', methods=['POST'])
@admin_required
def add_product():
    data = request.form
    conn = get_db()
    conn.execute("""
        INSERT INTO products (name, category, material, dimensions, finish, description, features, emoji, rating)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (data.get('name'), data.get('category'), data.get('material'), data.get('dimensions'),
          data.get('finish'), data.get('description'), data.get('features'),
          data.get('emoji', '📦'), data.get('rating', 4.5)))
    conn.commit()
    conn.close()
    flash('Product added successfully!', 'success')
    return redirect(url_for('admin_products'))

@app.route('/admin/product/edit/<int:product_id>', methods=['POST'])
@admin_required
def edit_product(product_id):
    data = request.form
    conn = get_db()
    conn.execute("""
        UPDATE products SET name=?, category=?, material=?, dimensions=?, finish=?, description=?, features=?, emoji=?, rating=?, active=?
        WHERE id=?
    """, (data.get('name'), data.get('category'), data.get('material'), data.get('dimensions'),
          data.get('finish'), data.get('description'), data.get('features'),
          data.get('emoji'), data.get('rating'), data.get('active', 1), product_id))
    conn.commit()
    conn.close()
    flash('Product updated!', 'success')
    return redirect(url_for('admin_products'))

@app.route('/admin/product/delete/<int:product_id>')
@admin_required
def delete_product(product_id):
    conn = get_db()
    conn.execute("DELETE FROM products WHERE id = ?", (product_id,))
    conn.commit()
    conn.close()
    flash('Product deleted!', 'success')
    return redirect(url_for('admin_products'))

@app.route('/admin/users')
@admin_required
def admin_users():
    conn = get_db()
    users = conn.execute("SELECT * FROM users WHERE role = 'customer' ORDER BY created_at DESC").fetchall()
    conn.close()
    return render_template('admin/users.html', users=users)

@app.route('/admin/contacts')
@admin_required
def admin_contacts():
    conn = get_db()
    contacts = conn.execute("SELECT * FROM contacts ORDER BY created_at DESC").fetchall()
    conn.close()
    return render_template('admin/contacts.html', contacts=contacts)

@app.route('/admin/contact/mark/<int:contact_id>')
@admin_required
def mark_contact(contact_id):
    conn = get_db()
    conn.execute("UPDATE contacts SET status = 'read' WHERE id = ?", (contact_id,))
    conn.commit()
    conn.close()
    return redirect(url_for('admin_contacts'))

@app.route('/admin/design-requests')
@admin_required
def admin_designs():
    conn = get_db()
    designs = conn.execute("SELECT * FROM design_requests ORDER BY created_at DESC").fetchall()
    conn.close()
    return render_template('admin/designs.html', designs=designs)

@app.route('/admin/design/mark/<int:design_id>')
@admin_required
def mark_design(design_id):
    conn = get_db()
    conn.execute("UPDATE design_requests SET status = 'read' WHERE id = ?", (design_id,))
    conn.commit()
    conn.close()
    return redirect(url_for('admin_designs'))

# VR Houses Admin
@app.route('/admin/vr-houses')
@admin_required
def admin_vr_houses():
    conn = get_db()
    houses = conn.execute("SELECT * FROM vr_houses ORDER BY id DESC").fetchall()
    conn.close()
    return render_template('admin/vr_houses.html', houses=houses)

@app.route('/admin/vr-house/add', methods=['POST'])
@admin_required
def add_vr_house():
    data = request.form
    conn = get_db()
    conn.execute("""
        INSERT INTO vr_houses (name, type, size_sqft, rooms, style, description, wall_color, floor_color)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (data.get('name'), data.get('type'), data.get('size_sqft'), data.get('rooms'), data.get('style'),
          data.get('description'), data.get('wall_color', '#f5f0e8'), data.get('floor_color', '#c9a96e')))
    conn.commit()
    conn.close()
    flash('VR House added!', 'success')
    return redirect(url_for('admin_vr_houses'))

@app.route('/admin/vr-house/delete/<int:house_id>')
@admin_required
def delete_vr_house(house_id):
    conn = get_db()
    conn.execute("DELETE FROM vr_rooms WHERE house_id = ?", (house_id,))
    conn.execute("DELETE FROM vr_houses WHERE id = ?", (house_id,))
    conn.commit()
    conn.close()
    flash('VR House deleted!', 'success')
    return redirect(url_for('admin_vr_houses'))

@app.route('/admin/enscape-projects')
@admin_required
def admin_enscape():
    import os
    enscape_dir = os.path.join(os.path.dirname(__file__), 'static', 'enscape')
    projects = []
    if os.path.exists(enscape_dir):
        for name in os.listdir(enscape_dir):
            path = os.path.join(enscape_dir, name)
            if os.path.isdir(path) and os.path.exists(os.path.join(path, 'index.html')):
                projects.append({'name': name, 'url': f'/enscape-viewer?project={name}'})
    return render_template('admin/enscape.html', projects=projects)

# ===================== CONTENT MANAGEMENT =====================
@app.route('/admin/content')
@admin_required
def admin_content():
    content = get_all_content()
    return render_template('admin/content.html', content=content)

@app.route('/admin/content/update', methods=['POST'])
@admin_required
def update_content():
    data = request.form
    key = data.get('key')
    title = data.get('title')
    content_text = data.get('content')
    conn = get_db()
    conn.execute("""
        INSERT INTO site_content (key, title, content) VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET title=excluded.title, content=excluded.content, updated_at=CURRENT_TIMESTAMP
    """, (key, title, content_text))
    conn.commit()
    conn.close()
    flash('Content updated!', 'success')
    return redirect(url_for('admin_content'))

@app.route('/api/content/<key>')
def api_content(key):
    return jsonify({'key': key, 'content': get_content(key)})

# ===================== MAIN =====================
if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
