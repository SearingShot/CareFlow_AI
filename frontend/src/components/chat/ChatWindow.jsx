import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble.jsx';

export default function ChatWindow({ messages, isLoading }) {
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <div
      ref={scrollRef}
      className="chat-scroll flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6 space-y-4"
      style={{ scrollBehavior: 'smooth' }}
    >
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <MessageBubble message={msg} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Typing indicator */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-3 px-1"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #00e5ff20, #8b5cf620)',
                border: '1px solid rgba(0, 229, 255, 0.2)',
              }}
            >
              <span className="text-xs" style={{ color: '#00e5ff' }}>AI</span>
            </div>
            <div
              className="glass-panel px-4 py-3 flex gap-1.5 items-center"
              style={{ borderColor: 'rgba(0, 229, 255, 0.15)' }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="typing-dot w-2 h-2 rounded-full"
                  style={{
                    background: '#00e5ff',
                    animation: `typing-dot 1.4s ease-in-out infinite`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={bottomRef} />
    </div>
  );
}
