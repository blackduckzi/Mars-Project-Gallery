
import React, { useState, useEffect, useRef } from 'react';
import Scene from './components/Scene';
import Overlay from './components/Overlay';
import UploadModal from './components/UploadModal';
import { MarsProject } from './types';
import { MARS_PROJECTS } from './constants';

const STORAGE_KEY = 'mars_memories_2025';

const App: React.FC = () => {
  const [projects, setProjects] = useState<MarsProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<MarsProject | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load memories from Local Storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProjects(parsed);
      } catch (e) {
        console.error("Failed to recover memory fragments from the Ether.");
        setProjects(MARS_PROJECTS);
      }
    } else {
      setProjects(MARS_PROJECTS);
    }
    
    // Simulate a brief "Neural Link" sync
    const timer = setTimeout(() => setIsSyncing(false), 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Save memories to Local Storage whenever projects change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
  }, [projects]);

  useEffect(() => {
    // Festive Christmas BGM
    audioRef.current = new Audio('https://cdn.pixabay.com/audio/2022/11/22/audio_49668d2f62.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    const playAudio = () => {
      if (audioRef.current && !isMuted) {
        audioRef.current.play().catch(() => {
          console.log("Auto-play blocked, waiting for interaction.");
        });
      }
    };

    playAudio();

    const handleFirstClick = () => {
      playAudio();
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.removeEventListener('click', handleFirstClick);
    };
  }, []);

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.play().catch(err => console.log("Audio play blocked."));
      setIsMuted(false);
    } else {
      audioRef.current.pause();
      setIsMuted(true);
    }
  };

  const handleProjectSelect = (project: MarsProject) => {
    setSelectedProject(project);
  };

  const handleUploadProject = (newProject: MarsProject) => {
    setProjects(prev => [...prev, newProject]);
  };

  return (
    <div className="relative w-full h-screen bg-[#010103] overflow-hidden">
      {/* Header UI */}
      <header className="absolute top-0 left-0 w-full p-6 md:p-10 z-40 pointer-events-none flex justify-between items-start">
        <div className="pointer-events-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white jetbrains-mono uppercase">
            Merry <span className="text-emerald-500">Christmas</span>
          </h1>
          <div className="mt-2 space-y-1">
            <p className="text-emerald-400 font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase text-[10px] md:text-[11px] flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-yellow-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></span>
              MARS Memories of 2025
            </p>
            {!isSyncing && (
              <p className="text-zinc-500 text-[8px] uppercase tracking-[0.3em] font-medium opacity-50 ml-5">
                {projects.length} Memory Fragments Synced
              </p>
            )}
          </div>
        </div>
        
        <div className="text-right pointer-events-auto flex flex-col items-end gap-4">
          <button 
            onClick={toggleMute}
            className="p-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all group"
          >
            {isMuted ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400 group-hover:text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
          <div className="hidden md:block">
            <p className="text-white text-sm font-bold jetbrains-mono tracking-widest">AETHER HARVEST</p>
            <p className="text-zinc-600 text-[10px] uppercase tracking-[0.3em] mt-1 font-semibold">Initiative V. Emerald-24</p>
          </div>
        </div>
      </header>

      {/* Main 3D Scene */}
      <Scene projects={projects} onProjectSelect={handleProjectSelect} />

      {/* Centered Add Memory Button */}
      {!selectedProject && !isUploadOpen && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="group flex items-center gap-3 bg-emerald-600/10 hover:bg-emerald-600/30 border border-emerald-500/30 hover:border-emerald-500/60 px-8 py-4 rounded-full transition-all backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.1)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400 group-hover:scale-125 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-100 group-hover:text-white">ADD Your Memory</span>
          </button>
        </div>
      )}

      {/* Project Detail Overlay */}
      <Overlay 
        selectedProject={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />

      {/* Upload Modal */}
      {isUploadOpen && (
        <UploadModal 
          onClose={() => setIsUploadOpen(false)} 
          onUpload={handleUploadProject}
        />
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 text-white text-[8px] md:text-[9px] uppercase tracking-normal font-medium pointer-events-none opacity-60 text-center w-full px-4">
        Explore the floating gallery • Navigate the Emerald Void
      </div>

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
