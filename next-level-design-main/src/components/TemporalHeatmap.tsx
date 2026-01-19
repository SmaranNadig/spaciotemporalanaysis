import { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { Event } from '../types';

interface TemporalHeatmapProps {
    events: Event[];
    startTime: number;
    endTime: number;
}

export function TemporalHeatmap({ events, startTime, endTime }: TemporalHeatmapProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const renderHeatmap = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Clear with dark background
        ctx.fillStyle = '#0a0f1a';
        ctx.fillRect(0, 0, width, height);

        // Count events per hour
        const hourCounts = new Array(24).fill(0);

        events.forEach(event => {
            const hour = Math.floor(event.time / 60);
            if (hour >= 0 && hour < 24) {
                hourCounts[hour]++;
            }
        });

        const isHourInRange = (hour: number) => {
            const startHour = Math.floor(startTime / 60);
            const endHour = Math.floor(endTime / 60);
            if (startHour <= endHour) return hour >= startHour && hour <= endHour;
            return hour >= startHour || hour <= endHour;
        };

        const maxCount = Math.max(...hourCounts);
        const barWidth = width / 24;
        const padding = 20;
        const chartHeight = height - padding * 2;

        // Draw gradient bars
        hourCounts.forEach((count, hour) => {
            const barHeight = (count / maxCount) * chartHeight * 0.9;
            const x = hour * barWidth;
            const y = height - padding - barHeight;

            // Create gradient for each bar
            const intensity = count / maxCount;
            const inRange = isHourInRange(hour);
            const gradient = ctx.createLinearGradient(x, y + barHeight, x, y);

            // Color based on intensity and range
            if (!inRange) {
                gradient.addColorStop(0, 'rgba(148, 163, 184, 0.1)');
                gradient.addColorStop(1, 'rgba(148, 163, 184, 0.2)');
            } else if (intensity < 0.33) {
                gradient.addColorStop(0, 'rgba(56, 189, 248, 0.3)');
                gradient.addColorStop(1, 'rgba(56, 189, 248, 0.8)');
            } else if (intensity < 0.66) {
                gradient.addColorStop(0, 'rgba(167, 139, 250, 0.4)');
                gradient.addColorStop(1, 'rgba(167, 139, 250, 0.9)');
            } else {
                gradient.addColorStop(0, 'rgba(239, 68, 68, 0.5)');
                gradient.addColorStop(1, 'rgba(239, 68, 68, 1)');
            }

            ctx.fillStyle = gradient;

            // Draw bar
            const radius = 3;
            ctx.beginPath();
            ctx.moveTo(x + 3, y + barHeight);
            ctx.lineTo(x + 3, y + radius);
            ctx.quadraticCurveTo(x + 3, y, x + 3 + radius, y);
            ctx.lineTo(x + barWidth - 6 - radius, y);
            ctx.quadraticCurveTo(x + barWidth - 3, y, x + barWidth - 3, y + radius);
            ctx.lineTo(x + barWidth - 3, y + barHeight);
            ctx.closePath();
            ctx.fill();

            // Glow effect for high intensity bars in range
            if (intensity > 0.7 && inRange) {
                ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });

        // Draw hour labels
        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';

        for (let hour = 0; hour < 24; hour += 3) {
            const x = hour * barWidth + barWidth / 2;
            ctx.fillText(`${hour}:00`, x, height - 5);
        }
    }, [events]);

    useEffect(() => {
        renderHeatmap();
    }, [renderHeatmap]);

    const timeLabels = ['12 AM', '6 AM', '12 PM', '6 PM', '12 AM'];

    return (
        <motion.div
            className="glass-card overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <div className="flex items-center gap-2 border-b border-border/50 p-4 bg-white/[0.02]">
                <Flame className="h-5 w-5 text-accent" />
                <h2 className="font-bold text-lg tracking-tight" style={{ color: "#00ffff" }}>Temporal Density Distribution</h2>
                <span className="ml-auto text-[10px] font-bold text-accent px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20">24H CYCLE</span>
            </div>

            <div className="p-4">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={180}
                    className="w-full"
                />

                {/* Legend */}
                <div className="mt-3 flex items-center justify-between text-xs font-bold font-mono">
                    {timeLabels.map((label, i) => (
                        <span key={i} className="text-accent/60">{label}</span>
                    ))}
                </div>

                {/* Intensity legend */}
                <div className="mt-4 flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-info/80 shadow-[0_0_8px_rgba(var(--info-rgb),0.5)]" />
                        <span className="text-[10px] font-bold text-info uppercase tracking-wider">Low Intensity</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-accent/80 shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)]" />
                        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Medium Intensity</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-destructive/80 shadow-[0_0_8px_rgba(var(--destructive-rgb),0.5)]" />
                        <span className="text-[10px] font-bold text-destructive uppercase tracking-wider">High Intensity</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
