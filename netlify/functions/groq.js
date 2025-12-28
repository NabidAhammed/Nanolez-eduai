export default async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const body = await req.json();
    const { payload, systemPrompt } = body;

    // Use .trim() to prevent "Invalid API Key" errors caused by accidental spaces
    const GROQ_API_KEY = process.env.GROQ_API_KEY?.trim();

    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY is missing in Netlify settings" }),
        { status: 500 }
      );
    }

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: payload },
        ],
        temperature: 0.2,
      }),
    });

    const data = await groqResponse.json();

    return new Response(JSON.stringify(data), {
      status: groqResponse.status,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server Error", details: err.message }),
      { status: 500 }
    );
  }
};