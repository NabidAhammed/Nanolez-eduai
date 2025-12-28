// Application constants

export const SUPPORTED_LANGUAGES = [
  "English", 
  "Spanish", 
  "French", 
  "German", 
  "Hindi", 
  "Bengali", 
  "Japanese", 
  "Chinese", 
  "Arabic", 
  "Portuguese"
] as const;

export const LOCAL_STORAGE_KEYS = {
  USER_ID: 'nano-user-id',
  USER_SESSION: 'nano-user-session',
  USER_DATA_PREFIX: 'nano-user-data-',
  THEME: 'nano-theme',
  LANGUAGE: 'nano-language',
  ROADMAPS: 'nano-roadmaps',
  ARTICLES: 'nano-articles',
  SELECTED_ROADMAP_ID: 'nano-selected-roadmap-id',
  SELECTED_ARTICLE_ID: 'nano-selected-article-id',
} as const;

export const API_ENDPOINTS = {
  GROQ_FUNCTION: '/.netlify/functions/groq',
} as const;

export const THEME_STORAGE_KEY = LOCAL_STORAGE_KEYS.THEME;
export const DEFAULT_THEME: 'light' | 'dark' = 'light';
export const DEFAULT_LANGUAGE = 'English';

export const GROQ_ACTIONS = {
  GENERATE_ROADMAP: 'generateRoadmap',
  GENERATE_ARTICLE: 'generateArticle',
  CHAT: 'chat',
} as const;
