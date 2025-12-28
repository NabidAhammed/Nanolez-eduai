// Sidebar component

import React from 'react';
import { Layout, Plus, Sun, Moon, Globe, User, LogOut } from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  appLanguage: string;
  currentUserEmail?: string | null;
  onLogout?: () => void;
}

export function Sidebar({ 
  activeView, 
  onViewChange, 
  theme, 
  onToggleTheme, 
  appLanguage,
  currentUserEmail,
  onLogout
}: SidebarProps) {
  const isDark = theme === 'dark';
  const bodyColor = isDark ? 'text-slate-400' : 'text-[#475569]';

  return (
    <aside className={`fixed left-6 top-6 bottom-6 w-20 lg:w-64 rounded-[2.5rem] ${
      isDark ? 'bg-[#0A0A0A] border-[#1A1A1A]' : 'bg-white border-slate-200 shadow-xl'
    } border z-50 transition-all duration-300 flex flex-col items-center py-8`}>
      
      {/* Logo */}
      <div className="mb-12 group cursor-pointer" onClick={() => onViewChange('dashboard')}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
          <img src="/favicon.svg" className="w-15 h-15 ml-1" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 w-full px-4">
        <button 
          onClick={() => onViewChange('dashboard')} 
          className={`w-full p-3 lg:px-4 lg:py-3 rounded-2xl flex items-center justify-center lg:justify-start gap-3 transition-all ${
            activeView === 'dashboard' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
              : `${bodyColor} hover:bg-slate-100 dark:hover:bg-white/5`
          }`}
        >
          <Layout className="w-5 h-5" /> 
          <span className="hidden lg:block font-bold text-sm">Dashboard</span>
        </button>
        
        <button 
          onClick={() => onViewChange('create')} 
          className={`w-full p-3 lg:px-4 lg:py-3 rounded-2xl flex items-center justify-center lg:justify-start gap-3 transition-all ${
            activeView === 'create' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
              : `${bodyColor} hover:bg-slate-100 dark:hover:bg-white/5`
          }`}
        >
          <Plus className="w-5 h-5" /> 
          <span className="hidden lg:block font-bold text-sm">New Path</span>
        </button>
        
        <div className="h-px bg-slate-200 dark:bg-white/5 mx-2" />
        
        <div className="hidden lg:block px-4 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Settings
        </div>
        
        <button 
          onClick={onToggleTheme} 
          className={`w-full p-3 lg:px-4 lg:py-3 rounded-2xl flex items-center justify-center lg:justify-start gap-3 transition-all ${bodyColor} hover:bg-slate-100 dark:hover:bg-white/5`}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-orange-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600" />
          )}
          <span className="hidden lg:block font-bold text-sm">
            {isDark ? 'Day Mode' : 'Night Mode'}
          </span>
        </button>
      </nav>

      {/* User Info and Controls */}
      <div className="mt-auto px-4 w-full space-y-3">
        {/* Language Indicator */}
        <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex flex-col items-center gap-1">
          <Globe className="w-4 h-4 text-indigo-500" />
          <span className="hidden lg:block text-[9px] font-black text-indigo-500 uppercase">
            {appLanguage}
          </span>
        </div>

        {/* User Info */}
        {currentUserEmail && (
          <div className={`p-3 rounded-2xl border flex flex-col items-center gap-1 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            <User className="w-4 h-4 text-indigo-500" />
            <span className="hidden lg:block text-[8px] font-bold text-center text-indigo-500 break-words">
              {currentUserEmail.split('@')[0]}
            </span>
            <span className="hidden lg:block text-[7px] text-slate-400 break-words">
              {currentUserEmail.split('@')[1]}
            </span>
          </div>
        )}

        {/* Logout Button */}
        {onLogout && (
          <button 
            onClick={onLogout}
            className={`w-full p-3 rounded-2xl flex items-center justify-center lg:justify-start gap-2 transition-all ${
              isDark ? 'text-slate-400 hover:bg-red-500/10 hover:text-red-400' : 'text-[#475569] hover:bg-red-50 hover:text-red-600'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden lg:block font-bold text-xs">Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
}
