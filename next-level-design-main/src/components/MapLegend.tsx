import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

export function MapLegend() {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="absolute bottom-6 right-6 z-20 pointer-events-auto"
        >
            <div className="bg-black/70 backdrop-blur-xl px-4 py-3 rounded-xl border border-white/10 shadow-2xl">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                    <Info className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Map Legend</span>
                </div>

                <div className="space-y-2">
                    {/* All Events */}
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-sm bg-primary/60" />
                        <span className="text-[10px] text-slate-300 font-medium">All Crime Events</span>
                    </div>

                    {/* Search Results */}
                    <div className="flex items-center gap-2">
                        <div className="relative w-2 h-2">
                            <div className="absolute inset-0 rounded-full bg-amber-400 animate-pulse" />
                            <div className="absolute inset-0 rounded-full bg-amber-500/50 blur-sm" />
                        </div>
                        <span className="text-[10px] text-amber-400 font-bold">Search Results</span>
                    </div>

                    {/* Hotspots */}
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-red-500/60 bg-red-500/10" />
                        <span className="text-[10px] text-red-400 font-medium">Crime Hotspots</span>
                    </div>

                    {/* Selection Area */}
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-dashed border-purple-400/60" />
                        <span className="text-[10px] text-purple-300 font-medium">Query Region</span>
                    </div>
                </div>

                {/* Helper Text */}
                <div className="mt-3 pt-2 border-t border-white/5">
                    <p className="text-[8px] text-slate-500 leading-relaxed">
                        Drag on map to select region
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
