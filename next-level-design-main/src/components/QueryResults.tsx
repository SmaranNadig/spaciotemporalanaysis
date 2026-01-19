import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Trash2, Zap, MapPin, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { minutesToTime } from '../utils/queryEngine';
import { QueryResult } from '../types';

interface QueryResultsProps {
    results: QueryResult[];
    onClear: () => void;
}

export function QueryResults({ results, onClear }: QueryResultsProps) {
    return (
        <motion.div
            className="glass-card flex h-full flex-col overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <div className="flex items-center justify-between border-b border-border/50 p-4 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-400" />
                    <h2 className="font-bold text-lg tracking-tight" style={{ color: 'rgba(106, 184, 208, 0.8)' }}>Analytics Operation History</h2>
                </div>
                {results.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={onClear}>
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Clear
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                {results.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center py-12">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                            <BarChart3 className="h-8 w-8 text-slate-600" />
                        </div>
                        <p className="text-sm font-medium text-foreground">No queries executed yet</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Configure parameters and click "Execute Query"
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {results.map((result, index) => (
                                <motion.div
                                    key={result.timestamp}
                                    layout
                                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="group rounded-xl border border-white/5 bg-white/[0.03] p-4 transition-all duration-300 hover:border-primary/30 hover:bg-white/[0.06]"
                                >
                                    {/* Result header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                                                <span className="font-mono text-lg font-bold text-primary">
                                                    {result.count.toLocaleString()}
                                                </span>
                                            </div>
                                            <span className="text-sm text-primary/90 font-semibold tracking-tight">events found</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 border border-emerald-500/20">
                                            <Zap className="h-3 w-3 text-emerald-400" />
                                            <span className="font-mono text-[10px] text-emerald-400 font-bold">
                                                {result.queryTime.toFixed(3)}ms
                                            </span>
                                        </div>
                                    </div>

                                    {/* Result details */}
                                    <div className="mt-4 space-y-2 text-[10px] text-slate-400">
                                        <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
                                            <MapPin className="h-3.5 w-3.5 text-primary/40" />
                                            <span className="font-mono">
                                                ({result.params.x1.toFixed(2)}, {result.params.y1.toFixed(2)}) → ({result.params.x2.toFixed(2)}, {result.params.y2.toFixed(2)})
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
                                            <Clock className="h-3.5 w-3.5 text-accent/40" />
                                            <span className="font-mono">
                                                {minutesToTime(result.params.t1)} → {minutesToTime(result.params.t2)}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
