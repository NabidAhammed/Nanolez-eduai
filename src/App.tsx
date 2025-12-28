import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Calendar, CheckCircle2, ChevronRight, Layout, 
  Map, Plus, Loader2, Sparkles, Zap, Globe, Trash2, 
  Languages, Moon, Sun, ExternalLink, GraduationCap, ArrowRight,
  Command, Compass, Layers, Star
} from 'lucide-react';
import { generateRoadmap, generateArticle } from './utils/api';

const SUPPORTED_LANGUAGES = ["English", "Spanish", "French", "German", "Hindi", "Bengali", "Japanese", "Chinese", "Arabic", "Portuguese"];

/**
 * Using centralized API utilities from utils/api.ts
 * This ensures consistency across all API calls
 */

// ============================================================================
// APP COMPONENT
// ============================================================================

export default function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'create' | 'roadmap' | 'article'>('dashboard');
  const [roadmaps, setRoadmaps] = useState<Record<string, any>>({});
  const [articles, setArticles] = useState<Record<string, any>>({});
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [genId, setGenId] = useState<string | null>(null);
  const [appLanguage, setAppLanguage] = useState("English");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [userId] = useState(() => {
    const saved = localStorage.getItem('nano-user-id');
    if (saved) return saved;
    const newId = crypto.randomUUID();
    localStorage.setItem('nano-user-id', newId);
    return newId;
  });

  // Function to normalize roadmap data and ensure all tasks have proper structure
  const normalizeRoadmap = (roadmap: any) => {
    if (!roadmap.months) return roadmap;
    
    return {
      ...roadmap,
      months: roadmap.months.map((month: any) => ({
        ...month,
        weeks: month.weeks.map((week: any) => ({
          ...week,
          days: week.days.map((day: any) => ({
            ...day,
            completed: day.completed || false, // Ensure completed is boolean
            articleId: day.articleId || null   // Ensure articleId exists
          }))
        }))
      }))
    };
  };

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('nano-theme');
    if (savedTheme) setTheme(savedTheme as 'light' | 'dark');

    const savedLanguage = localStorage.getItem('nano-language');
    if (savedLanguage) setAppLanguage(savedLanguage);

    const savedRoadmaps = localStorage.getItem('nano-roadmaps');
    if (savedRoadmaps) {
      try {
        const parsedRoadmaps = JSON.parse(savedRoadmaps);
        // Normalize all loaded roadmaps to ensure proper structure
        const normalizedRoadmaps: Record<string, any> = {};
        Object.keys(parsedRoadmaps).forEach(id => {
          normalizedRoadmaps[id] = normalizeRoadmap(parsedRoadmaps[id]);
        });
        setRoadmaps(normalizedRoadmaps);
      } catch (e) {
        console.error('Failed to parse saved roadmaps:', e);
      }
    }

    const savedArticles = localStorage.getItem('nano-articles');
    if (savedArticles) {
      try {
        setArticles(JSON.parse(savedArticles));
      } catch (e) {
        console.error('Failed to parse saved articles:', e);
      }
    }

    const savedSelectedRoadmapId = localStorage.getItem('nano-selected-roadmap-id');
    if (savedSelectedRoadmapId) setSelectedRoadmapId(savedSelectedRoadmapId);

    const savedSelectedArticleId = localStorage.getItem('nano-selected-article-id');
    if (savedSelectedArticleId) setSelectedArticleId(savedSelectedArticleId);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('nano-theme', next);
  };

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('nano-roadmaps', JSON.stringify(roadmaps));
  }, [roadmaps]);

  useEffect(() => {
    localStorage.setItem('nano-articles', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    if (selectedRoadmapId) {
      localStorage.setItem('nano-selected-roadmap-id', selectedRoadmapId);
    } else {
      localStorage.removeItem('nano-selected-roadmap-id');
    }
  }, [selectedRoadmapId]);

  useEffect(() => {
    if (selectedArticleId) {
      localStorage.setItem('nano-selected-article-id', selectedArticleId);
    } else {
      localStorage.removeItem('nano-selected-article-id');
    }
  }, [selectedArticleId]);

  useEffect(() => {
    localStorage.setItem('nano-language', appLanguage);
  }, [appLanguage]);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const data = await generateRoadmap(fd.get('goal') as string, fd.get('duration') as string, fd.get('level') as string, appLanguage, userId);
      const id = crypto.randomUUID();
      
      // Initialize task completion states and add articleId placeholders
      const initializedData = {
        ...data,
        id,
        progress: 0,
        goal: fd.get('goal'),
        language: appLanguage,
        months: data.months.map((month: any) => ({
          ...month,
          weeks: month.weeks.map((week: any) => ({
            ...week,
            days: week.days.map((day: any) => ({
              ...day,
              completed: false, // Initialize as not completed
              articleId: null // Initialize with no article
            }))
          }))
        }))
      };
      
      setRoadmaps(prev => ({ ...prev, [id]: initializedData }));
      setSelectedRoadmapId(id);
      setActiveView('roadmap');
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const deleteRoadmap = (id: string) => {
    setRoadmaps(prev => { const n = { ...prev }; delete n[id]; return n; });
    if (selectedRoadmapId === id) setActiveView('dashboard');
    setConfirmDelete(null);
  };

  const handleGenArticle = async (m: number, w: number, d: number, topic: string) => {
    setGenId(`${m}-${w}-${d}`);
    try {
      const data = await generateArticle(topic, roadmaps[selectedRoadmapId!].language, userId);
      const id = crypto.randomUUID();
      setArticles(prev => ({ ...prev, [id]: { ...data, id } }));
      setRoadmaps(prev => {
        const rm = { ...prev[selectedRoadmapId!] };
        rm.months[m].weeks[w].days[d].articleId = id;
        return { ...prev, [selectedRoadmapId!]: rm };
      });
      setSelectedArticleId(id);
      setActiveView('article');
    } catch (err) { console.error(err); }
    setGenId(null);
  };

  const toggleTask = (m: number, w: number, d: number) => {
    setRoadmaps(prev => {
      const rm = { ...prev[selectedRoadmapId!] };
      rm.months[m].weeks[w].days[d].completed = !rm.months[m].weeks[w].days[d].completed;
      let t = 0, c = 0;
      rm.months.forEach((mo: any) => mo.weeks.forEach((we: any) => we.days.forEach((da: any) => { t++; if (da.completed) c++; })));
      rm.progress = Math.round((c / t) * 100);
      return { ...prev, [selectedRoadmapId!]: rm };
    });
  };

  // UI Constants
  const isDark = theme === 'dark';
  const mainBg = isDark ? 'bg-[#050505]' : 'bg-[#F8FAFC]';
  const cardBg = isDark ? 'bg-[#111111] border-[#222222]' : 'bg-white border-[#E2E8F0] shadow-[0_8px_30px_rgb(0,0,0,0.04)]';
  const accentGradient = 'from-[#6366F1] to-[#A855F7]';
  const headingColor = isDark ? 'text-white' : 'text-[#0F172A]';
  const bodyColor = isDark ? 'text-slate-400' : 'text-[#475569]';

  return (
    <div className={`min-h-screen ${mainBg} ${headingColor} transition-all duration-500 flex selection:bg-indigo-500/30`}>
      {/* Sidebar Island */}
      <aside className={`fixed left-6 top-6 bottom-6 w-20 lg:w-64 rounded-[2.5rem] ${isDark ? 'bg-[#0A0A0A] border-[#1A1A1A]' : 'bg-white border-slate-200 shadow-xl'} border z-50 transition-all duration-300 flex flex-col items-center py-8`}>
        <div className="mb-12 group cursor-pointer" onClick={() => setActiveView('dashboard')}>
          <div className={`w-12 h-12 rounded-2xl  flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform`}>
          <img src="/favicon.svg" className="w-15 h-15 ml-1" />
          </div>
        </div>

        <nav className="flex-1 space-y-6 w-full px-4">
          <button onClick={() => setActiveView('dashboard')} className={`w-full p-3 lg:px-4 lg:py-3 rounded-2xl flex items-center justify-center lg:justify-start gap-3 transition-all ${activeView === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : bodyColor + ' hover:bg-slate-100 dark:hover:bg-white/5'}`}>
            <Layout className="w-5 h-5" /> <span className="hidden lg:block font-bold text-sm">Dashboard</span>
          </button>
          <button onClick={() => setActiveView('create')} className={`w-full p-3 lg:px-4 lg:py-3 rounded-2xl flex items-center justify-center lg:justify-start gap-3 transition-all ${activeView === 'create' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : bodyColor + ' hover:bg-slate-100 dark:hover:bg-white/5'}`}>
            <Plus className="w-5 h-5" /> <span className="hidden lg:block font-bold text-sm">New Path</span>
          </button>
          <div className="h-px bg-slate-200 dark:bg-white/5 mx-2" />
          <div className="hidden lg:block px-4 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Settings</div>
          <button onClick={toggleTheme} className={`w-full p-3 lg:px-4 lg:py-3 rounded-2xl flex items-center justify-center lg:justify-start gap-3 transition-all ${bodyColor} hover:bg-slate-100 dark:hover:bg-white/5`}>
            {isDark ? <Sun className="w-5 h-5 text-orange-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            <span className="hidden lg:block font-bold text-sm">{isDark ? 'Day Mode' : 'Night Mode'}</span>
          </button>
        </nav>

        <div className="mt-auto px-4 w-full">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex flex-col items-center gap-1">
             <Globe className="w-4 h-4 text-indigo-500" />
             <span className="hidden lg:block text-[9px] font-black text-indigo-500 uppercase">{appLanguage}</span>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 ml-28 lg:ml-80 mr-6 py-6 overflow-y-auto">
        
        {confirmDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
            <div className={`p-8 rounded-[2rem] border max-w-sm w-full animate-in zoom-in-95 duration-200 ${cardBg}`}>
              <h3 className="text-xl font-black mb-2">Discard Roadmap?</h3>
              <p className={`${bodyColor} text-sm mb-8 font-medium`}>This action will erase all progress for "{roadmaps[confirmDelete]?.title}".</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className={`flex-1 py-3 rounded-xl font-black text-sm transition-colors ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>Cancel</button>
                <button onClick={() => deleteRoadmap(confirmDelete)} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black text-sm hover:bg-red-600 transition-colors">Discard</button>
              </div>
            </div>
          </div>
        )}

        {activeView === 'dashboard' && (
          <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-12">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2 block">Personal Portal</span>
              <h1 className="text-5xl lg:text-7xl font-black tracking-tighter mb-4 leading-none space-x-1">NANOLEZ <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-fuchsia-500">EDU AI</span></h1>
              <p className={`${bodyColor} text-lg font-medium max-w-xl`}>Select an existing path or architect a new learning trajectory with neural guidance.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Special Create Card */}
              <div onClick={() => setActiveView('create')} className={`p-8 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center text-center h-[280px] cursor-pointer transition-all hover:border-indigo-500 hover:bg-indigo-500/5 group ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black mb-1">Architect New Goal</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">7-Day Systematic Cycle</p>
              </div>

              {Object.values(roadmaps).map(r => (
                <div key={r.id} onClick={() => { setSelectedRoadmapId(r.id); setActiveView('roadmap'); }} className={`group p-8 rounded-[2.5rem] border flex flex-col justify-between h-[280px] cursor-pointer transition-all hover:translate-y-[-4px] relative overflow-hidden ${cardBg}`}>
                  <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors" />
                  <div className="flex justify-between items-start relative z-10">
                    <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase border ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>{r.language}</div>
                    <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(r.id); }} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black tracking-tight leading-tight group-hover:text-indigo-500 transition-colors">{r.title}</h3>
                    <div className="mt-6">
                      <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest">
                        <span>Mastery Level</span>
                        <span className="text-indigo-500">{r.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 transition-all duration-1000 ease-out" style={{width: `${r.progress}%`}} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'create' && (
          <div className="max-w-3xl mx-auto py-12 animate-in zoom-in-95 duration-500">
             <div className="text-center mb-12">
                <h2 className="text-4xl lg:text-5xl font-black tracking-tighter mb-4">Neural Architecture</h2>
                <p className={`${bodyColor} font-medium`}>Define your objective and let the AI generate a rigorous 7-day-per-week curriculum.</p>
             </div>
             
             <form onSubmit={handleCreate} className={`p-10 lg:p-12 rounded-[3.5rem] border ${cardBg}`}>
                <div className="grid gap-8">
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 flex items-center gap-2">
                      <Command className="w-4 h-4" /> Global Objective
                    </label>
                    <input required name="goal" placeholder="e.g. Mastering Modern UI Design & Prototyping" className={`w-full p-6 rounded-3xl text-lg font-bold border-2 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all ${isDark ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-100'}`} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">Timeline</label>
                      <select name="duration" className={`w-full p-6 rounded-3xl font-bold border-2 outline-none appearance-none ${isDark ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                        <option>1 Month</option><option>3 Months</option><option>6 Months</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">Difficulty</label>
                      <select name="level" className={`w-full p-6 rounded-3xl font-bold border-2 outline-none appearance-none ${isDark ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                        <option>Beginner</option><option>Intermediate</option><option>Expert</option>
                      </select>
                    </div>
                  </div>

                  <div className={`p-6 rounded-3xl border flex items-center justify-between ${isDark ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500 rounded-lg text-white"><Globe className="w-4 h-4" /></div>
                      <span className="text-sm font-black tracking-tight">System Language</span>
                    </div>
                    <select value={appLanguage} onChange={(e) => setAppLanguage(e.target.value)} className="bg-transparent font-black text-indigo-600 outline-none cursor-pointer">
                      {SUPPORTED_LANGUAGES.map(l => <option key={l} value={l} className="bg-white text-black">{l}</option>)}
                    </select>
                  </div>

                  <button disabled={loading} className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <><Sparkles className="w-5 h-5" /> Generate Trajectory</>}
                  </button>
                </div>
             </form>
          </div>
        )}

        {activeView === 'roadmap' && selectedRoadmapId && roadmaps[selectedRoadmapId] && (
          <div className="max-w-6xl animate-in fade-in duration-500">
            <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{roadmaps[selectedRoadmapId].level}</div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isDark ? 'border-white/10' : 'border-slate-200'}`}>{roadmaps[selectedRoadmapId].duration}</div>
                </div>
                <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] mb-6">{roadmaps[selectedRoadmapId].title}</h1>
                <p className={`${bodyColor} text-lg font-medium`}>A rigorous 7-day systematic cycle tailored to {roadmaps[selectedRoadmapId].goal}.</p>
              </div>
              <button onClick={() => setConfirmDelete(selectedRoadmapId)} className="group flex items-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                <Trash2 className="w-4 h-4" /> Discard
              </button>
            </header>

            <div className="space-y-24">
              {roadmaps[selectedRoadmapId].months.map((m: any, mIdx: number) => (
                <div key={mIdx} className="relative">
                  <div className="sticky top-6 z-10 mb-8">
                    <div className={`inline-flex items-center gap-4 p-2 rounded-2xl border ${cardBg}`}>
                      <div className="bg-indigo-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl">{mIdx + 1}</div>
                      <div className="pr-6">
                        <h3 className="text-lg font-black leading-none mb-1 uppercase tracking-tighter">{m.name}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Core Phase Objectives</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-12 ml-6 lg:ml-8 border-l-2 border-slate-200 dark:border-white/5 pl-8 lg:pl-12">
                    {m.weeks.map((w: any, wIdx: number) => (
                      <div key={wIdx}>
                        <div className="flex items-center gap-4 mb-8">
                           <div className="w-3 h-3 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)] -ml-[41px] lg:-ml-[57px] ring-4 ring-white" />
                           <h4 className="text-xl font-black tracking-tight">{w.name} <span className="text-slate-400 mx-2">—</span> <span className="text-indigo-500">{w.weeklyGoal}</span></h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                          {w.days.map((d: any, dIdx: number) => (
                            <div key={dIdx} className={`p-6 rounded-[2rem] border transition-all flex flex-col justify-between group ${d.completed ? 'bg-indigo-600 text-white border-indigo-600' : cardBg + ' hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10'}`}>
                              <div>
                                <div className="flex justify-between items-start mb-4">
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${d.completed ? 'text-indigo-200' : 'text-slate-400'}`}>Day {d.day}</span>
                                  <button onClick={() => toggleTask(mIdx, wIdx, dIdx)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${d.completed ? 'bg-white text-indigo-600 border-white' : 'border-slate-200 dark:border-white/10 hover:border-indigo-500'}`}>
                                    <CheckCircle2 className="w-5 h-5" />
                                  </button>
                                </div>
                                <h5 className="font-black text-lg mb-2 leading-tight tracking-tight group-hover:text-indigo-500 transition-colors group-data-[completed=true]:text-white">
                                  {d.topic}
                                </h5>
                                <p className={`text-[11px] font-medium leading-relaxed mb-8 ${d.completed ? 'text-indigo-100/70' : 'text-slate-500'}`}>
                                  {d.task}
                                </p>
                              </div>
                              
                              {d.articleId ? (
                                <button onClick={() => { setSelectedArticleId(d.articleId); setActiveView('article'); }} className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${d.completed ? 'bg-white/20 text-white' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'}`}>
                                  <BookOpen className="w-3.5 h-3.5" /> Study
                                </button>
                              ) : (
                                <button disabled={genId === `${mIdx}-${wIdx}-${dIdx}`} onClick={() => handleGenArticle(mIdx, wIdx, dIdx, d.topic)} className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${d.completed ? 'bg-white/20 text-white' : isDark ? 'bg-white/5 border border-white/10 hover:border-indigo-500' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                                  {genId === `${mIdx}-${wIdx}-${dIdx}` ? <Loader2 className="animate-spin w-4 h-4" /> : <><Sparkles className="w-3.5 h-3.5" /> Core Lesson</>}
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
        )}

        {activeView === 'article' && selectedArticleId && articles[selectedArticleId] && (
          <div className="max-w-3xl mx-auto py-12 animate-in slide-in-from-bottom-8 duration-700">
            <button onClick={() => setActiveView('roadmap')} className="flex items-center gap-3 text-indigo-500 font-black text-xs uppercase tracking-[0.2em] mb-12 hover:translate-x-[-4px] transition-transform">
              <ChevronRight className="rotate-180 w-5 h-5" /> Back to Trajectory
            </button>
            
            <header className="mb-16">
              <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-10">{articles[selectedArticleId].title}</h1>
              <div className={`p-10 rounded-[2.5rem] text-xl font-bold leading-relaxed border-l-[12px] border-indigo-600 ${isDark ? 'bg-white/5 text-slate-300 border-white/10' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                {articles[selectedArticleId].summary}
              </div>
            </header>

            <div className="space-y-16 mb-24">
              {articles[selectedArticleId].sections.map((s: any, i: number) => (
                <section key={i}>
                  <div className="flex items-center gap-4 mb-8">
                    <span className="text-4xl font-black text-indigo-600/30">0{i+1}</span>
                    <h2 className="text-3xl font-black tracking-tight">{s.heading}</h2>
                  </div>
                  <div className={`text-xl leading-[1.8] font-medium whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-[#334155]'}`}>
                    {s.content}
                  </div>
                </section>
              ))}
            </div>

            {articles[selectedArticleId].externalResource && (
              <div className={`p-10 rounded-[3rem] border-2 flex flex-col md:flex-row items-center justify-between gap-10 group ${isDark ? 'bg-indigo-600/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-500 mb-2 font-black text-[10px] uppercase tracking-widest"><Globe className="w-4 h-4" /> Academic Resource</div>
                  <h3 className="text-3xl font-black tracking-tight group-hover:text-indigo-600 transition-colors">{articles[selectedArticleId].externalResource?.title || 'External Resource'}</h3>
                </div>
                <button 
                  onClick={() => {
                    console.log('Article data:', articles[selectedArticleId]);
                    console.log('External resource:', articles[selectedArticleId].externalResource);
                    
                    const externalResource = articles[selectedArticleId].externalResource;
                    // Check URL field first (as per groq function specification), then fallbacks
                    let url = externalResource?.url || externalResource?.uri || externalResource?.link || externalResource?.href || externalResource?.source;
                    
                    if (url && url.trim()) {
                      try {
                        // Ensure URL has protocol
                        let formattedUrl = url.trim();
                        if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
                          formattedUrl = 'https://' + formattedUrl;
                        }
                        console.log('Opening URL:', formattedUrl);
                        window.open(formattedUrl, '_blank', 'noopener,noreferrer');
                      } catch (error) {
                        console.error('Error opening external resource:', error);
                        alert('Unable to open the external resource. Please try copying the URL manually: ' + url);
                      }
                    } else {
                      alert('External resource URL is not available or empty.\n\nDebug Info:\n' + JSON.stringify(externalResource, null, 2) + '\n\nAvailable fields: ' + Object.keys(externalResource || {}).join(', '));
                    }
                  }}
                  className="w-full md:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Explore <ExternalLink className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {(!articles[selectedArticleId].externalResource || !articles[selectedArticleId].externalResource?.title) && (
              <div className={`p-10 rounded-[3rem] border-2 flex flex-col items-center justify-center text-center gap-4 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <Globe className="w-8 h-8 text-slate-400" />
                <div>
                  <h3 className="text-xl font-black text-slate-500 mb-2">No External Resource</h3>
                  <p className="text-sm text-slate-400">This article doesn't include an external academic resource.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Global CSS Overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { 
          background: ${isDark ? '#222' : '#E2E8F0'}; 
          border-radius: 20px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        
        input::placeholder { color: ${isDark ? '#444' : '#CBD5E1'}; }
      `}} />
    </div>
  );
}