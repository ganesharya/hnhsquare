// HNHSquare - Enhanced VR Walkthrough Engine
// Simulated 3D room experience with material swapping, AI palettes, save/share, auto-rotation

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

    const aiPalettes = [
        { name: 'Warm Minimal', desc: 'Cozy & clean', colors: ['#f5f0e8', '#c9a96e', '#d4a574', '#e8e4df'] },
        { name: 'Scandinavian', desc: 'Bright & airy', colors: ['#f8f4e8', '#d4c4a8', '#b8c9d9', '#e8d5d0'] },
        { name: 'Modern Luxe', desc: 'Bold & elegant', colors: ['#e8e4df', '#8b6f4e', '#2c3e50', '#c9a96e'] },
        { name: 'Japandi', desc: 'Calm & natural', colors: ['#e8d5d0', '#b8c9d9', '#d4c4a8', '#f5f0e8'] },
        { name: 'Industrial', desc: 'Raw & urban', colors: ['#4a4a4a', '#3a3a3a', '#a0a0a0', '#b0b0b0'] },
        { name: 'Bohemian', desc: 'Vibrant & free', colors: ['#e8d5c4', '#c9a96e', '#d4a574', '#e8d5d0'] }
    ];

    const roomPresets = [
        { name: 'Minimalist Zen', wall: '#f5f0e8', floor: '#c9a96e', lighting: 'Daylight', furniture: [101, 102, 103, 104] },
        { name: 'Cozy Evening', wall: '#e8d5d0', floor: '#8b6f4e', lighting: 'Warm Evening', furniture: [101, 102, 104, 105, 106] },
        { name: 'Modern Office', wall: '#e8e4df', floor: '#a0a0a0', lighting: 'Cool White', furniture: [102, 103, 104, 105] },
        { name: 'Party Ready', wall: '#4a4a4a', floor: '#3a3a3a', lighting: 'Party Mode', furniture: [101, 102, 103, 104, 105, 106] }
    ];

    let currentRoom = 0;
    let selectedFurniture = new Set();
    let isDragging = false;
    let startX = 0, startY = 0;
    let rotX = -10, rotY = 0;
    let autoRotateInterval = null;
    let isAutoRotating = false;
    let savedDesigns = JSON.parse(localStorage.getItem('hnh_vr_designs') || '[]');

    function init() {
        const viewport = document.getElementById('vrViewport');
        if (!viewport) return;

        renderWallSwatches();
        renderFloorSwatches();
        renderFurnitureList();
        renderLightingOptions();
        renderAIPalettes();
        renderRoomPresets();
        renderSavedDesigns();
        renderRoom();
        bindEvents();
        
        // Auto-rotate hint
        setTimeout(() => {
            const hint = document.getElementById('lookHint');
            if (hint) hint.textContent = 'Drag to look around • Double-click to auto-rotate';
        }, 3000);
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

    function renderRoomPresets() {
        const container = document.getElementById('roomPresets');
        if (!container) return;
        container.innerHTML = roomPresets.map((p, i) => `
            <div class="vr-preset-card" data-index="${i}">
                <div style="display:flex;gap:4px;margin-bottom:8px;">
                    <div style="flex:1;height:24px;background:${p.wall};border-radius:4px;"></div>
                    <div style="flex:1;height:24px;background:${p.floor};border-radius:4px;"></div>
                </div>
                <div style="font-size:0.8rem;font-weight:600;color:rgba(255,255,255,0.8);">${p.name}</div>
                <div style="font-size:0.7rem;color:rgba(255,255,255,0.5);">${p.lighting} • ${p.furniture.length} items</div>
            </div>
        `).join('');
    }

    function renderSavedDesigns() {
        const container = document.getElementById('savedDesigns');
        if (!container) return;
        if (savedDesigns.length === 0) {
            container.innerHTML = '<p style="font-size:0.8rem;color:rgba(255,255,255,0.4);text-align:center;">No saved designs yet</p>';
            return;
        }
        container.innerHTML = savedDesigns.map((d, i) => `
            <div class="vr-saved-design" data-index="${i}">
                <div style="display:flex;gap:4px;margin-bottom:6px;">
                    <div style="width:20px;height:20px;background:${d.wall};border-radius:4px;"></div>
                    <div style="width:20px;height:20px;background:${d.floor};border-radius:4px;"></div>
                </div>
                <div style="font-size:0.75rem;color:rgba(255,255,255,0.7);">${d.name}</div>
                <div style="font-size:0.65rem;color:rgba(255,255,255,0.4);">${d.date}</div>
            </div>
        `).join('');
    }

    function renderRoom() {
        const room = rooms[currentRoom];
        const nameEl = document.getElementById('vrRoomName');
        const sizeEl = document.getElementById('vrRoomSize');
        if (nameEl) {
            nameEl.style.opacity = '0';
            setTimeout(() => {
                nameEl.textContent = room.name;
                nameEl.style.opacity = '1';
            }, 150);
        }
        if (sizeEl) {
            sizeEl.style.opacity = '0';
            setTimeout(() => {
                sizeEl.textContent = room.size;
                sizeEl.style.opacity = '1';
            }, 150);
        }

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
        // Room navigation with transition
        document.getElementById('vrPrevRoom')?.addEventListener('click', () => {
            transitionRoom((currentRoom - 1 + rooms.length) % rooms.length);
        });
        document.getElementById('vrNextRoom')?.addEventListener('click', () => {
            transitionRoom((currentRoom + 1) % rooms.length);
        });

        // Fullscreen
        document.getElementById('vrFullscreen')?.addEventListener('click', () => {
            const el = document.getElementById('vrViewport');
            if (el.requestFullscreen) el.requestFullscreen();
        });

        // Auto-rotate toggle
        document.getElementById('vrAutoRotate')?.addEventListener('click', toggleAutoRotate);

        // Screenshot
        document.getElementById('vrScreenshot')?.addEventListener('click', takeScreenshot);

        // Save design
        document.getElementById('vrSaveDesign')?.addEventListener('click', saveCurrentDesign);

        // Wall swatches
        document.getElementById('wallSwatches')?.addEventListener('click', (e) => {
            const swatch = e.target.closest('.vr-swatch');
            if (!swatch) return;
            document.querySelectorAll('#wallSwatches .vr-swatch').forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            applyWallColor(swatch.dataset.color);
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
                if (isAutoRotating) toggleAutoRotate(); // stop auto-rotate on manual interaction
            });
            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                rotY += dx * 0.3;
                rotX = Math.max(-30, Math.min(10, rotX - dy * 0.3));
                updateRoomRotation();
                startX = e.clientX;
                startY = e.clientY;
            });
            window.addEventListener('mouseup', () => isDragging = false);
            
            // Double-click to auto-rotate
            viewport.addEventListener('dblclick', toggleAutoRotate);
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

        // Room preset click
        document.getElementById('roomPresets')?.addEventListener('click', (e) => {
            const card = e.target.closest('.vr-preset-card');
            if (!card) return;
            const preset = roomPresets[parseInt(card.dataset.index)];
            applyPreset(preset);
            showToast(`Applied ${preset.name} preset`);
        });

        // Saved design click
        document.getElementById('savedDesigns')?.addEventListener('click', (e) => {
            const card = e.target.closest('.vr-saved-design');
            if (!card) return;
            const design = savedDesigns[parseInt(card.dataset.index)];
            if (design) {
                applyWallColor(design.wall);
                applyFloorColor(design.floor);
                document.getElementById('customWallColor').value = design.wall;
                document.getElementById('customFloorColor').value = design.floor;
                applyLighting(design.lighting);
                selectedFurniture = new Set(design.furniture);
                renderFurnitureList();
                renderRoom();
                showToast(`Loaded ${design.name}`);
            }
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

    function transitionRoom(newIndex) {
        const roomEl = document.getElementById('vrRoom');
        if (roomEl) {
            roomEl.style.transition = 'opacity 0.3s ease, transform 0.5s ease';
            roomEl.style.opacity = '0';
            roomEl.style.transform = `rotateX(${rotX}deg) rotateY(${rotY + 30}deg) scale(0.9)`;
            
            setTimeout(() => {
                currentRoom = newIndex;
                renderRoom();
                roomEl.style.transform = `rotateX(${rotX}deg) rotateY(${rotY - 30}deg) scale(0.9)`;
                setTimeout(() => {
                    roomEl.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1)`;
                    roomEl.style.opacity = '1';
                }, 50);
            }, 300);
        }
    }

    function toggleAutoRotate() {
        const btn = document.getElementById('vrAutoRotate');
        if (isAutoRotating) {
            clearInterval(autoRotateInterval);
            isAutoRotating = false;
            if (btn) btn.textContent = '🔄';
            showToast('Auto-rotate stopped');
        } else {
            isAutoRotating = true;
            if (btn) btn.textContent = '⏸';
            showToast('Auto-rotate enabled');
            autoRotateInterval = setInterval(() => {
                rotY += 0.3;
                updateRoomRotation();
            }, 16);
        }
    }

    function updateRoomRotation() {
        const room = document.getElementById('vrRoom');
        if (room) room.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    }

    function takeScreenshot() {
        const viewport = document.getElementById('vrViewport');
        if (!viewport) return;
        
        // Create a flash effect
        const flash = document.createElement('div');
        flash.style.cssText = 'position:fixed;inset:0;background:white;z-index:9999;pointer-events:none;transition:opacity 0.5s ease;';
        document.body.appendChild(flash);
        setTimeout(() => flash.style.opacity = '0', 50);
        setTimeout(() => flash.remove(), 550);
        
        showToast('Screenshot captured! (In a real app, this would download the image)');
    }

    function saveCurrentDesign() {
        const wallColor = document.getElementById('customWallColor')?.value || '#f5f0e8';
        const floorColor = document.getElementById('customFloorColor')?.value || '#c9a96e';
        const activeLighting = document.querySelector('#lightingOptions .vr-option.active')?.dataset.mood || 'Daylight';
        
        const design = {
            name: `${rooms[currentRoom].name} Design ${savedDesigns.length + 1}`,
            wall: wallColor,
            floor: floorColor,
            lighting: activeLighting,
            furniture: Array.from(selectedFurniture),
            date: new Date().toLocaleDateString()
        };
        
        savedDesigns.push(design);
        localStorage.setItem('hnh_vr_designs', JSON.stringify(savedDesigns));
        renderSavedDesigns();
        showToast('Design saved!');
    }

    function applyPreset(preset) {
        applyWallColor(preset.wall);
        applyFloorColor(preset.floor);
        document.getElementById('customWallColor').value = preset.wall;
        document.getElementById('customFloorColor').value = preset.floor;
        applyLighting(preset.lighting);
        selectedFurniture = new Set(preset.furniture);
        renderFurnitureList();
        renderRoom();
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
