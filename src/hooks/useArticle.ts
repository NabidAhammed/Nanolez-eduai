// Custom hook for article operations

import { useState } from 'react';
import { generateArticle } from '../utils/api';
import { storage } from '../utils/storage';
import { Article } from '../types';

export function useArticle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [genId, setGenId] = useState<string | null>(null);

  const generateNewArticle = async (
    topic: string,
    language: string,
    onSuccess: (article: Article, articleId: string) => void,
    monthIndex?: number,
    weekIndex?: number,
    dayIndex?: number
  ) => {
    const taskId = monthIndex !== undefined && weekIndex !== undefined && dayIndex !== undefined 
      ? `${monthIndex}-${weekIndex}-${dayIndex}` 
      : null;

    if (taskId) {
      setGenId(taskId);
    }
    setLoading(true);
    setError(null);
    
    try {
      const userId = storage.getUserId();
      const data = await generateArticle(topic, language, userId);
      const id = crypto.randomUUID();
      
      const newArticle: Article = {
        ...data,
        id
      };
      
      onSuccess(newArticle, id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate article';
      setError(errorMessage);
      console.error('Error generating article:', err);
    } finally {
      setLoading(false);
      if (taskId) {
        setGenId(null);
      }
    }
  };

  const openExternalResource = (article: Article) => {
    if (!article.externalResource) {
      alert('No external resource available for this article.');
      return;
    }

    const externalResource = article.externalResource;
    // Check URL field first (as per groq function specification), then fallbacks
    let url = externalResource.url || externalResource.uri || externalResource.link || externalResource.href || externalResource.source;
    
    if (url && url.trim()) {
      try {
        // Ensure URL has protocol
        let formattedUrl = url.trim();
        if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
          formattedUrl = 'https://' + formattedUrl;
        }
        window.open(formattedUrl, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error('Error opening external resource:', error);
        alert('Unable to open the external resource. Please try copying the URL manually: ' + url);
      }
    } else {
      console.error('External resource URL missing or empty:', externalResource);
      alert('External resource URL is not available or empty.\n\nDebug Info:\n' + JSON.stringify(externalResource, null, 2) + '\n\nAvailable fields: ' + Object.keys(externalResource || {}).join(', '));
    }
  };

  return {
    loading,
    error,
    genId,
    generateNewArticle,
    openExternalResource,
  };
}
