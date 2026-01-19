import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings2, Clock, MapPinned, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { minutesToTime } from '../utils/queryEngine';
import { QueryParams } from '../types';

interface QueryControlsProps {
    initialParams: QueryParams;
    onExecute: (params: QueryParams) => void;
}

const quickTimeRanges = [
    { label: 'Night', sublabel: '12-6 AM', t1: 0, t2: 360 },
    { label: 'Morning', sublabel: '6-12 PM', t1: 360, t2: 720 },
    { label: 'Afternoon', sublabel: '12-6 PM', t1: 720, t2: 1080 },
    { label: 'Evening', sublabel: '6-12 AM', t1: 1080, t2: 1440 },
];

export function QueryControls({ initialParams, onExecute }: QueryControlsProps) {
    const [params, setParams] = useState<QueryParams>(initialParams);

    useEffect(() => {
        setParams(initialParams);
    }, [initialParams]);

    const handleSpatialChange = (field: keyof QueryParams, value: string) => {
        const numValue = parseFloat(value) || 0;
        setParams(prev => ({ ...prev, [field]: numValue }));
    };

    const handleTimeChange = (field: 't1' | 't2', value: number[]) => {
        setParams(prev => ({ ...prev, [field]: value[0] }));
    };

    const handleQuickTimeRange = (t1: number, t2: number) => {
        setParams(prev => ({ ...prev, t1, t2 }));
    };

    const handleExecute = () => {
        onExecute(params);
    };

    return (
        <motion.div
            className="glass-card overflow-hidden flex flex-col h-full"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            <div className="flex items-center gap-2 border-b border-white/5 p-4 bg-white/[0.02]">
                <Settings2 className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-lg tracking-tight" style={{ color: 'rgba(106, 184, 208, 0.8)' }}>Query Engine Configuration</h2>
            </div>

            <div className="space-y-8 p-6 overflow-y-auto">
                {/* Spatial Range */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                                <MapPinned className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Spatial Boundary</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="group">
                            <label className="mb-1.5 block text-[10px] font-bold text-slate-500 uppercase tracking-tighter transition-colors group-focus-within:text-primary">Latitude (Min)</label>
                            <input
                                type="number" step="0.001"
                                value={params.x1.toFixed(3)}
                                onChange={(e) => handleSpatialChange('x1', e.target.value)}
                                className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 font-mono text-sm text-primary transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
                            />
                        </div>
                        <div className="group">
                            <label className="mb-1.5 block text-[10px] font-bold text-slate-500 uppercase tracking-tighter transition-colors group-focus-within:text-primary">Latitude (Max)</label>
                            <input
                                type="number" step="0.001"
                                value={params.x2.toFixed(3)}
                                onChange={(e) => handleSpatialChange('x2', e.target.value)}
                                className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 font-mono text-sm text-primary transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
                            />
                        </div>
                        <div className="group">
                            <label className="mb-1.5 block text-[10px] font-bold text-slate-500 uppercase tracking-tighter transition-colors group-focus-within:text-primary">Longitude (Min)</label>
                            <input
                                type="number" step="0.001"
                                value={params.y1.toFixed(3)}
                                onChange={(e) => handleSpatialChange('y1', e.target.value)}
                                className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 font-mono text-sm text-primary transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
                            />
                        </div>
                        <div className="group">
                            <label className="mb-1.5 block text-[10px] font-bold text-slate-500 uppercase tracking-tighter transition-colors group-focus-within:text-primary">Longitude (Max)</label>
                            <input
                                type="number" step="0.001"
                                value={params.y2.toFixed(3)}
                                onChange={(e) => handleSpatialChange('y2', e.target.value)}
                                className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 font-mono text-sm text-primary transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
                            />
                        </div>
                    </div>
                </div>

                {/* Temporal Range */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-accent/10 border border-accent/20">
                            <Clock className="h-4 w-4 text-accent" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Temporal range</span>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Window Start</label>
                                <span className="text-xs font-bold font-mono text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                                    {minutesToTime(params.t1)}
                                </span>
                            </div>
                            <Slider
                                value={[params.t1]}
                                min={0}
                                max={1439}
                                step={1}
                                variant="primary"
                                onValueChange={(value) => handleTimeChange('t1', value)}
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Window End</label>
                                <span className="text-xs font-bold font-mono text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20 shadow-[0_0_10px_rgba(192,132,252,0.1)]">
                                    {minutesToTime(params.t2)}
                                </span>
                            </div>
                            <Slider
                                value={[params.t2]}
                                min={0}
                                max={1439}
                                step={1}
                                variant="accent"
                                onValueChange={(value) => handleTimeChange('t2', value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Time Ranges */}
                <div className="space-y-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block pl-1">Operational Presets</span>
                    <div className="grid grid-cols-2 gap-3">
                        {quickTimeRanges.map((range) => (
                            <Button
                                key={range.label}
                                variant="quick"
                                className="flex flex-col items-center justify-center h-auto py-3 rounded-2xl border-white/5 bg-white/[0.02]"
                                onClick={() => handleQuickTimeRange(range.t1, range.t2)}
                            >
                                <span className="text-xs font-bold text-white/80">{range.label}</span>
                                <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-tighter">{range.sublabel}</span>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Execute Button */}
            <div className="p-6 mt-auto border-t border-white/5 bg-white/[0.01]">
                <Button
                    variant="glow"
                    className="w-full h-14 rounded-2xl text-base tracking-[0.2em] uppercase font-black overflow-hidden relative group"
                    onClick={handleExecute}
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        Compute Analytics
                        <Zap className="w-4 h-4 fill-white" />
                    </span>
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                </Button>
            </div>
        </motion.div>
    );
}
