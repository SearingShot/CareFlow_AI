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
    <div
      className={`flex items-start gap-3 ${
        isUser ? 'flex-row-reverse' : ''
      }`}
    >
      {/* Avatar */}
      <div
        className="
          message-avatar
          mt-1
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-full
        "
        data-role={isUser ? 'user' : 'assistant'}
      >
        <span
          className="text-[11px] font-semibold tracking-wide"
          style={{
            color: isUser
              ? '#B7C0CC'
              : '#CBCBCB',
          }}
        >
          {isUser ? 'YOU' : 'AI'}
        </span>
      </div>

      {/* Content */}
      <div
        className={`
          flex
          w-full
          flex-col
          gap-2
          ${isUser ? 'items-end' : 'items-start'}
        `}
      >
        <div
          className="
            message-bubble
            whitespace-pre-wrap
            px-5
            py-4
            text-[14px]
            leading-[1.8]
          "
          style={{
            maxWidth: '78%',
            borderRadius: isUser
              ? '20px 20px 8px 20px'
              : '20px 20px 20px 8px',

            color: isUser
              ? '#E6EAF0'
              : '#F1F3F6',
          }}
          data-role={isUser ? 'user' : 'assistant'}
        >
          {message.content}
        </div>

        {/* Tool Activity */}
        {message.toolActivity && (
          <div className="mt-1 w-full max-w-[560px]">
            <ToolActivityCard activity={message.toolActivity} />
          </div>
        )}

        {/* Time */}
        <span
          className="px-1 text-[10px]"
          style={{
            color: 'var(--color-text-muted)',
          }}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}