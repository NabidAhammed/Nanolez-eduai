// Article component

import React from 'react';
import { ChevronRight, Globe, ExternalLink } from 'lucide-react';
import { Article as ArticleType } from '../types';

interface ArticleProps {
  article: ArticleType;
  theme: 'light' | 'dark';
  onBackToRoadmap: () => void;
  onOpenExternalResource: (article: ArticleType) => void;
}

export function ArticleView({ 
  article, 
  theme, 
  onBackToRoadmap, 
  onOpenExternalResource 
}: ArticleProps) {
  const isDark = theme === 'dark';
  const bodyColor = isDark ? 'text-slate-300' : 'text-[#334155]';

  return (
    <div className="max-w-3xl mx-auto py-12 animate-in slide-in-from-bottom-8 duration-700">
      {/* Back Button */}
      <button 
        onClick={onBackToRoadmap} 
        className="flex items-center gap-3 text-indigo-500 font-black text-xs uppercase tracking-[0.2em] mb-12 hover:translate-x-[-4px] transition-transform"
      >
        <ChevronRight className="rotate-180 w-5 h-5" /> 
        Back to Trajectory
      </button>
      
      {/* Header */}
      <header className="mb-16">
        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-10">
          {article.title}
        </h1>
        <div className={`p-10 rounded-[2.5rem] text-xl font-bold leading-relaxed border-l-[12px] border-indigo-600 ${isDark ? 'bg-white/5 text-slate-300 border-white/10' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
          {article.summary}
        </div>
      </header>

      {/* Content Sections */}
      <div className="space-y-16 mb-24">
        {article.sections.map((section, index) => (
          <section key={index}>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-4xl font-black text-indigo-600/30">
                0{index + 1}
              </span>
              <h2 className="text-3xl font-black tracking-tight">
                {section.heading}
              </h2>
            </div>
            <div className={`text-xl leading-[1.8] font-medium whitespace-pre-wrap ${bodyColor}`}>
              {section.content}
            </div>
          </section>
        ))}
      </div>

      {/* External Resource */}
      {article.externalResource && (
        <div className={`p-10 rounded-[3rem] border-2 flex flex-col md:flex-row items-center justify-between gap-10 group ${isDark ? 'bg-indigo-600/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-500 mb-2 font-black text-[10px] uppercase tracking-widest">
              <Globe className="w-4 h-4" /> 
              Academic Resource
            </div>
            <h3 className="text-3xl font-black tracking-tight group-hover:text-indigo-600 transition-colors">
              {article.externalResource.title}
            </h3>
          </div>
          <button 
            onClick={() => onOpenExternalResource(article)}
            className="w-full md:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/30 hover:scale-105 transition-transform"
          >
            Explore <ExternalLink className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
