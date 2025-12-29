// API utilities for Groq function calls

import { API_ENDPOINTS, GROQ_ACTIONS } from '../constants';
import { Roadmap, Article } from '../types';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Browser-compatible UUID generator
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}



async function callGroqFunction(userId: string, action: string, data: any): Promise<any> {
  let delay = 1000;
  const maxRetries = 2; // Further reduced retries for faster response

  console.log(`🚀 API Call: ${action} for user: ${userId}`, data);

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`📡 Attempt ${i + 1}/${maxRetries} for ${action}`);
      
      const response = await fetch(API_ENDPOINTS.GROQ_FUNCTION, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          action,
          data
        })
      });
      
      console.log(`📊 Response status: ${response.status}`);
      
      if (!response.ok) {
        let errorMessage = 'Function call failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
          console.error('❌ API Error Response:', errorData);
        } catch (e) {
          console.error('❌ Failed to parse error response:', e);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new ApiError(errorMessage, response.status);
      }
      
      const result = await response.json();
      console.log('✅ API Success:', result);
      return result.result;
    } catch (e) {
      console.error(`❌ Attempt ${i + 1} failed:`, e);
      
      if (i === maxRetries - 1) {
        // On final attempt, throw the error
        if (e instanceof ApiError) {
          throw e;
        } else if (e instanceof TypeError && e.message.includes('fetch')) {
          throw new ApiError('Network error: Unable to connect to server');
        } else {
          throw new ApiError(e instanceof Error ? e.message : 'Unknown error occurred');
        }
      }
      
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

// API functions with enhanced error handling and logging
export async function generateRoadmap(
  goal: string, 
  duration: string, 
  level: string, 
  language: string, 
  userId: string
): Promise<Roadmap> {
  console.log('🗺️ Starting roadmap generation...');
  try {
    const result = await callGroqFunction(userId, GROQ_ACTIONS.GENERATE_ROADMAP, {
      goal,
      duration,
      level,
      language
    });
    
    // Validate the response structure
    if (!result || !result.title || !result.months) {
      throw new ApiError('Invalid roadmap response structure');
    }
    
    console.log('✅ Roadmap generation completed');
    return result;
  } catch (error) {
    console.error('💥 Roadmap generation failed:', error);
    throw error;
  }
}

export async function generateArticle(
  topic: string, 
  language: string, 
  userId: string
): Promise<Article> {
  console.log('📚 Starting article generation...');
  try {
    const result = await callGroqFunction(userId, GROQ_ACTIONS.GENERATE_ARTICLE, {
      topic,
      language
    });
    
    // Validate the response structure
    if (!result || !result.title || !result.sections) {
      throw new ApiError('Invalid article response structure');
    }
    
    console.log('✅ Article generation completed');
    return result;
  } catch (error) {
    console.error('💥 Article generation failed:', error);
    throw error;
  }
}

export async function chatWithAI(
  messages: any[], 
  userId: string
): Promise<{ content: string }> {
  console.log('💬 Starting chat request...');
  try {
    const result = await callGroqFunction(userId, GROQ_ACTIONS.CHAT, {
      messages
    });
    
    if (!result || typeof result.content !== 'string') {
      throw new ApiError('Invalid chat response structure');
    }
    
    console.log('✅ Chat response completed');
    return result;
  } catch (error) {
    console.error('💥 Chat request failed:', error);
    throw error;
  }
}

// Test API connectivity
export async function testApiConnection(userId: string): Promise<boolean> {
  console.log('🔍 Testing API connection...');
  try {
    await chatWithAI([{ role: 'user', content: 'test' }], userId);
    console.log('✅ API connection test successful');
    return true;
  } catch (error) {
    console.error('❌ API connection test failed:', error);
    return false;
  }
}
