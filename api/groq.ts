// Vercel API function for Groq AI integration
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// Ensure fetch is available (Node.js 18+)
const globalAny = global as any;
if (!globalAny.fetch) {
  try {
    globalAny.fetch = require('node-fetch');
  } catch (error) {
    console.warn('⚠️  node-fetch not available, using fallback');
    // Simple fetch fallback for older environments
    globalAny.fetch = async function(url: string, options: any) {
      throw new Error('Fetch not available - please use Node.js 18+ or install node-fetch');
    };
  }
}

// Generate a UUID that's compatible across environments
function generateUUID(): string {
  try {
    if (crypto && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch (e) {
    // Fallback to manual UUID generation
  }
  
  // Fallback UUID generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', "true");
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Validate request method
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    console.log('📡 API Request received:', { method: req.method, body: req.body });
    
    // Validate request body
    if (!req.body) {
      res.status(400).json({ error: 'Request body is required' });
      return;
    }

    const { action, data, userId } = req.body;
    
    if (!action || !data) {
      res.status(400).json({ error: 'Action and data are required' });
      return;
    }

    console.log(`🎯 Processing action: ${action} for user: ${userId || 'anonymous'}`);

    const groqApiKey = process.env.GROQ_API_KEY;
    console.log('🔑 API Key status:', groqApiKey ? 'Available' : 'Not found');

    // Check if API key is available
    if (!groqApiKey) {
      console.warn('⚠️  GROQ_API_KEY not found, using fallback responses');
      
      switch (action) {
        case 'generateRoadmap':
          const fallbackRoadmap = generateRoadmapFallback(data);
          console.log('📋 Generated fallback roadmap');
          res.status(200).json({ result: fallbackRoadmap });
          break;

        case 'generateArticle':
          const fallbackArticle = generateArticleFallback(data);
          console.log('📖 Generated fallback article');
          res.status(200).json({ result: fallbackArticle });
          break;

        default:
          res.status(400).json({ error: `Invalid action: ${action}` });
      }
      return;
    }

    switch (action) {
      case 'generateRoadmap':
        const roadmap = await generateRoadmapWithGroq(data, groqApiKey);
        console.log('✅ Generated AI roadmap');
        res.status(200).json({ result: roadmap });
        break;

      case 'generateArticle':
        const article = await generateArticleWithGroq(data, groqApiKey);
        console.log('✅ Generated AI article');
        res.status(200).json({ result: article });
        break;

      default:
        res.status(400).json({ error: `Invalid action: ${action}` });
    }
  } catch (error) {
    console.error('💥 API Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      body: req.body
    });
    
    // Always return a valid JSON response
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

// Generate roadmap using Groq AI
async function generateRoadmapWithGroq(data: any, apiKey: string) {
  const { goal, duration, level, language } = data;
  
  const prompt = `Create a comprehensive learning roadmap for the following:
  Goal: ${goal}
  Duration: ${duration}
  Level: ${level}
  Language: ${language}

Please respond with a JSON object containing exactly this structure:
{
  "title": "Descriptive title for this roadmap",
  "months": [
    {
      "name": "Month name",
      "overview": "Brief overview of this month's goals",
      "weeks": [
        {
          "name": "Week name",
          "weeklyGoal": "Primary goal for this week",
          "days": [
            {
              "day": 1,
              "topic": "Specific learning topic",
              "task": "Detailed task description for practice"
            }
          ]
        }
      ]
    }
  ]
}

Create a realistic ${duration} roadmap with 4 weeks per month, 7 days per week. Make the content specific and educational.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator. Always respond with valid JSON only, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;
    
    // Parse the JSON response
    const roadmapData = JSON.parse(content);
    
    // Ensure required structure and add metadata
    return {
      id: generateUUID(),
      title: roadmapData.title || `${goal} Learning Roadmap`,
      goal: goal,
      duration: duration,
      level: level,
      language: language,
      progress: 0,
      months: roadmapData.months || []
    };
  } catch (error) {
    console.error('Groq API Error:', error);
    // Fallback to template-based generation
    return generateRoadmapFallback(data);
  }
}

// Generate article using Groq AI
async function generateArticleWithGroq(data: any, apiKey: string) {
  const { topic, language } = data;
  
  const prompt = `Create a comprehensive educational article about: ${topic}
Language: ${language}

Please respond with a JSON object containing exactly this structure:
{
  "title": "Engaging article title",
  "summary": "Brief summary of the article content",
  "sections": [
    {
      "heading": "Section heading",
      "content": "Detailed section content with explanations and examples"
    }
  ],
  "externalResource": {
    "title": "Helpful resource title",
    "url": "https://example.com/resource",
    "source": "Source name"
  }
}

Create 3-4 substantial sections with detailed, educational content. Include practical examples and explanations.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator. Always respond with valid JSON only, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;
    
    // Parse the JSON response
    const articleData = JSON.parse(content);
    
    // Ensure required structure and add metadata
    return {
      id: generateUUID(),
      title: articleData.title || `${topic} - Comprehensive Guide`,
      summary: articleData.summary || `A detailed guide covering ${topic} with practical examples.`,
      sections: articleData.sections || [],
      externalResource: articleData.externalResource || {
        title: `Learn More About ${topic}`,
        url: "https://www.khanacademy.org/",
        source: "Khan Academy"
      }
    };
  } catch (error) {
    console.error('Groq API Error:', error);
    // Fallback to template-based generation
    return generateArticleFallback(data);
  }
}

// Fallback roadmap generation (when API is unavailable)
function generateRoadmapFallback(data: any) {
  const { goal, duration, level, language } = data;
  
  const monthCount = duration === '1 Month' ? 1 : duration === '3 Months' ? 3 : 6;
  const months = [];
  
  for (let m = 0; m < monthCount; m++) {
    const monthName = `Month ${m + 1}: ${['Foundation', 'Intermediate', 'Advanced', 'Mastery', 'Specialization', 'Expert'][m] || 'Learning'}`;
    const weeks = [];
    
    for (let w = 0; w < 4; w++) {
      const weekName = `Week ${w + 1}`;
      const weeklyGoal = `Build upon previous knowledge and develop ${level.toLowerCase()} skills`;
      const days = [];
      
      for (let d = 0; d < 7; d++) {
        days.push({
          day: d + 1,
          topic: `${goal} - Day ${d + 1}`,
          task: `Complete hands-on practice and exercises for ${goal} concepts`,
          completed: false,
          articleId: null
        });
      }
      
      weeks.push({
        name: weekName,
        weeklyGoal: weeklyGoal,
        days: days
      });
    }
    
    months.push({
      name: monthName,
      overview: `Develop ${level.toLowerCase()} understanding of ${goal}`,
      weeks: weeks
    });
  }
  
  return {
    id: generateUUID(),
    title: `${goal} Learning Roadmap`,
    goal: goal,
    duration: duration,
    level: level,
    language: language,
    progress: 0,
    months: months
  };
}

// Fallback article generation (when API is unavailable)
function generateArticleFallback(data: any) {
  const { topic, language } = data;
  
  return {
    id: generateUUID(),
    title: `${topic} - Comprehensive Guide`,
    summary: `A detailed guide covering ${topic} with practical examples and best practices for ${language} learners.`,
    sections: [
      {
        heading: `Introduction to ${topic}`,
        content: `Welcome to this comprehensive guide on ${topic}. This article will provide you with a solid foundation and practical insights into the subject. We'll explore key concepts, best practices, and real-world applications to help you master ${topic}.`
      },
      {
        heading: "Core Concepts and Fundamentals",
        content: `Understanding the core concepts of ${topic} is essential for building a strong foundation. We'll break down complex ideas into digestible parts, providing clear explanations and practical examples that you can apply in your learning journey.`
      },
      {
        heading: "Practical Applications and Examples",
        content: `Theory is important, but practice makes perfect. In this section, we'll explore real-world applications of ${topic} with concrete examples and case studies that demonstrate how these concepts work in practice.`
      },
      {
        heading: "Advanced Techniques and Best Practices",
        content: `Once you have a grasp of the fundamentals, it's time to explore advanced techniques. We'll cover best practices, common pitfalls to avoid, and expert tips that will help you excel in ${topic}.`
      }
    ],
    externalResource: {
      title: `Learn More About ${topic}`,
      url: "https://www.coursera.org/",
      source: "Coursera - Online Courses"
    }
  };
}
