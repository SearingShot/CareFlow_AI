import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VoiceControls({
  onSendMessage,
  isListening,
  transcript,
  interimTranscript,
  speechStatus,
  speechError,
  audioLevel = 0,
  hasMicSignal = false,
  isFallbackTranscribing = false,
  startListening,
  stopListening,
  resetTranscript,
  isSupported,
  isLoading,
  isSpeaking,
  onCancelSpeech,
  onEndConversation,
}) {
  const [textInput, setTextInput] = useState('');
  const textareaRef = useRef(null);

  // Sync live speech recognition into the input field
  useEffect(() => {
    const fullText = [transcript, interimTranscript].filter(Boolean).join(' ').trim();
    if (fullText) {
      setTextInput(fullText);
    }
  }, [transcript, interimTranscript]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 112)}px`;
  }, [textInput]);

  const handleSend = useCallback(() => {
    const msg = textInput.trim();
    if (!msg || isLoading) return;
    
    if (isListening) {
      stopListening();
    }
    
    onSendMessage(msg);
    setTextInput('');
    resetTranscript?.();
  }, [textInput, isLoading, onSendMessage, isListening, stopListening, resetTranscript]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      if (isSpeaking) onCancelSpeech();
      startListening();
    }
  };

  const handleEndConversation = () => {
    if (isListening) stopListening();
    onEndConversation?.();
  };

  return (
    <div className="px-4 pb-5 md:pb-4 pt-2">
      <AnimatePresence>
        {(isListening || speechStatus || speechError || !isSupported) && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="mb-2 flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-[11px]"
            style={{
              color: speechError ? '#fca5a5' : 'var(--color-text-secondary)',
              background: 'rgba(2, 6, 23, 0.28)',
              border: `1px solid ${speechError ? 'rgba(239, 68, 68, 0.18)' : 'rgba(148, 163, 184, 0.1)'}`,
            }}
          >
            <span className="truncate">
              {!isSupported
                ? 'Speech recognition requires Chrome or Edge.'
                : speechError || speechStatus || 'Listening...'}
            </span>
            {(isListening || isFallbackTranscribing) && (
              <span className="flex items-center gap-1.5 text-[10px] whitespace-nowrap" style={{ color: hasMicSignal ? '#10b981' : '#00e5ff' }}>
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: hasMicSignal ? '#10b981' : '#00e5ff' }}
                />
                {isFallbackTranscribing ? 'Transcribing' : hasMicSignal ? 'Mic signal' : 'Listening'}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="voice-composer flex items-end gap-3 px-4 py-3 rounded-2xl"
        style={{
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.72), rgba(8, 13, 27, 0.86))',
          border: '1px solid rgba(148, 163, 184, 0.16)',
          backdropFilter: 'blur(18px)',
          boxShadow: '0 18px 45px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <div className="flex flex-col items-center gap-1.5">
          {isSupported && (
            <motion.button
              onClick={toggleMic}
              className="relative flex items-center justify-center rounded-full flex-shrink-0 cursor-pointer"
              style={{
                width: '44px',
                height: '44px',
                background: isListening
                  ? 'linear-gradient(135deg, #00e5ff, #06b6d4)'
                  : 'rgba(0, 229, 255, 0.1)',
                border: `1.5px solid ${isListening ? '#00e5ff' : 'rgba(0, 229, 255, 0.25)'}`,
                animation: isListening ? 'mic-pulse 1.5s infinite' : 'none',
              }}
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.04 }}
              id="mic-button"
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#00e5ff">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              )}
            </motion.button>
          )}
          {isListening && (
            <div className="flex h-3 items-end gap-[2px]">
              {[0.35, 0.55, 0.8, 1, 0.75].map((weight, index) => (
                <span
                  key={weight}
                  className="w-[3px] rounded-full"
                  style={{
                    height: `${Math.max(3, audioLevel * weight * 16)}px`,
                    background: hasMicSignal ? '#10b981' : '#00e5ff',
                    opacity: 0.35 + index * 0.1,
                    transition: 'height 80ms linear',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <textarea
          ref={textareaRef}
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? 'Speak now. Your transcript will appear here live.' : 'Type or dictate a message...'}
          disabled={isLoading}
          rows={1}
          className="chat-input-scroll flex-1 resize-none bg-transparent outline-none text-sm leading-6 placeholder-gray-500 min-w-0 max-h-28 py-2"
          style={{ color: 'var(--color-text-primary)', caretColor: '#00e5ff' }}
          id="chat-input"
        />

        <motion.button
          onClick={handleSend}
          disabled={!textInput.trim() || isLoading || isFallbackTranscribing}
          className="flex items-center justify-center rounded-full flex-shrink-0 cursor-pointer disabled:opacity-30"
          style={{
            width: '42px',
            height: '42px',
            background: textInput.trim()
              ? 'linear-gradient(135deg, #00e5ff, #3b82f6)'
              : 'rgba(59, 130, 246, 0.1)',
            border: textInput.trim() ? '1px solid rgba(0, 229, 255, 0.42)' : '1px solid rgba(59, 130, 246, 0.2)',
            boxShadow: textInput.trim() ? '0 12px 26px rgba(0, 229, 255, 0.16)' : 'none',
          }}
          whileTap={{ scale: 0.92 }}
          id="send-button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={textInput.trim() ? 'white' : '#3b82f6'}>
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </motion.button>

        <AnimatePresence>
          {isSpeaking && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={onCancelSpeech}
              className="flex items-center justify-center rounded-full flex-shrink-0 cursor-pointer"
              style={{
                width: '42px',
                height: '42px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
              }}
              whileTap={{ scale: 0.92 }}
              id="stop-speech-button"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444">
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        {onEndConversation && (
          <motion.button
            onClick={handleEndConversation}
            disabled={isLoading}
            className="hidden sm:flex items-center justify-center rounded-full flex-shrink-0 cursor-pointer disabled:opacity-30"
            style={{
              width: '42px',
              height: '42px',
              background: 'rgba(148, 163, 184, 0.08)',
              border: '1px solid rgba(148, 163, 184, 0.16)',
            }}
            whileTap={{ scale: 0.92 }}
            title="End conversation and generate summary"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#94a3b8">
              <path d="M6 6h12v12H6z" />
            </svg>
          </motion.button>
        )}
      </div>
    </div>
  );
}
