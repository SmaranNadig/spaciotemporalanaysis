import React from 'react';
import { Github, Info, Database, Cpu } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="h-16 border-t border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between px-8 text-[11px] text-slate-500 font-mono tracking-wider">
            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                    <Database className="w-3.5 h-3.5 text-primary" />
                    <span>SOURCE: CHICAGO PD OPEN DATA</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Cpu className="w-3.5 h-3.5 text-accent" />
                    <span>ALGORITHM: KD-TREE + FENWICK TREE</span>
                </div>
            </div>

            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                    <Info className="w-3.5 h-3.5" />
                    <span>VERSION 2.4.0-CYBER</span>
                </div>
                <a
                    href="#"
                    className="flex items-center space-x-2 hover:text-primary transition-colors cursor-pointer"
                >
                    <Github className="w-3.5 h-3.5" />
                    <span>DOCS</span>
                </a>
            </div>
        </footer>
    );
};

export default Footer;
