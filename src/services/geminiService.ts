import { Message } from '../types';

// The history needs to be in the format that the Gemini API expects.
// { role: "user" | "model", parts: [{ text: "..." }] }
export interface ApiContent {
    role: 'user' | 'model';
    parts: { text: string }[];
}


export async function streamChatResponse(
  history: Message[],
  message: string,
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
) {
  // Transform our internal Message[] format to the format the API route expects (which is the Gemini format)
  // Exclude messages that are not user or model (e.g. loading messages) and empty ones.
  const apiHistory: ApiContent[] = history
    .filter(msg => (msg.role === 'user' || msg.role === 'model') && msg.content)
    .map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
  }));

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        history: apiHistory,
        message: message,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'API request failed';
      let userMessage = 'Desculpe, ocorreu um erro. Por favor, tente novamente.';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.details || errorMessage;
        // Se o servidor enviou uma mensagem amigável para o usuário, use ela
        if (errorData.userMessage) {
          userMessage = errorData.userMessage;
        }
      } catch (jsonError) {
        // Se não conseguir fazer parse do JSON, usa o status text
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      // Criar um erro customizado que inclui a mensagem amigável
      const customError = new Error(errorMessage) as Error & { userMessage?: string };
      customError.userMessage = userMessage;
      throw customError;
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunkText = decoder.decode(value, { stream: true });
      onChunk(chunkText);
    }
    onComplete();
  } catch (error) {
    onError(error as Error);
  }
}
