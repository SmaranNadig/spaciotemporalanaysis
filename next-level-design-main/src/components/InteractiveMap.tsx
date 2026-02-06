import React, { useEffect, useRef, useMemo, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MousePointer2, Crop } from 'lucide-react';
import { Event } from '../types';

interface InteractiveMapProps {
    events: Event[];
    searchResults: Event[];
    onRegionSelect?: (bounds: { x1: number, y1: number, x2: number, y2: number }) => void;
}

interface MapBounds {
    north: number;
    south: number;
    east: number;
    west: number;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
    events,
    searchResults,
    onRegionSelect
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMapRef = useRef<L.Map | null>(null);
    const markersLayerRef = useRef<L.LayerGroup | null>(null);
    const selectionLayerRef = useRef<L.LayerGroup | null>(null);
    const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);

    // Selection Mode State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const selectionStartRef = useRef<L.LatLng | null>(null);
    const selectionRectRef = useRef<L.Rectangle | null>(null);

    // Create search result lookup
    const searchResultSet = useMemo(() => {
        return new Set(searchResults.map(e => `${e.x}-${e.y}-${e.time}`));
    }, [searchResults]);

    // Use events directly (already sampled by parent)
    const displayEvents = events;

    // Update bounds state
    const updateBounds = (map: L.Map) => {
        const bounds = map.getBounds();
        setMapBounds({
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest(),
        });
    };

    // Toggle Selection Mode
    const toggleSelectionMode = () => {
        const map = leafletMapRef.current;
        if (!map) return;

        const newMode = !isSelectionMode;
        setIsSelectionMode(newMode);

        if (newMode) {
            map.dragging.disable();
            map.getContainer().style.cursor = 'crosshair';
        } else {
            map.dragging.enable();
            map.getContainer().style.cursor = '';
            // Clear current selection visual if cancelling
            if (selectionLayerRef.current) {
                selectionLayerRef.current.clearLayers();
            }
            selectionStartRef.current = null;
            selectionRectRef.current = null;
        }
    };

    // Initialize map
    useEffect(() => {
        if (!mapRef.current || leafletMapRef.current) return;

        // Create map centered on India
        const map = L.map(mapRef.current, {
            center: [20.5937, 78.9629],
            zoom: 5,
            zoomControl: false, // We'll add it manually to position it better if needed, or stick to default
        });

        // Re-add zoom control to bottom right to avoid conflict with our custom tools if we place them top-left
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map);

        // Create layers
        markersLayerRef.current = L.layerGroup().addTo(map);
        selectionLayerRef.current = L.layerGroup().addTo(map);
        leafletMapRef.current = map;

        // Update bounds on map move/zoom
        map.on('moveend', () => updateBounds(map));
        map.on('zoomend', () => updateBounds(map));

        // Drag Selection Logic
        map.on('mousedown', (e) => {
            // We use a ref to track mode inside the event listener closure if needed, 
            // but we'll rely on the effect dependency below or checking the state if we can.
            // Actually, best to bind these handlers in a separate effect that depends on isSelectionMode.
        });

        // Initial bounds
        updateBounds(map);

        return () => {
            map.remove();
            leafletMapRef.current = null;
        };
    }, []);

    // Handle Selection Events
    useEffect(() => {
        const map = leafletMapRef.current;
        if (!map) return;

        const onMouseDown = (e: L.LeafletMouseEvent) => {
            if (!isSelectionMode) return;

            selectionStartRef.current = e.latlng;

            // Create a new rectangle
            const bounds = L.latLngBounds(e.latlng, e.latlng);
            const rect = L.rectangle(bounds, {
                color: '#22d3ee',
                weight: 2,
                fillColor: '#22d3ee',
                fillOpacity: 0.2,
                dashArray: '5, 5'
            }).addTo(selectionLayerRef.current!);

            selectionRectRef.current = rect;
        };

        const onMouseMove = (e: L.LeafletMouseEvent) => {
            if (!isSelectionMode || !selectionStartRef.current || !selectionRectRef.current) return;

            const bounds = L.latLngBounds(selectionStartRef.current, e.latlng);
            selectionRectRef.current.setBounds(bounds);
        };

        const onMouseUp = (e: L.LeafletMouseEvent) => {
            if (!isSelectionMode || !selectionStartRef.current || !selectionRectRef.current) return;

            const finalBounds = selectionRectRef.current.getBounds();

            // Call prop
            if (onRegionSelect) {
                onRegionSelect({
                    x1: finalBounds.getSouth(),
                    y1: finalBounds.getWest(),
                    x2: finalBounds.getNorth(),
                    y2: finalBounds.getEast()
                });
            }

            // Reset
            setIsSelectionMode(false);
            map.dragging.enable();
            map.getContainer().style.cursor = '';

            // Optional: keep the rectangle for a moment or clear it? 
            // The parent might update the map causing a re-render or data refresh.
            // Let's clear it to be clean, the 'active region' visualization in Dashboard might take over 
            // if we want to visualize it, but Dashboard currently draws the region on the Canvas map.
            // For this map, we might want to keep it? 
            // Actually, Dashboard logic 'setParams' will update the query. 
            // Let's clear our temporary drag rect.
            selectionLayerRef.current?.clearLayers();
            selectionStartRef.current = null;
            selectionRectRef.current = null;
        };

        // Attach listeners
        map.on('mousedown', onMouseDown);
        map.on('mousemove', onMouseMove);
        map.on('mouseup', onMouseUp);

        return () => {
            map.off('mousedown', onMouseDown);
            map.off('mousemove', onMouseMove);
            map.off('mouseup', onMouseUp);
        };
    }, [isSelectionMode, onRegionSelect]);

    // Update markers when events change
    useEffect(() => {
        if (!leafletMapRef.current || !markersLayerRef.current) return;

        // Clear existing markers
        markersLayerRef.current.clearLayers();

        // Add new markers
        displayEvents.forEach(event => {
            const isSearchResult = searchResultSet.has(`${event.x}-${event.y}-${event.time}`);

            const marker = L.circleMarker([event.x, event.y], {
                radius: isSearchResult ? 6 : 2, // Reduced size for high density
                fillColor: isSearchResult ? '#fbbf24' : '#22d3ee',
                color: isSearchResult ? '#f59e0b' : '#0891b2',
                weight: isSearchResult ? 2 : 0.5, // Thinner border
                opacity: isSearchResult ? 1 : 0.7,
                fillOpacity: isSearchResult ? 0.9 : 0.5, // More transparent
            });

            // Add popup
            marker.bindPopup(`
                <div style="font-family: system-ui; font-size: 12px;">
                    <strong style="color: #1f2937;">${event.type}</strong><br/>
                    <span style="color: #6b7280;">${event.description || 'No description'}</span><br/>
                    ${event.city ? `<span style="color: #9ca3af;">📍 ${event.city}</span><br/>` : ''}
                    ${event.caseClosed !== undefined ?
                    `<span style="color: ${event.caseClosed ? '#16a34a' : '#dc2626'};">
                            ${event.caseClosed ? '✅ Case Closed' : '❌ Case Open'}
                        </span>` : ''}
                </div>
            `);

            markersLayerRef.current!.addLayer(marker);
        });

        // Fit bounds to markers if we have events AND we haven't manually moved yet (optional, or just do it once)
        // For now, let's only do it on initial load logic if needed, but existing logic does it on every event change.
        // We'll keep existing behavior but maybe debounce it or check if it's a new dataset.
        // To avoid annoying jumps during interaction, let's only fit bounds if the dataset seems "new" or different?
        // The original code fit bounds every time displayEvents changed.
        // If we filter events based on selection, this might be jarring?
        // Actually, existing code:
        /*
        if (displayEvents.length > 0) {
            const lats = displayEvents.map(e => e.x);
            const lons = displayEvents.map(e => e.y);
            const bounds = L.latLngBounds(
                [Math.min(...lats), Math.min(...lons)],
                [Math.max(...lats), Math.max(...lons)]
            );
            leafletMapRef.current.fitBounds(bounds, { padding: [20, 20] });
        }
        */
        // We will keep this behavior for now as it matches the original file. 
        // If the user wants to keep the view stable while filtering, we might need to change this later.

        if (displayEvents.length > 0) {
            const lats = displayEvents.map(e => e.x);
            const lons = displayEvents.map(e => e.y);
            const bounds = L.latLngBounds(
                [Math.min(...lats), Math.min(...lons)],
                [Math.max(...lats), Math.max(...lons)]
            );
            // ONLY fit bounds if we haven't initialized or if the bounds are wildly different?
            // For now, let's trust the original logic but be careful.
            // Actually, resizing on every render is bad if we are just selecting a sub-region. 
            // But 'events' passed here are the RAW events for the dataset, usually.
            // If Dashboard filters 'events' before passing them, then the map will zoom in.
            // If Dashboard passes the FULL dataset and filters separately, then it stays.
            // In Dashboard.tsx: `const events = useMemo(() => activeDataset === 'chicago' ? realCrimeData : indianCrimeData ...`
            // So `events` is the full dataset. It won't change on selection. So fitting bounds is safe (it only runs when dataset changes).

            // However, checking if bounds actually changed heavily would be good?
            // Let's just keep it simple and safe for now.
            // We can rely on the fact that 'events' only changes when dataset switches.
            leafletMapRef.current.fitBounds(bounds, { padding: [20, 20] });
        }

    }, [displayEvents, searchResultSet]);

    const formatCoord = (val: number, isLat: boolean) => {
        const dir = isLat ? (val >= 0 ? 'N' : 'S') : (val >= 0 ? 'E' : 'W');
        return `${Math.abs(val).toFixed(2)}°${dir}`;
    };

    return (
        <div className="relative w-full h-full">
            <div
                ref={mapRef}
                className="w-full h-full rounded-xl z-0"
                style={{ minHeight: '500px' }}
            />

            {/* Custom Controls Container */}
            <div className="absolute top-4 right-4 z-[400] flex flex-col space-y-2">
                <button
                    onClick={toggleSelectionMode}
                    className={`
                        p-2 rounded-lg backdrop-blur-md border transition-all duration-200 shadow-lg
                        ${isSelectionMode
                            ? 'bg-cyan-500 text-white border-cyan-400 ring-2 ring-cyan-400/50'
                            : 'bg-black/40 text-slate-300 border-white/10 hover:bg-black/60 hover:text-white'}
                    `}
                    title={isSelectionMode ? "Cancel Selection" : "Select Region"}
                >
                    {isSelectionMode ? <Crop className="w-5 h-5" /> : <MousePointer2 className="w-5 h-5" />}
                </button>
            </div>

            {/* Corner Coordinates */}
            {mapBounds && (
                <>
                    {/* Top-Left: NW */}
                    <div className="absolute top-2 left-2 z-[1000] bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                        {formatCoord(mapBounds.north, true)}, {formatCoord(mapBounds.west, false)}
                    </div>

                    {/* Top-Right: NE */}
                    <div className="absolute top-2 right-16 z-[1000] bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                        {formatCoord(mapBounds.north, true)}, {formatCoord(mapBounds.east, false)}
                    </div>

                    {/* Bottom-Left: SW */}
                    <div className="absolute bottom-14 left-2 z-[1000] bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                        {formatCoord(mapBounds.south, true)}, {formatCoord(mapBounds.west, false)}
                    </div>

                    {/* Bottom-Right: SE - moved slightly left to avoid zoom control if needed */}
                    <div className="absolute bottom-14 right-14 z-[1000] bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                        {formatCoord(mapBounds.south, true)}, {formatCoord(mapBounds.east, false)}
                    </div>
                </>
            )}


            {/* Instruction Overlay when in Selection Mode */}
            {isSelectionMode && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] bg-cyan-500/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-cyan-400/50 animate-bounce-slight">
                    <p className="text-xs font-bold text-white flex items-center space-x-2">
                        <Crop className="w-3.5 h-3.5" />
                        <span>Click and drag to select a region</span>
                    </p>
                </div>
            )}

            {searchResults.length > 0 && (
                <div className="absolute bottom-4 right-14 z-[1000] bg-amber-500/20 backdrop-blur-xl px-3 py-2 rounded-lg border border-amber-500/30">
                    <p className="text-xs text-amber-400 font-bold">
                        🔍 {searchResults.length} results
                    </p>
                </div>
            )}
        </div>
    );
};

export default InteractiveMap;

