import React from 'react';
import ToolActivityCard from '../activity/ToolActivityCard.jsx';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar icon */}
      <div
        className="message-avatar w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
        data-role={isUser ? 'user' : 'assistant'}
      >
        <span
          className="text-xs font-semibold"
          style={{ color: isUser ? '#a78bfa' : '#00e5ff' }}
        >
          {isUser ? 'U' : 'AI'}
        </span>
      </div>

      {/* Message content */}
      <div className={`flex flex-col gap-1.5 w-full max-w-[88%] md:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className="message-bubble px-4 py-3 text-[14px] leading-6 shadow-sm whitespace-pre-wrap"
          style={{
            borderRadius: isUser ? '16px 16px 5px 16px' : '16px 16px 16px 5px',
            color: isUser ? '#e2e8f0' : '#f0f4f8',
          }}
          data-role={isUser ? 'user' : 'assistant'}
        >
          {message.content}
        </div>

        {/* Tool Activity Card (inline) */}
        {message.toolActivity && (
          <div className="mt-1 w-full max-w-[560px]">
            <ToolActivityCard activity={message.toolActivity} />
          </div>
        )}

        {/* Timestamp */}
        <span
          className="text-[10px] px-1"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
