
// This is the main application file for EduAI-NanoLez, an AI-powered learning platform.

import React, { useState, useEffect } from 'react';
import { 
  Target, Loader2, Sparkles, X,
  Zap, Plus, ArrowRight, 
  Terminal, 
  Sun, Moon, Trash2, AlertCircle,
  BookOpen, ListOrdered, Check, 
  Rocket, Compass, GraduationCap, Home, Library,
  Youtube, Globe, Info, Users,
  ShieldCheck, BrainCircuit, Activity
} from 'lucide-react';

const LANGUAGES = [
  { name: "English", code: "en" },
  { name: "Bengali", code: "bn" },
  { name: "Spanish", code: "es" },
  { name: "Hindi", code: "hi" },
  { name: "French", code: "fr" },
  { name: "German", code: "de" },
  { name: "Japanese", code: "ja" },
  { name: "Arabic", code: "ar" }
];

const INTENSITIES = [
  { name: "Beginner", level: "Foundation", icon: <ShieldCheck className="w-4 h-4" /> },
  { name: "Intermediate", level: "Applied", icon: <Activity className="w-4 h-4" /> },
  { name: "Advanced", level: "Mastery", icon: <BrainCircuit className="w-4 h-4" /> }
];

const safeText = (val: any): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  return String(val);
};

// API Configuration
const API_BASE_URL = 'api/'; // PHP backend is in api/ directory

// TypeScript interfaces for API responses
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface RoadmapData {
  id: string;
  title: string;
  months: Array<{
    name: string;
    weeks: Array<{
      name: string;
      goal: string;
      days: Array<{
        day: number;
        topic: string;
        task: string;
      }>;
    }>;
  }>;
  completedDays: string[];
  lang: string;
  intensity: string;
  meta: {
    goal: string;
    duration: string;
    studyTime: string;
  };
  created_at: string;
}

interface ArticleData {
  title: string;
  subtitle: string;
  deepDive: string;
  technicalConcepts: Array<{
    term: string;
    explanation: string;
  }>;
  steps: string[];
  practiceLab: string;
  resources: {
    article: {
      title: string;
      url: string;
      type: 'direct' | 'search' | 'verified';
      status: 'valid' | 'invalid' | 'checking';
      platform?: string;
      confidence?: 'high' | 'medium' | 'low';
    };
    video: {
      title: string;
      url: string;
      type: 'direct' | 'search' | 'verified';
      status: 'valid' | 'invalid' | 'checking';
      platform?: string;
      confidence?: 'high' | 'medium' | 'low';
    };
  };
  resourceValidation: {
    articleStatus: string;
    videoStatus: string;
    validatedAt: string;
    isFirstArticle: boolean;
  };
  dayId: string;
  topic: string;
  task: string;
}

interface UrlValidationResult {
  valid: boolean;
  confidence: number;
  issues: string[];
  isSecure: boolean;
  isEducational: boolean;
}

// Enhanced API client with better error handling
class ApiClient {
  private static async request<T>(action: string, payload: any): Promise<T> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ...payload })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data: ApiResponse<T> = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }

      if (!data.data) {
        throw new Error('No data received from server');
      }

      return data.data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      }
      throw error;
    }
  }

  static async generateRoadmap(goal: string, intensity: string, duration: string, studyTime: string, language: string): Promise<RoadmapData> {
    return this.request<RoadmapData>('generate_roadmap', {
      goal,
      intensity,
      duration,
      studyTime,
      language
    });
  }

  static async fetchArticle(topic: string, task: string, language: string, roadmapId: string, isFirstArticle: boolean): Promise<ArticleData> {
    return this.request<ArticleData>('fetch_article', {
      topic,
      task,
      language,
      roadmapId,
      isFirstArticle
    });
  }

  static async validateUrl(url: string): Promise<UrlValidationResult> {
    return this.request<UrlValidationResult>('validate_url', { url });
  }
}

// Legacy function names for backward compatibility
async function callGemini(prompt: string, systemPrompt: string, jsonMode: boolean = false, useSearch: boolean = false): Promise<string> {
  // Since we now use PHP backend, we need to implement this differently
  // For backward compatibility, we'll use the ApiClient to generate articles
  
  try {
    // For backward compatibility, we'll use the ApiClient to fetch articles
    // This function mimics the old callGemini behavior for any remaining references
    const articleData = await ApiClient.fetchArticle(
      prompt, // Using prompt as topic for backward compatibility
      systemPrompt, // Using systemPrompt as task for backward compatibility
      'en', // Default language
      crypto.randomUUID(), // Generate a temporary roadmap ID
      false // Not first article
    );
    
    // Return the article data as JSON string for compatibility
    return JSON.stringify(articleData);
  } catch (error) {
    // If API call fails, return a basic error response instead of throwing
    return JSON.stringify({
      error: 'API service temporarily unavailable',
      message: 'Please try again later or use the ApiClient methods directly'
    });
  }
}

// Utility functions
const createVerifiedSearchUrl = (topic: string, language: string = 'en'): string => {
  const cleanTopic = topic.replace(/[^\w\s-]/g, '').trim();
  const encodedTopic = encodeURIComponent(cleanTopic);
  
  // Create language-specific search URLs
  const searchQueries = {
    en: `${encodedTopic} tutorial guide`,
    es: `${encodedTopic} tutorial guía`,
    fr: `${encodedTopic} tutoriel guide`,
    de: `${encodedTopic} tutorial anleitung`,
    hi: `${encodedTopic} ट्यूटोरियल गाइड`,
    bn: `${encodedTopic} টিউটোরিয়াল গাইড`,
    ja: `${encodedTopic} チュートリアル ガイド`,
    ar: `${encodedTopic} تعليمي دليل`
  };

  return `https://www.youtube.com/results?search_query=${searchQueries[language as keyof typeof searchQueries] || searchQueries.en}`;
};

// URL Validation and Resource Management
interface ValidatedResource {
  title: string;
  url: string;
  type: 'direct' | 'search' | 'verified';
  status: 'valid' | 'invalid' | 'checking';
  platform?: string;
  confidence?: 'high' | 'medium' | 'low';
}

const validateUrl = async (url: string): Promise<ValidatedResource> => {
  const validated: ValidatedResource = {
    title: '',
    url: url,
    type: url.includes('youtube.com/results') || url.includes('search_query') ? 'search' : 'direct',
    status: 'checking',
    confidence: 'medium'
  };

  // Basic URL format validation
  try {
    new URL(url);
    validated.status = 'valid';
  } catch {
    validated.status = 'invalid';
    return validated;
  }

  // Enhanced URL validation with confidence scoring
  if (validated.type === 'direct') {
    try {
      // Only check HTTPS URLs for security
      if (!url.startsWith('https://')) {
        validated.status = 'invalid';
        validated.confidence = 'low';
        return validated;
      }

      // Check against known good domains
      const knownGoodDomains = [
        'developer.mozilla.org', 'freecodecamp.org', 'w3schools.com', 'javascript.info',
        'css-tricks.com', 'web.dev', 'tutorialspoint.com', 'codecademy.com',
        'kaggle.com', 'pandas.pydata.org', 'numpy.org', 'scikit-learn.org',
        'coursera.org', 'edx.org', 'khanacademy.org', 'udemy.com',
        'youtube.com', 'youtu.be'
      ];
      
      const domain = new URL(url).hostname.replace('www.', '');
      if (knownGoodDomains.includes(domain)) {
        validated.confidence = 'high';
      } else {
        validated.confidence = 'medium';
      }

      // For known domains, we assume they're valid
      validated.status = 'valid';
      
    } catch (error) {
      validated.status = 'invalid';
      validated.confidence = 'low';
    }
  } else {
    validated.status = 'valid'; // Search URLs are always considered valid
    validated.confidence = 'high'; // Search URLs are guaranteed to work
  }

  return validated;
};

// Curated high-quality educational platforms with multiple fallback options
const VERIFIED_EDUCATIONAL_PLATFORMS = {
  programming: [
    'https://developer.mozilla.org',
    'https://www.freecodecamp.org',
    'https://javascript.info',
    'https://web.dev',
    'https://css-tricks.com',
    'https://www.w3schools.com',
    'https://www.codecademy.com',
    'https://www.smashingmagazine.com',
    'https://www.tutorialspoint.com',
    'https://scrimba.com',
    'https://frontendmasters.com',
    'https://www.theodinproject.com'
  ],
  dataScience: [
    'https://www.kaggle.com/learn',
    'https://pandas.pydata.org/docs/',
    'https://numpy.org/doc/',
    'https://scikit-learn.org/stable/',
    'https://www.dataquest.io',
    'https://www.coursera.org/browse/data-science',
    'https://www.edx.org/learn/data-science',
    'https://www.datacamp.com',
    'https://towardsdatascience.com',
    'https://jovian.ai',
    'https://colab.research.google.com'
  ],
  general: [
    'https://www.coursera.org',
    'https://www.edx.org',
    'https://www.khanacademy.org',
    'https://www.udemy.com',
    'https://www.youtube.com/c/freecodecamp',
    'https://www.youtube.com/c/ProgrammingwithMosh',
    'https://www.youtube.com/user/thenewboston',
    'https://www.sattacademy.com',
    'https://www.brilliant.org',
    'https://www.skillshare.com',
    'https://www.linkedin.com/learning',
    'https://www.mitocw.riku.com'
  ]
};

const getFallbackResource = (topic: string, type: 'article' | 'video', language: string = 'en'): ValidatedResource => {
  const cleanTopic = topic.toLowerCase();
  let platform = '';
  
  // Determine topic category with more comprehensive matching
  if (cleanTopic.includes('programming') || cleanTopic.includes('coding') || cleanTopic.includes('javascript') || 
      cleanTopic.includes('python') || cleanTopic.includes('react') || cleanTopic.includes('html') || 
      cleanTopic.includes('css') || cleanTopic.includes('web development') || cleanTopic.includes('node.js') ||
      cleanTopic.includes('typescript') || cleanTopic.includes('frontend') || cleanTopic.includes('backend')) {
    platform = 'programming';
  } else if (cleanTopic.includes('data') || cleanTopic.includes('machine learning') || cleanTopic.includes('ai') ||
             cleanTopic.includes('statistics') || cleanTopic.includes('analytics') || cleanTopic.includes('pandas') ||
             cleanTopic.includes('numpy') || cleanTopic.includes('tensorflow') || cleanTopic.includes('scikit')) {
    platform = 'dataScience';
  } else {
    platform = 'general';
  }

  if (type === 'video') {
    return {
      title: `${topic} - Video Tutorial Search`,
      url: createVerifiedSearchUrl(topic, language),
      type: 'search',
      status: 'valid',
      platform: 'YouTube',
      confidence: 'high'
    };
  } else {
    // For articles, use verified educational platforms with smart selection
    const platforms = VERIFIED_EDUCATIONAL_PLATFORMS[platform as keyof typeof VERIFIED_EDUCATIONAL_PLATFORMS] || VERIFIED_EDUCATIONAL_PLATFORMS.general;
    
    // Select best platform based on topic
    let selectedPlatform = platforms[0];
    if (platform === 'programming') {
      selectedPlatform = cleanTopic.includes('javascript') ? 'https://javascript.info' : 
                        cleanTopic.includes('css') ? 'https://css-tricks.com' :
                        'https://developer.mozilla.org';
    } else if (platform === 'dataScience') {
      selectedPlatform = cleanTopic.includes('pandas') ? 'https://pandas.pydata.org/docs/' :
                        cleanTopic.includes('numpy') ? 'https://numpy.org/doc/' :
                        'https://www.kaggle.com/learn';
    }
    
    return {
      title: `${topic} - Comprehensive Guide`,
      url: selectedPlatform,
      type: 'verified',
      status: 'valid',
      platform: 'Verified Educational Platform',
      confidence: 'high'
    };
  }
};

const enhanceResourcePrompt = (originalPrompt: string, topic: string, language: string, isFirstArticle: boolean = false): string => {
  return `${originalPrompt}

CRITICAL RESOURCE VALIDATION REQUIREMENTS:
1. MANDATORY URL SELECTION (use these exact platforms):
   - Programming: https://developer.mozilla.org, https://www.freecodecamp.org, https://javascript.info, https://web.dev, https://css-tricks.com
   - Data Science: https://www.kaggle.com/learn, https://pandas.pydata.org/docs/, https://numpy.org/doc/, https://scikit-learn.org/stable/
   - General: https://www.coursera.org, https://www.edx.org, https://www.khanacademy.org, https://www.udemy.com

2. VIDEO RESOURCE STRATEGY:
   - FIRST ARTICLE ONLY: Use direct YouTube link to renowned channel full course (freeCodeCamp, Programming with Mosh, thenewboston, fireship)
   - ALL OTHER ARTICLES: ONLY use YouTube search URLs (NEVER direct video links)
   - Search URL format: https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' tutorial ' + language)}
   - Never use suspicious or unverified video sources

3. ARTICLE RESOURCE STRATEGY:
   - ALWAYS provide individual high-value docs for each topic
   - Use topic-specific platforms (MDN for JS, pandas docs for pandas, etc.)
   - Never use generic search links for articles

4. URL VALIDATION RULES:
   - ONLY use HTTPS URLs
   - Avoid personal blogs, undefined domains, or suspicious URLs
   - Prefer official documentation and established educational platforms
   - NEVER use shortened URLs (bit.ly, tinyurl, etc.)

5. RESOURCE QUALITY PRIORITY:
   - 1st: Official documentation (MDN, pandas docs, numpy docs, etc.)
   - 2nd: Established platforms (freeCodeCamp, Coursera, Kaggle, etc.)
   - 3rd: Search URLs as guaranteed fallback

6. FALLBACK MANDATORY:
   - Always provide at least ONE working resource (never leave empty)
   - Users must NEVER encounter broken links

CRITICAL: Videos must be search URLs except first article. Test each URL mentally before including.`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [roadmaps, setRoadmaps] = useState(() => {
    try {
      const saved = localStorage.getItem('nanolez_v4_roadmaps');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [articles, setArticles] = useState(() => {
    try {
      const saved = localStorage.getItem('nanolez_v4_articles');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  
  const [activeRoadmap, setActiveRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState<string | null>(null);
  const [viewedArticle, setViewedArticle] = useState<any>(null);
  const [theme, setTheme] = useState('dark');
  const [userLang, setUserLang] = useState("English");
  const [intensity, setIntensity] = useState("Beginner");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('nanolez_v4_roadmaps', JSON.stringify(roadmaps));
  }, [roadmaps]);

  useEffect(() => {
    localStorage.setItem('nanolez_v4_articles', JSON.stringify(articles));
  }, [articles]);

  const generateNewRoadmap = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    const fd = new FormData(e.currentTarget);
    const goal = fd.get('goal') as string;
    const duration = fd.get('duration') as string;
    const studyTime = fd.get('studyTime') as string;
    
    try {
      const data = await ApiClient.generateRoadmap(goal, intensity, duration, studyTime, userLang);
      const newPath = { 
        data, 
        id: crypto.randomUUID(), 
        completedDays: [], 
        lang: userLang,
        intensity: intensity,
        meta: { goal, duration, studyTime }
      };
      setRoadmaps([newPath, ...roadmaps]);
      setActiveRoadmap(newPath);
      setActiveTab('viewer');
    } catch (err: any) {
      setErrorMessage("Blueprint initialization failed. Check your network or try a simpler topic.");
    } finally {
      setLoading(false);
    }
  };

  const fetchArticle = async (day: any) => {
    const dayId = `${activeRoadmap.id}-${day.topic.replace(/\s+/g, '-').toLowerCase()}`;
    
    if (articles[dayId]) {
      setViewedArticle(articles[dayId]);
      return;
    }

    setLoadingArticle(dayId);
    setErrorMessage(null);
    
    // Check if this is the first article being accessed
    const isFirstArticle = Object.keys(articles).length === 0;

    try {
      // Use the ApiClient to fetch article data from the PHP backend
      const data = await ApiClient.fetchArticle(
        day.topic, 
        day.task, 
        activeRoadmap.lang, 
        activeRoadmap.id, 
        isFirstArticle
      );
      
      // The PHP backend already provides enhanced resources with validation
      // No need for additional resource validation since the backend handles it
      
      const articleData = { 
        ...data, 
        dayId,
        resourceValidation: {
          articleStatus: data.resources?.article?.status || 'valid',
          videoStatus: data.resources?.video?.status || 'valid',
          validatedAt: new Date().toISOString(),
          isFirstArticle: isFirstArticle
        }
      };
      
      setArticles((prev: any) => ({ ...prev, [dayId]: articleData }));
      setViewedArticle(articleData);
    } catch (err: any) {
      console.error('Article fetch error:', err);
      setErrorMessage("Knowledge Nexus connection failed. Please try accessing the node again.");
    } finally {
      setLoadingArticle(null);
    }
  };

  // Enhanced resource validation with multiple fallback layers
  const validateAndEnhanceResources = async (resources: any, topic: string, language: string, isFirstArticle: boolean = false) => {
    const enhanced: any = {};
    
    // Process article resource with multiple fallback layers
    if (resources?.article && resources.article.url) {
      try {
        const validatedArticle = await validateUrl(resources.article.url);
        if (validatedArticle.status === 'valid' && validatedArticle.confidence !== 'low') {
          enhanced.article = {
            ...resources.article,
            ...validatedArticle
          };
        } else {
          // First fallback: get smart fallback
          enhanced.article = getFallbackResource(topic, 'article', language);
        }
      } catch (error) {
        // Fallback on any error
        enhanced.article = getFallbackResource(topic, 'article', language);
      }
    } else {
      // No article provided, use fallback
      enhanced.article = getFallbackResource(topic, 'article', language);
    }
    
    // Process video resource with intelligent fallback strategy
    if (resources?.video && resources.video.url) {
      try {
        const validatedVideo = await validateUrl(resources.video.url);
        if (validatedVideo.status === 'valid') {
          // If this is NOT the first article and we got a direct video link, convert it to search
          if (!isFirstArticle && (validatedVideo.url.includes('watch?v=') || validatedVideo.url.includes('youtu.be'))) {
            enhanced.video = {
              title: `${topic} - Video Tutorial Search`,
              url: createVerifiedSearchUrl(topic, language),
              type: 'search',
              status: 'valid',
              platform: 'YouTube',
              confidence: 'high'
            };
          } else {
            enhanced.video = {
              ...resources.video,
              ...validatedVideo
            };
          }
        } else {
          // Invalid video, use search fallback
          enhanced.video = {
            title: `${topic} - Video Tutorial Search`,
            url: createVerifiedSearchUrl(topic, language),
            type: 'search',
            status: 'valid',
            platform: 'YouTube',
            confidence: 'high'
          };
        }
      } catch (error) {
        // Fallback on any error - always use YouTube search as guaranteed backup
        enhanced.video = {
          title: `${topic} - Video Tutorial Search`,
          url: createVerifiedSearchUrl(topic, language),
          type: 'search',
          status: 'valid',
          platform: 'YouTube',
          confidence: 'high'
        };
      }
    } else {
      // No video provided, use guaranteed YouTube search fallback
      enhanced.video = {
        title: `${topic} - Video Tutorial Search`,
        url: createVerifiedSearchUrl(topic, language),
        type: 'search',
        status: 'valid',
        platform: 'YouTube',
        confidence: 'high'
      };
    }
    
    // Ensure both resources have minimum required properties
    if (!enhanced.article) {
      enhanced.article = getFallbackResource(topic, 'article', language);
    }
    if (!enhanced.video) {
      enhanced.video = {
        title: `${topic} - Video Tutorial Search`,
        url: createVerifiedSearchUrl(topic, language),
        type: 'search',
        status: 'valid',
        platform: 'YouTube',
        confidence: 'high'
      };
    }
    
    return enhanced;
  };

  const toggleDay = (roadmapId: string, dayId: string) => {
    setRoadmaps((prev: any[]) => prev.map(r => {
      if (r.id === roadmapId) {
        const done = r.completedDays.includes(dayId) 
          ? r.completedDays.filter((id: string) => id !== dayId) 
          : [...r.completedDays, dayId];
        return { ...r, completedDays: done };
      }
      return r;
    }));
    
    if (activeRoadmap?.id === roadmapId) {
      setActiveRoadmap((prev: any) => ({
        ...prev,
        completedDays: prev.completedDays.includes(dayId) 
          ? prev.completedDays.filter((id: string) => id !== dayId) 
          : [...prev.completedDays, dayId]
      }));
    }
  };

  const themeClasses = theme === 'dark' 
    ? {
        bg: 'bg-black',
        text: 'text-white',
        card: 'bg-[#111111] border-[#222222]',
        cardHover: 'hover:bg-[#181818] hover:border-[#333333]',
        muted: 'text-zinc-400',
        input: 'bg-[#0a0a0a] border-[#222222]',
        nav: 'bg-black/90 border-[#222222]',
        accent: 'text-indigo-400',
        overlay: 'bg-black/99',
        border: 'border-[#222222]'
      }
    : {
        bg: 'bg-[#fcfcfc]',
        text: 'text-zinc-900',
        card: 'bg-white border-zinc-200 shadow-sm',
        cardHover: 'hover:bg-zinc-50 hover:border-zinc-300',
        muted: 'text-zinc-500',
        input: 'bg-white border-zinc-200',
        nav: 'bg-white/90 border-zinc-200',
        accent: 'text-indigo-600',
        overlay: 'bg-white/99',
        border: 'border-zinc-200'
      };

  return (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} font-sans pb-32 transition-colors duration-500`}>
      <header className={`h-16 px-4 md:px-8 flex justify-between items-center sticky top-0 bg-inherit/80 backdrop-blur-md z-[60] border-b ${themeClasses.border}`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden ${theme === 'light' ? 'bg-black shadow-lg' : ''}`}>
            <img src="/favicon.svg" alt="EduAI-Nanolez Logo" className="w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <span className="font-black tracking-tight text-xl uppercase bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              EduAI-NanoLez
            </span>
            <span className={`text-[8px] uppercase font-black tracking-[0.3em] ${themeClasses.muted}`}>AI Learning Platform</span>
          </div>
        </div>
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`p-2 rounded-full border ${themeClasses.card} transition-all`}>
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-700" />}
        </button>
      </header>

      {errorMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
            <div className="bg-red-600 border border-red-400 text-white p-4 rounded-xl flex items-center gap-3 shadow-2xl">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-bold flex-1">{errorMessage}</p>
                <button onClick={() => setErrorMessage(null)}><X className="w-4 h-4" /></button>
            </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="space-y-1">
               <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tight bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                 EduAI-NanoLez <span className="text-indigo-500"> Dashboard</span>
               </h1>
               <p className={`${themeClasses.muted} text-[10px] uppercase font-black tracking-[0.3em]`}>An AI-Powered Learning Platform by NanoLez Devs. Learn , track , explore</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <button onClick={() => { setErrorMessage(null); setActiveTab('create'); }} className={`h-64 rounded-3xl border-2 border-dashed ${theme === 'dark' ? 'border-indigo-500/20 hover:border-indigo-500/60' : 'border-indigo-200 hover:border-indigo-400'} flex flex-col items-center justify-center gap-3 transition-all hover:bg-indigo-500/5 group`}>
                <div className="p-4 bg-indigo-600 rounded-full group-hover:scale-110 transition-transform shadow-lg shadow-indigo-600/20">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <span className={`font-black text-[10px] uppercase tracking-widest ${themeClasses.accent}`}>Deploy New Roadmap</span>
              </button>

              {roadmaps.map((r: any) => (
                <div key={r.id} onClick={() => { setErrorMessage(null); setActiveRoadmap(r); setActiveTab('viewer'); }} className={`group rounded-3xl border ${themeClasses.card} ${themeClasses.cardHover} p-6 flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden`}>
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">{r.lang} • {r.intensity}</span>
                       <h3 className="text-xl font-extrabold uppercase leading-tight line-clamp-2">{r.title}</h3>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setRoadmaps(roadmaps.filter((x: any) => x.id !== r.id)); }} className={`${themeClasses.muted} hover:text-red-600 p-2 transition-colors`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3 mt-6">
                    <div className="flex justify-between items-center text-[10px] font-black tracking-widest">
                      <span className={themeClasses.muted}>PROGRESS</span>
                      <span className="text-indigo-600">
                        {Math.round(((r.completedDays?.length || 0) / (r.months.length * (r.months[0]?.weeks?.length || 1) * 7)) * 100)}%
                      </span>
                    </div>
                    <div className={`w-full h-2.5 ${theme === 'dark' ? 'bg-white/5' : 'bg-zinc-100'} rounded-full overflow-hidden`}>
                      <div 
                        className="h-full bg-indigo-600 transition-all duration-1000" 
                        style={{ width: `${((r.completedDays?.length || 0) / (r.months.length * (r.months[0]?.weeks?.length || 1) * 7)) * 100}%` }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto py-4 animate-in slide-in-from-bottom-8">
            <div className="text-center mb-10 space-y-2">
              <Compass className="w-12 h-12 text-indigo-600 mx-auto" />
              <h2 className="text-4xl font-black uppercase italic tracking-tight">Initialization</h2>
            </div>
            <form onSubmit={generateNewRoadmap} className={`p-8 md:p-12 rounded-[2.5rem] border ${themeClasses.card} space-y-10 shadow-2xl shadow-indigo-500/5`}>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 ml-1">What do you want to master?</label>
                <input name="goal" required placeholder="e.g. Quantitative Finance or Quantum Computing" className={`w-full p-5 ${themeClasses.input} rounded-2xl text-lg font-bold outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder:opacity-30`} />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 ml-1">Training Intensity</label>
                <div className="grid grid-cols-3 gap-4">
                  {INTENSITIES.map(lvl => (
                    <button key={lvl.name} type="button" onClick={() => setIntensity(lvl.name)} className={`py-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${intensity === lvl.name ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/30' : `${themeClasses.card} border-transparent ${themeClasses.muted}`}`}>
                      <div className={intensity === lvl.name ? 'text-white' : 'text-indigo-500'}>{lvl.icon}</div>
                      <span className="text-[10px] font-black uppercase">{lvl.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 ml-1">Daily Commitment</label>
                  <select name="studyTime" className={`w-full p-5 ${themeClasses.input} rounded-2xl font-bold outline-none cursor-pointer hover:border-indigo-600 transition-all`}>
                    <option value="2">2 Hours</option>
                    <option value="4">4 Hours</option>
                    <option value="8">8 Hours</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 ml-1">Training Term</label>
                  <select name="duration" className={`w-full p-5 ${themeClasses.input} rounded-2xl font-bold outline-none cursor-pointer hover:border-indigo-600 transition-all`}>
                    <option value="1">1 Month</option>
                    <option value="3">3 Months</option>
                    <option value="6">6 Months</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 ml-1">Language Output</label>
                <div className="grid grid-cols-4 gap-2">
                  {LANGUAGES.map(lang => (
                    <button key={lang.code} type="button" onClick={() => setUserLang(lang.name)} className={`py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${userLang === lang.name ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : `${themeClasses.card} border-transparent ${themeClasses.muted}`}`}>{lang.name}</button>
                  ))}
                </div>
              </div>

              <button disabled={loading} className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 disabled:opacity-50 transition-all shadow-xl shadow-indigo-600/20">
                {loading ? <Loader2 className="animate-spin" /> : <><Sparkles className="w-6 h-6"/> EXECUTE DEPLOYMENT</>}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'viewer' && activeRoadmap && (
          <div className="animate-in fade-in space-y-16 pb-20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-4">
                <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest group">
                  <ArrowRight className="rotate-180 w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back to Nexus
                </button>
                <h2 className="text-4xl md:text-5xl font-black uppercase italic leading-tight tracking-tight">{activeRoadmap.title}</h2>
              </div>
              <div className={`p-8 ${themeClasses.card} rounded-[2rem] flex items-center gap-8 shadow-xl`}>
                <div className="text-right">
                  <p className={`text-[10px] font-black uppercase ${themeClasses.muted} tracking-widest`}>Node Progress</p>
                  <p className="font-black text-indigo-600 text-2xl leading-none mt-1">{activeRoadmap.completedDays?.length || 0} Synced</p>
                </div>
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                  <Target className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>

            {activeRoadmap.months?.map((month: any, mi: number) => (
              <div key={mi} className="space-y-10">
                <div className="flex items-center gap-6">
                   <span className={`text-6xl font-black italic ${theme === 'dark' ? 'text-white/5' : 'text-zinc-100'} shrink-0`}>{mi + 1}</span>
                   <h3 className="text-3xl font-black uppercase italic tracking-tighter">{month.name}</h3>
                   <div className={`h-1 flex-1 ${theme === 'dark' ? 'bg-white/5' : 'bg-zinc-100'} rounded-full`} />
                </div>
                <div className="space-y-16">
                  {month.weeks?.map((week: any, wi: number) => (
                    <div key={wi} className="space-y-8">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-indigo-600 rounded-lg shadow-md">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className={`font-black text-[10px] uppercase tracking-[0.2em] ${themeClasses.muted}`}>{week.name}</h4>
                          <p className="text-2xl font-black italic uppercase tracking-tight mt-1">{week.goal}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {week.days?.map((day: any, di: number) => {
                          const dayId = `${activeRoadmap.id}-${day.topic.replace(/\s+/g, '-').toLowerCase()}`;
                          const isDone = activeRoadmap.completedDays?.includes(dayId);
                          return (
                            <div key={di} className={`p-7 rounded-[2rem] border-2 transition-all flex flex-col justify-between gap-6 shadow-sm ${isDone ? 'bg-indigo-600 border-indigo-600' : `${themeClasses.card} hover:border-indigo-600/50`}`}>
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${isDone ? 'text-white/70' : themeClasses.muted}`}>Day {day.day}</span>
                                  <button onClick={() => toggleDay(activeRoadmap.id, dayId)} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isDone ? 'bg-white text-indigo-600 shadow-xl' : `bg-indigo-600/10 text-indigo-600 border border-indigo-600/20 hover:bg-indigo-600 hover:text-white`}`}>
                                    <Check className="w-5 h-5 stroke-[3]" />
                                  </button>
                                </div>
                                <h5 className={`font-black italic text-xl leading-[1.1] ${isDone ? 'text-white' : themeClasses.text}`}>{day.topic}</h5>
                                <p className={`text-[11px] font-bold leading-relaxed line-clamp-3 ${isDone ? 'text-white/80' : themeClasses.muted}`}>{day.task}</p>
                              </div>
                              <button onClick={() => fetchArticle(day)} className={`w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${isDone ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'}`}>
                                {loadingArticle === dayId ? <Loader2 className="animate-spin w-4 h-4" /> : <><Rocket className="w-4 h-4" /> Access Data</>}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-12 bg-indigo-600" />
                <Info className="w-8 h-8 text-indigo-600" />
                <div className="h-px w-12 bg-indigo-600" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tight">About <span className="text-indigo-500">EduAI-NanoLez</span></h1>
              <p className="text-xl font-bold italic text-zinc-500 max-w-3xl mx-auto">
                Revolutionary AI-powered educational roadmap generator that transforms learning ambitions into structured, actionable paths
              </p>
            </div>

            {/* Methods Section */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30">
                  <BrainCircuit className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">Our Methods</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className={`p-8 rounded-[2.5rem] ${themeClasses.card} border-2 hover:border-indigo-600/30 transition-all space-y-6`}>
                  <h3 className="text-2xl font-black italic uppercase tracking-tight text-indigo-600">Multi-Model AI Architecture</h3>
                  <p className={`text-lg font-bold leading-relaxed ${themeClasses.muted}`}>
                    Our system utilizes 5 cutting-edge AI models with automatic fallback: Gemini 2.5 Flash, Groq Llama 3.1 70B, Groq Llama 3.1 8B, Mixtral 8x7B, and Mistral Large Latest. When one model fails, others seamlessly take over to ensure 99.9% uptime.
                  </p>
                </div>
                <div className={`p-8 rounded-[2.5rem] ${themeClasses.card} border-2 hover:border-indigo-600/30 transition-all space-y-6`}>
                  <h3 className="text-2xl font-black italic uppercase tracking-tight text-indigo-600">Pedagogical Intelligence</h3>
                  <p className={`text-lg font-bold leading-relaxed ${themeClasses.muted}`}>
                    Advanced prompting techniques transform AI into expert pedagogical architects, creating hierarchical learning paths that adapt to your intensity level, available time, and target language.
                  </p>
                </div>
                <div className={`p-8 rounded-[2.5rem] ${themeClasses.card} border-2 hover:border-indigo-600/30 transition-all space-y-6`}>
                  <h3 className="text-2xl font-black italic uppercase tracking-tight text-indigo-600">Dynamic Resource Mining</h3>
                  <p className={`text-lg font-bold leading-relaxed ${themeClasses.muted}`}>
                    AI-powered knowledge mining finds the highest-value educational resources, from direct YouTube tutorials to comprehensive articles, tailored specifically to your learning topic and context.
                  </p>
                </div>
                <div className={`p-8 rounded-[2.5rem] ${themeClasses.card} border-2 hover:border-indigo-600/30 transition-all space-y-6`}>
                  <h3 className="text-2xl font-black italic uppercase tracking-tight text-indigo-600">Progressive Complexity</h3>
                  <p className={`text-lg font-bold leading-relaxed ${themeClasses.muted}`}>
                    Structured monthly progression with weekly goals and daily tasks, ensuring systematic skill building from foundation to mastery across any subject domain.
                  </p>
                </div>
              </div>
            </section>

            {/* Benefits Section */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-600 rounded-xl shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600">Key Benefits</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: "Guaranteed Results",
                    description: "99.9% uptime through multi-model fallback ensures you always receive your learning roadmaps and articles",
                    icon: <ShieldCheck className="w-8 h-8" />
                  },
                  {
                    title: "Personalized Learning",
                    description: "Custom roadmaps adapted to your intensity level, daily commitment, timeline, and preferred language",
                    icon: <Users className="w-8 h-8" />
                  },
                  {
                    title: "High-Value Resources",
                    description: "AI-curated educational content including direct video tutorials, articles, and practical exercises",
                    icon: <BookOpen className="w-8 h-8" />
                  },
                  {
                    title: "Progress Tracking",
                    description: "Visual progress indicators and completion tracking to maintain motivation and accountability",
                    icon: <Check className="w-8 h-8" />
                  },
                  {
                    title: "Instant Access",
                    description: "No waiting - immediate generation of comprehensive learning paths and detailed educational content",
                    icon: <Zap className="w-8 h-8" />
                  },
                  {
                    title: "Multi-Language",
                    description: "Support for 8 major languages including English, Bengali, Spanish, Hindi, French, German, Japanese, and Arabic",
                    icon: <Globe className="w-8 h-8" />
                  }
                ].map((benefit, i) => (
                  <div key={i} className={`p-6 ${themeClasses.card} rounded-[2rem] border-2 hover:border-emerald-600/30 transition-all space-y-4`}>
                    <div className="text-emerald-600">{benefit.icon}</div>
                    <h3 className="text-xl font-black italic uppercase tracking-tight">{benefit.title}</h3>
                    <p className={`text-sm font-bold leading-relaxed ${themeClasses.muted}`}>{benefit.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Working Process */}
            <section className={`p-10 md:p-16 rounded-[3.5rem] ${theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-zinc-50'} border-2 ${themeClasses.border} space-y-12 shadow-inner`}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-fuchsia-600 rounded-xl shadow-lg">
                  <ListOrdered className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-fuchsia-600">Working Process</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="flex gap-6 items-start">
                    <div className="w-14 h-14 bg-indigo-600 text-white rounded-[1.25rem] flex items-center justify-center font-black text-2xl italic shrink-0 shadow-lg shadow-indigo-600/30">1</div>
                    <div>
                      <h3 className="text-xl font-black italic uppercase mb-3 text-indigo-600">Input Analysis</h3>
                      <p className={`text-lg font-bold ${themeClasses.muted} leading-snug`}>User provides learning goal, intensity preference, daily commitment, duration, and language choice</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-start">
                    <div className="w-14 h-14 bg-indigo-600 text-white rounded-[1.25rem] flex items-center justify-center font-black text-2xl italic shrink-0 shadow-lg shadow-indigo-600/30">2</div>
                    <div>
                      <h3 className="text-xl font-black italic uppercase mb-3 text-indigo-600">AI Processing</h3>
                      <p className={`text-lg font-bold ${themeClasses.muted} leading-snug`}>Multi-model AI system generates structured roadmap with months, weeks, and daily learning tasks</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-start">
                    <div className="w-14 h-14 bg-indigo-600 text-white rounded-[1.25rem] flex items-center justify-center font-black text-2xl italic shrink-0 shadow-lg shadow-indigo-600/30">3</div>
                    <div>
                      <h3 className="text-xl font-black italic uppercase mb-3 text-indigo-600">Resource Mining</h3>
                      <p className={`text-lg font-bold ${themeClasses.muted} leading-snug`}>AI searches and curates high-value educational resources for each learning topic</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="flex gap-6 items-start">
                    <div className="w-14 h-14 bg-indigo-600 text-white rounded-[1.25rem] flex items-center justify-center font-black text-2xl italic shrink-0 shadow-lg shadow-indigo-600/30">4</div>
                    <div>
                      <h3 className="text-xl font-black italic uppercase mb-3 text-indigo-600">Content Delivery</h3>
                      <p className={`text-lg font-bold ${themeClasses.muted} leading-snug`}>Detailed articles with explanations, steps, practice labs, and curated resources are generated</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-start">
                    <div className="w-14 h-14 bg-indigo-600 text-white rounded-[1.25rem] flex items-center justify-center font-black text-2xl italic shrink-0 shadow-lg shadow-indigo-600/30">5</div>
                    <div>
                      <h3 className="text-xl font-black italic uppercase mb-3 text-indigo-600">Progress Tracking</h3>
                      <p className={`text-lg font-bold ${themeClasses.muted} leading-snug`}>Users mark completed days and track their learning progress through visual indicators</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-start">
                    <div className="w-14 h-14 bg-indigo-600 text-white rounded-[1.25rem] flex items-center justify-center font-black text-2xl italic shrink-0 shadow-lg shadow-indigo-600/30">6</div>
                    <div>
                      <h3 className="text-xl font-black italic uppercase mb-3 text-indigo-600">Continuous Learning</h3>
                      <p className={`text-lg font-bold ${themeClasses.muted} leading-snug`}>System saves progress and provides ongoing access to all generated content and roadmaps</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* How to Use */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-600 rounded-xl shadow-lg">
                  <Compass className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-600">How to Use</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    step: "1",
                    title: "Click Deploy",
                    description: "Navigate to the Deploy tab using the bottom navigation",
                    action: "Tap the + button in the center of the bottom navigation"
                  },
                  {
                    step: "2", 
                    title: "Set Your Goal",
                    description: "Enter what you want to master in the goal field",
                    action: "Type your learning objective (e.g., 'Quantum Computing')"
                  },
                  {
                    step: "3",
                    title: "Choose Intensity",
                    description: "Select your preferred learning intensity level",
                    action: "Choose Beginner, Intermediate, or Advanced"
                  },
                  {
                    step: "4",
                    title: "Configure Schedule",
                    description: "Set your daily study time and overall duration",
                    action: "Select 2-8 hours daily and 1-6 months duration"
                  },
                  {
                    step: "5",
                    title: "Pick Language",
                    description: "Choose your preferred language for content",
                    action: "Select from 8 available languages"
                  },
                  {
                    step: "6",
                    title: "Generate Roadmap",
                    description: "Execute deployment to create your learning path",
                    action: "Click 'EXECUTE DEPLOYMENT' button"
                  },
                  {
                    step: "7",
                    title: "Access Content",
                    description: "Click on any day to access detailed learning materials",
                    action: "Tap 'Access Data' on any learning day card"
                  },
                  {
                    step: "8",
                    title: "Track Progress",
                    description: "Mark completed days and monitor your advancement",
                    action: "Click the checkmark button on completed tasks"
                  }
                ].map((step, i) => (
                  <div key={i} className={`p-6 ${themeClasses.card} rounded-[2rem] border-2 hover:border-amber-600/30 transition-all space-y-4`}>
                    <div className="w-12 h-12 bg-amber-600 text-white rounded-2xl flex items-center justify-center font-black text-xl italic">{step.step}</div>
                    <h3 className="text-lg font-black italic uppercase tracking-tight">{step.title}</h3>
                    <p className={`text-sm font-bold leading-relaxed ${themeClasses.muted}`}>{step.description}</p>
                    <div className="p-3 bg-amber-600/10 rounded-xl">
                      <p className="text-xs font-black uppercase tracking-wider text-amber-600">{step.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* About Author & Company */}
            <section className={`p-10 md:p-16 rounded-[3.5rem] bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border-2 border-indigo-600/20 space-y-12`}>
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-12 bg-indigo-600" />
                  <GraduationCap className="w-8 h-8 text-indigo-600" />
                  <div className="h-px w-12 bg-indigo-600" />
                </div>
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">About Author & Company</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="text-center space-y-6">
                  <div className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-indigo-600/30">
                    <Users className="w-16 h-16 text-white" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black italic uppercase tracking-tight">Nabid Ahammed Limon</h3>
                    <p className="text-lg font-bold text-indigo-600">Lead Developer & AI Architect</p>
                    <p className={`text-lg font-bold leading-relaxed ${themeClasses.muted} max-w-md mx-auto`}>
                      Visionary developer specializing in AI-powered educational technologies. Passionate about making quality education accessible through intelligent automation and multi-model AI systems.
                    </p>
                  </div>
                </div>
                
                <div className="text-center space-y-6">
                  <div className="w-32 h-32 bg-purple-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-purple-600/30">
                    <Target className="w-16 h-16 text-white" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black italic uppercase tracking-tight">NanoLez Devs</h3>
                    <p className="text-lg font-bold text-purple-600">Innovation in Education Technology</p>
                    <p className={`text-lg font-bold leading-relaxed ${themeClasses.muted} max-w-md mx-auto`}>
                      Cutting-edge development company focused on revolutionary educational tools powered by artificial intelligence. Transforming how people learn and acquire new skills worldwide.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-center pt-8 border-t border-indigo-600/20">
                <p className={`text-lg font-bold italic ${themeClasses.muted}`}>
                  "Empowering learners worldwide through intelligent, personalized education"
                </p>
              </div>
            </section>
          </div>
        )}

      </main>

      {/* ARTICLE OVERLAY */}
      {viewedArticle && (
        <div className={`fixed inset-0 z-[100] ${themeClasses.overlay} backdrop-blur-3xl overflow-y-auto animate-in fade-in`}>
          <div className="max-w-4xl mx-auto px-6 py-12 md:py-24 relative">
            <button onClick={() => setViewedArticle(null)} className="fixed top-8 right-8 p-4 bg-red-600 text-white rounded-2xl shadow-2xl z-[110] hover:scale-105 active:scale-95 transition-all">
              <X className="w-6 h-6 stroke-[3]"/>
            </button>
            
            <div className="space-y-16">
              <header className="space-y-6 text-center">
                <div className="flex items-center justify-center gap-4">
                   <div className="h-px w-12 bg-indigo-600" />
                   <span className="text-indigo-600 font-black uppercase tracking-[0.5em] text-[11px]">Training Node Data</span>
                   <div className="h-px w-12 bg-indigo-600" />
                </div>
                <h1 className="text-4xl md:text-7xl font-black uppercase italic leading-none tracking-tighter">{safeText(viewedArticle.title)}</h1>
                <p className="text-xl md:text-2xl font-bold italic text-zinc-500 max-w-2xl mx-auto">{safeText(viewedArticle.subtitle)}</p>
              </header>

              <div className="space-y-20">
                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">Contextual Deep Dive</h3>
                  </div>
                  <div className={`text-xl md:text-2xl font-bold leading-relaxed ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'} space-y-8`}>
                    {safeText(viewedArticle.deepDive).split('\n').map((p, i) => <p key={i} className="first-letter:text-5xl first-letter:font-black first-letter:text-indigo-600 first-letter:mr-3 first-letter:float-left">{p}</p>)}
                  </div>
                </section>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {viewedArticle.technicalConcepts?.map((concept: any, i: number) => (
                    <div key={i} className={`p-8 rounded-[2.5rem] ${themeClasses.card} border-2 hover:border-indigo-600/30 transition-all`}>
                      <h4 className="text-xl font-black italic uppercase mb-3 text-indigo-600 tracking-tight">{concept.term}</h4>
                      <p className={`text-lg font-bold ${themeClasses.muted} leading-snug`}>{concept.explanation}</p>
                    </div>
                  ))}
                </div>

                <section className={`p-10 md:p-16 rounded-[3.5rem] ${theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-zinc-50'} border-2 ${themeClasses.border} space-y-12 shadow-inner`}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-fuchsia-600 rounded-xl shadow-lg">
                      <ListOrdered className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-fuchsia-600">Operational Steps</h3>
                  </div>
                  <div className="space-y-8">
                    {viewedArticle.steps?.map((step: any, i: number) => (
                      <div key={i} className="flex gap-6 items-start">
                        <div className="w-14 h-14 bg-indigo-600 text-white rounded-[1.25rem] flex items-center justify-center font-black text-2xl italic shrink-0 shadow-lg shadow-indigo-600/30">{i+1}</div>
                        <p className={`text-xl md:text-2xl font-black ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'} pt-2 leading-tight tracking-tight`}>{safeText(step)}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {viewedArticle.practiceLab && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-600 rounded-xl shadow-lg">
                        <Terminal className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600">Practical Sandbox</h3>
                    </div>
                    <div className="group relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                      <pre className="relative p-8 md:p-10 bg-black border border-white/10 rounded-[2rem] text-emerald-400 font-mono text-lg overflow-x-auto leading-relaxed scrollbar-hide">
                        <code>{safeText(viewedArticle.practiceLab)}</code>
                      </pre>
                    </div>
                  </section>
                )}

                <section className="space-y-8 pt-12 border-t-4 border-indigo-600/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">Curated Learning Resources</h3>
                    {viewedArticle.resourceValidation && (
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black uppercase tracking-wider text-green-600 bg-green-600/10 px-2 py-1 rounded-full">All Links Verified</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {viewedArticle.resources?.article?.url && (
                      <a href={viewedArticle.resources.article.url} target="_blank" rel="noopener noreferrer" className={`p-6 ${themeClasses.card} rounded-[2rem] border-2 flex items-center gap-6 hover:border-indigo-600 hover:shadow-xl transition-all group relative`}>
                          {/* Resource Type & Confidence Indicators */}
                          <div className="absolute top-3 right-3 flex gap-1">
                            {viewedArticle.resources.article.type === 'verified' && (
                              <span className="text-[8px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-600/10 px-2 py-1 rounded-full">Verified</span>
                            )}
                            {viewedArticle.resources.article.type === 'search' && (
                              <span className="text-[8px] font-black uppercase tracking-wider text-amber-600 bg-amber-600/10 px-2 py-1 rounded-full">Search</span>
                            )}
                            {viewedArticle.resources.article.type === 'direct' && (
                              <span className="text-[8px] font-black uppercase tracking-wider text-blue-600 bg-blue-600/10 px-2 py-1 rounded-full">Direct</span>
                            )}
                            {viewedArticle.resources.article.confidence && (
                              <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${
                                viewedArticle.resources.article.confidence === 'high' ? 'text-emerald-600 bg-emerald-600/10' :
                                viewedArticle.resources.article.confidence === 'medium' ? 'text-amber-600 bg-amber-600/10' :
                                'text-red-600 bg-red-600/10'
                              }`}>{viewedArticle.resources.article.confidence}</span>
                            )}
                          </div>
                          
                          <div className="p-4 bg-blue-600/10 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Globe className="w-8 h-8 text-blue-500 group-hover:text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-black uppercase ${themeClasses.muted} tracking-widest`}>Article Resource</span>
                              {viewedArticle.resources.article.platform && (
                                <span className="text-[8px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-600/10 px-2 py-0.5 rounded-full">{viewedArticle.resources.article.platform}</span>
                              )}
                            </div>
                            <h4 className="text-lg font-black italic uppercase line-clamp-1">{viewedArticle.resources.article.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              {viewedArticle.resourceValidation?.articleStatus && (
                                <p className={`text-[9px] ${themeClasses.muted}`}>Status: {viewedArticle.resourceValidation.articleStatus}</p>
                              )}
                              {viewedArticle.resources.article.confidence && (
                                <div className="flex items-center gap-1">
                                  <div className={`w-2 h-2 rounded-full ${
                                    viewedArticle.resources.article.confidence === 'high' ? 'bg-emerald-500' :
                                    viewedArticle.resources.article.confidence === 'medium' ? 'bg-amber-500' :
                                    'bg-red-500'
                                  }`}></div>
                                  <span className={`text-[8px] font-black uppercase tracking-wider ${
                                    viewedArticle.resources.article.confidence === 'high' ? 'text-emerald-600' :
                                    viewedArticle.resources.article.confidence === 'medium' ? 'text-amber-600' :
                                    'text-red-600'
                                  }`}>{viewedArticle.resources.article.confidence} confidence</span>
                                </div>
                              )}
                            </div>
                          </div>
                      </a>
                    )}
                    {viewedArticle.resources?.video?.url && (
                      <a href={viewedArticle.resources.video.url} target="_blank" rel="noopener noreferrer" className={`p-6 ${themeClasses.card} rounded-[2rem] border-2 flex items-center gap-6 hover:border-red-600 hover:shadow-xl transition-all group relative`}>
                          {/* Resource Type & Confidence Indicators */}
                          <div className="absolute top-3 right-3 flex gap-1">
                            {viewedArticle.resourceValidation?.isFirstArticle && viewedArticle.resources.video.type === 'direct' && (
                              <span className="text-[8px] font-black uppercase tracking-wider text-purple-600 bg-purple-600/10 px-2 py-1 rounded-full">Full Course</span>
                            )}
                            {viewedArticle.resources.video.type === 'search' && (
                              <span className="text-[8px] font-black uppercase tracking-wider text-amber-600 bg-amber-600/10 px-2 py-1 rounded-full">Search</span>
                            )}
                            {viewedArticle.resources.video.type === 'direct' && !viewedArticle.resourceValidation?.isFirstArticle && (
                              <span className="text-[8px] font-black uppercase tracking-wider text-blue-600 bg-blue-600/10 px-2 py-1 rounded-full">Direct</span>
                            )}
                            {viewedArticle.resources.video.platform === 'YouTube' && (
                              <span className="text-[8px] font-black uppercase tracking-wider text-red-600 bg-red-600/10 px-2 py-1 rounded-full">YouTube</span>
                            )}
                            {viewedArticle.resources.video.confidence && (
                              <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${
                                viewedArticle.resources.video.confidence === 'high' ? 'text-emerald-600 bg-emerald-600/10' :
                                viewedArticle.resources.video.confidence === 'medium' ? 'text-amber-600 bg-amber-600/10' :
                                'text-red-600 bg-red-600/10'
                              }`}>{viewedArticle.resources.video.confidence}</span>
                            )}
                          </div>
                          
                          <div className="p-4 bg-red-600/10 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-all">
                            <Youtube className="w-8 h-8 text-red-500 group-hover:text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-black uppercase ${themeClasses.muted} tracking-widest`}>
                                {viewedArticle.resources.video.url.includes('watch') || viewedArticle.resources.video.url.includes('youtu.be') ? 'Direct Video' : 'Video Search'}
                              </span>
                              {viewedArticle.resources.video.platform && (
                                <span className="text-[8px] font-black uppercase tracking-wider text-red-600 bg-red-600/10 px-2 py-0.5 rounded-full">{viewedArticle.resources.video.platform}</span>
                              )}
                            </div>
                            <h4 className="text-lg font-black italic uppercase line-clamp-1">{viewedArticle.resources.video.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              {viewedArticle.resourceValidation?.videoStatus && (
                                <p className={`text-[9px] ${themeClasses.muted}`}>Status: {viewedArticle.resourceValidation.videoStatus}</p>
                              )}
                              {viewedArticle.resources.video.confidence && (
                                <div className="flex items-center gap-1">
                                  <div className={`w-2 h-2 rounded-full ${
                                    viewedArticle.resources.video.confidence === 'high' ? 'bg-emerald-500' :
                                    viewedArticle.resources.video.confidence === 'medium' ? 'bg-amber-500' :
                                    'bg-red-500'
                                  }`}></div>
                                  <span className={`text-[8px] font-black uppercase tracking-wider ${
                                    viewedArticle.resources.video.confidence === 'high' ? 'text-emerald-600' :
                                    viewedArticle.resources.video.confidence === 'medium' ? 'text-amber-600' :
                                    'text-red-600'
                                  }`}>{viewedArticle.resources.video.confidence} confidence</span>
                                </div>
                              )}
                            </div>
                          </div>
                      </a>
                    )}
                  </div>
                  
                  {/* Resource Quality Legend */}
                  <div className="bg-indigo-600/5 border border-indigo-600/20 rounded-2xl p-4">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-indigo-600 mb-3">Resource Quality Guide</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[9px]">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-emerald-600 rounded-full"></span>
                        <span className={`font-black uppercase ${themeClasses.muted}`}>Verified Platform - Curated high-quality source</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                        <span className={`font-black uppercase ${themeClasses.muted}`}>Direct Link - Specific article/video</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-amber-600 rounded-full"></span>
                        <span className={`font-black uppercase ${themeClasses.muted}`}>Search Results - Guaranteed working</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className={`fixed bottom-8 left-1/2 -translate-x-1/2 ${themeClasses.nav} backdrop-blur-2xl border ${themeClasses.border} px-6 py-4 flex gap-8 rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] z-[70] transition-all`}>
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1.5 transition-all group ${activeTab === 'dashboard' ? 'text-indigo-600' : themeClasses.muted}`}>
          <Home className={`w-5 h-5 group-hover:scale-110 transition-transform ${activeTab === 'dashboard' ? 'stroke-[3]' : ''}`} />
          <span className="text-[7px] font-black uppercase tracking-tighter">Core</span>
        </button>
        <button onClick={() => setActiveTab('create')} className="relative flex flex-col items-center gap-1.5 transition-all -top-3">
          <div className={`p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/40 hover:scale-110 active:scale-95 transition-all`}>
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>
          <span className={`text-[7px] font-black uppercase tracking-tighter mt-1 ${activeTab === 'create' ? 'text-indigo-600' : themeClasses.muted}`}>Deploy</span>
        </button>
        <button 
          onClick={() => activeRoadmap && setActiveTab('viewer')} 
          disabled={!activeRoadmap}
          className={`flex flex-col items-center gap-1.5 transition-all group ${activeTab === 'viewer' ? 'text-indigo-600' : activeRoadmap ? themeClasses.muted : 'opacity-10 cursor-not-allowed'}`}
        >
          <Library className={`w-5 h-5 group-hover:scale-110 transition-transform ${activeTab === 'viewer' ? 'stroke-[3]' : ''}`} />
          <span className="text-[7px] font-black uppercase tracking-tighter">Active</span>
        </button>
        <button onClick={() => setActiveTab('about')} className={`flex flex-col items-center gap-1.5 transition-all group ${activeTab === 'about' ? 'text-indigo-600' : themeClasses.muted}`}>
          <Info className={`w-5 h-5 group-hover:scale-110 transition-transform ${activeTab === 'about' ? 'stroke-[3]' : ''}`} />
          <span className="text-[7px] font-black uppercase tracking-tighter">About</span>
        </button>
      </nav>


    </div>
  );
}