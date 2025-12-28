// Roadmap component

import React from 'react';
import { Trash2, BookOpen, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Roadmap as RoadmapType } from '../types';

interface RoadmapProps {
  roadmap: RoadmapType;
  theme: 'light' | 'dark';
  onDelete: () => void;
  onTaskToggle: (monthIndex: number, weekIndex: number, dayIndex: number) => void;
  onArticleClick: (articleId: string) => void;
  onGenerateArticle: (monthIndex: number, weekIndex: number, dayIndex: number, topic: string) => void;
  genId: string | null;
  loading: boolean;
}

export function Roadmap({ 
  roadmap, 
  theme, 
  onDelete, 
  onTaskToggle, 
  onArticleClick, 
  onGenerateArticle,
  genId,
  loading 
}: RoadmapProps) {
  const isDark = theme === 'dark';
  const cardBg = isDark ? 'bg-[#111111] border-[#222222]' : 'bg-white border-[#E2E8F0] shadow-[0_8px_30px_rgb(0,0,0,0.04)]';
  const bodyColor = isDark ? 'text-slate-400' : 'text-[#475569]';

  return (
    <div className="max-w-6xl animate-in fade-in duration-500">
      {/* Header */}
      <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              {roadmap.level}
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              {roadmap.duration}
            </div>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] mb-6">
            {roadmap.title}
          </h1>
          
          <p className={`${bodyColor} text-lg font-medium`}>
            A rigorous 7-day systematic cycle tailored to {roadmap.goal}.
          </p>
        </div>
        
        <button 
          onClick={onDelete} 
          className="group flex items-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
        >
          <Trash2 className="w-4 h-4" /> 
          Discard
        </button>
      </header>

      {/* Timeline */}
      <div className="space-y-24">
        {roadmap.months.map((month, monthIndex) => (
          <div key={monthIndex} className="relative">
            {/* Month Header */}
            <div className="sticky top-6 z-10 mb-8">
              <div className={`inline-flex items-center gap-4 p-2 rounded-2xl border ${cardBg}`}>
                <div className="bg-indigo-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl">
                  {monthIndex + 1}
                </div>
                <div className="pr-6">
                  <h3 className="text-lg font-black leading-none mb-1 uppercase tracking-tighter">
                    {month.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Core Phase Objectives
                  </p>
                </div>
              </div>
            </div>

            {/* Weeks */}
            <div className="space-y-12 ml-6 lg:ml-8 border-l-2 border-slate-200 dark:border-white/5 pl-8 lg:pl-12">
              {month.weeks.map((week, weekIndex) => (
                <div key={weekIndex}>
                  {/* Week Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-3 h-3 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)] -ml-[41px] lg:-ml-[57px] ring-4 ring-white" />
                    <h4 className="text-xl font-black tracking-tight">
                      {week.name} <span className="text-slate-400 mx-2">—</span> <span className="text-indigo-500">{week.weeklyGoal}</span>
                    </h4>
                  </div>

                  {/* Days Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {week.days.map((day, dayIndex) => (
                      <div 
                        key={dayIndex} 
                        className={`p-6 rounded-[2rem] border transition-all flex flex-col justify-between group ${
                          day.completed 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : `${cardBg} hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10`
                        }`}
                      >
                        {/* Day Header */}
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${day.completed ? 'text-indigo-200' : 'text-slate-400'}`}>
                              Day {day.day}
                            </span>
                            <button 
                              onClick={() => onTaskToggle(monthIndex, weekIndex, dayIndex)} 
                              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                                day.completed 
                                  ? 'bg-white text-indigo-600 border-white' 
                                  : 'border-slate-200 dark:border-white/10 hover:border-indigo-500'
                              }`}
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                          </div>
                          
                          <h5 className={`font-black text-lg mb-2 leading-tight tracking-tight group-hover:text-indigo-500 transition-colors ${
                            day.completed ? 'text-white' : ''
                          }`}>
                            {day.topic}
                          </h5>
                          
                          <p className={`text-[11px] font-medium leading-relaxed mb-8 ${
                            day.completed ? 'text-indigo-100/70' : 'text-slate-500'
                          }`}>
                            {day.task}
                          </p>
                        </div>
                        
                        {/* Article Button */}
                        {day.articleId ? (
                          <button 
                            onClick={() => onArticleClick(day.articleId!)} 
                            className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                              day.completed 
                                ? 'bg-white/20 text-white' 
                                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            }`}
                          >
                            <BookOpen className="w-3.5 h-3.5" /> 
                            Study
                          </button>
                        ) : (
                          <button 
                            disabled={loading && genId === `${monthIndex}-${weekIndex}-${dayIndex}`} 
                            onClick={() => onGenerateArticle(monthIndex, weekIndex, dayIndex, day.topic)} 
                            className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                              day.completed 
                                ? 'bg-white/20 text-white' 
                                : isDark 
                                  ? 'bg-white/5 border border-white/10 hover:border-indigo-500' 
                                  : 'bg-slate-100 text-slate-900'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {loading && genId === `${monthIndex}-${weekIndex}-${dayIndex}` ? (
                              <Loader2 className="animate-spin w-4 h-4" />
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" /> 
                                Core Lesson
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
