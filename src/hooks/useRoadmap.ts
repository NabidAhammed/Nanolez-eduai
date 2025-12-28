// Custom hook for roadmap operations

import { useState } from 'react';
import { generateRoadmap } from '../utils/api';
import { storage } from '../utils/storage';
import { Roadmap } from '../types';

export function useRoadmap() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRoadmap = async (
    goal: string,
    duration: string,
    level: string,
    language: string,
    onSuccess: (roadmap: Roadmap) => void
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = storage.getUserId();
      const data = await generateRoadmap(goal, duration, level, language, userId);
      const id = crypto.randomUUID();
      
      // Initialize task completion states and add articleId placeholders
      const initializedData: Roadmap = {
        ...data,
        id,
        progress: 0,
        goal,
        language,
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
      
      onSuccess(initializedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate roadmap';
      setError(errorMessage);
      console.error('Error generating roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createRoadmap,
  };
}
