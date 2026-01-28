import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe2 } from 'lucide-react';
import { DatasetType } from '../types';

interface DatasetTabsProps {
    activeDataset: DatasetType;
    onDatasetChange: (dataset: DatasetType) => void;
    chicagoCount: number;
    indiaCount: number;
}

export const DatasetTabs: React.FC<DatasetTabsProps> = ({
    activeDataset,
    onDatasetChange,
    chicagoCount,
    indiaCount
}) => {
    const tabs = [
        {
            id: 'chicago' as DatasetType,
            label: 'Chicago',
            flag: '🇺🇸',
            icon: MapPin,
            count: chicagoCount,
            color: 'from-blue-500 to-cyan-500'
        },
        {
            id: 'india' as DatasetType,
            label: 'India',
            flag: '🇮🇳',
            icon: Globe2,
            count: indiaCount,
            color: 'from-orange-500 to-amber-500'
        }
    ];

    return (
        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10 backdrop-blur-xl">
            {tabs.map((tab) => {
                const isActive = activeDataset === tab.id;
                const Icon = tab.icon;

                return (
                    <motion.button
                        key={tab.id}
                        onClick={() => onDatasetChange(tab.id)}
                        className={`
                            relative flex items-center gap-2 px-4 py-2 rounded-lg
                            font-medium text-sm transition-all duration-300
                            ${isActive
                                ? 'text-white'
                                : 'text-slate-400 hover:text-white/80'
                            }
                        `}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* Active Background */}
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-lg shadow-lg`}
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                            />
                        )}

                        {/* Content */}
                        <span className="relative z-10 flex items-center gap-2">
                            <span className="text-lg">{tab.flag}</span>
                            <Icon className="w-4 h-4" />
                            <span className="font-semibold">{tab.label}</span>
                            <span className={`
                                px-2 py-0.5 rounded-full text-xs font-bold
                                ${isActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-white/5 text-slate-500'
                                }
                            `}>
                                {tab.count.toLocaleString()}
                            </span>
                        </span>
                    </motion.button>
                );
            })}
        </div>
    );
};

export default DatasetTabs;
