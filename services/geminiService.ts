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
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
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
