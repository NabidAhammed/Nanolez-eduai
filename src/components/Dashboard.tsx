// Dashboard component

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Roadmap } from '../types';

interface DashboardProps {
  roadmaps: Record<string, Roadmap>;
  theme: 'light' | 'dark';
  onCreateNew: () => void;
  onSelectRoadmap: (id: string) => void;
  onDeleteRoadmap: (id: string) => void;
}

export function Dashboard({ 
  roadmaps, 
  theme, 
  onCreateNew, 
  onSelectRoadmap, 
  onDeleteRoadmap 
}: DashboardProps) {
  const isDark = theme === 'dark';
  const bodyColor = isDark ? 'text-slate-400' : 'text-[#475569]';
  const cardBg = isDark ? 'bg-[#111111] border-[#222222]' : 'bg-white border-[#E2E8F0] shadow-[0_8px_30px_rgb(0,0,0,0.04)]';

  return (
    <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-12">
        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2 block">
          Personal Portal
        </span>
        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter mb-4 leading-none space-x-1">
          NANOLEZ <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-fuchsia-500">EDU AI</span>
        </h1>
        <p className={`${bodyColor} text-lg font-medium max-w-xl`}>
          Select an existing path or architect a new learning trajectory with neural guidance.
        </p>
      </div>

      {/* Roadmaps Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Special Create Card */}
        <div 
          onClick={onCreateNew} 
          className={`p-8 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center text-center h-[280px] cursor-pointer transition-all hover:border-indigo-500 hover:bg-indigo-500/5 group ${isDark ? 'border-white/10' : 'border-slate-200'}`}
        >
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Plus className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black mb-1">Architect New Goal</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">7-Day Systematic Cycle</p>
        </div>

        {/* Existing Roadmaps */}
        {Object.values(roadmaps).map((roadmap) => (
          <div 
            key={roadmap.id} 
            onClick={() => onSelectRoadmap(roadmap.id)} 
            className={`group p-8 rounded-[2.5rem] border flex flex-col justify-between h-[280px] cursor-pointer transition-all hover:translate-y-[-4px] relative overflow-hidden ${cardBg}`}
          >
            {/* Background Effect */}
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors" />
            
            {/* Header */}
            <div className="flex justify-between items-start relative z-10">
              <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase border ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                {roadmap.language}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteRoadmap(roadmap.id); }} 
                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            {/* Content */}
            <div className="relative z-10">
              <h3 className="text-2xl font-black tracking-tight leading-tight group-hover:text-indigo-500 transition-colors">
                {roadmap.title}
              </h3>
              
              {/* Progress */}
              <div className="mt-6">
                <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest">
                  <span>Mastery Level</span>
                  <span className="text-indigo-500">{roadmap.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-1000 ease-out" 
                    style={{width: `${roadmap.progress}%`}} 
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
