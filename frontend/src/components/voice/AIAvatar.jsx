import React from 'react';
import { motion } from 'framer-motion';

export default function AIAvatar({ state = 'idle', audioLevel = 0.2 }) {
  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';
  const isThinking = state === 'thinking';

  const bars = 32;

  const colors = {
    idle: '#CBCBCB',
    listening: '#FFFFE3',
    speaking: '#FFFFE3',
    thinking: '#D8DEE6',
  };

  const glow = {
    idle: 'rgba(203,203,203,0.06)',
    listening: 'rgba(255,255,227,0.18)',
    speaking: 'rgba(255,255,227,0.22)',
    thinking: 'rgba(184,194,204,0.10)',
  };

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center w-full h-full overflow-hidden"
      animate={{
        y: [0, -3, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Ambient Outer Glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '260px',
          height: '260px',
          background: `radial-gradient(circle, ${glow[state]} 0%, transparent 72%)`,
          filter: 'blur(24px)',
        }}
        animate={{
          scale: isListening
            ? [1, 1.08, 1]
            : isSpeaking
            ? [1, 1.12, 1.02, 1]
            : [1, 1.03, 1],

          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: isSpeaking ? 1.2 : 2.8,
          repeat: Infinity,
          ease: [0.22, 1, 0.36, 1],
        }}
      />

      {/* Inner Core Glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '140px',
          height: '140px',
          background: glow[state],
          filter: 'blur(50px)',
          opacity: 0.45,
        }}
        animate={{
          scale: isSpeaking
            ? [1, 1.18, 1]
            : isListening
            ? [1, 1.1, 1]
            : [1, 1.04, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Waveform */}
      <div
        className="
          relative
          flex
          items-center
          justify-center
          gap-[3px]
          overflow-hidden
          h-[170px]
        "
      >
        {Array.from({ length: bars }).map((_, i) => {
          const center = bars / 2;
          const distance = Math.abs(i - center);

          return (
            <motion.div
              key={i}
              className="rounded-full"
              style={{
                width: '4px',
                transformOrigin: 'center',

                background:
                  state === 'speaking'
                    ? 'linear-gradient(to top, #6D8196, #FFFFE3)'
                    : colors[state],

                boxShadow:
                  state !== 'idle'
                    ? `0 0 12px ${glow[state]}`
                    : 'none',
              }}
              animate={{
                height:
                  isSpeaking || isListening
                    ? Array.from({ length: 14 }, (_, frame) => {

                        const t = frame * 0.34;

                        const primary =
                          Math.sin(i * 0.34 - t * 2.2);

                        const secondary =
                          Math.sin(i * 0.18 - t * 1.3);

                        const envelope =
                          Math.max(
                            0.22,
                            1 - distance / center
                          );

                        const liveBoost =
                          isSpeaking
                            ? 18
                            : 8 + audioLevel * 16;

                        const wave =
                          (
                            primary * 0.7 +
                            secondary * 0.3
                          );

                        const value =
                          18 +
                          Math.abs(wave) *
                          liveBoost *
                          envelope;

                        return `${value}px`;
                      })

                    : isThinking
                    ? ['10px', '28px', '10px']

                    : Array.from({ length: 6 }, (_, frame) => {
                        const t = frame * 0.4;

                        const wave =
                          Math.sin(i * 0.22 - t);

                        return `${5 + Math.abs(wave) * 3}px`;
                      }),

                opacity:
                  isSpeaking || isListening
                    ? [0.45, 1, 0.65, 1, 0.45]
                    : [0.25, 0.5, 0.25],
              }}
              transition={{
                duration:
                  isSpeaking
                    ? 2
                    : audioLevel > 0.04
                    ? 2.8
                    : 4.8,

                repeat: Infinity,
                ease: 'linear',
              }}
            />
          );
        })}
      </div>

      {/* Status */}
      <motion.div
        className="mt-8 text-[11px] tracking-[0.35em] uppercase"
        style={{
          color: colors[state],
          letterSpacing: '0.35em',
        }}
        animate={{
          opacity: [0.45, 1, 0.45],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        {state}
      </motion.div>
    </motion.div>
  );
}