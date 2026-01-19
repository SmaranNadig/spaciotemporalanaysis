import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { Event, QueryParams, QueryResult, Stats } from '../types';
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
import Footer from '../components/Footer';

const Dashboard: React.FC = () => {
    // State
    const [events] = useState<Event[]>(realCrimeData);
    const [params, setParams] = useState<QueryParams>({
        x1: 41.7, y1: -87.8,
        x2: 41.9, y2: -87.6,
        t1: 480, t2: 1200
    });
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

    // Map Bounds (Chicago)
    const mapBounds = {
        minX: 41.6,
        maxX: 42.0,
        minY: -87.9,
        maxY: -87.5
    };

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
        ctx.fillStyle = 'rgba(34, 211, 238, 0.4)'; // Cyan-400
        events.forEach(event => {
            const px = mapToPixel(event.x, mapBounds.minX, mapBounds.maxX, 0, width);
            const py = mapToPixel(event.y, mapBounds.minY, mapBounds.maxY, height, 0);
            ctx.fillRect(px, py, 1.5, 1.5);
        });

        // Draw Search Results (highlighted)
        if (searchResults.length > 0) {
            searchResults.forEach(event => {
                const px = mapToPixel(event.x, mapBounds.minX, mapBounds.maxX, 0, width);
                const py = mapToPixel(event.y, mapBounds.minY, mapBounds.maxY, height, 0);

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
            const px = mapToPixel(hotspot.x, mapBounds.minX, mapBounds.maxX, 0, width);
            const py = mapToPixel(hotspot.y, mapBounds.minY, mapBounds.maxY, height, 0);

            const pulse = Math.sin(Date.now() / 400) * 5;
            ctx.beginPath();
            ctx.arc(px, py, 25 + pulse, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)'; // Red-500
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
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
            const px1 = mapToPixel(params.x1, mapBounds.minX, mapBounds.maxX, 0, width);
            const px2 = mapToPixel(params.x2, mapBounds.minX, mapBounds.maxX, 0, width);
            const py1 = mapToPixel(params.y1, mapBounds.minY, mapBounds.maxY, height, 0);
            const py2 = mapToPixel(params.y2, mapBounds.minY, mapBounds.maxY, height, 0);

            ctx.strokeStyle = 'rgba(192, 132, 252, 0.6)'; // Purple-400
            ctx.lineWidth = 2;
            ctx.strokeRect(Math.min(px1, px2), Math.min(py1, py2), Math.abs(px2 - px1), Math.abs(py2 - py1));
            ctx.fillStyle = 'rgba(192, 132, 252, 0.05)';
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

        const x1Val = mapBounds.minX + (Math.min(dragState.start.x, dragState.current.x) / canvas.width) * (mapBounds.maxX - mapBounds.minX);
        const x2Val = mapBounds.minX + (Math.max(dragState.start.x, dragState.current.x) / canvas.width) * (mapBounds.maxX - mapBounds.minX);
        const y1Val = mapBounds.maxY - (Math.max(dragState.start.y, dragState.current.y) / canvas.height) * (mapBounds.maxY - mapBounds.minY);
        const y2Val = mapBounds.maxY - (Math.min(dragState.start.y, dragState.current.y) / canvas.height) * (mapBounds.maxY - mapBounds.minY);

        setParams(prev => ({ ...prev, x1: x1Val, x2: x2Val, y1: y1Val, y2: y2Val }));
        setDragState({ isDragging: false, start: null, current: null });
        toast.info("Region updated from map selection");
    };

    return (
        <div className="flex flex-col min-h-screen bg-background transition-colors duration-700">
            <Header />

            <main className="flex-1 max-w-[1440px] w-full mx-auto p-8 space-y-8 overflow-hidden">

                {/* 1. STATS ROW */}
                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <StatCard
                        title="Database Status"
                        value={stats.totalEvents}
                        subtitle="Events Loaded"
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
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Map Engine Active</span>
                            </div>
                        </div>

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
