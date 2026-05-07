import React from 'react';
import { motion } from 'framer-motion';

/**
 * AIAvatar — Holographic talking AI assistant visualization
 *
 * A futuristic holographic head silhouette with:
 * - Reactive waveform "mouth" synced with TTS
 * - Pulsing concentric rings
 * - Distinct states: idle, listening, speaking, thinking
 */
export default function AIAvatar({ state = 'idle' }) {
  // state: 'idle' | 'listening' | 'speaking' | 'thinking'

  const stateColors = {
    idle: { primary: '#00e5ff', secondary: '#3b82f6', glow: 'rgba(0,229,255,0.15)' },
    listening: { primary: '#00e5ff', secondary: '#06b6d4', glow: 'rgba(0,229,255,0.35)' },
    speaking: { primary: '#8b5cf6', secondary: '#a78bfa', glow: 'rgba(139,92,246,0.45)' },
    thinking: { primary: '#3b82f6', secondary: '#8b5cf6', glow: 'rgba(59,130,246,0.25)' },
  };

  const colors = stateColors[state] || stateColors.idle;

  // Waveform bar count for the mouth
  const waveformBars = 9;

  return (
    <div className="relative flex items-center justify-center" style={{ width: '220px', height: '260px' }}>

      {/* Outer glow backdrop */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '200px',
          height: '200px',
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
        }}
        animate={{
          scale: state === 'listening' ? [1, 1.35, 1] : state === 'speaking' ? [1, 1.25, 1.1, 1.3, 1] : [1, 1.05, 1],
          opacity: state === 'idle' ? [0.5, 0.8, 0.5] : state === 'speaking' ? [0.8, 1, 0.8] : 1,
        }}
        transition={{
          duration: state === 'listening' ? 1.2 : state === 'speaking' ? 0.4 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Concentric ring 1 */}
      <motion.div
        className="absolute rounded-full border"
        style={{
          width: '180px',
          height: '180px',
          borderColor: `${colors.primary}33`,
        }}
        animate={{
          scale: state === 'listening' ? [1, 1.15, 1] : [1, 1.03, 1],
          rotate: state === 'thinking' ? 360 : 0,
        }}
        transition={{
          duration: state === 'thinking' ? 4 : 3,
          repeat: Infinity,
          ease: state === 'thinking' ? 'linear' : 'easeInOut',
        }}
      />

      {/* Concentric ring 2 */}
      <motion.div
        className="absolute rounded-full border"
        style={{
          width: '160px',
          height: '160px',
          borderColor: `${colors.secondary}33`,
        }}
        animate={{
          scale: state === 'speaking' ? [1, 1.15, 1.05, 1.1, 1] : [1, 1.02, 1],
          rotate: state === 'thinking' ? -360 : 0,
        }}
        transition={{
          duration: state === 'thinking' ? 3 : 4,
          repeat: Infinity,
          ease: state === 'thinking' ? 'linear' : 'easeInOut',
          delay: 0.5,
        }}
      />

      {/* Listening ripple rings */}
      {state === 'listening' && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`ripple-${i}`}
              className="absolute rounded-full border"
              style={{
                width: '140px',
                height: '140px',
                borderColor: colors.primary,
              }}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.6,
                ease: 'easeOut',
              }}
            />
          ))}
        </>
      )}

      {/* Main avatar container */}
      <motion.div
        className="relative flex flex-col items-center justify-center rounded-full"
        style={{
          width: '140px',
          height: '140px',
          background: `radial-gradient(circle at 50% 40%, ${colors.primary}15 0%, ${colors.glow} 60%, transparent 100%)`,
          border: `1.5px solid ${colors.primary}40`,
          boxShadow: `0 0 30px ${colors.glow}, inset 0 0 30px ${colors.glow}`,
        }}
        animate={{
          y: state === 'idle' ? [0, -5, 0] : state === 'speaking' ? [0, -2, 1, -1, 0] : 0,
        }}
        transition={{
          duration: state === 'speaking' ? 0.4 : 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Holographic head silhouette */}
        <svg
          width="80"
          height="90"
          viewBox="0 0 80 90"
          fill="none"
          className="absolute"
          style={{ top: '12px' }}
        >
          {/* Head outline */}
          <motion.ellipse
            cx="40"
            cy="32"
            rx="24"
            ry="28"
            stroke={colors.primary}
            strokeWidth="1.5"
            fill={`${colors.primary}08`}
            animate={{
              strokeOpacity: state === 'idle' ? [0.4, 0.7, 0.4] : [0.6, 1, 0.6],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Eyes */}
          <motion.circle
            cx="31"
            cy="28"
            r="2.5"
            fill={colors.primary}
            animate={{
              opacity: state === 'thinking' ? [1, 0.3, 1] : [0.7, 1, 0.7],
              scale: state === 'listening' ? [1, 1.2, 1] : 1,
            }}
            transition={{ duration: state === 'thinking' ? 1 : 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="49"
            cy="28"
            r="2.5"
            fill={colors.primary}
            animate={{
              opacity: state === 'thinking' ? [1, 0.3, 1] : [0.7, 1, 0.7],
              scale: state === 'listening' ? [1, 1.2, 1] : 1,
            }}
            transition={{ duration: state === 'thinking' ? 1 : 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Neck / shoulders hint */}
          <motion.path
            d="M 28 58 Q 40 65 52 58"
            stroke={colors.primary}
            strokeWidth="1"
            fill="none"
            strokeOpacity={0.3}
          />

          {/* Neural network lines inside head */}
          {state !== 'idle' && (
            <>
              <motion.line
                x1="33" y1="20" x2="40" y2="16"
                stroke={colors.primary}
                strokeWidth="0.5"
                animate={{ strokeOpacity: [0, 0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              />
              <motion.line
                x1="47" y1="20" x2="40" y2="16"
                stroke={colors.primary}
                strokeWidth="0.5"
                animate={{ strokeOpacity: [0, 0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              />
              <motion.line
                x1="40" y1="16" x2="40" y2="10"
                stroke={colors.secondary}
                strokeWidth="0.5"
                animate={{ strokeOpacity: [0, 0.4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
              />
            </>
          )}
        </svg>

        {/* Waveform mouth — synced with speaking */}
        <div
          className="absolute flex items-end justify-center gap-[2px]"
          style={{ bottom: '32px', height: '20px' }}
        >
          {Array.from({ length: waveformBars }).map((_, i) => {
            const centerDistance = Math.abs(i - Math.floor(waveformBars / 2));
            const maxHeight = state === 'speaking'
              ? 24 - centerDistance * 2.5
              : state === 'listening'
                ? 10 - centerDistance
                : 4;

            return (
              <motion.div
                key={`bar-${i}`}
                style={{
                  width: '3px',
                  borderRadius: '2px',
                  background: state === 'speaking'
                    ? `linear-gradient(to top, ${colors.primary}, ${colors.secondary})`
                    : state === 'listening'
                      ? colors.primary
                      : `${colors.primary}60`,
                }}
                animate={{
                  height: state === 'speaking'
                    ? [
                        `${Math.max(3, maxHeight * 0.3)}px`,
                        `${maxHeight}px`,
                        `${Math.max(3, maxHeight * 0.5)}px`,
                        `${maxHeight * 0.8}px`,
                        `${Math.max(3, maxHeight * 0.3)}px`,
                      ]
                    : state === 'listening'
                      ? [`${Math.max(2, maxHeight * 0.4)}px`, `${maxHeight}px`, `${Math.max(2, maxHeight * 0.4)}px`]
                      : [`${maxHeight * 0.6}px`, `${maxHeight}px`, `${maxHeight * 0.6}px`],
                  opacity: state === 'idle' ? [0.3, 0.5, 0.3] : 1,
                }}
                transition={{
                  duration: state === 'speaking' ? 0.2 + Math.random() * 0.15 : state === 'listening' ? 0.8 : 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * (state === 'speaking' ? 0.02 : 0.08),
                }}
              />
            );
          })}
        </div>
      </motion.div>

      {/* State label */}
      <motion.div
        className="absolute text-xs font-medium tracking-widest uppercase"
        style={{
          bottom: '0px',
          color: colors.primary,
          textShadow: `0 0 10px ${colors.glow}`,
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {state === 'idle' && 'Ready'}
        {state === 'listening' && 'Listening'}
        {state === 'speaking' && 'Speaking'}
        {state === 'thinking' && 'Thinking'}
      </motion.div>
    </div>
  );
}
