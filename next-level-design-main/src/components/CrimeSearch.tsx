import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MapPin, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Event, QueryParams, DatasetType } from '../types';
import { minutesToTime } from '../utils/queryEngine';

type CaseStatusFilter = 'all' | 'open' | 'closed';

interface CrimeSearchProps {
    events: Event[];
    currentParams: QueryParams;
    onResultsFound: (matchingEvents: Event[]) => void;
    activeDataset?: DatasetType;
}


// Crime similarity mappings for intelligent search
const CRIME_SIMILARITY: Record<string, string[]> = {
    'THEFT': ['ROBBERY', 'BURGLARY', 'MOTOR VEHICLE THEFT', 'FRAUD'],
    'ROBBERY': ['THEFT', 'BURGLARY', 'ASSAULT'],
    'BURGLARY': ['THEFT', 'ROBBERY', 'MOTOR VEHICLE THEFT', 'CRIMINAL TRESPASS'],
    'ASSAULT': ['BATTERY', 'ROBBERY', 'WEAPONS'],
    'BATTERY': ['ASSAULT', 'HOMICIDE'],
    'NARCOTICS': ['OTHER NARCOTIC VIOLATION', 'DRUG'],
    'MOTOR VEHICLE THEFT': ['THEFT', 'BURGLARY'],
    'VANDALISM': ['CRIMINAL DAMAGE', 'CRIMINAL TRESPASS'],
    'FRAUD': ['THEFT', 'IDENTITY THEFT', 'DECEPTIVE PRACTICE'],
    'WEAPONS': ['ASSAULT', 'HOMICIDE'],
};

export function CrimeSearch({ events, currentParams, onResultsFound, activeDataset = 'chicago' }: CrimeSearchProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [includeSimilar, setIncludeSimilar] = useState(true);
    const [caseStatusFilter, setCaseStatusFilter] = useState<CaseStatusFilter>('all');
    const [results, setResults] = useState<Event[]>([]);
    const [isSearching, setIsSearching] = useState(false);


    // Get all unique crime types from the dataset
    const availableTypes = useMemo(() => {
        const types = new Set<string>();
        events.forEach(event => {
            if (event.type) types.add(event.type);
        });
        return Array.from(types).sort();
    }, [events]);

    // Smart search algorithm
    const performSearch = () => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        setIsSearching(true);

        // Use setTimeout to show loading state
        setTimeout(() => {
            const queryUpper = searchQuery.trim().toUpperCase();

            // Build search terms (original + similar types)
            let searchTerms = [queryUpper];
            if (includeSimilar && CRIME_SIMILARITY[queryUpper]) {
                searchTerms = [...searchTerms, ...CRIME_SIMILARITY[queryUpper]];
            }

            // Filter events by:
            // 1. Crime type match
            // 2. Within current spatial bounds
            // 3. Within current temporal range
            // 4. Case status (for India dataset only)
            const matchingEvents = events.filter(event => {
                // Check crime type
                const typeMatch = event.type && searchTerms.some(term =>
                    event.type!.toUpperCase().includes(term)
                );

                if (!typeMatch) return false;

                // Check spatial bounds
                const inSpatialRange =
                    event.x >= Math.min(currentParams.x1, currentParams.x2) &&
                    event.x <= Math.max(currentParams.x1, currentParams.x2) &&
                    event.y >= Math.min(currentParams.y1, currentParams.y2) &&
                    event.y <= Math.max(currentParams.y1, currentParams.y2);

                // Check temporal range
                const inTemporalRange =
                    event.time >= Math.min(currentParams.t1, currentParams.t2) &&
                    event.time <= Math.max(currentParams.t1, currentParams.t2);

                // Check case status (only for India dataset when filter is not 'all')
                let caseStatusMatch = true;
                if (activeDataset === 'india' && caseStatusFilter !== 'all') {
                    if (caseStatusFilter === 'closed') {
                        caseStatusMatch = event.caseClosed === true;
                    } else if (caseStatusFilter === 'open') {
                        caseStatusMatch = event.caseClosed === false;
                    }
                }

                return inSpatialRange && inTemporalRange && caseStatusMatch;
            });

            setResults(matchingEvents);
            onResultsFound(matchingEvents);
            setIsSearching(false);
        }, 300);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    };

    return (
        <motion.div
            className="glass-card overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <div className="flex items-center gap-2 border-b border-white/5 p-4 bg-white/[0.02]">
                <Search className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-lg tracking-tight" style={{ color: 'rgba(106, 184, 208, 0.8)' }}>
                    Crime Type Search
                </h2>
            </div>

            <div className="p-4 space-y-4">
                {/* Search Input */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Search for crime type (e.g., THEFT, ASSAULT, NARCOTICS)..."
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 pr-12 font-mono text-sm text-white placeholder-slate-500 transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
                    />
                    <button
                        onClick={performSearch}
                        disabled={isSearching}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/30 active:scale-95 transition-all"
                    >
                        {isSearching ? '...' : 'Search'}
                    </button>
                </div>

                {/* Options */}
                <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={includeSimilar}
                            onChange={(e) => setIncludeSimilar(e.target.checked)}
                            className="w-4 h-4 rounded border-white/20 bg-black/40 text-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <span className="text-xs text-slate-400 group-hover:text-primary transition-colors">
                            Include similar crime types
                        </span>
                    </label>

                    {/* Case Status Filter - Only for India */}
                    {activeDataset === 'india' && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-medium">Case Status:</span>
                            <div className="flex rounded-lg overflow-hidden border border-white/10">
                                <button
                                    onClick={() => setCaseStatusFilter('all')}
                                    className={`px-3 py-1.5 text-xs font-medium transition-all ${caseStatusFilter === 'all'
                                            ? 'bg-primary/20 text-primary'
                                            : 'bg-black/20 text-slate-400 hover:text-white'
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setCaseStatusFilter('open')}
                                    className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all border-l border-white/10 ${caseStatusFilter === 'open'
                                            ? 'bg-red-500/20 text-red-400'
                                            : 'bg-black/20 text-slate-400 hover:text-white'
                                        }`}
                                >
                                    <XCircle className="w-3 h-3" />
                                    Open
                                </button>
                                <button
                                    onClick={() => setCaseStatusFilter('closed')}
                                    className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all border-l border-white/10 ${caseStatusFilter === 'closed'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-black/20 text-slate-400 hover:text-white'
                                        }`}
                                >
                                    <CheckCircle className="w-3 h-3" />
                                    Closed
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Type Suggestions */}
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quick Search:</p>
                    <div className="flex flex-wrap gap-2">
                        {['THEFT', 'ASSAULT', 'NARCOTICS', 'ROBBERY', 'VANDALISM'].map(type => (
                            <button
                                key={type}
                                onClick={() => {
                                    setSearchQuery(type);
                                    setTimeout(() => {
                                        setSearchQuery(type); // Ensure state is set
                                        performSearch();
                                    }, 0);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-primary/20 text-xs font-mono text-slate-400 hover:text-primary border border-white/5 hover:border-primary/30 transition-all"
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results */}
                <AnimatePresence mode="wait">
                    {results.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3"
                        >
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <p className="text-sm font-bold text-gradient">
                                    {results.length} matching {results.length === 1 ? 'crime' : 'crimes'} found
                                </p>
                                <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 border border-success/20">
                                    <Filter className="h-3 w-3 text-success" />
                                    <span className="font-mono text-[10px] text-success font-bold">FILTERED</span>
                                </div>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto space-y-2 custom-scrollbar">
                                {results.slice(0, 20).map((event, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-primary/30 hover:bg-white/[0.06] transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="px-2 py-0.5 rounded-full bg-destructive/20 border border-destructive/30 text-[10px] font-bold text-destructive uppercase tracking-wider">
                                                        {event.type}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 leading-relaxed">
                                                    {event.description || event.type}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-4 text-[10px] text-slate-500 font-mono">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-3 w-3 text-primary/40" />
                                                <span>{event.x.toFixed(3)}, {event.y.toFixed(3)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-3 w-3 text-accent/40" />
                                                <span>{minutesToTime(event.time)}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {results.length > 20 && (
                                    <p className="text-center text-xs text-slate-500 py-2">
                                        Showing first 20 of {results.length} results
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {searchQuery && results.length === 0 && !isSearching && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-8 text-center"
                        >
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                                <AlertCircle className="h-6 w-6 text-warning" />
                            </div>
                            <p className="text-sm font-medium text-foreground">No matching crimes found</p>
                            <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                                Try adjusting your search term or expanding the spatial/temporal range
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
