
// Local storage utilities

import { LOCAL_STORAGE_KEYS } from '../constants';
import { Roadmap, Article, UserSession, UserData } from '../types';

export const storage = {
  // Generic storage functions
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      
      // First, try to parse as JSON
      if (item.trim().startsWith('{') || item.trim().startsWith('[')) {
        try {
          return JSON.parse(item);
        } catch (jsonError) {
          // If JSON parsing fails, fall through to handle as plain string
          console.warn(`JSON parse failed for key "${key}", treating as plain string:`, jsonError);
        }
      }
      
      // Handle as plain string
      if (typeof defaultValue === 'string' || (defaultValue === null && item)) {
        return item as T;
      }
      
      // For other types (like objects), try to migrate
      console.log(`Migrating localStorage key "${key}" from plain string to JSON format`);
      try {
        localStorage.setItem(key, JSON.stringify(item));
        return JSON.parse(JSON.stringify(item));
      } catch (migrationError) {
        console.error(`Migration failed for key "${key}":`, migrationError);
        return defaultValue;
      }
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  // Clear all localStorage data to start fresh
  clearAll: (): void => {
    try {
      Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('All localStorage data cleared');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  // Initialize storage with proper data migration
  initialize: (): void => {
    console.log('Initializing localStorage...');
    
    // Clear problematic data first
    const problematicKeys = [
      LOCAL_STORAGE_KEYS.THEME,
      LOCAL_STORAGE_KEYS.LANGUAGE, 
      LOCAL_STORAGE_KEYS.SELECTED_ROADMAP_ID,
      LOCAL_STORAGE_KEYS.SELECTED_ARTICLE_ID,
      LOCAL_STORAGE_KEYS.USER_ID
    ];
    
    problematicKeys.forEach(key => {
      const item = localStorage.getItem(key);
      if (item && !item.trim().startsWith('{') && !item.trim().startsWith('[')) {
        console.log(`Clearing problematic data for key: ${key}`);
        localStorage.removeItem(key);
      }
    });
    
    console.log('localStorage initialization complete');
  },

  // Roadmap-specific storage
  getRoadmaps: (): Record<string, Roadmap> => {
    return storage.get(LOCAL_STORAGE_KEYS.ROADMAPS, {});
  },

  setRoadmaps: (roadmaps: Record<string, Roadmap>): void => {
    storage.set(LOCAL_STORAGE_KEYS.ROADMAPS, roadmaps);
  },

  // Article-specific storage
  getArticles: (): Record<string, Article> => {
    return storage.get(LOCAL_STORAGE_KEYS.ARTICLES, {});
  },

  setArticles: (articles: Record<string, Article>): void => {
    storage.set(LOCAL_STORAGE_KEYS.ARTICLES, articles);
  },

  // Theme storage
  getTheme: (): 'light' | 'dark' => {
    return storage.get(LOCAL_STORAGE_KEYS.THEME, 'light');
  },

  setTheme: (theme: 'light' | 'dark'): void => {
    storage.set(LOCAL_STORAGE_KEYS.THEME, theme);
  },

  // Language storage
  getLanguage: (): string => {
    return storage.get(LOCAL_STORAGE_KEYS.LANGUAGE, 'English');
  },

  setLanguage: (language: string): void => {
    storage.set(LOCAL_STORAGE_KEYS.LANGUAGE, language);
  },

  // User ID storage
  getUserId: (): string => {
    const saved = storage.get(LOCAL_STORAGE_KEYS.USER_ID, '');
    if (saved) return saved;
    
    const newId = crypto.randomUUID();
    storage.set(LOCAL_STORAGE_KEYS.USER_ID, newId);
    return newId;
  },

  // Selected roadmap storage
  getSelectedRoadmapId: (): string | null => {
    return storage.get(LOCAL_STORAGE_KEYS.SELECTED_ROADMAP_ID, null);
  },

  setSelectedRoadmapId: (id: string | null): void => {
    if (id) {
      storage.set(LOCAL_STORAGE_KEYS.SELECTED_ROADMAP_ID, id);
    } else {
      storage.remove(LOCAL_STORAGE_KEYS.SELECTED_ROADMAP_ID);
    }
  },

  // Selected article storage
  getSelectedArticleId: (): string | null => {
    return storage.get(LOCAL_STORAGE_KEYS.SELECTED_ARTICLE_ID, null);
  },

  setSelectedArticleId: (id: string | null): void => {
    if (id) {
      storage.set(LOCAL_STORAGE_KEYS.SELECTED_ARTICLE_ID, id);
    } else {
      storage.remove(LOCAL_STORAGE_KEYS.SELECTED_ARTICLE_ID);
    }
  },

  // User session management
  getCurrentUserSession: (): UserSession | null => {
    return storage.get(LOCAL_STORAGE_KEYS.USER_SESSION, null);
  },

  setCurrentUserSession: (session: UserSession | null): void => {
    if (session) {
      storage.set(LOCAL_STORAGE_KEYS.USER_SESSION, session);
    } else {
      storage.remove(LOCAL_STORAGE_KEYS.USER_SESSION);
    }
  },

  // User-specific data storage
  getUserDataKey: (email: string): string => {
    return `${LOCAL_STORAGE_KEYS.USER_DATA_PREFIX}${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
  },

  getUserData: (email: string): UserData => {
    const userDataKey = storage.getUserDataKey(email);
    const defaultUserData: UserData = {
      roadmaps: {},
      articles: {},
      selectedRoadmapId: null,
      selectedArticleId: null,
      theme: 'light',
      language: 'English'
    };
    return storage.get(userDataKey, defaultUserData);
  },

  setUserData: (email: string, userData: UserData): void => {
    const userDataKey = storage.getUserDataKey(email);
    storage.set(userDataKey, userData);
  },

  // User-specific roadmaps
  getUserRoadmaps: (email: string): Record<string, Roadmap> => {
    const userData = storage.getUserData(email);
    return userData.roadmaps;
  },

  setUserRoadmaps: (email: string, roadmaps: Record<string, Roadmap>): void => {
    const userData = storage.getUserData(email);
    userData.roadmaps = roadmaps;
    storage.setUserData(email, userData);
  },

  // User-specific articles
  getUserArticles: (email: string): Record<string, Article> => {
    const userData = storage.getUserData(email);
    return userData.articles;
  },

  setUserArticles: (email: string, articles: Record<string, Article>): void => {
    const userData = storage.getUserData(email);
    userData.articles = articles;
    storage.setUserData(email, userData);
  },

  // User-specific theme
  getUserTheme: (email: string): 'light' | 'dark' => {
    const userData = storage.getUserData(email);
    return userData.theme;
  },

  setUserTheme: (email: string, theme: 'light' | 'dark'): void => {
    const userData = storage.getUserData(email);
    userData.theme = theme;
    storage.setUserData(email, userData);
  },

  // User-specific language
  getUserLanguage: (email: string): string => {
    const userData = storage.getUserData(email);
    return userData.language;
  },

  setUserLanguage: (email: string, language: string): void => {
    const userData = storage.getUserData(email);
    userData.language = language;
    storage.setUserData(email, userData);
  },

  // User-specific selected roadmap
  getUserSelectedRoadmapId: (email: string): string | null => {
    const userData = storage.getUserData(email);
    return userData.selectedRoadmapId;
  },

  setUserSelectedRoadmapId: (email: string, id: string | null): void => {
    const userData = storage.getUserData(email);
    userData.selectedRoadmapId = id;
    storage.setUserData(email, userData);
  },

  // User-specific selected article
  getUserSelectedArticleId: (email: string): string | null => {
    const userData = storage.getUserData(email);
    return userData.selectedArticleId;
  },

  setUserSelectedArticleId: (email: string, id: string | null): void => {
    const userData = storage.getUserData(email);
    userData.selectedArticleId = id;
    storage.setUserData(email, userData);
  },
};

// Initialize storage on module load
storage.initialize();
