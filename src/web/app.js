// Spatio-Temporal Event Analytics - Interactive Dashboard
// JavaScript Application Logic

// Global state
let events = [];
let queryHistory = [];
let canvas, ctx;
let heatmapCanvas, heatmapCtx;
let queryCount = 0;
let totalQueryTime = 0;

// Drag selection state
let isDragging = false;
let dragStart = null;
let dragCurrent = null;

// Map bounds
const mapBounds = {
    minX: 41.75,
    maxX: 41.95,
    minY: -87.75,
    maxY: -87.55
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeCanvases();
    loadSampleData();
    setupEventListeners();
    updateStats();
});

// Initialize canvases
function initializeCanvases() {
    canvas = document.getElementById('eventCanvas');
    ctx = canvas.getContext('2d');

    heatmapCanvas = document.getElementById('heatmapCanvas');
    heatmapCtx = heatmapCanvas.getContext('2d');

    // Initial render
    renderMap();
    renderHeatmap();
}

// Load real crime data
function loadSampleData() {
    console.log('📂 Loading REAL Chicago crime data...');

    // Check if real data is available
    if (typeof realCrimeData !== 'undefined' && realCrimeData.length > 0) {
        events = realCrimeData;
        console.log(`✓ Loaded ${events.length.toLocaleString()} REAL crime events from Chicago PD dataset`);
    } else {
        // Fallback to synthetic if real data not found
        console.log('⚠️ Real data not found, generating synthetic fallback...');
        generateSyntheticData();
    }

    document.getElementById('totalEvents').textContent = events.length.toLocaleString();

    renderMap();
    renderHeatmap();
}

// Fallback: Generate synthetic data if real data not available
function generateSyntheticData() {
    const hotspots = [
        { x: 41.88, y: -87.63, weight: 0.4 },  // Downtown
        { x: 41.85, y: -87.65, weight: 0.3 },  // South
        { x: 41.91, y: -87.67, weight: 0.3 }   // North
    ];

    for (let i = 0; i < 2000; i++) {
        let x, y, time;

        // 70% from hotspots, 30% random
        if (Math.random() < 0.7) {
            const hotspot = hotspots[Math.floor(Math.random() * hotspots.length)];
            x = gaussian(hotspot.x, 0.02);
            y = gaussian(hotspot.y, 0.02);
        } else {
            x = mapBounds.minX + Math.random() * (mapBounds.maxX - mapBounds.minX);
            y = mapBounds.minY + Math.random() * (mapBounds.maxY - mapBounds.minY);
        }

        // More events at night (8 PM - 4 AM)
        if (Math.random() < 0.4) {
            time = Math.random() < 0.5
                ? Math.floor(Math.random() * 240)      // 12 AM - 4 AM
                : 1200 + Math.floor(Math.random() * 240); // 8 PM - 12 AM
        } else {
            time = 240 + Math.floor(Math.random() * 960); // 4 AM - 8 PM
        }

        events.push({ x, y, time, weight: 1 });
    }

    console.log(`✓ Generated ${events.length} synthetic events (fallback)`);
}

// Gaussian random number generator
function gaussian(mean, stdDev) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z0 * stdDev;
}

// Render event map
function renderMap() {
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 10; i++) {
        const x = (width / 10) * i;
        const y = (height / 10) * i;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // Draw events
    events.forEach(event => {
        const px = mapToPixel(event.x, mapBounds.minX, mapBounds.maxX, 0, width);
        const py = mapToPixel(event.y, mapBounds.minY, mapBounds.maxY, height, 0);

        ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw hotspot indicators
    const hotspots = findHotspots();
    hotspots.forEach(hotspot => {
        const px = mapToPixel(hotspot.x, mapBounds.minX, mapBounds.maxX, 0, width);
        const py = mapToPixel(hotspot.y, mapBounds.minY, mapBounds.maxY, height, 0);

        // Pulsating circle
        const radius = 30 + Math.sin(Date.now() / 500) * 5;

        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.fill();
    });

    // Draw selection rectangle while dragging
    if (isDragging && dragStart && dragCurrent) {
        const x1 = Math.min(dragStart.x, dragCurrent.x);
        const y1 = Math.min(dragStart.y, dragCurrent.y);
        const x2 = Math.max(dragStart.x, dragCurrent.x);
        const y2 = Math.max(dragStart.y, dragCurrent.y);

        // Draw selection rectangle
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.9)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

        ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
        ctx.fillRect(x1, y1, x2 - x1, y2 - y1);

        ctx.setLineDash([]); // Reset dash
    }
}

// Find event hotspots using simple clustering
function findHotspots() {
    const gridSize = 0.05;
    const grid = {};

    events.forEach(event => {
        const gx = Math.floor(event.x / gridSize);
        const gy = Math.floor(event.y / gridSize);
        const key = `${gx},${gy}`;

        if (!grid[key]) {
            grid[key] = { count: 0, x: 0, y: 0 };
        }

        grid[key].count++;
        grid[key].x += event.x;
        grid[key].y += event.y;
    });

    // Find top 3 hotspots
    const hotspots = Object.values(grid)
        .filter(cell => cell.count > 20)
        .map(cell => ({
            x: cell.x / cell.count,
            y: cell.y / cell.count,
            count: cell.count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

    return hotspots;
}

// Render temporal heatmap
function renderHeatmap() {
    const width = heatmapCanvas.width;
    const height = heatmapCanvas.height;

    // Clear
    heatmapCtx.fillStyle = '#0f172a';
    heatmapCtx.fillRect(0, 0, width, height);

    // Count events per hour
    const hourCounts = new Array(24).fill(0);

    events.forEach(event => {
        const hour = Math.floor(event.time / 60);
        hourCounts[hour]++;
    });

    const maxCount = Math.max(...hourCounts);

    // Draw bars
    const barWidth = width / 24;

    hourCounts.forEach((count, hour) => {
        const barHeight = (count / maxCount) * height * 0.9;
        const x = hour * barWidth;
        const y = height - barHeight;

        // Color gradient based on intensity
        const intensity = count / maxCount;
        const hue = 240 - intensity * 60; // Blue to red
        heatmapCtx.fillStyle = `hsl(${hue}, 70%, 50%)`;

        heatmapCtx.fillRect(x + 2, y, barWidth - 4, barHeight);

        // Label
        if (hour % 3 === 0) {
            heatmapCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            heatmapCtx.font = '10px Inter';
            heatmapCtx.textAlign = 'center';
            heatmapCtx.fillText(`${hour}:00`, x + barWidth / 2, height - 5);
        }
    });
}

// Map coordinate to pixel
function mapToPixel(value, minVal, maxVal, minPx, maxPx) {
    return minPx + ((value - minVal) / (maxVal - minVal)) * (maxPx - minPx);
}

// Convert pixel coordinates to lat/lon coordinates
function pixelToCoords(start, end) {
    const width = canvas.width;
    const height = canvas.height;

    // Convert pixel X to latitude
    const x1Pixel = Math.min(start.x, end.x);
    const x2Pixel = Math.max(start.x, end.x);
    const x1 = mapBounds.minX + (x1Pixel / width) * (mapBounds.maxX - mapBounds.minX);
    const x2 = mapBounds.minX + (x2Pixel / width) * (mapBounds.maxX - mapBounds.minX);

    // Convert pixel Y to longitude (inverted Y axis)
    const y1Pixel = Math.min(start.y, end.y);
    const y2Pixel = Math.max(start.y, end.y);
    const y1 = mapBounds.maxY - (y2Pixel / height) * (mapBounds.maxY - mapBounds.minY);
    const y2 = mapBounds.maxY - (y1Pixel / height) * (mapBounds.maxY - mapBounds.minY);

    return { x1, y1, x2, y2 };
}

// Setup event listeners
function setupEventListeners() {
    // Time slider updates
    const t1 = document.getElementById('t1');
    const t2 = document.getElementById('t2');

    t1.addEventListener('input', () => {
        document.getElementById('t1Display').textContent = minutesToTime(parseInt(t1.value));
    });

    t2.addEventListener('input', () => {
        document.getElementById('t2Display').textContent = minutesToTime(parseInt(t2.value));
    });

    // Canvas drag selection
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;

        isDragging = true;
        dragStart = { x: px, y: py };
        dragCurrent = { x: px, y: py };

        // Hide overlay during drag
        document.getElementById('mapOverlay').style.opacity = '0';
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;

        // Convert to lat/lon for display
        const x = mapBounds.minX + (px / canvas.width) * (mapBounds.maxX - mapBounds.minX);
        const y = mapBounds.maxY - (py / canvas.height) * (mapBounds.maxY - mapBounds.minY);

        document.getElementById('mapCoords').textContent =
            `(${x.toFixed(4)}, ${y.toFixed(4)})`;

        // Update drag position if dragging
        if (isDragging) {
            dragCurrent = { x: px, y: py };
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        if (!isDragging) return;

        const rect = canvas.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;

        dragCurrent = { x: px, y: py };

        // Convert pixel coordinates to lat/lon
        const coords = pixelToCoords(dragStart, dragCurrent);

        // Update input fields
        document.getElementById('x1').value = coords.x1.toFixed(4);
        document.getElementById('y1').value = coords.y1.toFixed(4);
        document.getElementById('x2').value = coords.x2.toFixed(4);
        document.getElementById('y2').value = coords.y2.toFixed(4);

        // Reset drag state
        isDragging = false;
        dragStart = null;
        dragCurrent = null;

        // Show overlay again
        setTimeout(() => {
            const overlay = document.getElementById('mapOverlay');
            if (overlay) overlay.style.opacity = '';
        }, 100);

        console.log(`✓ Region selected: (${coords.x1.toFixed(2)}, ${coords.y1.toFixed(2)}) to (${coords.x2.toFixed(2)}, ${coords.y2.toFixed(2)})`);
    });

    canvas.addEventListener('mouseleave', () => {
        if (isDragging) {
            // Cancel drag if mouse leaves canvas
            isDragging = false;
            dragStart = null;
            dragCurrent = null;
        }
    });

    // Animation loop for pulsating hotspots
    setInterval(renderMap, 50);
}

// Convert minutes to time string
function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// Set time range
function setTimeRange(t1, t2) {
    document.getElementById('t1').value = t1;
    document.getElementById('t2').value = t2;
    document.getElementById('t1Display').textContent = minutesToTime(t1);
    document.getElementById('t2Display').textContent = minutesToTime(t2);
}

// Run query (simulated)
function runQuery() {
    const x1 = parseFloat(document.getElementById('x1').value);
    const y1 = parseFloat(document.getElementById('y1').value);
    const x2 = parseFloat(document.getElementById('x2').value);
    const y2 = parseFloat(document.getElementById('y2').value);
    const t1 = parseInt(document.getElementById('t1').value);
    const t2 = parseInt(document.getElementById('t2').value);

    // Simulate query processing
    const startTime = performance.now();

    // Count events in range
    let count = 0;
    events.forEach(event => {
        const inSpatialRange = event.x >= Math.min(x1, x2) &&
            event.x <= Math.max(x1, x2) &&
            event.y >= Math.min(y1, y2) &&
            event.y <= Math.max(y1, y2);

        let inTemporalRange;
        if (t1 <= t2) {
            inTemporalRange = event.time >= t1 && event.time <= t2;
        } else {
            // Wraps around midnight
            inTemporalRange = event.time >= t1 || event.time <= t2;
        }

        if (inSpatialRange && inTemporalRange) {
            count++;
        }
    });

    const endTime = performance.now();
    const queryTime = (endTime - startTime).toFixed(3);

    // Update stats
    queryCount++;
    totalQueryTime += parseFloat(queryTime);
    updateStats(count, queryTime);

    // Add to results
    addQueryResult(count, x1, y1, x2, y2, t1, t2, queryTime);

    // Visual feedback
    highlightQueryRegion(x1, y1, x2, y2);
}

// Update statistics
function updateStats(lastResult = null, lastTime = null) {
    document.getElementById('totalEvents').textContent = events.length.toLocaleString();
    document.getElementById('queriesRun').textContent = queryCount;

    if (queryCount > 0) {
        const avgTime = (totalQueryTime / queryCount).toFixed(3);
        document.getElementById('avgQueryTime').textContent = `${avgTime} ms`;
    }

    if (lastResult !== null) {
        document.getElementById('lastResult').textContent = lastResult.toLocaleString();
    }
}

// Add query result to panel
function addQueryResult(count, x1, y1, x2, y2, t1, t2, queryTime) {
    const container = document.getElementById('resultsContainer');

    // Remove empty state
    const emptyState = container.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    // Create result element
    const resultDiv = document.createElement('div');
    resultDiv.className = 'result-item';
    resultDiv.innerHTML = `
        <div class="result-header">
            <div class="result-count">${count.toLocaleString()} events</div>
            <div class="result-time">⚡ ${queryTime} ms</div>
        </div>
        <div class="result-details">
            📍 Region: (${x1.toFixed(2)}, ${y1.toFixed(2)}) → (${x2.toFixed(2)}, ${y2.toFixed(2)})<br>
            ⏰ Time: ${minutesToTime(t1)} → ${minutesToTime(t2)}
        </div>
    `;

    // Insert at top
    container.insertBefore(resultDiv, container.firstChild);

    // Limit to 10 results
    while (container.children.length > 10) {
        container.removeChild(container.lastChild);
    }
}

// Highlight query region on map
function highlightQueryRegion(x1, y1, x2, y2) {
    const width = canvas.width;
    const height = canvas.height;

    const px1 = mapToPixel(Math.min(x1, x2), mapBounds.minX, mapBounds.maxX, 0, width);
    const py1 = mapToPixel(Math.max(y1, y2), mapBounds.minY, mapBounds.maxY, height, 0);
    const px2 = mapToPixel(Math.max(x1, x2), mapBounds.minX, mapBounds.maxX, 0, width);
    const py2 = mapToPixel(Math.min(y1, y2), mapBounds.minY, mapBounds.maxY, height, 0);

    // Draw highlight
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
    ctx.lineWidth = 3;
    ctx.strokeRect(px1, py1, px2 - px1, py2 - py1);

    ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
    ctx.fillRect(px1, py1, px2 - px1, py2 - py1);

    // Fade out after 2 seconds
    setTimeout(renderMap, 2000);
}

// Reset map view
function resetMap() {
    renderMap();
}

// Clear results
function clearResults() {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <p>No queries executed yet</p>
            <p class="empty-hint">Configure parameters and click "Execute Query"</p>
        </div>
    `;

    queryCount = 0;
    totalQueryTime = 0;
    updateStats();
    document.getElementById('lastResult').textContent = '-';
}

console.log('✅ Analytics Dashboard Initialized');
