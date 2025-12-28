const rateLimitMap = new Map<string, number>();

function isRateLimited(userId: string, limitMs = 5000) {
  const now = Date.now();
  const last = rateLimitMap.get(userId) || 0;

  if (now - last < limitMs) return true;

  rateLimitMap.set(userId, now);
  return false;
}

async function callGroqAPI(messages: any[], jsonMode: boolean = false) {
  const requestBody: any = {
    model: "llama-3.3-70b-versatile",
    messages: messages,
    temperature: jsonMode ? 0.7 : 0.6,
  };

  if (jsonMode) {
    requestBody.response_format = { type: "json_object" };
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Groq API failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from Groq");

  return content;
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { userId, action, data } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID required" }),
        { status: 400 }
      );
    }

    if (isRateLimited(userId)) {
      return new Response(
        JSON.stringify({ error: "Too many requests" }),
        { status: 429 }
      );
    }

    let result;

    switch (action) {
      case 'generateRoadmap': {
        const { goal, duration, level, language } = data;
        const prompt = `Generate a 7-day-per-week learning roadmap for: "${goal}". Level: ${level}. Duration: ${duration}. Lang: ${language}.
        JSON structure: { "title": string, "months": [{ "name": string, "overview": string, "weeks": [{ "name": string, "weeklyGoal": string, "days": [{ "day": number, "topic": string, "task": string, "completed": boolean }] }] }] }`;
        
        const messages = [
          { role: "system", content: "Valid JSON only. Write in " + language + ". 7 days/week required. Include 'completed: false' for all days." },
          { role: "user", content: prompt }
        ];
        
        const response = await callGroqAPI(messages, true);
        result = JSON.parse(response);
        break;
      }

      case 'generateArticle': {
        const { topic, language } = data;
        const prompt = `Deep article on "${topic}". Write in ${language}. JSON: { "title": string, "summary": string, "sections": [{ "heading": string, "content": string }], "externalResource": { "title": string, "url": string } }`;
        
        const messages = [
          { role: "system", content: "Valid JSON only. Write in " + language },
          { role: "user", content: prompt }
        ];
        
        const response = await callGroqAPI(messages, true);
        result = JSON.parse(response);
        break;
      }

      case 'chat': {
        const { messages } = data;
        const response = await callGroqAPI(messages, false);
        result = { content: response };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400 }
        );
    }

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Groq function error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "AI generation failed" }),
      { status: 500 }
    );
  }
};
