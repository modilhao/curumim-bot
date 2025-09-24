import React from 'react';
import { Message, Role } from '../types';

interface MessageItemProps {
  message: Message;
  isLastMessage?: boolean;
  onQuickReplyClick?: (text: string) => void;
}

const renderFormattedText = (text: string) => {
  const formattedText = text
    // Replace markdown-style bold with <strong> tags containing a Tailwind class for styling
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Replace markdown-style bullet points (* or -) with HTML bullet entities
    // Handles bullets at the start of the string or after a newline
    .replace(/^(\s*)[*-]\s/gm, '$1&bull; ');
  return { __html: formattedText };
};


const MessageItem: React.FC<MessageItemProps> = ({ message, isLastMessage, onQuickReplyClick }) => {
  const isUser = message.role === Role.USER;
  
  if (message.id === 'loading') {
    return (
      <div className="flex justify-start">
        <div className="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-lg">
          <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    );
  }

  // Do not render empty messages from the model
  if (message.role === Role.MODEL && !message.content?.trim() && !message.quickReplies) {
    return null;
  }

  const messageClass = isUser
    ? 'bg-[#B81647] text-white self-end'
    : 'bg-gray-200 text-gray-800 self-start';

  const containerClass = isUser ? 'justify-end' : 'justify-start';

  const handleScheduleClick = () => {
    window.open('https://calendly.com/agencia-oca/conversa-estrategica', '_blank');
  }

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`p-3 rounded-lg max-w-lg flex flex-col ${messageClass}`}>
        <p
          className="whitespace-pre-wrap"
          dangerouslySetInnerHTML={renderFormattedText(message.content)}
        ></p>
        {message.isSchedulingAction && (
          <button
            onClick={handleScheduleClick}
            className="mt-3 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200"
          >
            Agendar Chamada Estratégica
          </button>
        )}
      </div>
      {isLastMessage && message.quickReplies && message.quickReplies.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 max-w-lg" style={{ justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
          {message.quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => onQuickReplyClick?.(reply)}
              className="border border-[#B81647] text-[#B81647] px-4 py-2 rounded-full bg-white hover:bg-[#B81647] hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              {reply}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageItem;