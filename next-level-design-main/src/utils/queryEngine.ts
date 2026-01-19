import { Event, QueryParams, Stats, QueryResult } from '../types';

/**
 * Utility function to convert milliseconds to HH:MM time string
 */
export const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

/**
 * Executes a spatio-temporal query on the event dataset
 * Ported from app.js functionality
 */
export const executeQuery = (events: Event[], params: QueryParams): { count: number; time: number } => {
    const startTime = performance.now();
    let count = 0;

    const { x1, y1, x2, y2, t1, t2 } = params;
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    events.forEach(event => {
        const inSpatialRange = event.x >= minX &&
            event.x <= maxX &&
            event.y >= minY &&
            event.y <= maxY;

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
    return { count, time: endTime - startTime };
};

/**
 * Simple clustering to find hotspots
 */
export const findHotspots = (events: Event[], gridSize = 0.05) => {
    const grid: Record<string, { count: number; x: number; y: number }> = {};

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

    return Object.values(grid)
        .filter(cell => cell.count > 20)
        .map(cell => ({
            x: cell.x / cell.count,
            y: cell.y / cell.count,
            count: cell.count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
};
