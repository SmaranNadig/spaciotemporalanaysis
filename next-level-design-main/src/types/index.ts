// TypeScript types for the analytics dashboard

export interface Event {
    x: number;        // Latitude
    y: number;        // Longitude
    time: number;     // Minutes of day (0-1439)
    weight: number;   // Event weight (usually 1)
    type?: string;    // Crime type (THEFT, ASSAULT, etc.)
    description?: string; // Brief description of the crime
}

export interface QueryParams {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    t1: number;
    t2: number;
}

export interface QueryResult {
    count: number;
    queryTime: number;
    params: QueryParams;
    timestamp: number;
}

export interface Stats {
    totalEvents: number;
    avgQueryTime: number;
    queriesRun: number;
    lastResult: number | null;
}

export interface MapBounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

export interface Hotspot {
    x: number;
    y: number;
    count: number;
}
