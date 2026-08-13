// HNHSquare - Enhanced AI Design Studio
// Simulated AI interior design with budget, materials, save/load, and comparisons

(function() {
    'use strict';

    const styles = [
        { id: 'modern', name: 'Modern Minimal', emoji: '⬜', desc: 'Clean lines, neutral palette', budgetMultiplier: 1.0 },
        { id: 'classic', name: 'Classic Luxury', emoji: '👑', desc: 'Ornate details, rich textures', budgetMultiplier: 1.5 },
        { id: 'scandi', name: 'Scandinavian', emoji: '🌲', desc: 'Light wood, cozy hygge', budgetMultiplier: 0.9 },
        { id: 'industrial', name: 'Industrial', emoji: '🏭', desc: 'Raw materials, exposed elements', budgetMultiplier: 0.8 },
        { id: 'bohemian', name: 'Bohemian', emoji: '🌸', desc: 'Eclectic, colorful, layered', budgetMultiplier: 0.7 },
        { id: 'japandi', name: 'Japandi', emoji: '🏯', desc: 'Japanese + Scandinavian fusion', budgetMultiplier: 1.1 },
        { id: 'artdeco', name: 'Art Deco', emoji: '💎', desc: 'Glamorous geometric patterns', budgetMultiplier: 1.3 },
        { id: 'coastal', name: 'Coastal', emoji: '🌊', desc: 'Beachy blues and whites', budgetMultiplier: 0.9 }
    ];

    const colors = [
        '#E8D5C4', '#C4D5E8', '#D5E8D4', '#E8D4D5', '#D4D5E8', '#E8E4D4',
        '#D4E8E4', '#E8D4E4', '#D4E8D5', '#E8E8D4', '#D5D4E8', '#E4D4E8'
    ];

    const materials = {
        modern: ['Quartz Countertop', 'Glass Panels', 'Chrome Fixtures', 'Engineered Wood', 'Concrete Accents'],
        classic: ['Marble Flooring', 'Brass Hardware', 'Velvet Upholstery', 'Oak Wood', 'Crystal Lighting'],
        scandi: ['Pine Wood', 'Linen Fabrics', 'Ceramic Tiles', 'Birch Furniture', 'Wool Rugs'],
        industrial: ['Exposed Brick', 'Steel Beams', 'Reclaimed Wood', 'Leather Seating', 'Edison Bulbs'],
        bohemian: ['Rattan Furniture', 'Macrame Decor', 'Patterned Textiles', 'Vintage Finds', 'Terracotta Pots'],
        japandi: ['Bamboo', 'Shoji Screens', 'Tatami Mats', 'Washi Paper', 'Stone Accents'],
        artdeco: ['Mirrored Surfaces', 'Lacquered Wood', 'Gold Leaf', 'Velvet Curtains', 'Geometric Tiles'],
        coastal: ['Wicker Furniture', 'Driftwood', 'Linen Drapes', 'Sea Glass', 'White Washed Wood']
    };

    const designResults = [
        { label: 'Option A', desc: 'Balanced layout with focal point', color1: '#f5f0e8', color2: '#c9a96e', layout: 'symmetrical' },
        { label: 'Option B', desc: 'Maximized storage & flow', color1: '#e8e4df', color2: '#8b6f4e', layout: 'linear' },
        { label: 'Option C', desc: 'Open concept with zones', color1: '#d4c4a8', color2: '#a08050', layout: 'open' },
        { label: 'Option D', desc: 'Cozy nook arrangement', color1: '#e8d5d0', color2: '#b8c9d9', layout: 'intimate' }
    ];

    let currentStep = 1;
    let selectedStyle = null;
    let selectedColor = null;
    let selectedDesign = null;
    let savedDesigns = JSON.parse(localStorage.getItem('hnh_ai_designs') || '[]');

    function init() {
        renderStyles();
        renderColors();
        renderBudgetSlider();
        renderSavedDesigns();
        bindEvents();
    }

    function renderStyles() {
        const grid = document.getElementById('styleGrid');
        if (!grid) return;
        grid.innerHTML = styles.map(s => `
            <div class="style-option" data-style="${s.id}">
                <span class="style-emoji">${s.emoji}</span>
                <h5>${s.name}</h5>
                <p>${s.desc}</p>
            </div>
        `).join('');
    }

    function renderColors() {
        const palette = document.getElementById('colorPalette');
        if (!palette) return;
        palette.innerHTML = colors.map((c, i) => `
            <div class="color-swatch ${i === 0 ? 'selected' : ''}" style="background:${c}" data-color="${c}"></div>
        `).join('');
    }

    function renderBudgetSlider() {
        const container = document.getElementById('budgetSliderWrap');
        if (!container) return;
        container.innerHTML = `
            <label style="display:block;font-size:0.85rem;font-weight:500;margin-bottom:8px;color:var(--text);">Budget Range</label>
            <input type="range" id="budgetSlider" min="50000" max="1000000" step="50000" value="250000" 
                style="width:100%;accent-color:var(--accent);" oninput="document.getElementById('budgetDisplay').textContent='₹'+parseInt(this.value).toLocaleString('en-IN')">
            <div style="display:flex;justify-content:space-between;margin-top:4px;">
                <span style="font-size:0.75rem;color:var(--text-light);">₹50,000</span>
                <span id="budgetDisplay" style="font-size:0.9rem;font-weight:600;color:var(--accent);">₹2,50,000</span>
                <span style="font-size:0.75rem;color:var(--text-light);">₹10,00,000</span>
            </div>
        `;
    }

    function renderSavedDesigns() {
        const container = document.getElementById('savedDesignsList');
        if (!container) return;
        if (savedDesigns.length === 0) {
            container.innerHTML = '<p style="color:var(--text-light);font-size:0.85rem;text-align:center;">No saved designs yet</p>';
            return;
        }
        container.innerHTML = savedDesigns.map((d, i) => `
            <div class="saved-design-card" data-index="${i}" style="padding:12px;background:var(--bg-warm);border:1px solid var(--border);border-radius:8px;cursor:pointer;transition:0.2s;">
                <div style="display:flex;gap:8px;margin-bottom:6px;">
                    <div style="width:24px;height:24px;background:${d.wallColor};border-radius:4px;"></div>
                    <div style="width:24px;height:24px;background:${d.floorColor};border-radius:4px;"></div>
                </div>
                <div style="font-size:0.85rem;font-weight:600;color:var(--primary);">${d.name}</div>
                <div style="font-size:0.75rem;color:var(--text-light);">${d.style} • ${d.roomType} • ${d.date}</div>
            </div>
        `).join('');
    }

    function bindEvents() {
        // Step 1 -> Step 2
        document.getElementById('nextToStep2')?.addEventListener('click', () => {
            goToStep(2);
        });

        // Step 2 -> Step 3
        document.getElementById('generateDesigns')?.addEventListener('click', () => {
            if (!selectedStyle) {
                showToast('Please select a style first');
                return;
            }
            goToStep(3);
            simulateGeneration();
        });

        document.getElementById('backToStep1')?.addEventListener('click', () => goToStep(1));

        // Style selection
        document.getElementById('styleGrid')?.addEventListener('click', (e) => {
            const opt = e.target.closest('.style-option');
            if (!opt) return;
            document.querySelectorAll('.style-option').forEach(s => s.classList.remove('selected'));
            opt.classList.add('selected');
            selectedStyle = opt.dataset.style;
            renderMaterialSuggestions();
        });

        // Color selection
        document.getElementById('colorPalette')?.addEventListener('click', (e) => {
            const swatch = e.target.closest('.color-swatch');
            if (!swatch) return;
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
            swatch.classList.add('selected');
            selectedColor = swatch.dataset.color;
        });

        // Back to results
        document.getElementById('backToResults')?.addEventListener('click', () => goToStep(3));

        // Design customization - instant preview
        document.getElementById('designWallColor')?.addEventListener('input', updateDesignPreview);
        document.getElementById('designFloorColor')?.addEventListener('input', updateDesignPreview);
        document.getElementById('designLighting')?.addEventListener('change', updateDesignPreview);
        document.getElementById('designFurniture')?.addEventListener('change', updateDesignPreview);

        // Save design
        document.getElementById('saveDesignBtn')?.addEventListener('click', saveCurrentDesign);

        // Load saved design
        document.getElementById('savedDesignsList')?.addEventListener('click', (e) => {
            const card = e.target.closest('.saved-design-card');
            if (!card) return;
            const design = savedDesigns[parseInt(card.dataset.index)];
            if (design) {
                loadDesign(design);
            }
        });

        // Upload zone
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('roomPhoto');
        if (uploadZone && fileInput) {
            uploadZone.addEventListener('click', () => fileInput.click());
            uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.style.borderColor = 'var(--accent)'; });
            uploadZone.addEventListener('dragleave', () => { uploadZone.style.borderColor = 'var(--border)'; });
            uploadZone.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadZone.style.borderColor = 'var(--border)';
                showToast('Photo uploaded successfully!');
            });
            fileInput.addEventListener('change', () => {
                if (fileInput.files.length) showToast('Photo uploaded successfully!');
            });
        }
    }

    function renderMaterialSuggestions() {
        const container = document.getElementById('materialSuggestions');
        if (!container || !selectedStyle) return;
        const mats = materials[selectedStyle] || [];
        container.innerHTML = `
            <h4 style="font-size:0.9rem;margin-bottom:10px;color:var(--primary);">Recommended Materials</h4>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
                ${mats.map(m => `<span style="font-size:0.8rem;background:var(--primary);color:var(--gold);padding:6px 14px;border-radius:20px;">${m}</span>`).join('')}
            </div>
        `;
    }

    function goToStep(step) {
        currentStep = step;
        document.querySelectorAll('.design-step').forEach((s, i) => {
            s.classList.toggle('active', i + 1 === step);
        });
        document.querySelectorAll('.design-panel').forEach((p, i) => {
            p.classList.toggle('active', i + 1 === step);
        });
    }

    function simulateGeneration() {
        const generating = document.getElementById('aiGenerating');
        const results = document.getElementById('designResults');
        const bar = document.getElementById('aiProgressBar');
        if (!generating || !results || !bar) return;

        generating.style.display = 'block';
        results.style.display = 'none';
        bar.style.width = '0%';

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            bar.style.width = progress + '%';

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    generating.style.display = 'none';
                    results.style.display = 'block';
                    renderResults();
                }, 400);
            }
        }, 300);
    }

    function renderResults() {
        const grid = document.getElementById('resultsGrid');
        if (!grid) return;

        grid.innerHTML = designResults.map((r, i) => `
            <div class="result-card ${i === 0 ? 'selected' : ''}" data-index="${i}">
                <div class="result-img" style="background: linear-gradient(135deg, ${r.color1} 0%, ${r.color2} 100%);" data-label="${r.label}"></div>
                <div class="result-info">
                    <h4>${r.label}</h4>
                    <p>${r.desc}</p>
                </div>
            </div>
        `).join('');

        grid.querySelectorAll('.result-card').forEach(card => {
            card.addEventListener('click', () => {
                grid.querySelectorAll('.result-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedDesign = parseInt(card.dataset.index);
                setTimeout(() => goToStep(4), 300);
                renderDesignPreview();
                renderBudgetEstimate();
                renderMaterialRecommendations();
            });
        });
    }

    function renderDesignPreview() {
        const preview = document.getElementById('designPreview');
        if (!preview) return;

        const design = designResults[selectedDesign || 0];
        const wallColor = document.getElementById('designWallColor')?.value || design.color1;
        const floorColor = document.getElementById('designFloorColor')?.value || design.color2;
        const lighting = document.getElementById('designLighting')?.value || 'daylight';
        const furniture = document.getElementById('designFurniture')?.value || 'modern';

        const lightingFilters = {
            'daylight': 'brightness(100%)',
            'warm': 'brightness(90%) sepia(20%)',
            'cool': 'brightness(105%) hue-rotate(180deg)',
            'cozy': 'brightness(65%) sepia(15%)'
        };

        const furnitureEmojis = {
            'modern': '🛋️🪑📺',
            'classic': '🪑🕯️🏛️',
            'scandi': '🌲🪴🪑',
            'industrial': '🏭🪑💡',
            'japandi': '🏯🧘🪑',
            'boho': '🌴🪑🧶'
        };

        preview.innerHTML = `
            <div style="height:250px;background:linear-gradient(135deg, ${wallColor} 0%, ${floorColor} 100%);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:24px;filter:${lightingFilters[lighting] || ''};">
                <div style="text-align:center;color:white;text-shadow:0 2px 8px rgba(0,0,0,0.3);">
                    <div style="font-size:3rem;margin-bottom:8px;">${furnitureEmojis[furniture] || '🏠'}</div>
                    <h3 style="font-family:var(--font-display);font-size:1.5rem;">${design.label}</h3>
                    <p>${design.desc}</p>
                </div>
            </div>
        `;
    }

    function renderBudgetEstimate() {
        const container = document.getElementById('budgetEstimate');
        if (!container) return;
        
        const budget = parseInt(document.getElementById('budgetSlider')?.value || 250000);
        const styleMult = styles.find(s => s.id === selectedStyle)?.budgetMultiplier || 1;
        const estimated = Math.round(budget * styleMult);
        
        container.innerHTML = `
            <div style="background:var(--bg-warm);padding:16px;border-radius:8px;border:1px solid var(--border);margin-top:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <span style="font-size:0.85rem;color:var(--text-light);">Your Budget</span>
                    <span style="font-size:0.9rem;font-weight:600;color:var(--primary);">₹${budget.toLocaleString('en-IN')}</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <span style="font-size:0.85rem;color:var(--text-light);">Style Multiplier</span>
                    <span style="font-size:0.9rem;font-weight:600;color:var(--accent);">${styleMult}x</span>
                </div>
                <div style="height:1px;background:var(--border);margin:8px 0;"></div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:0.9rem;font-weight:600;color:var(--primary);">Estimated Cost</span>
                    <span style="font-size:1.1rem;font-weight:700;color:var(--success);">₹${estimated.toLocaleString('en-IN')}</span>
                </div>
                <p style="font-size:0.75rem;color:var(--text-light);margin-top:8px;">*Estimate includes materials, labor, and installation. Final quote may vary.</p>
            </div>
        `;
    }

    function renderMaterialRecommendations() {
        const container = document.getElementById('resultMaterials');
        if (!container || !selectedStyle) return;
        const mats = materials[selectedStyle] || [];
        container.innerHTML = `
            <h4 style="font-size:0.9rem;margin:16px 0 10px;color:var(--primary);">🛠️ Recommended Materials</h4>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
                ${mats.map(m => `<span style="font-size:0.8rem;background:var(--primary);color:var(--gold);padding:6px 14px;border-radius:20px;">${m}</span>`).join('')}
            </div>
        `;
    }

    function saveCurrentDesign() {
        const design = designResults[selectedDesign || 0];
        const wallColor = document.getElementById('designWallColor')?.value || design.color1;
        const floorColor = document.getElementById('designFloorColor')?.value || design.color2;
        const roomType = document.getElementById('roomType')?.value || 'living';
        
        const saved = {
            name: `${styles.find(s => s.id === selectedStyle)?.name || 'Custom'} Design ${savedDesigns.length + 1}`,
            style: selectedStyle,
            roomType: roomType,
            wallColor: wallColor,
            floorColor: floorColor,
            lighting: document.getElementById('designLighting')?.value || 'daylight',
            furniture: document.getElementById('designFurniture')?.value || 'modern',
            date: new Date().toLocaleDateString()
        };
        
        savedDesigns.push(saved);
        localStorage.setItem('hnh_ai_designs', JSON.stringify(savedDesigns));
        renderSavedDesigns();
        showToast('Design saved to your gallery!');
    }

    function loadDesign(design) {
        document.getElementById('designWallColor').value = design.wallColor;
        document.getElementById('designFloorColor').value = design.floorColor;
        document.getElementById('designLighting').value = design.lighting;
        document.getElementById('designFurniture').value = design.furniture;
        selectedStyle = design.style;
        
        goToStep(4);
        renderDesignPreview();
        renderBudgetEstimate();
        renderMaterialRecommendations();
        showToast(`Loaded ${design.name}`);
    }

    function updateDesignPreview() {
        if (currentStep === 4) {
            renderDesignPreview();
        }
    }

    init();
})();
