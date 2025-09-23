// netlify/functions/chat.ts
import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Netlify injeta as variáveis de ambiente automaticamente
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("[chat] GEMINI_API_KEY não encontrado nas variáveis de ambiente.");
}

const genAI = new GoogleGenerativeAI(API_KEY ?? "");
const MODEL = "gemini-1.5-flash"; // troque para "gemini-1.5-pro" se quiser respostas mais profundas

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ChatBody =
  | { prompt: string; temperature?: number; maxOutputTokens?: number }
  | { messages: ChatMessage[]; temperature?: number; maxOutputTokens?: number };

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Headers CORS
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: "",
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ ok: false, error: "Método não permitido" }),
    };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ ok: false, error: "Corpo da requisição vazio" }),
      };
    }

    const body = JSON.parse(event.body) as ChatBody;

    const temperature =
      typeof (body as any).temperature === "number" ? (body as any).temperature : 0.7;
    const maxOutputTokens =
      typeof (body as any).maxOutputTokens === "number" ? (body as any).maxOutputTokens : 1024;

    // Normaliza para um único prompt
    let prompt = "";
    if ("prompt" in body && typeof body.prompt === "string") {
      prompt = body.prompt;
    } else if ("messages" in body && Array.isArray(body.messages)) {
      // Concatena mensagens em um contexto simples
      const system = body.messages
        .filter((m) => m.role === "system")
        .map((m) => m.content)
        .join("\n");
      const userTurns = body.messages
        .filter((m) => m.role !== "system")
        .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n");

      prompt = [system ? `SYSTEM: ${system}` : "", userTurns].filter(Boolean).join("\n");
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          ok: false,
          error: "Corpo inválido. Envie { prompt } ou { messages }.",
        }),
      };
    }

    if (!API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          ok: false,
          error: "GEMINI_API_KEY ausente. Defina nas variáveis de ambiente do Netlify.",
        }),
      };
    }

    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens,
      },
    });

    const text = result.response.text();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        model: MODEL,
        temperature,
        maxOutputTokens,
        promptPreview: prompt.slice(0, 160),
        text,
      }),
    };
  } catch (err: any) {
    console.error("[chat] erro:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        ok: false,
        error: err?.message ?? "Erro interno",
      }),
    };
  }
};

export { handler };