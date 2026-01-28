import { MapBounds } from '../types';

/**
 * Map coordinate to pixel
 */
export const mapToPixel = (value: number, minVal: number, maxVal: number, minPx: number, maxPx: number): number => {
    return minPx + ((value - minVal) / (maxVal - minVal)) * (maxPx - minPx);
};

/**
 * Pixel to coordinate
 */
export const pixelToCoords = (
    px: number,
    py: number,
    width: number,
    height: number,
    bounds: MapBounds
): { x: number; y: number } => {
    const x = bounds.minX + (px / width) * (bounds.maxX - bounds.minX);
    const y = bounds.maxY - (py / height) * (bounds.maxY - bounds.minY);
    return { x, y };
};

/**
 * Draw glassmorphic background effect on canvas
 */
export const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Deep slate background with a subtle topographical gradient
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#020617');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle grid with dataset-aware accents
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 0.5;
    const step = 60;

    // Draw Grid
    ctx.beginPath();
    for (let x = 0; x < width; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Add glowing corners or accents if needed
    ctx.fillStyle = 'rgba(34, 211, 238, 0.05)'; // Cyan glow corner
    ctx.beginPath();
    ctx.arc(0, 0, 150, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(249, 115, 22, 0.03)'; // Saffron glow corner (India accent)
    ctx.beginPath();
    ctx.arc(width, height, 200, 0, Math.PI * 2);
    ctx.fill();
};
