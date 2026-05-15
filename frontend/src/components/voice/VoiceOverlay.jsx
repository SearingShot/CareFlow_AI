import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AIAvatar from './AIAvatar.jsx';

export default function VoiceOverlay({
  isOpen,
  onClose,

  state,

  transcript,
  interimTranscript,

  pendingMessage,

  latestAssistantMessage,

  isListening,
  isSpeaking,
  isLoading,

  audioLevel,

  onMicToggle,
}) {

  const liveTranscript = [
    transcript,
    interimTranscript,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  const displayText = (() => {

    if (liveTranscript) {
      return liveTranscript;
    }

    if (isLoading) {
      return pendingMessage || 'Thinking...';
    }

    if (isSpeaking && latestAssistantMessage) {
      return latestAssistantMessage;
    }

    if (isListening) {
      return 'Listening...';
    }

    return 'Tap microphone to begin';

  })();

  return (
    <AnimatePresence>

      {isOpen && (

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24 }}
          className="
            fixed
            inset-0
            z-[120]
            overflow-hidden
            lg:hidden
          "
          style={{
            background:
              `
              radial-gradient(
                circle at top,
                rgba(60,70,95,0.22),
                rgba(10,12,18,0.96) 42%,
                rgba(4,5,8,1) 100%
              )
              `,
            backdropFilter: 'blur(24px)',
          }}
        >

          {/* Ambient Background */}
          <div className="absolute inset-0 overflow-hidden">

            <div
              className="
                absolute
                left-1/2
                top-1/2
                h-[520px]
                w-[520px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
              "
              style={{
                background:
                  'radial-gradient(circle, rgba(255,255,255,0.06), transparent 70%)',

                filter: 'blur(80px)',
              }}
            />

          </div>

          {/* Main Layout */}
          <div
            className="
              relative
              flex
              h-full
              flex-col
              items-center
              justify-between
              px-6
              pt-16
              pb-10
            "
          >

            {/* Header */}
            <div className="w-full flex items-center justify-between">

              <div>
                <p
                  className="text-[10px] uppercase tracking-[0.34em]"
                  style={{
                    color: 'var(--color-text-faint)',
                  }}
                >
                  Voice Assistant
                </p>

                <h2
                  className="mt-2 text-[18px] font-semibold"
                  style={{
                    color: 'var(--color-text-primary)',
                  }}
                >
                  CareFlow AI
                </h2>
              </div>

              <button
                onClick={onClose}
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                "
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >

                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M6 6L18 18"
                    stroke="#CBCBCB"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />

                  <path
                    d="M18 6L6 18"
                    stroke="#CBCBCB"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>

              </button>
            </div>

            {/* Avatar */}
            <div
            className="
                relative
                flex
                flex-1
                items-center
                justify-center
                w-full
            "
            >

            <div
                className="
                relative
                flex
                items-center
                justify-center
                w-full
                "
                style={{
                height: '320px',
                }}
            >

                <div className="scale-[1.6] md:scale-[1.85]">

                <AIAvatar
                    state={state}
                    audioLevel={audioLevel}
                />

                </div>

            </div>

            </div>

            {/* Transcript */}
            <motion.div
              key={displayText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className="
                mx-auto
                max-w-[780px]
                px-6
                text-center
              "
            >

              <p
                className="
                  mb-5
                  text-[10px]
                  uppercase
                  tracking-[0.38em]
                "
                style={{
                  color: 'rgba(255,255,255,0.42)',
                }}
              >
                {isListening
                  ? 'Listening'
                  : isSpeaking
                  ? 'Speaking'
                  : isLoading
                  ? 'Processing'
                  : latestAssistantMessage
                  ? 'Ready'
                  : 'Voice Ready'}
              </p>

              <p
                className="
                  text-[26px]
                  leading-[1.5]
                  md:text-[38px]
                  md:leading-[1.42]
                  font-light
                  tracking-[-0.03em]
                "
                style={{
                  color: 'rgba(245,247,250,0.94)',
                }}
              >
                {displayText}
              </p>

            </motion.div>

            {/* Bottom Dock */}
            <div
              className="
                mt-10
                flex
                items-center
                gap-5
                rounded-full
                px-6
                py-4
              "
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(20px)',

                boxShadow:
                  '0 20px 50px rgba(0,0,0,0.34)',
              }}
            >

              {/* Mic Button */}
              <button
                onClick={onMicToggle}
                className="
                  flex
                  h-[76px]
                  w-[76px]
                  items-center
                  justify-center
                  rounded-full
                  transition-all
                "
                style={{
                  background: isListening
                    ? 'rgba(168,181,159,0.18)'
                    : 'rgba(255,255,255,0.05)',

                  border: isListening
                    ? '1px solid rgba(168,181,159,0.28)'
                    : '1px solid rgba(255,255,255,0.06)',

                  boxShadow: isListening
                    ? '0 0 60px rgba(168,181,159,0.22)'
                    : '0 12px 40px rgba(0,0,0,0.32)',
                }}
              >

                {isListening ? (

                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#D6E4C9"
                  >
                    <rect
                      x="6"
                      y="6"
                      width="12"
                      height="12"
                      rx="2"
                    />
                  </svg>

                ) : (

                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="#F3F4F6"
                  >
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />

                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>

                )}

              </button>

            </div>

          </div>

        </motion.div>
      )}

    </AnimatePresence>
  );
}