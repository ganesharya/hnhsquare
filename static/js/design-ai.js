// HNHSquare - AI Design Studio
// Simulated AI interior design generation with instant customization

(function() {
    'use strict';

    const styles = [
        { id: 'modern', name: 'Modern Minimal', emoji: '⬜', desc: 'Clean lines, neutral palette' },
        { id: 'classic', name: 'Classic Luxury', emoji: '👑', desc: 'Ornate details, rich textures' },
        { id: 'scandi', name: 'Scandinavian', emoji: '🌲', desc: 'Light wood, cozy hygge' },
        { id: 'industrial', name: 'Industrial', emoji: '🏭', desc: 'Raw materials, exposed elements' },
        { id: 'bohemian', name: 'Bohemian', emoji: '🌸', desc: 'Eclectic, colorful, layered' },
        { id: 'japandi', name: 'Japandi', emoji: '🏯', desc: 'Japanese + Scandinavian fusion' }
    ];

    const colors = [
        '#E8D5C4', '#C4D5E8', '#D5E8D4', '#E8D4D5', '#D4D5E8', '#E8E4D4',
        '#D4E8E4', '#E8D4E4', '#D4E8D5', '#E8E8D4', '#D5D4E8', '#E4D4E8'
    ];

    const designResults = [
        { label: 'Option A', desc: 'Balanced layout with focal point', color1: '#f5f0e8', color2: '#c9a96e' },
        { label: 'Option B', desc: 'Maximized storage & flow', color1: '#e8e4df', color2: '#8b6f4e' },
        { label: 'Option C', desc: 'Open concept with zones', color1: '#d4c4a8', color2: '#a08050' }
    ];

    let currentStep = 1;
    let selectedStyle = null;
    let selectedColor = null;
    let selectedDesign = null;

    function init() {
        renderStyles();
        renderColors();
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

    function updateDesignPreview() {
        if (currentStep === 4) {
            renderDesignPreview();
        }
    }

    init();
})();
