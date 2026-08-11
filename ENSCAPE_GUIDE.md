# Enscape 3D Walkthrough Deployment Guide

## Overview
HNHSquare now supports direct viewing of Enscape Web Standalone exports in the browser. This allows your clients to walk through photorealistic 3D architectural visualizations without installing any software.

---

## What is Enscape Web Standalone?

Enscape Web Standalone is a feature in Enscape (real-time rendering plugin for Revit, SketchUp, Rhino, ArchiCAD) that exports your 3D scene as a self-contained HTML file with WebGL rendering. It runs entirely in the browser.

**Supported Software:**
- Autodesk Revit
- SketchUp
- Rhino
- ArchiCAD
- Vectorworks

---

## Step-by-Step: Export from Enscape

### 1. Prepare Your Model
- Open your architectural/interior model in Revit/SketchUp/Rhino
- Launch Enscape plugin
- Set up views, lighting, materials, and entourage

### 2. Export Web Standalone
```
Enscape Menu → Web Standalone → Export
```
- Choose quality settings (Medium recommended for web)
- Select output folder
- Wait for export to complete

### 3. Export Output Structure
```
your-export-folder/
├── index.html          (Main viewer file)
├── assets/
│   ├── textures/       (Compressed images)
│   ├── models/         (3D geometry data)
│   ├── scripts/        (WebGL engine)
│   └── ...
```

**File Size:** Typically 50MB - 500MB depending on scene complexity

---

## Deploy to HNHSquare

### Method 1: Manual Upload (Recommended for testing)

1. Create project folder:
```bash
cd hnhsquare-fullstack/static/enscape/
mkdir modern-villa-bangalore
cd modern-villa-bangalore
```

2. Copy exported files:
```bash
cp /path/to/enscape/export/* .
```

3. Verify structure:
```
static/enscape/modern-villa-bangalore/
├── index.html
└── assets/
```

4. Access in browser:
```
http://localhost:5000/enscape-viewer?project=modern-villa-bangalore
```

### Method 2: Git Deployment (Production)

1. Add exported folder to your repo:
```bash
git add static/enscape/modern-villa-bangalore/
git commit -m "Add Enscape walkthrough: Modern Villa"
git push origin main
```

2. Railway auto-deploys

### Method 3: Railway Volume / File Upload

For large files (>100MB), use Railway's file upload or connect external storage:
- Upload to AWS S3 / Cloudflare R2
- Update iframe src to point to external URL

---

## Enscape Viewer Features

| Feature | Status |
|---------|--------|
| WASD / Arrow key navigation | ✅ Native Enscape |
| Mouse look / orbit | ✅ Native Enscape |
| Scroll zoom | ✅ Native Enscape |
| Material inspection on click | ✅ Native Enscape |
| Day/Night toggle | ✅ Native Enscape |
| Fullscreen mode | ✅ Native Enscape |
| Mobile / Tablet support | ✅ Native Enscape |
| VR headset (WebXR) | ✅ Native Enscape |

---

## Optimizing for Web

### Reduce File Size
1. In Enscape export settings, choose **"Medium"** or **"Low"** quality
2. Reduce texture resolution before export
3. Limit model complexity (remove unnecessary geometry)
4. Use compressed image formats

### Performance Tips
- Host on CDN for faster global loading
- Use gzip compression on server
- Lazy-load multiple walkthroughs
- Preload critical assets

---

## URL Structure

### Viewer Page (with sidebar)
```
https://your-domain.com/enscape-viewer?project=folder-name
```

### Direct Link (fullscreen)
```
https://your-domain.com/static/enscape/folder-name/index.html
```

### Admin Management
```
https://your-domain.com/admin/enscape-projects
```

---

## Sample Projects Included

The following sample projects are pre-configured in the viewer sidebar:

1. **Modern Villa - Bangalore** (3,200 sqft, 4BHK)
2. **Luxury Apartment - Mumbai** (1,800 sqft, 3BHK)
3. **Scandinavian Home - Pune** (2,400 sqft, 4BHK)
4. **Industrial Loft - Delhi** (1,500 sqft, 2BHK)

> Note: These are placeholder entries. To make them functional, export actual Enscape projects into the corresponding folders.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Black screen | Enable WebGL in browser. Check console for errors |
| Slow loading | Reduce export quality. Use CDN hosting |
| Mobile not working | Enscape Web Standalone requires WebGL 2.0 |
| CORS errors | Ensure all assets are on same domain |
| File too large for Git | Use Git LFS or external hosting |

---

## Security Notes

- Enscape Web Standalone runs client-side (no server processing needed)
- No sensitive data is transmitted
- Files are static HTML/JS — safe to host publicly
- Consider password-protecting premium walkthroughs via Flask routes
