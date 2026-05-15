import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VoiceControls({
  onSendMessage,
  prefilledMessage,
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
}) {

  const [textInput, setTextInput] = useState('');
  const textareaRef = useRef(null);

  /* -------------------------------- */
  /* Live transcript sync */
  /* -------------------------------- */

  useEffect(() => {
    const fullText = [transcript, interimTranscript]
      .filter(Boolean)
      .join(' ')
      .trim();

    if (fullText) {
      setTextInput(fullText);
    }
  }, [transcript, interimTranscript]);

  useEffect(() => {
  if (prefilledMessage) {
    setTextInput(prefilledMessage);
  }
}, [prefilledMessage]);

  /* -------------------------------- */
  /* Auto resize */
  /* -------------------------------- */

  useEffect(() => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height =
      `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
  }, [textInput]);

  /* -------------------------------- */
  /* Send */
  /* -------------------------------- */

  const handleSend = useCallback(() => {

    const msg = textInput.trim();

    if (!msg || isLoading) return;

    if (isListening) {
      stopListening();
    }

    onSendMessage(msg);

    setTextInput('');

    resetTranscript?.();

  }, [
    textInput,
    isLoading,
    onSendMessage,
    isListening,
    stopListening,
    resetTranscript,
  ]);

  /* -------------------------------- */
  /* Keyboard */
  /* -------------------------------- */

  const handleKeyDown = (e) => {

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* -------------------------------- */
  /* Mic */
  /* -------------------------------- */

  const toggleMic = () => {

    if (isListening) {
      stopListening();
    } else {

      if (isSpeaking) {
        onCancelSpeech?.();
      }

      startListening();
    }
  };

  return (
    <div className="px-5 pb-5 pt-3 md:px-6 md:pb-6">

      {/* Status Bar */}
      <AnimatePresence>

        {(isListening || speechStatus || speechError || !isSupported) && (

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="mb-3 flex items-center justify-between gap-3 rounded-2xl px-4 py-2 text-[11px]"
            style={{
              color: speechError
                ? '#fca5a5'
                : 'var(--color-text-secondary)',

              background: 'rgba(255,255,255,0.02)',

              border: speechError
                ? '1px solid rgba(239,68,68,0.18)'
                : '1px solid rgba(255,255,255,0.04)',
            }}
          >

            <span className="truncate">
              {!isSupported
                ? 'Speech recognition requires Chrome or Edge.'
                : speechError || speechStatus || 'Listening...'}
            </span>

            {(isListening || isFallbackTranscribing) && (
              <span
                className="flex items-center gap-1.5 whitespace-nowrap text-[10px]"
                style={{
                  color: hasMicSignal
                    ? '#A8B59F'
                    : 'var(--color-text-muted)',
                }}
              >

                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full"
                  style={{
                    background: hasMicSignal
                      ? '#A8B59F'
                      : 'var(--color-text-muted)',
                  }}
                />

                {isFallbackTranscribing
                  ? 'Transcribing'
                  : hasMicSignal
                    ? 'Mic active'
                    : 'Listening'}
              </span>
            )}

          </motion.div>
        )}

      </AnimatePresence>

      {/* Composer */}
      <div
        className="voice-composer flex items-center gap-3 rounded-[26px] px-4 py-3"
      >

        {/* Mic */}
        <div className="flex flex-col items-center gap-2">

          {isSupported && (

            <motion.button
              onClick={toggleMic}
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.03 }}
              className="flex items-center justify-center rounded-full"
              style={{
                width: '48px',
                height: '48px',

                background: isListening
                  ? 'rgba(168,181,159,0.18)'
                  : 'rgba(255,255,255,0.03)',

                border: isListening
                  ? '1px solid rgba(168,181,159,0.28)'
                  : '1px solid rgba(255,255,255,0.05)',

                boxShadow: isListening
                  ? '0 0 30px rgba(168,181,159,0.12)'
                  : 'none',
              }}
            >

              {isListening ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#A8B59F">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#A8B59F">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              )}

            </motion.button>
          )}

          {isListening && (

            <div className="flex h-3 items-center gap-[2px]">

              {[0.35, 0.55, 0.8, 1, 0.75].map((weight, index) => (

                <span
                  key={index}
                  className="w-[3px] rounded-full"
                  style={{
                    height: `${Math.max(3, audioLevel * weight * 16)}px`,

                    background: '#A8B59F',

                    opacity: 0.35 + index * 0.1,

                    transition: 'height 80ms linear',
                  }}
                />
              ))}

            </div>
          )}

        </div>

        {/* Input */}
        <textarea
          ref={textareaRef}
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isLoading}
          placeholder={
            isListening
              ? 'Speak now...'
              : 'Type or dictate a message...'
          }
          className="
            chat-input-scroll
            flex-1
            resize-none
            bg-transparent
            outline-none
            text-[15px]
            leading-[22px]
            placeholder-gray-500
            min-w-0
            max-h-28
            h-[22px]
            pt-[1px]
          "
          style={{
            color: 'var(--color-text-primary)',
            caretColor: '#8FA98E',
          }}
        />

        {/* Send */}
        <motion.button
          onClick={handleSend}
          disabled={!textInput.trim() || isLoading}
          whileTap={{ scale: 0.94 }}
          className="
            flex
            h-[46px]
            w-[46px]
            items-center
            justify-center
            rounded-full
            transition-all
            disabled:opacity-30
          "
          style={{
            background: textInput.trim()
              ? 'rgba(255,255,255,0.06)'
              : 'rgba(255,255,255,0.025)',

            border: textInput.trim()
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(255,255,255,0.04)',
          }}
        >

          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={textInput.trim() ? '#F3F2EA' : '#5C6470'}
          >
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>

        </motion.button>

        {/* Stop Speech */}
        <AnimatePresence>

          {isSpeaking && (

            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={onCancelSpeech}
              whileTap={{ scale: 0.94 }}
              className="
                flex
                h-[46px]
                w-[46px]
                items-center
                justify-center
                rounded-full
              "
              style={{
                background: 'rgba(201,123,123,0.08)',
                border: '1px solid rgba(201,123,123,0.16)',
              }}
            >

              <svg width="14" height="14" viewBox="0 0 24 24" fill="#C97B7B">
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>

            </motion.button>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}