import React, { useEffect, useCallback } from 'react';
import Layout from './components/layout/Layout.jsx';
import ChatWindow from './components/chat/ChatWindow.jsx';
import VoiceControls from './components/voice/VoiceControls.jsx';
import AIAvatar from './components/voice/AIAvatar.jsx';
import SummaryPanel from './components/activity/SummaryPanel.jsx';
import { useChat } from './hooks/useChat.js';
import { useSpeechRecognition } from './hooks/useSpeechRecognition.js';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis.js';

export default function App() {
  const { messages, isLoading, latestToolActivity, summary, sendMessage, endConversation } = useChat();
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

  // Auto-send is removed so user can review/edit the transcript in the input field.

  // Auto-speak AI responses
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && lastMessage.id !== 'welcome') {
      speak(lastMessage.content);
    }
  }, [messages, speak]);

  const handleSendMessage = useCallback(
    async (text) => {
      // Stop any ongoing speech before sending
      if (isSpeaking) cancelSpeech();
      await sendMessage(text);
    },
    [sendMessage, isSpeaking, cancelSpeech]
  );

  // Determine avatar state
  const getAvatarState = () => {
    if (isListening) return 'listening';
    if (isLoading) return 'thinking';
    if (isSpeaking) return 'speaking';
    return 'idle';
  };

  return (
    <Layout
      chatPanel={
        <>
          <ChatWindow messages={messages} isLoading={isLoading} />
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
          />
        </>
      }
      avatarPanel={<AIAvatar state={getAvatarState()} />}
      summaryPanel={
        <SummaryPanel
          messages={messages}
          latestToolActivity={latestToolActivity}
          summary={summary}
          onEndConversation={endConversation}
          isLoading={isLoading}
        />
      }
    />
  );
}
