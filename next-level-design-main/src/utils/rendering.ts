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
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Subtle grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const step = 50;
    for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
};
