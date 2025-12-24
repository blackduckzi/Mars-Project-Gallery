
import React, { useState } from 'react';
import { MarsProject } from '../types';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (project: MarsProject) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload }) => {
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !previewUrl) return;

    const newProject: MarsProject = {
      id: Date.now().toString(),
      description,
      imageUrl: previewUrl
    };

    onUpload(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="max-w-xs w-full bg-zinc-950 border border-emerald-900/40 rounded-3xl overflow-hidden shadow-2xl animate-slide-up flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-zinc-950">
          <h2 className="text-xs font-black jetbrains-mono text-emerald-500 uppercase tracking-tighter">ADD Your Memory</h2>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] uppercase font-black text-zinc-500 tracking-[0.2em]">Memory Image</label>
            <label className="cursor-pointer block group">
              <div className="aspect-video border border-dashed border-zinc-800 group-hover:border-emerald-500/30 rounded-2xl flex items-center justify-center transition-all bg-zinc-900/20 overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Preview" />
                ) : (
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-zinc-700 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-zinc-700 text-[9px] font-bold uppercase tracking-widest">Select Image</span>
                  </div>
                )}
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase font-black text-zinc-500 tracking-[0.2em]">Description</label>
            <textarea 
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-emerald-500/50 p-4 rounded-2xl text-xs text-white outline-none transition-all resize-none jetbrains-mono"
              placeholder="Tell the story of this memory..."
            />
          </div>

          <button 
            type="submit"
            className="w-full py-3.5 bg-emerald-600 text-black font-black uppercase tracking-[0.3em] text-[10px] transition-all rounded-full disabled:opacity-20 shadow-lg shadow-emerald-900/20"
            disabled={!description || !previewUrl}
          >
            Store Memory
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
