// Vercel API function for Groq AI integration
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// Ensure fetch is available (Node.js 18+)
if (!(global as any).fetch) {
  console.warn('⚠️  Fetch not available, please use Node.js 18+ or install node-fetch');
  (global as any).fetch = async function(_url: string, _options: unknown) {
    throw new Error('Fetch not available - please use Node.js 18+ or install node-fetch');
  };
}

// Generate a UUID that's compatible across environments
function generateUUID(): string {
  try {
    if (crypto && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
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
      console.error('❌ GROQ_API_KEY environment variable is required');
      res.status(500).json({ 
        error: 'Configuration error',
        message: 'GROQ_API_KEY environment variable is not configured. Please set up your Groq API key.'
      });
      return;
    }

    switch (action) {
      case 'generateRoadmap': {
        const roadmap = await generateRoadmapWithGroq(data, groqApiKey);
        console.log('✅ Generated AI roadmap');
        res.status(200).json({ result: roadmap });
        break;
      }

      case 'generateArticle': {
        const article = await generateArticleWithGroq(data, groqApiKey);
        console.log('✅ Generated AI article');
        res.status(200).json({ result: article });
        break;
      }

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
async function generateRoadmapWithGroq(data: Record<string, unknown>, apiKey: string) {
  const { goal, duration, level, language } = data as { goal: string; duration: string; level: string; language: string };
  
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
    throw new Error(`Failed to generate roadmap: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate article using Groq AI
async function generateArticleWithGroq(data: Record<string, unknown>, apiKey: string) {
  const { topic, language } = data as { topic: string; language: string };
  
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
    throw new Error(`Failed to generate article: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


