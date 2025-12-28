// Refactored App component using separated components and hooks

import React, { useState } from 'react';
import { 
  ArrowRight, 
  ChevronRight, 
  Globe, 
  Trash2, 
  Loader2, 
  Sparkles,
  CheckCircle2,
  BookOpen,
  ExternalLink,
  LogOut,
  User
} from 'lucide-react';

// Import hooks
import { useAuth } from './hooks/useAuth';
import { useUserData } from './hooks/useUserData';
import { useRoadmap } from './hooks/useRoadmap';
import { useArticle } from './hooks/useArticle';

// Import components
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CreateRoadmap } from './components/CreateRoadmap';
import { Roadmap } from './components/Roadmap';
import { ArticleView } from './components/ArticleView';
import { Login } from './components/Login';

// Import types
import { ViewType } from './types';

export default function AppRefactored() {
  // Authentication state
  const { userSession, loading: authLoading, error: authError, login, logout, getCurrentUserEmail, isAuthenticated } = useAuth();
  const currentUserEmail = getCurrentUserEmail();

  // User-specific data management
  const {
    roadmaps,
    articles,
    selectedRoadmapId,
    selectedArticleId,
    theme,
    appLanguage,
    addRoadmap,
    removeRoadmap,
    toggleTask,
    setSelectedRoadmapId,
    setSelectedArticleId,
    linkArticleToTask,
    addArticle,
    setTheme,
    setAppLanguage,
  } = useUserData(currentUserEmail || '');
  
  const { loading: roadmapLoading, error: roadmapError, createRoadmap } = useRoadmap();
  const { 
    loading: articleLoading, 
    error: articleError, 
    genId, 
    generateNewArticle, 
    openExternalResource 
  } = useArticle();

  // Local state
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Handler functions
  const handleCreateRoadmap = async (goal: string, duration: string, level: string) => {
    await createRoadmap(
      goal,
      duration,
      level,
      appLanguage,
      (roadmap) => {
        addRoadmap(roadmap);
        setSelectedRoadmapId(roadmap.id);
        setActiveView('roadmap');
      }
    );
  };

  const handleDeleteRoadmap = (id: string) => {
    removeRoadmap(id);
    setConfirmDelete(null);
    if (activeView === 'roadmap') {
      setActiveView('dashboard');
    }
  };

  const handleGenerateArticle = async (
    monthIndex: number,
    weekIndex: number,
    dayIndex: number,
    topic: string
  ) => {
    const selectedRoadmap = roadmaps[selectedRoadmapId!];
    if (!selectedRoadmap) return;

    await generateNewArticle(
      topic,
      selectedRoadmap.language,
      (article, articleId) => {
        addArticle(article);
        linkArticleToTask(selectedRoadmapId!, monthIndex, weekIndex, dayIndex, articleId);
        setSelectedArticleId(articleId);
        setActiveView('article');
      },
      monthIndex,
      weekIndex,
      dayIndex
    );
  };

  const handleTaskToggle = (monthIndex: number, weekIndex: number, dayIndex: number) => {
    if (selectedRoadmapId) {
      toggleTask(selectedRoadmapId, monthIndex, weekIndex, dayIndex);
    }
  };

  const handleSelectRoadmap = (id: string) => {
    setSelectedRoadmapId(id);
    setActiveView('roadmap');
  };

  const handleArticleClick = (articleId: string) => {
    setSelectedArticleId(articleId);
    setActiveView('article');
  };

  const handleBackToRoadmap = () => {
    setActiveView('roadmap');
    setSelectedArticleId(null);
  };

  const handleOpenExternalResource = (article: any) => {
    openExternalResource(article);
  };

  const handleCreateNew = () => {
    setActiveView('create');
  };

  const handleLogin = async (email: string, password: string) => {
    const success = await login(email, password);
    if (success) {
      // Reset to dashboard after successful login
      setActiveView('dashboard');
    }
    return success;
  };

  const handleLogout = () => {
    logout();
    setActiveView('dashboard');
  };

  // Show login screen if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Login theme={theme} onLogin={handleLogin} />;
  }

  // Render functions for each view
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard
            roadmaps={roadmaps}
            theme={theme}
            onCreateNew={handleCreateNew}
            onSelectRoadmap={handleSelectRoadmap}
            onDeleteRoadmap={(id) => setConfirmDelete(id)}
          />
        );

      case 'create':
        return (
          <CreateRoadmap
            loading={roadmapLoading}
            theme={theme}
            appLanguage={appLanguage}
            onLanguageChange={setAppLanguage}
            onSubmit={handleCreateRoadmap}
          />
        );

      case 'roadmap':
        const selectedRoadmap = selectedRoadmapId ? roadmaps[selectedRoadmapId] : null;
        if (!selectedRoadmap) {
          return <div className="text-center py-12">Roadmap not found</div>;
        }

        return (
          <Roadmap
            roadmap={selectedRoadmap}
            theme={theme}
            onDelete={() => setConfirmDelete(selectedRoadmapId!)}
            onTaskToggle={handleTaskToggle}
            onArticleClick={handleArticleClick}
            onGenerateArticle={handleGenerateArticle}
            genId={genId}
            loading={articleLoading}
          />
        );

      case 'article':
        const selectedArticle = selectedArticleId ? articles[selectedArticleId] : null;
        if (!selectedArticle) {
          return <div className="text-center py-12">Article not found</div>;
        }

        return (
          <ArticleView
            article={selectedArticle}
            theme={theme}
            onBackToRoadmap={handleBackToRoadmap}
            onOpenExternalResource={handleOpenExternalResource}
          />
        );

      default:
        return <div>Unknown view</div>;
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 flex selection:bg-indigo-500/30 ${
      theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-[#F8FAFC] text-[#0F172A]'
    }`}>
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        appLanguage={appLanguage}
        currentUserEmail={currentUserEmail}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 ml-28 lg:ml-80 mr-6 py-6 overflow-y-auto">
        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
            <div className={`p-8 rounded-[2rem] border max-w-sm w-full animate-in zoom-in-95 duration-200 ${
              theme === 'dark' ? 'bg-[#111111] border-[#222222]' : 'bg-white border-[#E2E8F0] shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
            }`}>
              <h3 className="text-xl font-black mb-2">Discard Roadmap?</h3>
              <p className={`text-sm mb-8 font-medium ${
                theme === 'dark' ? 'text-slate-400' : 'text-[#475569]'
              }`}>
                This action will erase all progress for "{roadmaps[confirmDelete]?.title}".
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className={`flex-1 py-3 rounded-xl font-black text-sm transition-colors ${
                    theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteRoadmap(confirmDelete)}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black text-sm hover:bg-red-600 transition-colors"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {(roadmapError || articleError) && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-500 text-sm">
              {roadmapError || articleError}
            </p>
          </div>
        )}

        {/* Render Current View */}
        {renderView()}
      </main>

      {/* Global Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { 
          background: ${theme === 'dark' ? '#222' : '#E2E8F0'}; 
          border-radius: 20px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        
        input::placeholder { color: ${theme === 'dark' ? '#444' : '#CBD5E1'}; }
      `}} />
    </div>
  );
}
