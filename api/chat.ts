// api/chat.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// Vercel (produção) injeta as envs automaticamente.
// Em dev local, use um .env com GEMINI_API_KEY=...
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

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as ChatBody;

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
      return json(
        { ok: false, error: "Corpo inválido. Envie { prompt } ou { messages }." },
        400
      );
    }

    if (!API_KEY) {
      return json(
        {
          ok: false,
          error:
            "GEMINI_API_KEY ausente. Defina em Project → Settings → Environment Variables no Vercel."
        },
        500
      );
    }

    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }]}],
      generationConfig: {
        temperature,
        maxOutputTokens
      }
    });

    const text = result.response.text();

    return json(
      {
        ok: true,
        model: MODEL,
        temperature,
        maxOutputTokens,
        promptPreview: prompt.slice(0, 160),
        text
      },
      200
    );
  } catch (err: any) {
    console.error("[chat] erro:", err);
    return json(
      {
        ok: false,
        error: err?.message ?? "Erro interno"
      },
      500
    );
  }
}

// Utilitário para respostas JSON com CORS básico (caso consuma direto do front)
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Ajuste abaixo conforme sua necessidade de CORS
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "content-type, authorization"
    }
  });
}

// (Opcional) Permite pré-flight CORS simples
export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type, authorization"
    }
  });
}
