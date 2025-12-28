// Create Roadmap component

import React, { useState } from 'react';
import { Loader2, Sparkles, Globe, Command } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../constants';

interface CreateRoadmapProps {
  loading: boolean;
  theme: 'light' | 'dark';
  appLanguage: string;
  onLanguageChange: (language: string) => void;
  onSubmit: (goal: string, duration: string, level: string) => Promise<void>;
}

export function CreateRoadmap({ 
  loading, 
  theme, 
  appLanguage, 
  onLanguageChange, 
  onSubmit 
}: CreateRoadmapProps) {
  const isDark = theme === 'dark';
  const bodyColor = isDark ? 'text-slate-400' : 'text-[#475569]';
  const cardBg = isDark ? 'bg-[#111111] border-[#222222]' : 'bg-white border-[#E2E8F0] shadow-[0_8px_30px_rgb(0,0,0,0.04)]';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const goal = formData.get('goal') as string;
    const duration = formData.get('duration') as string;
    const level = formData.get('level') as string;
    
    await onSubmit(goal, duration, level);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 animate-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl lg:text-5xl font-black tracking-tighter mb-4">
          Neural Architecture
        </h2>
        <p className={`${bodyColor} font-medium`}>
          Define your objective and let the AI generate a rigorous 7-day-per-week curriculum.
        </p>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className={`p-10 lg:p-12 rounded-[3.5rem] border ${cardBg}`}>
        <div className="grid gap-8">
          {/* Goal Input */}
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 flex items-center gap-2">
              <Command className="w-4 h-4" /> 
              Global Objective
            </label>
            <input 
              required 
              name="goal" 
              placeholder="e.g. Mastering Modern UI Design & Prototyping" 
              className={`w-full p-6 rounded-3xl text-lg font-bold border-2 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all ${isDark ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-100'}`} 
            />
          </div>

          {/* Duration and Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">
                Timeline
              </label>
              <select 
                name="duration" 
                className={`w-full p-6 rounded-3xl font-bold border-2 outline-none appearance-none ${isDark ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-100'}`}
              >
                <option>1 Month</option>
                <option>3 Months</option>
                <option>6 Months</option>
              </select>
            </div>
            
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">
                Difficulty
              </label>
              <select 
                name="level" 
                className={`w-full p-6 rounded-3xl font-bold border-2 outline-none appearance-none ${isDark ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-100'}`}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Expert</option>
              </select>
            </div>
          </div>

          {/* Language Selection */}
          <div className={`p-6 rounded-3xl border flex items-center justify-between ${isDark ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500 rounded-lg text-white">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-sm font-black tracking-tight">System Language</span>
            </div>
            <select 
              value={appLanguage} 
              onChange={(e) => onLanguageChange(e.target.value)} 
              className="bg-transparent font-black text-indigo-600 outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l} value={l} className="bg-white text-black">
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button 
            disabled={loading} 
            className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <Loader2 className="animate-spin w-6 h-6" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> 
                Generate Trajectory
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
