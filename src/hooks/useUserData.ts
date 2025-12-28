

// Custom hook for managing user-specific roadmaps and articles data

import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { Roadmap, Article, Day } from '../types';

// Function to normalize roadmap data and ensure all tasks have proper structure
const normalizeRoadmap = (roadmap: Roadmap): Roadmap => {
  if (!roadmap.months) return roadmap;
  
  return {
    ...roadmap,
    months: roadmap.months.map((month) => ({
      ...month,
      weeks: month.weeks.map((week) => ({
        ...week,
        days: week.days.map((day: Day) => ({
          ...day,
          completed: day.completed || false, // Ensure completed is boolean
          articleId: day.articleId || null   // Ensure articleId exists
        }))
      }))
    }))
  };
};

export function useUserData(email: string) {
  const [roadmaps, setRoadmaps] = useState<Record<string, Roadmap>>({});
  const [articles, setArticles] = useState<Record<string, Article>>({});
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [appLanguage, setAppLanguage] = useState('English');

  // Load data from storage when email changes
  useEffect(() => {
    if (!email) return;

    // Load user-specific roadmaps
    const savedRoadmaps = storage.getUserRoadmaps(email);
    const normalizedRoadmaps: Record<string, Roadmap> = {};
    Object.keys(savedRoadmaps).forEach(id => {
      normalizedRoadmaps[id] = normalizeRoadmap(savedRoadmaps[id]);
    });
    setRoadmaps(normalizedRoadmaps);

    // Load user-specific articles
    const savedArticles = storage.getUserArticles(email);
    setArticles(savedArticles);

    // Load user-specific selected IDs
    setSelectedRoadmapId(storage.getUserSelectedRoadmapId(email));
    setSelectedArticleId(storage.getUserSelectedArticleId(email));

    // Load user-specific theme and language
    setTheme(storage.getUserTheme(email));
    setAppLanguage(storage.getUserLanguage(email));
  }, [email]);

  // Save roadmaps to storage whenever state changes
  useEffect(() => {
    if (email) {
      storage.setUserRoadmaps(email, roadmaps);
    }
  }, [roadmaps, email]);

  // Save articles to storage whenever state changes
  useEffect(() => {
    if (email) {
      storage.setUserArticles(email, articles);
    }
  }, [articles, email]);

  // Save selected roadmap ID to storage whenever state changes
  useEffect(() => {
    if (email) {
      storage.setUserSelectedRoadmapId(email, selectedRoadmapId);
    }
  }, [selectedRoadmapId, email]);

  // Save selected article ID to storage whenever state changes
  useEffect(() => {
    if (email) {
      storage.setUserSelectedArticleId(email, selectedArticleId);
    }
  }, [selectedArticleId, email]);

  // Save theme to storage whenever state changes
  useEffect(() => {
    if (email) {
      storage.setUserTheme(email, theme);
    }
  }, [theme, email]);

  // Save language to storage whenever state changes
  useEffect(() => {
    if (email) {
      storage.setUserLanguage(email, appLanguage);
    }
  }, [appLanguage, email]);

  // Roadmap operations
  const addRoadmap = (roadmap: Roadmap) => {
    setRoadmaps(prev => ({ ...prev, [roadmap.id]: roadmap }));
  };

  const removeRoadmap = (id: string) => {
    setRoadmaps(prev => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    if (selectedRoadmapId === id) {
      setSelectedRoadmapId(null);
    }
  };

  const updateRoadmap = (id: string, updates: Partial<Roadmap>) => {
    setRoadmaps(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  };

  const toggleTask = (roadmapId: string, monthIndex: number, weekIndex: number, dayIndex: number) => {
    setRoadmaps(prev => {
      const rm = { ...prev[roadmapId] };
      rm.months[monthIndex].weeks[weekIndex].days[dayIndex].completed = 
        !rm.months[monthIndex].weeks[weekIndex].days[dayIndex].completed;
      
      // Recalculate progress
      let total = 0, completed = 0;
      rm.months.forEach((month) => 
        month.weeks.forEach((week) => 
          week.days.forEach((day) => { 
            total++; 
            if (day.completed) completed++; 
          })
        )
      );
      rm.progress = Math.round((completed / total) * 100);
      
      return { ...prev, [roadmapId]: rm };
    });
  };

  // Article operations
  const addArticle = (article: Article) => {
    setArticles(prev => ({ ...prev, [article.id]: article }));
  };

  const removeArticle = (id: string) => {
    setArticles(prev => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    if (selectedArticleId === id) {
      setSelectedArticleId(null);
    }
  };

  const updateArticle = (id: string, updates: Partial<Article>) => {
    setArticles(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  };

  // Link article to day task
  const linkArticleToTask = (
    roadmapId: string, 
    monthIndex: number, 
    weekIndex: number, 
    dayIndex: number, 
    articleId: string
  ) => {
    setRoadmaps(prev => {
      const rm = { ...prev[roadmapId] };
      rm.months[monthIndex].weeks[weekIndex].days[dayIndex].articleId = articleId;
      return { ...prev, [roadmapId]: rm };
    });
  };

  return {
    // State
    roadmaps,
    articles,
    selectedRoadmapId,
    selectedArticleId,
    theme,
    appLanguage,
    
    // Roadmap operations
    addRoadmap,
    removeRoadmap,
    updateRoadmap,
    toggleTask,
    setSelectedRoadmapId,
    
    // Article operations
    addArticle,
    removeArticle,
    updateArticle,
    setSelectedArticleId,
    linkArticleToTask,
    
    // Theme and language operations
    setTheme,
    setAppLanguage,
  };
}

