import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Map as MapIcon,
    Clock,
    Search,
    History,
    Settings,
    Zap,
    Trash2,
    Download
} from 'lucide-react';
import { toast } from 'sonner';

import { realCrimeData } from '../data/realCrimeData';
import { indianCrimeData } from '../data/indianCrimeData';
import { Event, QueryParams, QueryResult, Stats, DatasetType, MapConfig } from '../types';
import { executeQuery, minutesToTime, findHotspots } from '../utils/queryEngine';
import { mapToPixel, drawBackground } from '../utils/rendering';

// Components
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import { TemporalHeatmap } from '../components/TemporalHeatmap';
import { QueryControls } from '../components/QueryControls';
import { QueryResults } from '../components/QueryResults';
import { CrimeSearch } from '../components/CrimeSearch';
import { MapLegend } from '../components/MapLegend';
import { DatasetTabs } from '../components/DatasetTabs';
import { InteractiveMap } from '../components/InteractiveMap';
import Footer from '../components/Footer';

// Dataset configurations
const DATASET_CONFIGS: Record<DatasetType, MapConfig> = {
    chicago: {
        minX: 41.6,
        maxX: 42.0,
        minY: -87.9,
        maxY: -87.5,
        label: 'Chicago, USA',
        defaultParams: { x1: 41.7, y1: -87.8, x2: 41.9, y2: -87.6, t1: 480, t2: 1200 }
    },
    india: {
        minX: 8.0,
        maxX: 35.0,
        minY: 68.0,
        maxY: 97.0,
        label: 'India',
        defaultParams: { x1: 12.0, y1: 72.0, x2: 28.0, y2: 85.0, t1: 480, t2: 1200 }
    }
};

const Dashboard: React.FC = () => {
    // Dataset switching state
    const [activeDataset, setActiveDataset] = useState<DatasetType>('chicago');

    // Get current events and config based on active dataset
    const events = useMemo(() =>
        activeDataset === 'chicago' ? realCrimeData : indianCrimeData,
        [activeDataset]
    );

    // Filter events for display (Sampling for India to maintain performance)
    const displayEvents = useMemo(() => {
        if (activeDataset === 'chicago') return events;

        // India dataset optimization
        const LIMIT = 15000;
        if (events.length <= LIMIT) return events;

        const step = Math.ceil(events.length / LIMIT);
        return events.filter((_, i) => i % step === 0);
    }, [events, activeDataset]);

    // Calculate generic India count for the tab (so it matches what would be shown)
    const indiaDisplayCount = useMemo(() => {
        const total = indianCrimeData.length;
        const LIMIT = 15000;
        if (total <= LIMIT) return total;
        const step = Math.ceil(total / LIMIT);
        // We can just calculate length directly without filtering the whole array
        // It's basically ceil(total / step) because we take every nth item starting at 0
        return Math.ceil(total / step);
    }, []);

    const currentConfig = useMemo(() =>
        DATASET_CONFIGS[activeDataset],
        [activeDataset]
    );

    const mapBounds = useMemo(() => ({
        minX: currentConfig.minX,
        maxX: currentConfig.maxX,
        minY: currentConfig.minY,
        maxY: currentConfig.maxY
    }), [currentConfig]);

    // State
    const [params, setParams] = useState<QueryParams>(DATASET_CONFIGS.chicago.defaultParams);
    const [stats, setStats] = useState<Stats>({
        totalEvents: realCrimeData.length,
        avgQueryTime: 0,
        queriesRun: 0,
        lastResult: null
    });
    const [history, setHistory] = useState<QueryResult[]>([]);
    const [isQuerying, setIsQuerying] = useState(false);
    const [searchResults, setSearchResults] = useState<Event[]>([]);

    // Refs for canvas
    const mapCanvasRef = useRef<HTMLCanvasElement>(null);

    // DRAG SELECTION STATE
    const [dragState, setDragState] = useState<{
        isDragging: boolean;
        start: { x: number; y: number } | null;
        current: { x: number; y: number } | null;
    }>({ isDragging: false, start: null, current: null });

    // Handle dataset change
    const handleDatasetChange = useCallback((dataset: DatasetType) => {
        setActiveDataset(dataset);
        // Reset to default params for the new dataset
        setParams(DATASET_CONFIGS[dataset].defaultParams);
        // Update stats for new dataset
        const newEvents = dataset === 'chicago' ? realCrimeData : indianCrimeData;
        setStats(prev => ({
            ...prev,
            totalEvents: newEvents.length,
            queriesRun: 0,
            avgQueryTime: 0,
            lastResult: null
        }));
        // Clear search results
        setSearchResults([]);
        setHistory([]);
        toast.success(`Switched to ${dataset === 'chicago' ? '🇺🇸 Chicago' : '🇮🇳 India'} dataset`);
    }, []);

    // Execute Query
    const handleQuery = useCallback(() => {
        setIsQuerying(true);
        const startTime = performance.now();

        // Artificial delay for futuristic processing feel
        setTimeout(() => {
            const { count, time } = executeQuery(events, params);

            const newResult: QueryResult = {
                count,
                queryTime: time,
                params: { ...params },
                timestamp: Date.now()
            };

            setHistory(prev => [newResult, ...prev].slice(0, 10));
            setStats(prev => ({
                ...prev,
                queriesRun: prev.queriesRun + 1,
                avgQueryTime: (prev.avgQueryTime * prev.queriesRun + time) / (prev.queriesRun + 1),
                lastResult: count
            }));

            setIsQuerying(false);
            toast.success(`Query successful: ${count.toLocaleString()} matches found`);
        }, 500);
    }, [events, params]);

    // Render Map
    const renderMap = useCallback(() => {
        const canvas = mapCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = canvas;
        drawBackground(ctx, width, height);

        // Draw regular events
        // User requested Cyan for both, matches the premium 'digital' look
        ctx.fillStyle = activeDataset === 'chicago'
            ? 'rgba(34, 211, 238, 0.45)'
            : 'rgba(34, 211, 238, 0.35)'; // Slightly softer for high-density India

        events.forEach(event => {
            const px = mapToPixel(event.y, mapBounds.minY, mapBounds.maxY, 0, width);
            const py = mapToPixel(event.x, mapBounds.minX, mapBounds.maxX, height, 0);

            // Smaller dots for that 'screen of data' feel
            const size = activeDataset === 'india' ? 1.2 : 1.5;
            ctx.fillRect(px, py, size, size);
        });

        // Draw City Labels for India dataset (every 1000th point of a specific city for variety)
        if (activeDataset === 'india') {
            const citiesToLabel = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Srinagar', 'Guwahati', 'Patna'];
            const labeled = new Set<string>();

            events.forEach(event => {
                if (event.city && citiesToLabel.includes(event.city) && !labeled.has(event.city)) {
                    const px = mapToPixel(event.y, mapBounds.minY, mapBounds.maxY, 0, width);
                    const py = mapToPixel(event.x, mapBounds.minX, mapBounds.maxX, height, 0);

                    ctx.font = 'bold 10px Inter, sans-serif';
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.fillText(event.city.toUpperCase(), px + 4, py - 4);

                    // Tiny city marker dot
                    ctx.beginPath();
                    ctx.arc(px, py, 3, 0, Math.PI * 2);
                    ctx.fillStyle = 'white';
                    ctx.fill();

                    labeled.add(event.city);
                }
            });
        }

        // Draw Search Results (highlighted)
        if (searchResults.length > 0) {
            searchResults.forEach(event => {
                const px = mapToPixel(event.y, mapBounds.minY, mapBounds.maxY, 0, width);
                const py = mapToPixel(event.x, mapBounds.minX, mapBounds.maxX, height, 0);

                // Pulsing glow effect
                const pulse = Math.sin(Date.now() / 300) * 3;

                // Outer glow
                ctx.beginPath();
                ctx.arc(px, py, 8 + pulse, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(251, 191, 36, 0.2)'; // Amber glow
                ctx.fill();

                // Inner marker
                ctx.beginPath();
                ctx.arc(px, py, 4, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(251, 191, 36, 0.9)'; // Amber-400
                ctx.fill();

                // Border
                ctx.strokeStyle = 'rgba(245, 158, 11, 1)'; // Amber-500
                ctx.lineWidth = 2;
                ctx.stroke();
            });
        }

        // Draw Hotspots (with animation)
        const hotspots = findHotspots(events);
        hotspots.forEach(hotspot => {
            const px = mapToPixel(hotspot.y, mapBounds.minY, mapBounds.maxY, 0, width);
            const py = mapToPixel(hotspot.x, mapBounds.minX, mapBounds.maxX, height, 0);

            const pulse = Math.sin(Date.now() / 400) * 5;
            ctx.beginPath();
            ctx.arc(px, py, 25 + pulse, 0, Math.PI * 2);
            ctx.strokeStyle = activeDataset === 'chicago' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(249, 115, 22, 0.4)';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = activeDataset === 'chicago' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(249, 115, 22, 0.1)';
            ctx.fill();
        });

        // Draw Selection Area
        if (dragState.isDragging && dragState.start && dragState.current) {
            const x1 = Math.min(dragState.start.x, dragState.current.x);
            const y1 = Math.min(dragState.start.y, dragState.current.y);
            const x2 = Math.max(dragState.start.x, dragState.current.x);
            const y2 = Math.max(dragState.start.y, dragState.current.y);

            ctx.strokeStyle = 'rgba(34, 211, 238, 0.9)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
            ctx.fillStyle = 'rgba(34, 211, 238, 0.1)';
            ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
            ctx.setLineDash([]);
        } else {
            // Draw current parameter region
            const px1 = mapToPixel(params.y1, mapBounds.minY, mapBounds.maxY, 0, width);
            const px2 = mapToPixel(params.y2, mapBounds.minY, mapBounds.maxY, 0, width);
            const py1 = mapToPixel(params.x1, mapBounds.minX, mapBounds.maxX, height, 0);
            const py2 = mapToPixel(params.x2, mapBounds.minX, mapBounds.maxX, height, 0);

            ctx.strokeStyle = activeDataset === 'chicago' ? 'rgba(192, 132, 252, 0.6)' : 'rgba(251, 146, 60, 0.6)';
            ctx.lineWidth = 2;
            ctx.strokeRect(Math.min(px1, px2), Math.min(py1, py2), Math.abs(px2 - px1), Math.abs(py2 - py1));
            ctx.fillStyle = activeDataset === 'chicago' ? 'rgba(192, 132, 252, 0.05)' : 'rgba(251, 146, 60, 0.05)';
            ctx.fillRect(Math.min(px1, px2), Math.min(py1, py2), Math.abs(px2 - px1), Math.abs(py2 - py1));
        }
    }, [events, params, dragState, mapBounds, searchResults]);

    // Optimized Animation Loop using RAF for zero lag
    useEffect(() => {
        let rafId: number;
        const animate = () => {
            renderMap();
            rafId = requestAnimationFrame(animate);
        };
        rafId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafId);
    }, [renderMap]);

    // Drag Interaction
    const handleMouseDown = (e: React.MouseEvent) => {
        const canvas = mapCanvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();

        // Scale mouse coordinates to canvas internal resolution
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        setDragState({
            isDragging: true,
            start: { x, y },
            current: { x, y }
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragState.isDragging) return;
        const canvas = mapCanvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        setDragState(prev => ({
            ...prev,
            current: { x, y }
        }));
    };

    const handleMouseUp = () => {
        if (!dragState.isDragging || !dragState.start || !dragState.current) return;

        const canvas = mapCanvasRef.current;
        if (!canvas) return;

        // GIS Standard: Longitude (E/W) is Horizontal (X), Latitude (N/S) is Vertical (Y)
        // Map X Pixel -> Longitude (y)
        const y1Val = mapBounds.minY + (Math.min(dragState.start.x, dragState.current.x) / canvas.width) * (mapBounds.maxY - mapBounds.minY);
        const y2Val = mapBounds.minY + (Math.max(dragState.start.x, dragState.current.x) / canvas.width) * (mapBounds.maxY - mapBounds.minY);

        // Map Y Pixel -> Latitude (x) - Note: Canvas Y=0 is Top (Max Latitude)
        const x1Val = mapBounds.maxY - (Math.max(dragState.start.y, dragState.current.y) / canvas.height) * (mapBounds.maxY - mapBounds.minY); // Wait, this is wrong, should be minLat/maxLat
        const x1ValCorrect = mapBounds.minX + ((canvas.height - Math.max(dragState.start.y, dragState.current.y)) / canvas.height) * (mapBounds.maxX - mapBounds.minX);
        const x2ValCorrect = mapBounds.minX + ((canvas.height - Math.min(dragState.start.y, dragState.current.y)) / canvas.height) * (mapBounds.maxX - mapBounds.minX);

        setParams(prev => ({ ...prev, x1: x1ValCorrect, x2: x2ValCorrect, y1: y1Val, y2: y2Val }));
        setDragState({ isDragging: false, start: null, current: null });
        toast.info("Region updated from map selection");
    };

    return (
        <div className="flex flex-col min-h-screen bg-background transition-colors duration-700">
            <Header />

            <main className="flex-1 max-w-[1440px] w-full mx-auto p-8 space-y-8 overflow-hidden">

                {/* 0. DATASET SWITCHER */}
                <section className="flex items-center justify-between animate-fade-in-up">
                    <DatasetTabs
                        activeDataset={activeDataset}
                        onDatasetChange={handleDatasetChange}
                        chicagoCount={realCrimeData.length}
                        indiaCount={indiaDisplayCount}
                    />
                    <div className="text-sm text-slate-400">
                        <span className="font-medium text-white">{currentConfig.label}</span>
                        <span className="mx-2">•</span>
                        <span>{displayEvents.length.toLocaleString()} events loaded</span>
                    </div>
                </section>

                {/* 1. STATS ROW */}
                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <StatCard
                        title="Database Status"
                        value={displayEvents.length.toLocaleString()}
                        subtitle="Points on Map"
                        icon={<Download className="w-5 h-5 text-blue-400" />}
                        color="text-blue-400"
                        delay={0.1}
                    />
                    <StatCard
                        title="Query Engine"
                        value={stats.queriesRun}
                        subtitle="Operations Run"
                        icon={<Activity className="w-5 h-5 text-emerald-400" />}
                        color="text-emerald-400"
                        delay={0.2}
                    />
                    <StatCard
                        title="Last Query Match"
                        value={stats.lastResult !== null ? stats.lastResult : "-"}
                        subtitle="Incidents found"
                        icon={<Search className="w-5 h-5 text-amber-400" />}
                        color="text-amber-400"
                        delay={0.3}
                    />
                    <StatCard
                        title="Engine Latency"
                        value={`${stats.avgQueryTime.toFixed(3)} ms`}
                        subtitle="Avg Comp. Time"
                        icon={<Zap className="w-5 h-5 text-primary" />}
                        color="text-primary"
                        delay={0.4}
                    />
                </section>

                {/* 2. MAIN VISUALIZATION GRID */}
                <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-[550px]">
                    {/* EVENT MAP - 2/3 Width */}
                    <div className="xl:col-span-2 glass-card relative overflow-hidden group/map animate-scale-in" style={{ animationDelay: '200ms' }}>
                        <div className="absolute top-6 left-6 z-20 pointer-events-none">
                            <div className="bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                                    {activeDataset === 'india' ? 'Interactive Map' : 'Map Engine Active'}
                                </span>
                            </div>
                        </div>

                        {activeDataset === 'chicago' ? (
                            <>
                                <canvas
                                    ref={mapCanvasRef}
                                    width={1200}
                                    height={800}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    className="w-full h-full object-cover cursor-crosshair"
                                />

                                <div className="absolute bottom-6 left-6 z-20 pointer-events-none group-hover/map:opacity-100 opacity-60 transition-opacity">
                                    <div className="bg-black/60 backdrop-blur-xl px-4 py-3 rounded-xl border border-white/10 flex flex-col">
                                        <span className="text-[9px] font-mono text-slate-500 tracking-tighter uppercase mb-1">INTERACTIVE CANVAS API</span>
                                        <span className="text-xs font-semibold text-white/90">Click & Drag to Select Analytics Region</span>
                                    </div>
                                </div>

                                {/* Map Legend */}
                                <MapLegend />
                            </>
                        ) : (
                            <InteractiveMap
                                events={displayEvents}
                                searchResults={searchResults}
                                onRegionSelect={(bounds) => {
                                    setParams(prev => ({
                                        ...prev,
                                        ...bounds
                                    }));
                                    toast.info("Region updated from map selection");
                                }}
                            />
                        )}
                    </div>

                    {/* TEMPORAL HEATMAP - 1/3 Width */}
                    <div className="glass-card flex flex-col p-6 space-y-6 animate-slide-in-right" style={{ animationDelay: '300ms' }}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Clock className="w-5 h-5 text-accent" />
                                <h3 className="font-bold text-lg text-gradient">Temporal Density</h3>
                            </div>
                            <span className="text-[10px] bg-accent/20 text-accent px-2 py-1 rounded-full border border-accent/20 font-bold uppercase tracking-wider">24H Window</span>
                        </div>

                        <div className="flex-1 flex flex-col justify-center">
                            <TemporalHeatmap
                                events={events}
                                startTime={params.t1}
                                endTime={params.t2}
                            />
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Peak Intensity Statistics</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] text-primary/60 mb-1 leading-tight font-bold">PREDICTED PEAK</p>
                                    <p className="text-sm font-bold text-primary">22:00 - 02:00</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-accent/60 mb-1 leading-tight font-bold">LOW INTENSITY</p>
                                    <p className="text-sm font-bold text-accent">06:00 - 10:00</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. CONTROLS & RESULTS SECTION */}
                <section className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-12">
                    <QueryControls
                        initialParams={params}
                        onExecute={(newParams) => {
                            setParams(newParams);
                            handleQuery();
                        }}
                    />

                    <QueryResults
                        results={history}
                        onClear={() => {
                            setHistory([]);
                            setStats(prev => ({ ...prev, queriesRun: 0, avgQueryTime: 0, lastResult: null }));
                        }}
                    />
                </section>

                {/* 4. CRIME SEARCH SECTION */}
                <section className="pb-12">
                    <CrimeSearch
                        events={events}
                        currentParams={params}
                        activeDataset={activeDataset}
                        onResultsFound={(results) => {
                            setSearchResults(results);
                            if (results.length > 0) {
                                toast.success(`Found ${results.length} matching crimes in the selected region`);
                            }
                        }}
                    />
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Dashboard;
