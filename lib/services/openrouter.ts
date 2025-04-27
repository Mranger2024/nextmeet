import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "",
        "X-Title": process.env.NEXT_PUBLIC_SITE_NAME || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-pro-exp-02-05:free",
        messages: messages.map((msg) => ({
          role: msg.role,
          content: [{ type: "text", text: msg.content }],
        })),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle quota exceeded and other errors
      if (data.error) {
        return res.status(response.status).json({
          error: {
            message: data.error.message || 'API Error',
            code: response.status,
            metadata: data.error.metadata || {}
          }
        });
      }
      throw new Error(`API Error: ${response.statusText}`);
    }

    // Handle successful response
    if (data.choices?.[0]?.message?.content) {
      return res.status(200).json({
        message: typeof data.choices[0].message.content === 'string' 
          ? data.choices[0].message.content
          : data.choices[0].message.content[0]?.text || 'No response from AI.'
      });
    }

    throw new Error('Invalid response format from API');
  } catch (error) {
    console.error("Chat API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
