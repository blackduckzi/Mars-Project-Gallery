
import React from 'react';
import { MarsProject } from '../types';

interface OverlayProps {
  selectedProject: MarsProject | null;
  onClose: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ selectedProject, onClose }) => {
  if (!selectedProject) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl transition-all duration-500">
      <div className="max-w-xl w-full bg-zinc-950/40 border border-emerald-500/20 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.1)] animate-slide-up">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-3 bg-white/5 text-white/70 rounded-full hover:bg-emerald-500 hover:text-black transition-all z-10 backdrop-blur-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Main Case Image */}
        <div className="relative aspect-square sm:aspect-video group">
          <img 
            src={selectedProject.imageUrl} 
            alt="MARS Memory" 
            className="w-full h-full object-cover transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
        </div>
        
        <div className="p-10 space-y-6 -mt-12 relative z-10">
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
              <p className="text-[10px] uppercase font-black text-emerald-400 tracking-[0.3em]">Project Detail</p>
            </div>
            <p className="text-zinc-100 font-light leading-relaxed jetbrains-mono text-lg md:text-xl">
              {selectedProject.description}
            </p>
          </div>

          {/* Footer Badge */}
          <div className="flex items-center justify-between pt-8 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em]">Memory Fragment</span>
            </div>
            <span className="text-[9px] font-black text-emerald-900/40 uppercase tracking-[0.2em] jetbrains-mono">#{selectedProject.id.slice(-4)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overlay;
