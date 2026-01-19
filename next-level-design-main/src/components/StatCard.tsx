import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface Props {
    title: string;
    value: number | string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    delay?: number;
}

const StatCard: React.FC<Props> = ({ title, value, subtitle, icon, color, delay = 0 }) => {
    const numericValue = typeof value === 'number' ? value : parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    const isNumeric = typeof value === 'number' || !isNaN(parseFloat(value as string));

    const springValue = useSpring(0, { stiffness: 60, damping: 20 });
    const displayValue = useTransform(springValue, (latest) =>
        isNumeric ? Math.floor(latest).toLocaleString() : value
    );

    useEffect(() => {
        if (isNumeric) {
            springValue.set(numericValue);
        }
    }, [numericValue, isNumeric, springValue]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="glass-card flex-1 min-w-[240px] p-6 group cursor-default relative overflow-hidden"
        >
            <div className="flex items-start justify-between">
                <div className={`p-4 rounded-xl bg-black/40 ${color} shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                    {icon}
                </div>
                <div className="text-right">
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${color}`}>{title}</p>
                    <motion.h3 className={`text-3xl font-bold tracking-tight font-mono-data ${color} drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]`}>
                        {isNumeric ? <motion.span>{displayValue}</motion.span> : value}
                    </motion.h3>
                    <p className="text-[10px] font-medium text-slate-500 uppercase mt-1">{subtitle}</p>
                </div>
            </div>

            {/* Background Decorative Element */}
            <div className={`absolute -bottom-8 -right-8 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity bg-current ${color}`} />

            {/* Shimmer effect */}
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity" />
        </motion.div>
    );
};

export default StatCard;
