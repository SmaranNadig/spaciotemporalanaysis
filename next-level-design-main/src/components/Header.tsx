import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap } from 'lucide-react';

const Header: React.FC = () => {
    return (
        <header className="relative h-32 flex flex-col items-center justify-center overflow-hidden border-b border-white/5">
            {/* Background Particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-primary/20 rounded-full"
                        initial={{
                            x: Math.random() * 1400,
                            y: Math.random() * 200,
                            opacity: 0
                        }}
                        animate={{
                            y: [null, Math.random() * -100],
                            opacity: [0, 0.4, 0],
                            scale: [0.5, 1.5, 0.5]
                        }}
                        transition={{
                            duration: 3 + Math.random() * 5,
                            repeat: Infinity,
                            delay: Math.random() * 10
                        }}
                    />
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 flex items-center space-x-4"
            >
                <div className="bg-primary/20 p-3 rounded-2xl glow-primary">
                    <Activity className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-bold tracking-tight text-gradient-header">
                        Spatio-Temporal Event Analytics
                    </h1>
                    <div className="flex items-center space-x-2 mt-1">
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-mono text-primary/80 uppercase tracking-[0.2em]">
                            Live Chicago Crime Dataset • Engine V2.4
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Subtle glow underneath */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.5)]" />
        </header>
    );
};

export default Header;
