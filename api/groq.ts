const rateLimitMap = new Map<string, number>();

function isRateLimited(userId: string, limitMs = 5000) {
  const now = Date.now();
  const last = rateLimitMap.get(userId) || 0;

  if (now - last < limitMs) return true;

  rateLimitMap.set(userId, now);
  return false;
}

function generateMockRoadmap(goal: string, duration: string, level: string, language: string) {
  console.log('🔧 Generating mock roadmap for:', goal);
  return {
    title: `Learning Plan: ${goal}`,
    months: [
      {
        name: "Month 1: Foundation",
        overview: `Start your journey to master ${goal} at ${level} level.`,
        weeks: [
          {
            name: "Week 1: Introduction",
            weeklyGoal: `Get familiar with basic concepts of ${goal}`,
            days: [
              { day: 1, topic: "Getting Started", task: `Read introduction to ${goal}`, completed: false },
              { day: 2, topic: "Basic Concepts", task: "Study fundamental principles", completed: false },
              { day: 3, topic: "Tools & Setup", task: "Set up development environment", completed: false },
              { day: 4, topic: "First Steps", task: "Complete your first exercise", completed: false },
              { day: 5, topic: "Practice", task: "Practice basic exercises", completed: false },
              { day: 6, topic: "Review", task: "Review what you've learned", completed: false },
              { day: 7, topic: "Assessment", task: "Take a progress quiz", completed: false }
            ]
          },
          {
            name: "Week 2: Core Concepts",
            weeklyGoal: "Master the essential concepts",
            days: [
              { day: 8, topic: "Advanced Basics", task: "Deep dive into core concepts", completed: false },
              { day: 9, topic: "Problem Solving", task: "Practice problem-solving techniques", completed: false },
              { day: 10, topic: "Implementation", task: "Start implementing solutions", completed: false },
              { day: 11, topic: "Testing", task: "Learn testing methodologies", completed: false },
              { day: 12, topic: "Debugging", task: "Practice debugging skills", completed: false },
              { day: 13, topic: "Optimization", task: "Learn to optimize your work", completed: false },
              { day: 14, topic: "Weekly Review", task: "Comprehensive review", completed: false }
            ]
          }
        ]
      }
    ]
  };
}

function generateMockArticle(topic: string, language: string) {
  console.log('🔧 Generating mock article for:', topic);
  return {
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

async function callGroqAPI(messages: any[], jsonMode: boolean = false) {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ GROQ_API_KEY not found in environment variables');
    throw new Error('API key not configured');
  }

  const requestBody: any = {
    model: "llama-3.3-70b-versatile",
    messages: messages,
    temperature: jsonMode ? 0.7 : 0.6,
  };

  if (jsonMode) {
    requestBody.response_format = { type: "json_object" };
  }

  console.log('📡 Calling Groq API...');
  
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Groq API error:', response.status, response.statusText, errorText);
    throw new Error(`Groq API failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from Groq");

  console.log('✅ Groq API response received');
  return content;
}

export default async (req: Request) => {
  const timestamp = new Date().toISOString();
  console.log(`🚀 Groq API called at ${timestamp}`, {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method Not Allowed" }),
      { 
        status: 405,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const requestBody = await req.json();
    const { userId, action, data } = requestBody;

    console.log('📝 Request details:', { userId, action, data });

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID required" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    if (isRateLimited(userId)) {
      return new Response(
        JSON.stringify({ error: "Too many requests" }),
        { 
          status: 429,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    let result;

    try {
      switch (action) {
        case 'generateRoadmap': {
          const { goal, duration, level, language } = data;
          console.log('🗺️ Generating roadmap...', { goal, duration, level, language });
          
          const prompt = `Generate a 7-day-per-week learning roadmap for: "${goal}". Level: ${level}. Duration: ${duration}. Lang: ${language}.
          JSON structure: { "title": string, "months": [{ "name": string, "overview": string, "weeks": [{ "name": string, "weeklyGoal": string, "days": [{ "day": number, "topic": string, "task": string, "completed": boolean }] }] }] }`;
          
          const messages = [
            { role: "system", content: "Valid JSON only. Write in " + language + ". 7 days/week required. Include 'completed: false' for all days." },
            { role: "user", content: prompt }
          ];
          
          const response = await callGroqAPI(messages, true);
          result = JSON.parse(response);
          console.log('✅ Roadmap generated successfully');
          break;
        }

        case 'generateArticle': {
          const { topic, language } = data;
          console.log('📚 Generating article...', { topic, language });
          
          const prompt = `Deep article on "${topic}". Write in ${language}. JSON: { "title": string, "summary": string, "sections": [{ "heading": string, "content": string }], "externalResource": { "title": string, "url": string } }`;
          
          const messages = [
            { role: "system", content: "Valid JSON only. Write in " + language },
            { role: "user", content: prompt }
          ];
          
          const response = await callGroqAPI(messages, true);
          result = JSON.parse(response);
          console.log('✅ Article generated successfully');
          break;
        }

        case 'chat': {
          const { messages } = data;
          console.log('💬 Chat request...');
          
          const response = await callGroqAPI(messages, false);
          result = { content: response };
          console.log('✅ Chat response generated');
          break;
        }

        default:
          return new Response(
            JSON.stringify({ error: "Invalid action" }),
            { 
              status: 400,
              headers: { "Content-Type": "application/json" }
            }
          );
      }
    } catch (apiError) {
      console.error('❌ API Error, falling back to mock data:', apiError);
      
      // Fallback to mock data when API fails
      switch (action) {
        case 'generateRoadmap': {
          const { goal, duration, level, language } = data;
          result = generateMockRoadmap(goal, duration, level, language);
          break;
        }
        case 'generateArticle': {
          const { topic, language } = data;
          result = generateMockArticle(topic, language);
          break;
        }
        case 'chat': {
          result = { content: "I'm sorry, I'm having trouble connecting to the AI service right now. Please try again later." };
          break;
        }
        default:
          throw apiError;
      }
    }

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("💥 Groq function error:", err);
    
    return new Response(
      JSON.stringify({ 
        error: err instanceof Error ? err.message : "AI generation failed",
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
