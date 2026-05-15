import React, {
  useEffect,
  useCallback,
  useState,
  useRef,
} from 'react';
import Layout from './components/layout/Layout.jsx';
import ChatWindow from './components/chat/ChatWindow.jsx';
import VoiceControls from './components/voice/VoiceControls.jsx';
import AIAvatar from './components/voice/AIAvatar.jsx';
import VoiceOverlay from './components/voice/VoiceOverlay.jsx';
import SummaryPanel from './components/activity/SummaryPanel.jsx';
import { useChat } from './hooks/useChat.js';
import { useSpeechRecognition } from './hooks/useSpeechRecognition.js';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis.js';

export default function App() {
  const {
  messages,
  isLoading,
  latestToolActivity,
  summary,
  pendingMessage,
  sendMessage,
  endConversation,
} = useChat();
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    statusMessage,
    error,
    audioLevel,
    hasMicSignal,
    isFallbackTranscribing,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();
  const { isSpeaking, speak, cancel: cancelSpeech } = useSpeechSynthesis();
  const [prefilledMessage, setPrefilledMessage] = useState('');
  const [voiceOverlayOpen, setVoiceOverlayOpen] = useState(false);
  const silenceTimeoutRef = useRef(null);

  // Auto-send is removed so user can review/edit the transcript in the input field.

  // Auto-speak AI responses
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && lastMessage.id !== 'welcome') {
      speak(lastMessage.content);
    }
  }, [messages, speak]);

  /* -------------------------------- */
  /* Voice Auto Send */
  /* -------------------------------- */

  useEffect(() => {

    if (!voiceOverlayOpen) return;

    const liveTranscript = [
      transcript,
      interimTranscript,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    if (!isListening) return;

    if (!liveTranscript) return;

    clearTimeout(silenceTimeoutRef.current);

    silenceTimeoutRef.current = setTimeout(async () => {

      const finalMessage = liveTranscript.trim();

      if (finalMessage.split(' ').length < 2) return;

      stopListening();

      await handleSendMessage(finalMessage);

      resetTranscript?.();

    }, 3200);

    return () => {
      clearTimeout(silenceTimeoutRef.current);
    };

  }, [
    transcript,
    interimTranscript,
    isListening,
    voiceOverlayOpen,
  ]);

  const handleSendMessage = useCallback(
    async (text) => {
      // Stop any ongoing speech before sending
      if (isSpeaking) cancelSpeech();
      await sendMessage(text);
      setPrefilledMessage('');
    },
    [sendMessage, isSpeaking, cancelSpeech]
  );

  const handleVoiceOverlayMic = async () => {

    if (isListening) {
      stopListening();
      return;
    }

    /*
    * Interrupt assistant speech immediately
    */
    if (isSpeaking) {
      cancelSpeech();
    }

    /*
    * Small delay prevents speech engine race conditions
    */
    setTimeout(() => {
      startListening();
    }, 120);
  };

  // Determine avatar state
  const getAvatarState = () => {
    if (isListening) return 'listening';
    if (isLoading) return 'thinking';
    if (isSpeaking) return 'speaking';
    return 'idle';
  };

  return (
    <>
  <Layout

    voiceState={getAvatarState()}

    toolStatus={
      latestToolActivity?.tool_name
        ? latestToolActivity.tool_name
        : 'Tools Ready'
    }

    networkStatus="online"

    chatPanel={
      <>
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          pendingMessage={pendingMessage}
        />

        <VoiceControls
          onSendMessage={handleSendMessage}
          isListening={isListening}
          transcript={transcript}
          interimTranscript={interimTranscript}
          speechStatus={statusMessage}
          speechError={error}
          audioLevel={audioLevel}
          hasMicSignal={hasMicSignal}
          isFallbackTranscribing={isFallbackTranscribing}
          startListening={startListening}
          stopListening={stopListening}
          resetTranscript={resetTranscript}
          isSupported={isSupported}
          isLoading={isLoading}
          isSpeaking={isSpeaking}
          onCancelSpeech={cancelSpeech}
          onEndConversation={endConversation}
          prefilledMessage={prefilledMessage}
        />
      </>
    }

    avatarPanel={
      <AIAvatar
        state={getAvatarState()}
        audioLevel={audioLevel}
      />
    }

    summaryPanel={
      <SummaryPanel
        messages={messages}
        latestToolActivity={latestToolActivity}
        summary={summary}
        onEndConversation={endConversation}
        isLoading={isLoading}
        onQuickAction={setPrefilledMessage}
      />
    }
  />

  <VoiceOverlay
    isOpen={voiceOverlayOpen}
    onClose={() => setVoiceOverlayOpen(false)}

    state={getAvatarState()}

    transcript={transcript}
    interimTranscript={interimTranscript}

    pendingMessage={pendingMessage}

    latestAssistantMessage={
      [...messages]
        .reverse()
        .find((m) => m.role === 'assistant')?.content || ''
    }

    isListening={isListening}
    isSpeaking={isSpeaking}
    isLoading={isLoading}

    audioLevel={audioLevel}

    onMicToggle={handleVoiceOverlayMic}
  />

  {/* Floating Mobile FAB */}
  <div
    className="
      fixed
      bottom-24
      right-5
      z-[90]
      lg:hidden
    "
  >

    {/* Ambient Glow */}
    <div
      className="
        absolute
        -inset-4
        rounded-full
        transition-all
        duration-300
        opacity-80
        group-hover:opacity-100
        group-hover:scale-[1.12]
      "
      style={{
        background:
          'radial-gradient(circle, rgba(214,228,201,0.28), rgba(214,228,201,0.10), transparent 72%)',

        filter: 'blur(26px)',
      }}
    />

    <button
      onClick={() => setVoiceOverlayOpen(true)}
      className="
        group
        relative
        flex
        h-16
        w-16
        items-center
        justify-center
        rounded-full
        transition-all
        duration-300
        hover:scale-[1.08]
        active:scale-[0.96]
      "
      style={{
        background:
          'linear-gradient(180deg, rgba(38,42,52,0.98), rgba(18,20,28,0.98))',

        border:
          '1px solid rgba(255,255,255,0.08)',

        boxShadow:
          '0 18px 40px rgba(0,0,0,0.42)',

        transform: 'translateZ(0)',

        animation: 'voicePulse 3.2s ease-in-out infinite',
      }}
    >

      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M4 12H7"
          stroke="#F3F4F6"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        <path
          d="M10 9V15"
          stroke="#F3F4F6"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        <path
          d="M14 7V17"
          stroke="#F3F4F6"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        <path
          d="M18 10V14"
          stroke="#F3F4F6"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        <path
          d="M21 12H20"
          stroke="#F3F4F6"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>

    </button>

  </div>
</>
  );
}
