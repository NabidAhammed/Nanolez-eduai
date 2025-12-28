// Custom hook for managing roadmaps and articles data

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

export function useData() {
  const [roadmaps, setRoadmaps] = useState<Record<string, Roadmap>>({});
  const [articles, setArticles] = useState<Record<string, Article>>({});
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  // Load data from storage on mount
  useEffect(() => {
    // Load roadmaps
    const savedRoadmaps = storage.getRoadmaps();
    const normalizedRoadmaps: Record<string, Roadmap> = {};
    Object.keys(savedRoadmaps).forEach(id => {
      normalizedRoadmaps[id] = normalizeRoadmap(savedRoadmaps[id]);
    });
    setRoadmaps(normalizedRoadmaps);

    // Load articles
    const savedArticles = storage.getArticles();
    setArticles(savedArticles);

    // Load selected IDs
    setSelectedRoadmapId(storage.getSelectedRoadmapId());
    setSelectedArticleId(storage.getSelectedArticleId());
  }, []);

  // Save roadmaps to storage whenever state changes
  useEffect(() => {
    storage.setRoadmaps(roadmaps);
  }, [roadmaps]);

  // Save articles to storage whenever state changes
  useEffect(() => {
    storage.setArticles(articles);
  }, [articles]);

  // Save selected roadmap ID to storage whenever state changes
  useEffect(() => {
    storage.setSelectedRoadmapId(selectedRoadmapId);
  }, [selectedRoadmapId]);

  // Save selected article ID to storage whenever state changes
  useEffect(() => {
    storage.setSelectedArticleId(selectedArticleId);
  }, [selectedArticleId]);

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
  };
}
