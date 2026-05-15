import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble.jsx';

export default function ChatWindow({
  messages,
  isLoading,
  pendingMessage,
}) {
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  return (
    <div
      ref={scrollRef}
      className="chat-scroll flex-1 overflow-y-auto px-7 pt-8 pb-6 md:px-6 md:pt-8 md:pb-6 space-y-5"
      style={{
        scrollBehavior: 'smooth',
      }}
    >
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{
              opacity: 0,
              y: 14,
              scale: 0.985,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -10,
            }}
            transition={{
              duration: 0.32,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <MessageBubble message={msg} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Assistant Thinking State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: 0.28,
            }}
            className="flex items-start gap-3"
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
              data-role="assistant"
            >
              <span
                className="text-[11px] font-semibold tracking-wide"
                style={{
                  color: '#CBCBCB',
                }}
              >
                AI
              </span>
            </div>

            {/* Thinking Bubble */}
            <div
              className="px-5 py-4"
              style={{
                maxWidth: '78%',
                borderRadius: '20px 20px 20px 8px',

                background:
                  'linear-gradient(180deg, rgba(26,28,35,0.94), rgba(18,20,27,0.96))',

                border:
                  '1px solid rgba(255,255,255,0.04)',

                boxShadow:
                  '0 10px 30px rgba(0,0,0,0.18)',
              }}
            >
              <div className="flex items-center gap-3">

                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{
                        opacity: [0.3, 1, 0.3],
                        y: [0, -3, 0],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.16,
                      }}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background: '#D7DBE0',
                      }}
                    />
                  ))}
                </div>

                <motion.span
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="text-[13px]"
                  style={{
                    color: 'rgba(235,240,245,0.72)',
                  }}
                >
                  {pendingMessage || 'Processing'}
                </motion.span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={bottomRef} />
    </div>
  );
}