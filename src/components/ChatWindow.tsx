import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Role } from '../types';
import { streamChatResponse } from '../services/geminiService';
import MessageItem from './MessageItem';
import ChatInput from './ChatInput';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mldprano';

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const icebreakers = [
    'Preciso vender mais.',
    'Não consigo atrair clientes.',
    'Meu site não gera resultados.',
    'Minhas redes sociais são fracas.',
    'Quero um orçamento.',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
    
    const previousMessages = messages;
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const delay = Math.random() * (1200 - 500) + 500;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    let text = '';
    const modelMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMessageId, role: Role.MODEL, content: '' }]);

    const onChunk = (chunkText: string) => {
        text += chunkText;
        
        // Processa o texto em tempo real para ocultar completamente o JSON e tags especiais
        let displayText = text;
        
        // Remove JSON do lead (incluindo tags incompletas durante streaming)
        const leadDataRegex = /\[LEAD_DATA_JSON\][\s\S]*?(\[\/LEAD_DATA_JSON\]|$)/;
        displayText = displayText.replace(leadDataRegex, '').trim();
        
        // Remove qualquer fragmento de JSON que possa aparecer
        const jsonFragmentRegex = /```json[\s\S]*?(```|$)/g;
        displayText = displayText.replace(jsonFragmentRegex, '').trim();
        
        // Remove tags de botões
        const buttonRegex = /\[BUTTON: (.*?)\]/g;
        displayText = displayText.replace(buttonRegex, '').trim();
        
        // Remove tag de agendamento
        displayText = displayText.replace('[ACTION_SCHEDULE]', '').trim();
        
        // Remove qualquer linha que contenha estrutura JSON visível
        const jsonLineRegex = /.*"(name|email|company|whatsapp|industry|targetClient|position|summary)".*\n?/g;
        displayText = displayText.replace(jsonLineRegex, '').trim();
        
        setMessages(prev => prev.map(msg => 
          msg.id === modelMessageId ? { ...msg, content: displayText } : msg
        ));
    };

    const onComplete = () => {
        setMessages(prev => prev.map(msg => {
            if (msg.id === modelMessageId) {
                let processedText = text;
                
                // Processa e extrai dados do lead para envio ao Formspree
                const leadDataRegex = /\[LEAD_DATA_JSON\]([\s\S]*?)\[\/LEAD_DATA_JSON\]/;
                const leadDataMatch = processedText.match(leadDataRegex);
                if (leadDataMatch && leadDataMatch[1]) {
                    try {
                        const leadData = JSON.parse(leadDataMatch[1]);
                        submitLeadData(leadData);
                    } catch (e) { console.error("Failed to parse lead data JSON", e); }
                }
                
                // Remove completamente qualquer vestígio de JSON
                processedText = processedText.replace(leadDataRegex, '').trim();
                
                // Remove fragmentos de JSON que possam ter escapado
                const jsonFragmentRegex = /```json[\s\S]*?```/g;
                processedText = processedText.replace(jsonFragmentRegex, '').trim();
                
                // Remove linhas com estrutura JSON
                const jsonLineRegex = /.*"(name|email|company|whatsapp|industry|targetClient|position|summary)".*\n?/g;
                processedText = processedText.replace(jsonLineRegex, '').trim();

                // Processa botões para quick replies
                const buttonRegex = /\[BUTTON: (.*?)\]/g;
                const quickReplies = [...processedText.matchAll(buttonRegex)].map(match => match[1]);
                processedText = processedText.replace(buttonRegex, '').trim();

                // Verifica se há ação de agendamento
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

    const onError = (error: Error & { userMessage?: string }) => {
        console.error('Error sending message:', error);
        
        // Usar a mensagem amigável do servidor se disponível, senão usar mensagem padrão
        const displayMessage = error.userMessage || "Desculpe, ocorreu um erro. Por favor, tente novamente.";
        
        setMessages(prev => prev.map(msg => msg.id === modelMessageId 
            ? {
                id: modelMessageId,
                role: Role.MODEL,
                content: displayMessage,
              } 
            : msg
        ));
        setIsLoading(false);
    };

    await streamChatResponse(previousMessages, inputText, onChunk, onComplete, onError);

  }, [messages]);
  
  const handleQuickReplyClick = (text: string) => {
    setMessages(prev => prev.map(m => ({ ...m, quickReplies: undefined })));
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

        {messages.length === 0 && !isLoading && (
          <div>
            <div className="text-left mb-4">
                <p className="text-gray-600">Olá, sou o Curumim, consultor especializado da OCA. Pra começar, me diz: qual o principal desafio que você está enfrentando no seu negócio? Ou se preferir, escolha uma das opções abaixo:</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {icebreakers.map((text, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReplyClick(text)}
                  className="border border-[#B81647] text-[#B81647] px-4 py-2 rounded-full hover:bg-[#B81647] hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && messages[messages.length-1]?.role === Role.USER && (
           <MessageItem message={{id: 'loading', role: Role.MODEL, content: '...'}} />
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatWindow;
