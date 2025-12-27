import React, { useState, useEffect, useRef } from 'react';
/**import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInAnonymously,
  signOut,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  collection, 
  updateDoc, 
  deleteDoc
} from 'firebase/firestore';

**/
import { 
  Target, 
  CheckCircle2, 
  Circle, 
  Loader2, 
  Sparkles,
  LogOut,
  Newspaper,
  X,
  Lightbulb,
  CheckCircle,
  Hammer,
  ExternalLink,
  GraduationCap,
  Zap,
  Youtube,
  AlertTriangle,
  History,
  Trash2,
  Plus,
  Trophy,
  Download,
  PlayCircle,
  Layout,
  Languages,
  BookOpen,
  ArrowRight
} from 'lucide-react';
/**
// --- Firebase Configuration ---
const firebaseConfig =  {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
**/
const LANGUAGES = ["English", "Spanish", "Hindi", "French", "German", "Bengali", "Portuguese", "Japanese", "Chinese", "Arabic"];

const formatLessonText = (text) => {
  if (!text) return null;
  return text.split('\n\n').map((paragraph, i) => {
    if (paragraph.startsWith('#')) {
      return <h4 key={i} className="text-sm font-black text-slate-800 mt-4 mb-2 border-l-3 border-indigo-500 pl-2 uppercase tracking-tight">{paragraph.replace(/[#*]/g, '')}</h4>;
    }
    if (paragraph.includes('\n- ') || paragraph.includes('\n* ')) {
      const items = paragraph.split(/\n[-*] /).filter(item => item.trim());
      return (
        <ul key={i} className="space-y-1.5 my-3">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2 text-slate-600 text-[11px] font-medium leading-relaxed">
              <span className="text-indigo-500 font-bold">•</span>
              {item.trim()}
            </li>
          ))}
        </ul>
      );
    }
    return <p key={i} className="mb-3 leading-relaxed text-slate-600 text-[11px] font-medium">{paragraph.replace(/\*\*/g, '')}</p>;
  });
};

const cleanText = (text) => text?.replace(/[*#_~`]/g, '').trim() || "";

const App = () => {
  const [user, setUser] = useState(null);
const [nameInput, setNameInput] = useState("");
  const [roadmaps, setRoadmaps] = useState([]);
  const [activeRoadmapId, setActiveRoadmapId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const LOCAL_USER_KEY = "nano_user";
  const LOCAL_ROADMAPS_KEY = "nano_roadmaps";

//creating user for the login screen

const createLocalUser = (name) => {
  const user = {
    uid: crypto.randomUUID(),
    name: name.trim(),
    createdAt: Date.now()
  };
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
  return user;
};

const getLocalUser = () => {
  return JSON.parse(localStorage.getItem(LOCAL_USER_KEY));
};


  // Modals
  const [articleModal, setArticleModal] = useState({ isOpen: false, data: null, title: '', isLoading: false });
  const [isArticleLoading, setIsArticleLoading] = useState(false);
  const [quizModal, setQuizModal] = useState({ isOpen: false, questions: [], isLoading: false, score: null, userAnswers: {}, totalPoints: 10, type: 'weekly', weekName: '' });
  const [certModal, setCertModal] = useState({ isOpen: false, roadmap: null });

  const [formData, setFormData] = useState({ goal: '', dailyTime: '2', duration: '3', articleLanguage: "English" });

  const fetchGemini = async (payload, systemPrompt) => {
  let lastErr;

  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch("/.netlify/functions/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload, systemPrompt })
      });

      if (response.ok) {
        return await response.json();
      }

      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr || new Error("AI request failed");
};

useEffect(() => {
  const existingUser = getLocalUser();
  if (existingUser) setUser(existingUser);
}, []);

useEffect(() => {
  const user = getLocalUser();
  setUser(user);
  setIsAuthLoading(false);
}, []);

useEffect(() => {
  if (!user) return;

  const data = JSON.parse(localStorage.getItem(LOCAL_ROADMAPS_KEY)) || [];
  const userRoadmaps = data
    .filter(r => r.userId === user.uid)
    .sort((a, b) => b.createdAt - a.createdAt);

  setRoadmaps(userRoadmaps);
  if (userRoadmaps.length && !activeRoadmapId) {
    setActiveRoadmapId(userRoadmaps[0].id);
  }
}, [user]);


  const activeRoadmap = roadmaps.find(r => r.id === activeRoadmapId);

const generateRoadmap = async () => {
  if (!formData.goal || isGenerating || !user) return;

  setIsGenerating(true);

  try {


    const prompt = `Goal: ${formData.goal}, Duration: ${formData.duration} months. Daily time: ${formData.dailyTime}h.`;

const system = `JSON only: {
  "title": "...",
  "months": [
    {
      "name": "...",
      "weeks": [
        {
          "name": "...",
          "days": [
            { "day": 1, "task": "...", "topic": "..." }
          ],
          "weeklyProject": "..."
        }
      ]
    }
  ]
}`;

    const result = await fetchGemini(prompt, system);
    const data = JSON.parse(result.candidates[0].content.parts[0].text);

    const newRoadmap = {
      ...data,
      id: crypto.randomUUID(),
      userId: user.uid,
      goal: formData.goal,
      articleLanguage: formData.articleLanguage,
      createdAt: Date.now(),
      progress: {},
      scores: {}
    };

    const all = JSON.parse(localStorage.getItem(LOCAL_ROADMAPS_KEY)) || [];
    localStorage.setItem(
      LOCAL_ROADMAPS_KEY,
      JSON.stringify([newRoadmap, ...all])
    );

    setRoadmaps(prev => [newRoadmap, ...prev]);
    setActiveRoadmapId(newRoadmap.id);
    setFormData({ ...formData, goal: '' });

  } catch {
    setError("Generation failed.");
  } finally {
    setIsGenerating(false);
  }
};


  const fetchAIArticle = async (dayData) => {

    if (isArticleLoading) return; // 🚫 prevents spam
  setIsArticleLoading(true);

  try {
    const res = await fetch("/.netlify/functions/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: day.task })
    });

    if (!res.ok) throw new Error("Rate limited");

    const data = await res.json();
    setArticleModal({ isOpen: true, data });

  } catch (err) {
    setError("Please wait a moment before requesting again.");
  } finally {
    setIsArticleLoading(false);
  }
    setArticleModal({ isOpen: true, data: null, title: dayData.topic, isLoading: true });
    const payload = `Topic: ${dayData.topic}. Goal: ${activeRoadmap.goal}. Language: ${activeRoadmap.articleLanguage}.`;
    const system = `Create a structured educational lesson. Use markdown-like formatting with headers (starting with #) and bullet points. JSON only: { "content": "Detailed lesson with # Headers and - Bullet points...", "project": "Specific mini-project title/desc", "videoSearch": "specific search query", "keyPoints": ["..."] }`;
    try {
      const result = await fetchGemini(payload, system);
      const data = JSON.parse(result.candidates[0].content.parts[0].text);
      setArticleModal(prev => ({ ...prev, data, isLoading: false }));
    } catch (err) { setError("Lesson failed"); setArticleModal(p => ({ ...p, isOpen: false })); }
  };

  const startQuiz = async (type, weekName = '') => {
    const qCount = type === 'final' ? 20 : 10;
    setQuizModal({ isOpen: true, questions: [], isLoading: true, score: null, userAnswers: {}, totalPoints: qCount, type, weekName });
    const prompt = `Create a ${qCount} question quiz for: ${activeRoadmap.goal}. Topic: ${weekName || 'Final Exam'}. Language: ${activeRoadmap.articleLanguage}.`;
    const system = `JSON: { "quiz": [{ "question": "...", "options": ["...", "...", "...", "..."], "correctIndex": 0, "explanation": "..." }] }`;
    try {
      const result = await fetchGemini(prompt, system);
      const data = JSON.parse(result.candidates[0].content.parts[0].text);
      setQuizModal(p => ({ ...p, questions: data.quiz, isLoading: false }));
    } catch (err) { setError("Quiz generation failed"); setQuizModal(p => ({ ...p, isOpen: false })); }
  };

 const submitQuiz = () => {
  let earned = 0;

  quizModal.questions.forEach((q, i) => {
    if (quizModal.userAnswers[i] === q.correctIndex) earned++;
  });

  const scoreKey =
    quizModal.type === 'final' ? 'final' : quizModal.weekName;

  setRoadmaps(prev => {
    const updated = prev.map(r => {
      if (r.id !== activeRoadmapId) return r;

      return {
        ...r,
        scores: {
          ...(r.scores || {}),
          [scoreKey]: earned
        }
      };
    });

    // 🔒 persist to localStorage
    localStorage.setItem(
      "nano_roadmaps",
      JSON.stringify(updated)
    );

    return updated;
  });

  setQuizModal(p => ({ ...p, score: earned }));
};

 const toggleTask = (roadmapId, key) => {
  setRoadmaps(prev => {
    const updated = prev.map(r => {
      if (r.id !== roadmapId) return r;
      return {
        ...r,
        progress: {
          ...r.progress,
          [key]: !r.progress?.[key]
        }
      };
    });

    localStorage.setItem(LOCAL_ROADMAPS_KEY, JSON.stringify(updated));
    return updated;
  });
};


  const getProgress = (r) => {
    if (!r) return 0;
    let t = 0, d = 0;
    r.months?.forEach(m => m.weeks?.forEach(w => {
      w.days?.forEach(day => { t++; if (r.progress?.[`${m.name}-${w.name}-day-${day.day}`]) d++; });
      if (w.weeklyProject) { t++; if (r.progress?.[`${m.name}-${w.name}-project`]) d++; }
    }));
    return t > 0 ? Math.round((d / t) * 100) : 0;
  };

 const deleteRoadmap = (id, e) => {
  e.stopPropagation();
  if (!confirm("Delete this roadmap?")) return;

  setRoadmaps(prev => {
    const updated = prev.filter(r => r.id !== id);
    localStorage.setItem(LOCAL_ROADMAPS_KEY, JSON.stringify(updated));
    return updated;
  });

  if (activeRoadmapId === id) setActiveRoadmapId(null);
};

  if (isAuthLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-indigo-600 w-6 h-6" /></div>;

  return (
    <div className="min-h-screen bg-[#FDFDFE] text-slate-900 pb-12 font-sans selection:bg-indigo-100 antialiased">
      {error && (
        <div className="fixed top-4 right-4 z-[100] bg-red-600 text-white px-3 py-2 rounded-lg shadow-xl flex items-center gap-2 border border-red-500 animate-in slide-in-from-right-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          <p className="text-[10px] font-black uppercase">{error}</p>
          <button onClick={() => setError(null)}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* ARTICLE MODAL */}
      {articleModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
            <div className="px-5 py-3 border-b flex justify-between items-center bg-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-800 text-[11px] uppercase truncate max-w-md tracking-tight">{cleanText(articleModal.title)}</h3>
              </div>
              <button onClick={() => setArticleModal({ ...articleModal, isOpen: false })} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-slate-50/20 p-6">
              {articleModal.isLoading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <div className="w-8 h-8 border-2 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Generating Curriculum...</p>
                </div>
              ) : articleModal.data && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-4xl mx-auto">
                   <div className="lg:col-span-8 space-y-5">
                      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                         {formatLessonText(articleModal.data.content)}
                      </div>
                      
                      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                         <h4 className="text-[10px] font-black text-indigo-600 mb-3 uppercase tracking-widest flex items-center gap-2">
                           <Lightbulb className="w-3.5 h-3.5" /> Core Takeaways
                         </h4>
                         <div className="space-y-2">
                            {articleModal.data.keyPoints?.map((p, i) => (
                              <div key={i} className="flex gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100 items-start">
                                <CheckCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                                <span className="text-[10.5px] font-bold text-slate-600 leading-snug">{p}</span>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="lg:col-span-4 space-y-5">
                      <div className="bg-slate-900 p-5 rounded-xl text-white shadow-xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform">
                            <Hammer className="w-12 h-12" />
                         </div>
                         <h4 className="text-[9px] font-black text-indigo-400 mb-3 uppercase tracking-widest flex items-center gap-1.5"><Hammer className="w-3.5 h-3.5" /> Practical Task</h4>
                         <p className="text-white font-bold text-[11px] leading-relaxed mb-5">{articleModal.data.project}</p>
                         <button className="w-full bg-white text-slate-900 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors">Complete Lab</button>
                      </div>

                      <div className="bg-white p-5 rounded-xl border border-slate-200">
                         <h4 className="text-[9px] font-black text-slate-400 mb-3 uppercase tracking-widest flex items-center gap-1.5"><PlayCircle className="w-3.5 h-3.5" /> Learning Lab</h4>
                         <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(articleModal.data.videoSearch || articleModal.title)}`} target="_blank" className="flex items-center justify-between p-3 bg-rose-50/50 rounded-lg hover:bg-rose-50 transition-all border border-rose-100 group">
                            <div className="flex items-center gap-2">
                              <Youtube className="w-4 h-4 text-rose-600" />
                              <span className="text-[10px] font-black text-slate-700">Watch Tutorials</span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                         </a>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QUIZ MODAL */}
      {quizModal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-slate-200">
            <div className="px-5 py-3 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-500" />
                <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-wider">{quizModal.type === 'final' ? 'Certification Exam' : 'Weekly Knowledge Check'}</h3>
              </div>
              <button onClick={() => setQuizModal({ ...quizModal, isOpen: false })} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/30">
              {quizModal.isLoading ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <div className="w-8 h-8 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Generating Questions...</p>
                </div>
              ) : (
                <>
                  {quizModal.questions.map((q, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                      <p className="text-[11px] font-black text-slate-800 leading-snug">{idx + 1}. {q.question}</p>
                      <div className="grid grid-cols-1 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <button key={oIdx} 
                            onClick={() => quizModal.score === null && setQuizModal(p => ({ ...p, userAnswers: { ...p.userAnswers, [idx]: oIdx } }))}
                            className={`p-2.5 rounded-lg text-left text-[10px] font-bold transition-all border ${quizModal.userAnswers[idx] === oIdx ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'bg-slate-50 border-transparent hover:border-slate-200 text-slate-600'}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                      {quizModal.score !== null && (
                        <div className={`p-3 rounded-lg text-[9px] font-bold ${quizModal.userAnswers[idx] === q.correctIndex ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                           <p className="uppercase font-black tracking-widest mb-1">{quizModal.userAnswers[idx] === q.correctIndex ? 'Correct' : 'Incorrect'}</p>
                           <p className="opacity-90 leading-tight font-medium">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {quizModal.score === null ? (
                    <button onClick={submitQuiz} disabled={Object.keys(quizModal.userAnswers).length < quizModal.totalPoints} className="w-full py-3 bg-slate-900 text-white rounded-lg font-black text-[11px] uppercase tracking-widest shadow-lg disabled:opacity-50 transition-all">Submit Answers</button>
                  ) : (
                    <div className="text-center p-6 bg-white rounded-xl border-2 border-indigo-50">
                       <h4 className="text-2xl font-black text-indigo-600 mb-1">{quizModal.score} / {quizModal.totalPoints}</h4>
                       <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-4">Final Grade</p>
                       <button onClick={() => setQuizModal({ ...quizModal, isOpen: false })} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md">Continue</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD */}
      {!user ? (
         <div className="min-h-screen flex items-center justify-center bg-white p-6">
    <div className="max-w-xs w-full text-center">

      <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl">
       <img src="favicon.svg" alt="Logo" className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-black mb-2 tracking-tight text-slate-900">
        NanoLez-EDUAI
      </h1>

      <p className="text-slate-400 text-[11px] mb-6 font-bold uppercase tracking-wider">
        AI Roadmaps • Articles • Quizzes
      </p>

      <input
        value={nameInput}
        onChange={(e) => setNameInput(e.target.value)}
        placeholder="Enter your name"
        className="w-full px-4 py-3 mb-4 rounded-xl border border-slate-200
                   text-sm font-semibold focus:outline-none
                   focus:ring-2 focus:ring-slate-300"
      />

      <button
        disabled={!nameInput.trim()}
        onClick={() => setUser(createLocalUser(nameInput))}
        className="w-full bg-slate-900 text-white py-3.5 rounded-xl
                   font-black text-[11px] uppercase tracking-widest
                   disabled:opacity-40
                   hover:scale-[1.02] transition-all shadow-xl
                   flex items-center justify-center gap-2"
      >
        Enter Dashboard
        <ArrowRight className="w-4 h-4" />
      </button>

    </div>
  </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg"><img src="/public/favicon.svg" alt="Logo" className="w-4 h-4" /></div>
              <div>
                <h2 className="text-sm font-black tracking-widest text-slate-900 uppercase leading-none mb-0.5">NanoLez-EduAI</h2>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Learn anything,track everything</span>
              </div>
            </div>
            <h2 className="text-sm font-bold text-slate-700">
  Welcome, {user.name}
</h2>

            <button onClick={() => {
    localStorage.removeItem("nano_user");
    setUser(null);
  }} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-rose-500 transition-all hover:bg-rose-50"><LogOut className="w-3.5 h-3.5" /></button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <aside className="lg:col-span-3 space-y-6">
              {/* Creator */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-5 flex items-center gap-2"><Plus className="w-3.5 h-3.5" /> New Objective</h3>
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Learning Goal</label>
                    <input className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-lg font-bold text-[11px] outline-none focus:border-indigo-600 focus:bg-white transition-all" placeholder="e.g. React Developer" value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value})} />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Instruction Language</label>
                    <div className="relative">
                      <Languages className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <select className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-lg font-bold text-[11px] appearance-none outline-none focus:border-indigo-600 transition-all cursor-pointer" value={formData.articleLanguage} onChange={e => setFormData({...formData, articleLanguage: e.target.value})}>
                        {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                       <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Months</label>
                       <input type="number" className="w-full px-2 py-2.5 bg-slate-50 border border-slate-100 rounded-lg font-bold text-[11px] text-center outline-none focus:border-indigo-600" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Hrs/Day</label>
                       <input type="number" className="w-full px-2 py-2.5 bg-slate-50 border border-slate-100 rounded-lg font-bold text-[11px] text-center outline-none focus:border-indigo-600" value={formData.dailyTime} onChange={e => setFormData({...formData, dailyTime: e.target.value})} />
                    </div>
                  </div>
                  <button onClick={generateRoadmap} disabled={!formData.goal || isGenerating} className="w-full bg-slate-900 text-white font-black py-3 rounded-lg text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 mt-1 hover:bg-slate-800 transition-all">
                    {isGenerating ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {isGenerating ? 'Compiling...' : 'Construct Plan'}
                  </button>
                </div>
              </div>

              {/* Plans History */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><History className="w-3.5 h-3.5" /> History</h3>
                    <span className="text-[8px] font-black bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded uppercase">{roadmaps.length} Slots</span>
                 </div>
                 <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {roadmaps.map(r => (
                      <div key={r.id} onClick={() => setActiveRoadmapId(r.id)} className={`group relative p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${activeRoadmapId === r.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-white hover:border-slate-200'}`}>
                        <div className="truncate flex-1 pr-2">
                          <p className="text-[9px] font-black uppercase truncate leading-none mb-1.5 tracking-tight">{r.title}</p>
                          <div className={`h-1 w-full rounded-full ${activeRoadmapId === r.id ? 'bg-white/20' : 'bg-slate-200'}`}>
                             <div className={`h-full transition-all ${activeRoadmapId === r.id ? 'bg-white' : 'bg-indigo-500'}`} style={{ width: `${getProgress(r)}%` }} />
                          </div>
                        </div>
                        <button onClick={(e) => deleteRoadmap(r.id, e)} className={`p-1.5 rounded-lg transition-all ${activeRoadmapId === r.id ? 'hover:bg-indigo-700 text-white/50 hover:text-white' : 'hover:bg-rose-50 text-slate-200 hover:text-rose-500'}`}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {roadmaps.length === 0 && <p className="text-[9px] text-slate-400 text-center py-4 font-bold uppercase tracking-widest">No Active Plans</p>}
                 </div>
              </div>
            </aside>

            <main className="lg:col-span-9">
              {!activeRoadmap ? (
                <div className="h-80 flex flex-col items-center justify-center text-center p-8 bg-white rounded-xl border border-dashed border-slate-200">
                  <Layout className="w-8 h-8 text-slate-100 mb-3" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Initialization Required</h3>
                  <p className="text-slate-400 text-[10px] mt-1 font-bold uppercase tracking-widest">Select a previous protocol or create a new objective.</p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                  {/* Active Header */}
                  <div className="bg-slate-900 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
                    <div className="relative z-10 space-y-1">
                      <h2 className="text-xl font-black tracking-tight leading-none uppercase">{activeRoadmap.title}</h2>
                      <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em]">{activeRoadmap.goal} • {activeRoadmap.articleLanguage}</p>
                    </div>
                    <div className="relative z-10 text-center bg-white/5 px-4 py-2.5 rounded-xl border border-white/10 backdrop-blur-md min-w-[100px]">
                       <p className="text-xl font-black leading-none">{getProgress(activeRoadmap)}%</p>
                       <p className="text-[7px] font-black uppercase tracking-widest opacity-60 mt-1">Final Sync</p>
                    </div>
                  </div>

                  {/* Certification Alert */}
                  {activeRoadmap.scores?.final >= 16 && (
                    <div className="bg-emerald-600 p-4 rounded-xl flex justify-between items-center text-white shadow-lg border border-emerald-500 animate-bounce-subtle">
                       <div className="flex items-center gap-3">
                          <Trophy className="w-5 h-5" />
                          <div>
                            <h3 className="text-[11px] font-black uppercase tracking-widest">Protocol Mastered</h3>
                            <p className="text-[9px] font-bold opacity-80 uppercase">Grade: {activeRoadmap.scores.final}/20 • Download Diploma Below</p>
                          </div>
                       </div>
                       <button onClick={() => setCertModal({ isOpen: true, roadmap: activeRoadmap })} className="bg-white text-emerald-600 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all">View Diploma</button>
                    </div>
                  )}

                  {/* Roadmap Content */}
                  <div className="space-y-8 pb-12">
                    {activeRoadmap.months?.map((month, mIdx) => (
                      <div key={mIdx} className="space-y-4">
                        <div className="flex items-center gap-3">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap px-2 py-0.5 bg-slate-100 rounded-md">{month.name}</span>
                           <div className="h-[1px] w-full bg-slate-100" />
                        </div>
                        
                        {month.weeks?.map((week, wIdx) => (
                          <div key={wIdx} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
                            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                              <h3 className="font-black text-slate-800 text-xs uppercase tracking-tight">{week.name}</h3>
                              <button onClick={() => startQuiz('weekly', week.name)} className={`px-3 py-1.5 rounded-lg font-black text-[8px] uppercase tracking-widest flex items-center gap-1.5 transition-all ${activeRoadmap.scores?.[week.name] !== undefined ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-900 text-white hover:bg-indigo-600'}`}>
                                {activeRoadmap.scores?.[week.name] !== undefined ? <><CheckCircle className="w-3 h-3" /> Grade: {activeRoadmap.scores[week.name]}/10</> : <><Zap className="w-3 h-3" /> Knowledge Check</>}
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {week.days?.map(d => {
                                const key = `${month.name}-${week.name}-day-${d.day}`;
                                const done = activeRoadmap.progress?.[key];
                                return (
                                  <div key={d.day}
  className={`flex items-stretch rounded-xl overflow-hidden group transition-all
    ${done
      ? 'bg-slate-50 border border-slate-100 opacity-75'
      : 'bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md'}
  `}
>
  {/* LEFT: TASK TOGGLE */}
  <div
    onClick={() => toggleTask(activeRoadmap.id, key)}
    className="flex-1 min-w-0 px-3 py-2 flex items-start gap-3 cursor-pointer"
  >
    {/* CHECK ICON */}
    <div
      className={`mt-0.5 transition-colors
        ${done ? 'text-emerald-500' : 'text-slate-300 group-hover:text-indigo-500'}
      `}
    >
      {done ? (
        <CheckCircle2 className="w-5 h-5" />
      ) : (
        <Circle className="w-5 h-5" strokeWidth={2} />
      )}
    </div>

    {/* TEXT */}
    <div className="flex-1 min-w-0">
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
        Day {d.day} • {cleanText(d.topic)}
      </p>

      <p
        className={`text-[11px] font-semibold leading-snug line-clamp-2
          ${done ? 'line-through text-slate-400' : 'text-slate-700'}
        `}
        title={cleanText(d.task)}
      >
        {cleanText(d.task)}
      </p>
    </div>
  </div>

  {/* RIGHT: ARTICLE BUTTON */}
  <button
  disabled={isArticleLoading}
  onClick={() => fetchAIArticle(d)}
  className="shrink-0 w-12 border-l border-slate-100
             flex items-center justify-center
             disabled:opacity-40 disabled:cursor-not-allowed
             hover:bg-indigo-50 transition text-indigo-600 bg-slate-50/50"
>
  <Newspaper className="w-3.5 h-3.5" />
</button>

</div>
 ); })}
 </div>
                            
{week.weeklyProject && (
   <div onClick={() => toggleTask(activeRoadmap.id, `${month.name}-${week.name}-project`)} className={`p-4 rounded-lg border-2 border-dashed flex items-center justify-between cursor-pointer transition-all gap-4 ${activeRoadmap.progress?.[`${month.name}-${week.name}-project`] ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'border-indigo-100 text-indigo-600 bg-indigo-50/30 hover:bg-indigo-50 hover:border-indigo-200'}`}>
    <div className="flex items-center gap-3">
                                  <Hammer className={`w-4 h-4 ${activeRoadmap.progress?.[`${month.name}-${week.name}-project`] ? 'text-white' : 'text-indigo-400'}`} />
                                  <div>
                                    <p className="text-[7px] font-black uppercase tracking-widest opacity-60">Weekly Sprint Goal</p>
                                    <h4 className="font-black text-[10px] uppercase leading-none mt-0.5">{cleanText(week.weeklyProject)}</h4>
                                  </div>
                                </div>
                                {activeRoadmap.progress?.[`${month.name}-${week.name}-project`] ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4 opacity-30" />}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                    
                    {getProgress(activeRoadmap) >= 80 && !activeRoadmap.scores?.final && (
                       <div className="text-center py-8 bg-amber-50 rounded-2xl border border-amber-100">
                          <h3 className="text-[11px] font-black uppercase text-amber-700 mb-3 tracking-widest">Final Examination Available</h3>
                          <button onClick={() => startQuiz('final')} className="bg-amber-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-amber-600/20 hover:scale-105 transition-all">Launch Certification Protocol</button>
                       </div>
                    )}
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;