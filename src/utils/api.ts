// API utilities for Groq function calls

import { API_ENDPOINTS, GROQ_ACTIONS } from '../constants';
import { Roadmap, Article } from '../types';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function callGroqFunction(userId: string, action: string, data: any): Promise<any> {
  let delay = 1000;
  const maxRetries = 5;

  for (let i = 0; i < maxRetries; i++) {
    try {
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
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || 'Function call failed', 
          response.status
        );
      }
      
      const result = await response.json();
      return result.result;
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

// API functions
export async function generateRoadmap(
  goal: string, 
  duration: string, 
  level: string, 
  language: string, 
  userId: string
): Promise<Roadmap> {
  return callGroqFunction(userId, GROQ_ACTIONS.GENERATE_ROADMAP, {
    goal,
    duration,
    level,
    language
  });
}

export async function generateArticle(
  topic: string, 
  language: string, 
  userId: string
): Promise<Article> {
  return callGroqFunction(userId, GROQ_ACTIONS.GENERATE_ARTICLE, {
    topic,
    language
  });
}

export async function chatWithAI(
  messages: any[], 
  userId: string
): Promise<{ content: string }> {
  return callGroqFunction(userId, GROQ_ACTIONS.CHAT, {
    messages
  });
}
