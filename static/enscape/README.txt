# Enscape Web Standalone Integration

## How to Add Your Enscape Walkthroughs

### Step 1: Export from Enscape
1. Open your project in Revit / SketchUp / Rhino / ArchiCAD
2. Launch Enscape and set up your views
3. Go to Enscape menu → **"Web Standalone"**
4. Click **"Export"** and choose a folder
5. This creates: `index.html` + `assets/` folder

### Step 2: Upload to HNHSquare
1. Create a folder inside this directory: `/static/enscape/your-project-name/`
2. Copy the exported `index.html` and `assets/` folder into it
3. The structure should be:
```
static/enscape/
├── modern-villa/
│   ├── index.html
│   └── assets/
├── luxury-apartment/
│   ├── index.html
│   └── assets/
```

### Step 3: Access
Visit: `https://your-domain.com/enscape-viewer?project=your-project-name`

### Alternative: Direct Link
You can also link directly to the exported file:
`https://your-domain.com/static/enscape/your-project/index.html`

### Notes
- Enscape Web Standalone requires WebGL-enabled browser
- File size can be large (50MB-500MB per project)
- Recommended: Compress textures before export for faster loading
- Works on desktop and mobile browsers
