// HNHSquare - VR Walkthrough Engine
// Simulated 3D room experience with material swapping & AI palettes

(function() {
    'use strict';

    const rooms = [
        { name: 'Modern Living Room', size: '18 x 14 ft', emoji: '🛋️' },
        { name: 'Master Bedroom', size: '16 x 14 ft', emoji: '🛏️' },
        { name: 'Modular Kitchen', size: '12 x 10 ft', emoji: '🍳' },
        { name: 'Dining Area', size: '14 x 12 ft', emoji: '🍽️' }
    ];

    const wallColors = [
        { name: 'Warm White', color: '#f5f0e8' },
        { name: 'Soft Grey', color: '#e8e4df' },
        { name: 'Sage Green', color: '#c8d5b9' },
        { name: 'Dusty Blue', color: '#b8c9d9' },
        { name: 'Terracotta', color: '#d4a574' },
        { name: 'Charcoal', color: '#4a4a4a' },
        { name: 'Cream', color: '#f8f4e8' },
        { name: 'Blush Pink', color: '#e8d5d0' },
        { name: 'Navy', color: '#2c3e50' },
        { name: 'Olive', color: '#8b9a6d' }
    ];

    const floorMaterials = [
        { name: 'Oak Wood', color: '#c9a96e' },
        { name: 'Walnut', color: '#8b6f4e' },
        { name: 'White Marble', color: '#e8e8e8' },
        { name: 'Grey Tile', color: '#a0a0a0' },
        { name: 'Terrazzo', color: '#d4c4a8' },
        { name: 'Black Granite', color: '#3a3a3a' },
        { name: 'Bamboo', color: '#d4c4a0' },
        { name: 'Cement', color: '#b0b0b0' },
        { name: 'Red Oak', color: '#b87a5a' },
        { name: 'Teak', color: '#a08050' }
    ];

    const furnitureItems = [
        { id: 101, name: 'Sectional Sofa', emoji: '🛋️', width: 200, height: 80, left: 200, top: 180 },
        { id: 102, name: 'Coffee Table', emoji: '🪑', width: 80, height: 40, left: 260, top: 220 },
        { id: 103, name: 'TV Unit', emoji: '📺', width: 150, height: 50, left: 225, top: 100 },
        { id: 104, name: 'Floor Lamp', emoji: '💡', width: 30, height: 100, left: 120, top: 150 },
        { id: 105, name: 'Accent Chair', emoji: '🪑', width: 70, height: 70, left: 400, top: 160 },
        { id: 106, name: 'Rug', emoji: '🧶', width: 180, height: 100, left: 210, top: 200 }
    ];

    // AI-curated color palettes
    const aiPalettes = [
        { name: 'Warm Minimal', desc: 'Cozy & clean', colors: ['#f5f0e8', '#c9a96e', '#d4a574', '#e8e4df'] },
        { name: 'Scandinavian', desc: 'Bright & airy', colors: ['#f8f4e8', '#d4c4a8', '#b8c9d9', '#e8d5d0'] },
        { name: 'Modern Luxe', desc: 'Bold & elegant', colors: ['#e8e4df', '#8b6f4e', '#2c3e50', '#c9a96e'] },
        { name: 'Japandi', desc: 'Calm & natural', colors: ['#e8d5d0', '#b8c9d9', '#d4c4a8', '#f5f0e8'] },
        { name: 'Industrial', desc: 'Raw & urban', colors: ['#4a4a4a', '#3a3a3a', '#a0a0a0', '#b0b0b0'] },
        { name: 'Bohemian', desc: 'Vibrant & free', colors: ['#e8d5c4', '#c9a96e', '#d4a574', '#e8d5d0'] }
    ];

    let currentRoom = 0;
    let selectedFurniture = new Set();
    let isDragging = false;
    let startX = 0, startY = 0;
    let rotX = -10, rotY = 0;

    function init() {
        const viewport = document.getElementById('vrViewport');
        if (!viewport) return;

        renderWallSwatches();
        renderFloorSwatches();
        renderFurnitureList();
        renderLightingOptions();
        renderAIPalettes();
        renderRoom();
        bindEvents();
    }

    function renderWallSwatches() {
        const container = document.getElementById('wallSwatches');
        if (!container) return;
        container.innerHTML = wallColors.map((c, i) => `
            <div class="vr-swatch ${i === 0 ? 'active' : ''}" style="background:${c.color}" title="${c.name}" data-color="${c.color}" data-type="wall"></div>
        `).join('');
    }

    function renderFloorSwatches() {
        const container = document.getElementById('floorSwatches');
        if (!container) return;
        container.innerHTML = floorMaterials.map((m, i) => `
            <div class="vr-swatch ${i === 0 ? 'active' : ''}" style="background:${m.color}" title="${m.name}" data-color="${m.color}" data-type="floor"></div>
        `).join('');
    }

    function renderFurnitureList() {
        const container = document.getElementById('furnitureList');
        if (!container) return;
        container.innerHTML = furnitureItems.map(item => `
            <div class="vr-furniture-item-card ${selectedFurniture.has(item.id) ? 'selected' : ''}" data-id="${item.id}">
                <div class="vr-furniture-thumb">${item.emoji}</div>
                <div class="vr-furniture-info">
                    <h5>${item.name}</h5>
                    <p>Tap to add/remove</p>
                </div>
            </div>
        `).join('');
    }

    function renderLightingOptions() {
        const container = document.getElementById('lightingOptions');
        if (!container) return;
        const moods = ['Daylight', 'Warm Evening', 'Cool White', 'Cozy Dim', 'Party Mode'];
        container.innerHTML = moods.map((m, i) => `
            <div class="vr-option ${i === 0 ? 'active' : ''}" data-mood="${m}">${m}</div>
        `).join('');
    }

    function renderAIPalettes() {
        const container = document.getElementById('aiPalettes');
        if (!container) return;
        container.innerHTML = aiPalettes.map(p => `
            <div class="ai-palette-card" data-wall="${p.colors[0]}" data-floor="${p.colors[1]}">
                <div class="ai-palette-colors">
                    ${p.colors.map(c => `<div class="ai-palette-color" style="background:${c}"></div>`).join('')}
                </div>
                <div class="ai-palette-name">${p.name}</div>
                <div class="ai-palette-desc">${p.desc}</div>
            </div>
        `).join('');
    }

    function renderRoom() {
        const room = rooms[currentRoom];
        const nameEl = document.getElementById('vrRoomName');
        const sizeEl = document.getElementById('vrRoomSize');
        if (nameEl) nameEl.textContent = room.name;
        if (sizeEl) sizeEl.textContent = room.size;

        const furnitureContainer = document.getElementById('vrFurniture');
        if (furnitureContainer) {
            furnitureContainer.innerHTML = furnitureItems.map(item => {
                const isSelected = selectedFurniture.has(item.id);
                return `
                    <div class="vr-furniture-item ${isSelected ? 'selected' : ''}" 
                         style="left:${item.left}px;top:${item.top}px;width:${item.width}px;height:${item.height}px;${isSelected ? '' : 'opacity:0.3;'}"
                         data-id="${item.id}">
                        ${item.emoji}
                    </div>
                `;
            }).join('');
        }
    }

    function bindEvents() {
        // Room navigation
        document.getElementById('vrPrevRoom')?.addEventListener('click', () => {
            currentRoom = (currentRoom - 1 + rooms.length) % rooms.length;
            renderRoom();
        });
        document.getElementById('vrNextRoom')?.addEventListener('click', () => {
            currentRoom = (currentRoom + 1) % rooms.length;
            renderRoom();
        });

        // Fullscreen
        document.getElementById('vrFullscreen')?.addEventListener('click', () => {
            const el = document.getElementById('vrViewport');
            if (el.requestFullscreen) el.requestFullscreen();
        });

        // Wall swatches
        document.getElementById('wallSwatches')?.addEventListener('click', (e) => {
            const swatch = e.target.closest('.vr-swatch');
            if (!swatch) return;
            document.querySelectorAll('#wallSwatches .vr-swatch').forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            const color = swatch.dataset.color;
            applyWallColor(color);
        });

        // Custom wall color
        document.getElementById('customWallColor')?.addEventListener('input', (e) => {
            applyWallColor(e.target.value);
            document.querySelectorAll('#wallSwatches .vr-swatch').forEach(s => s.classList.remove('active'));
        });

        // Floor swatches
        document.getElementById('floorSwatches')?.addEventListener('click', (e) => {
            const swatch = e.target.closest('.vr-swatch');
            if (!swatch) return;
            document.querySelectorAll('#floorSwatches .vr-swatch').forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            applyFloorColor(swatch.dataset.color);
        });

        // Custom floor color
        document.getElementById('customFloorColor')?.addEventListener('input', (e) => {
            applyFloorColor(e.target.value);
            document.querySelectorAll('#floorSwatches .vr-swatch').forEach(s => s.classList.remove('active'));
        });

        // Furniture selection
        document.getElementById('furnitureList')?.addEventListener('click', (e) => {
            const card = e.target.closest('.vr-furniture-item-card');
            if (!card) return;
            const id = parseInt(card.dataset.id);
            if (selectedFurniture.has(id)) {
                selectedFurniture.delete(id);
                card.classList.remove('selected');
            } else {
                selectedFurniture.add(id);
                card.classList.add('selected');
            }
            renderRoom();
        });

        // Tabs
        document.querySelectorAll('.vr-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.vr-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.vr-tab-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('tab-' + tab.dataset.tab)?.classList.add('active');
            });
        });

        // Lighting
        document.getElementById('lightingOptions')?.addEventListener('click', (e) => {
            const opt = e.target.closest('.vr-option');
            if (!opt) return;
            document.querySelectorAll('#lightingOptions .vr-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            applyLighting(opt.dataset.mood);
        });

        // Brightness
        document.getElementById('brightnessSlider')?.addEventListener('input', (e) => {
            const val = e.target.value;
            document.querySelector('.vr-scene').style.filter = `brightness(${val}%)`;
        });

        // Mouse drag for rotation
        const viewport = document.getElementById('vrViewport');
        if (viewport) {
            viewport.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                document.getElementById('lookHint').style.display = 'none';
            });
            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                rotY += dx * 0.3;
                rotX = Math.max(-30, Math.min(10, rotX - dy * 0.3));
                document.getElementById('vrRoom').style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
                startX = e.clientX;
                startY = e.clientY;
            });
            window.addEventListener('mouseup', () => isDragging = false);
        }

        // AI Palette click
        document.getElementById('aiPalettes')?.addEventListener('click', (e) => {
            const card = e.target.closest('.ai-palette-card');
            if (!card) return;
            const wallColor = card.dataset.wall;
            const floorColor = card.dataset.floor;
            applyWallColor(wallColor);
            applyFloorColor(floorColor);
            document.getElementById('customWallColor').value = wallColor;
            document.getElementById('customFloorColor').value = floorColor;
            showToast(`Applied ${card.querySelector('.ai-palette-name').textContent} palette`);
        });

        // Panel toggle
        document.getElementById('vrPanelToggle')?.addEventListener('click', () => {
            const body = document.getElementById('vrPanelBody');
            const btn = document.getElementById('vrPanelToggle');
            if (body.style.display === 'none') {
                body.style.display = 'block';
                btn.textContent = '−';
            } else {
                body.style.display = 'none';
                btn.textContent = '+';
            }
        });
    }

    function applyWallColor(color) {
        document.querySelectorAll('.vr-wall-left, .vr-wall-right').forEach(w => {
            w.style.background = `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -20)} 100%)`;
        });
        document.querySelector('.vr-wall-back').style.background = `linear-gradient(135deg, ${adjustColor(color, -10)} 0%, ${adjustColor(color, -30)} 100%)`;
    }

    function applyFloorColor(color) {
        document.querySelector('.vr-floor').style.background = `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -20)} 100%)`;
    }

    function applyLighting(mood) {
        const scene = document.querySelector('.vr-scene');
        const moods = {
            'Daylight': 'brightness(100%) sepia(0%)',
            'Warm Evening': 'brightness(85%) sepia(30%)',
            'Cool White': 'brightness(110%) sepia(0%) hue-rotate(180deg)',
            'Cozy Dim': 'brightness(60%) sepia(20%)',
            'Party Mode': 'brightness(90%) saturate(150%)'
        };
        scene.style.filter = moods[mood] || moods['Daylight'];
    }

    function adjustColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, Math.min(255, (num >> 16) + amt));
        const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
        const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    init();
})();
