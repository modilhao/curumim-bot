import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Content } from '@google/genai';
import { Message, Role } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';
import MessageItem from './MessageItem';
import ChatInput from './ChatInput';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mldprano';

const ICEBREAKERS = [
  'Preciso vender mais.',
  'Não consigo atrair clientes.',
  'Meu site não gera resultados.',
  'Minhas redes sociais são fracas.',
  'Quero um orçamento.',
];

const INITIAL_GREETING = "Olá, sou o Curumim, consultor especializado da OCA. Pra começar, me diz: qual o principal desafio que você está enfrentando no seu negócio? Ou se preferir, escolha uma das opções abaixo:";

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-0',
      role: Role.MODEL,
      content: INITIAL_GREETING,
      quickReplies: ICEBREAKERS,
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const submitLeadData = async (data: any) => {
    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        console.error('Failed to submit lead data to Formspree.');
      }
    } catch (error) {
      console.error('Error submitting lead data:', error);
    }
  };

  const handleSendMessage = useCallback(async (inputText: string) => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: inputText,
    };
    
    // Hide quick replies from previous message
    const previousMessages = messages.map(m => ({ ...m, quickReplies: undefined }));
    setMessages([...previousMessages, userMessage]);
    setIsLoading(true);
    
    let accumulatedRawText = '';
    const modelMessageId = (Date.now() + 1).toString();
    // Add empty model message placeholder
    setMessages(prev => [...prev, { id: modelMessageId, role: Role.MODEL, content: '' }]);

    const cleanTextForDisplay = (rawText: string) => {
      // This regex removes the JSON block for display purposes during streaming.
      // It matches the opening tag, content, and closing tag (or end of string).
      const leadDataRegex = /\[LEAD_DATA_JSON\][\s\S]*?(\[\/LEAD_DATA_JSON\]|$)/;
      return rawText.replace(leadDataRegex, '').trimStart();
    }

    const onChunk = (chunkText: string) => {
        accumulatedRawText += chunkText;
        const cleanedText = cleanTextForDisplay(accumulatedRawText);
        setMessages(prev => prev.map(msg => 
          msg.id === modelMessageId ? { ...msg, content: cleanedText } : msg
        ));
    };

    const onComplete = () => {
        setMessages(prev => prev.map(msg => {
            if (msg.id === modelMessageId) {
                let processedText = accumulatedRawText; // Use the full raw text for final processing

                const leadDataRegex = /\[LEAD_DATA_JSON\]([\s\S]*?)\[\/LEAD_DATA_JSON\]/;
                const leadDataMatch = processedText.match(leadDataRegex);
                if (leadDataMatch && leadDataMatch[1]) {
                    try {
                        const leadData = JSON.parse(leadDataMatch[1]);
                        submitLeadData(leadData);
                    } catch (e) { console.error("Failed to parse lead data JSON", e); }
                    processedText = processedText.replace(leadDataRegex, '').trim();
                }

                const buttonRegex = /\[BUTTON: (.*?)\]/g;
                const quickReplies = [...processedText.matchAll(buttonRegex)].map(match => match[1]);
                processedText = processedText.replace(buttonRegex, '').trim();

                const hasAction = processedText.includes('[ACTION_SCHEDULE]');
                processedText = processedText.replace('[ACTION_SCHEDULE]', '').trim();
                
                return { 
                    ...msg, 
                    content: processedText, 
                    isSchedulingAction: hasAction,
                    quickReplies: quickReplies.length > 0 ? quickReplies : undefined
                };
            }
            return msg;
        }));
        setIsLoading(false);
    }

    const onError = (error: Error) => {
        console.error('Error sending message:', error);
        let errorMessage = "Desculpe, ocorreu um erro. Por favor, tente novamente.";
        if (error.message.includes('API_KEY')) {
            errorMessage = "Erro de configuração: A chave da API não foi encontrada. Entre em contato com o suporte.";
        }
        setMessages(prev => prev.map(msg => msg.id === modelMessageId 
            ? {
                id: modelMessageId,
                role: Role.MODEL,
                content: errorMessage,
              } 
            : msg
        ));
        setIsLoading(false);
    };

    try {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set.");
        }
      
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const apiHistory: Content[] = previousMessages
            .filter(msg => (msg.role === Role.USER || msg.role === Role.MODEL) && msg.content)
            .map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }],
            }));

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { 
              systemInstruction: SYSTEM_INSTRUCTION,
              thinkingConfig: { thinkingBudget: 0 } 
            },
            history: apiHistory,
        });
      
        const stream = await chat.sendMessageStream({ message: inputText });

        for await (const chunk of stream) {
            const chunkText = chunk.text;
            if (chunkText) {
                onChunk(chunkText);
            }
        }
        onComplete();
    } catch (error) {
        onError(error as Error);
    }

  }, [messages]);
  
  const handleQuickReplyClick = (text: string) => {
    handleSendMessage(text);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <MessageItem 
            key={msg.id} 
            message={msg}
            isLastMessage={index === messages.length - 1}
            onQuickReplyClick={handleQuickReplyClick}
          />
        ))}

        {isLoading && !messages.find(m => m.id.toString().startsWith('initial') && m.role === Role.MODEL && m.content === '') && (
           <MessageItem message={{id: 'loading', role: Role.MODEL, content: '...'}} />
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput ref={inputRef} onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatWindow;