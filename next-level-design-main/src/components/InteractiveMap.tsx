import React, { useEffect, useRef, useMemo, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Event } from '../types';

interface InteractiveMapProps {
    events: Event[];
    searchResults: Event[];
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
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMapRef = useRef<L.Map | null>(null);
    const markersLayerRef = useRef<L.LayerGroup | null>(null);
    const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);

    // Create search result lookup
    const searchResultSet = useMemo(() => {
        return new Set(searchResults.map(e => `${e.x}-${e.y}-${e.time}`));
    }, [searchResults]);

    // Sample events for performance
    const displayEvents = useMemo(() => {
        if (events.length <= 5000) return events;
        const step = Math.ceil(events.length / 5000);
        return events.filter((_, i) => i % step === 0);
    }, [events]);

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

    // Initialize map
    useEffect(() => {
        if (!mapRef.current || leafletMapRef.current) return;

        // Create map centered on India
        const map = L.map(mapRef.current, {
            center: [20.5937, 78.9629],
            zoom: 5,
            zoomControl: true,
        });

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map);

        // Create markers layer
        markersLayerRef.current = L.layerGroup().addTo(map);
        leafletMapRef.current = map;

        // Update bounds on map move/zoom
        map.on('moveend', () => updateBounds(map));
        map.on('zoomend', () => updateBounds(map));

        // Initial bounds
        updateBounds(map);

        return () => {
            map.remove();
            leafletMapRef.current = null;
        };
    }, []);

    // Update markers when events change
    useEffect(() => {
        if (!leafletMapRef.current || !markersLayerRef.current) return;

        // Clear existing markers
        markersLayerRef.current.clearLayers();

        // Add new markers
        displayEvents.forEach(event => {
            const isSearchResult = searchResultSet.has(`${event.x}-${event.y}-${event.time}`);

            const marker = L.circleMarker([event.x, event.y], {
                radius: isSearchResult ? 8 : 4,
                fillColor: isSearchResult ? '#fbbf24' : '#22d3ee',
                color: isSearchResult ? '#f59e0b' : '#0891b2',
                weight: isSearchResult ? 2 : 1,
                opacity: 1,
                fillOpacity: isSearchResult ? 0.9 : 0.6,
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

        // Fit bounds to markers if we have events
        if (displayEvents.length > 0) {
            const lats = displayEvents.map(e => e.x);
            const lons = displayEvents.map(e => e.y);
            const bounds = L.latLngBounds(
                [Math.min(...lats), Math.min(...lons)],
                [Math.max(...lats), Math.max(...lons)]
            );
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
                className="w-full h-full rounded-xl"
                style={{ minHeight: '500px' }}
            />

            {/* Corner Coordinates */}
            {mapBounds && (
                <>
                    {/* Top-Left: NW */}
                    <div className="absolute top-2 left-2 z-[1000] bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                        {formatCoord(mapBounds.north, true)}, {formatCoord(mapBounds.west, false)}
                    </div>

                    {/* Top-Right: NE */}
                    <div className="absolute top-2 right-2 z-[1000] bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                        {formatCoord(mapBounds.north, true)}, {formatCoord(mapBounds.east, false)}
                    </div>

                    {/* Bottom-Left: SW */}
                    <div className="absolute bottom-14 left-2 z-[1000] bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                        {formatCoord(mapBounds.south, true)}, {formatCoord(mapBounds.west, false)}
                    </div>

                    {/* Bottom-Right: SE */}
                    <div className="absolute bottom-14 right-2 z-[1000] bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                        {formatCoord(mapBounds.south, true)}, {formatCoord(mapBounds.east, false)}
                    </div>
                </>
            )}

            {/* Info overlay */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-black/70 backdrop-blur-xl px-3 py-2 rounded-lg border border-white/10">
                <p className="text-xs text-slate-300">
                    <span className="text-cyan-400 font-bold">{displayEvents.length.toLocaleString()}</span> points
                    {events.length > displayEvents.length && (
                        <span className="text-slate-500"> (sampled from {events.length.toLocaleString()})</span>
                    )}
                </p>
            </div>

            {searchResults.length > 0 && (
                <div className="absolute bottom-4 right-4 z-[1000] bg-amber-500/20 backdrop-blur-xl px-3 py-2 rounded-lg border border-amber-500/30">
                    <p className="text-xs text-amber-400 font-bold">
                        🔍 {searchResults.length} results
                    </p>
                </div>
            )}
        </div>
    );
};

export default InteractiveMap;

