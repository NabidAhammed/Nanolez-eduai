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

// Local development mock data generators
function generateMockRoadmap(goal: string, duration: string, level: string, language: string): Roadmap {
  console.log('🔧 Generating mock roadmap for local development:', goal);
  return {
    id: generateUUID(),
    title: `Learning Plan: ${goal}`,
    goal: goal,
    duration: duration,
    level: level,
    language: language,
    progress: 0,
    months: [
      {
        name: "Month 1: Foundation",
        overview: `Start your journey to master ${goal} at ${level} level.`,
        weeks: [
          {
            name: "Week 1: Introduction",
            weeklyGoal: `Get familiar with basic concepts of ${goal}`,
            days: [
              { day: 1, topic: "Getting Started", task: `Read introduction to ${goal}`, completed: false, articleId: null },
              { day: 2, topic: "Basic Concepts", task: "Study fundamental principles", completed: false, articleId: null },
              { day: 3, topic: "Tools & Setup", task: "Set up development environment", completed: false, articleId: null },
              { day: 4, topic: "First Steps", task: "Complete your first exercise", completed: false, articleId: null },
              { day: 5, topic: "Practice", task: "Practice basic exercises", completed: false, articleId: null },
              { day: 6, topic: "Review", task: "Review what you've learned", completed: false, articleId: null },
              { day: 7, topic: "Assessment", task: "Take a progress quiz", completed: false, articleId: null }
            ]
          },
          {
            name: "Week 2: Core Concepts",
            weeklyGoal: "Master the essential concepts",
            days: [
              { day: 8, topic: "Advanced Basics", task: "Deep dive into core concepts", completed: false, articleId: null },
              { day: 9, topic: "Problem Solving", task: "Practice problem-solving techniques", completed: false, articleId: null },
              { day: 10, topic: "Implementation", task: "Start implementing solutions", completed: false, articleId: null },
              { day: 11, topic: "Testing", task: "Learn testing methodologies", completed: false, articleId: null },
              { day: 12, topic: "Debugging", task: "Practice debugging skills", completed: false, articleId: null },
              { day: 13, topic: "Optimization", task: "Learn to optimize your work", completed: false, articleId: null },
              { day: 14, topic: "Weekly Review", task: "Comprehensive review", completed: false, articleId: null }
            ]
          }
        ]
      }
    ]
  };
}

function generateMockArticle(topic: string, language: string): Article {
  console.log('🔧 Generating mock article for local development:', topic);
  return {
    id: generateUUID(),
    title: `Understanding ${topic}: A Comprehensive Guide`,
    summary: `This article provides a comprehensive overview of ${topic}, covering key concepts, practical applications, and best practices.`,
    sections: [
      {
        heading: "Introduction to " + topic,
        content: `${topic} is a fundamental concept that plays a crucial role in modern applications. Understanding its core principles is essential for anyone looking to master this field.`
      },
      {
        heading: "Key Concepts",
        content: `The key concepts of ${topic} include understanding the basic principles, implementing best practices, and applying the knowledge in practical scenarios.`
      },
      {
        heading: "Practical Applications",
        content: `In real-world scenarios, ${topic} can be applied to solve various problems and improve efficiency. Here are some practical examples...`
      }
    ],
    externalResource: {
      title: `Learn more about ${topic}`,
      url: `https://example.com/${topic.toLowerCase().replace(/\s+/g, '-')}`
    }
  };
}

async function callGroqFunction(userId: string, action: string, data: any): Promise<any> {
  let delay = 1000;
  const maxRetries = 2; // Further reduced retries for faster response

  console.log(`🚀 API Call: ${action} for user: ${userId}`, data);

  // Check if we're in local development (localhost)
  const isLocalDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (isLocalDevelopment) {
    console.log('🏠 Local development detected, will fallback to mock data');
  }

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
        // On final attempt, check if we should fallback to mock data
        if (isLocalDevelopment || e instanceof ApiError && (e.status === 404 || e.message.includes('Network error'))) {
          console.log('🔧 Falling back to mock data due to API unavailability');
          
          // Fallback to mock data
          switch (action) {
            case 'generateRoadmap': {
              const { goal, duration, level, language } = data;
              return generateMockRoadmap(goal, duration, level, language);
            }
            case 'generateArticle': {
              const { topic, language } = data;
              return generateMockArticle(topic, language);
            }
            case 'chat': {
              return { content: "I'm sorry, I'm having trouble connecting to the AI service right now. Please try again later." };
            }
            default:
              throw new ApiError('Unknown action for mock fallback');
          }
        }
        
        // Throw with detailed error info
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
