import { useCallback, useEffect, useMemo, useState } from 'react';
import { endConversation as requestEndConversation, sendChatMessage } from '../services/api';

const STORAGE_KEY = 'careflow-temp-chat';

const createSessionId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const welcomeMessage = () => ({
  id: 'welcome',
  role: 'assistant',
  content: "Hello, I'm CareFlow AI. I can help you check slots, book, modify, retrieve, or cancel appointments. How can I help?",
  timestamp: new Date(),
  toolActivity: null,
});

const reviveMessages = (messages) =>
  messages.map((message) => ({
    ...message,
    timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
  }));

export function useChat() {
  const initialState = useMemo(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved?.messages?.length && saved?.sessionId) {
        return {
          sessionId: saved.sessionId,
          messages: reviveMessages(saved.messages),
          summary: saved.summary || null,
        };
      }
    } catch {
      // Ignore malformed localStorage and start a clean session.
    }

    return {
      sessionId: createSessionId(),
      messages: [welcomeMessage()],
      summary: null,
    };
  }, []);

  const [sessionId, setSessionId] = useState(initialState.sessionId);
  const [messages, setMessages] = useState(initialState.messages);
  const [summary, setSummary] = useState(initialState.summary);
  const [isLoading, setIsLoading] = useState(false);
  const [latestToolActivity, setLatestToolActivity] = useState(null);
  const [pendingMessage, setPendingMessage] = useState('');

  useEffect(() => {
    const isFreshSession =
      messages.length <= 1 &&
      messages[0]?.id === 'welcome';

    if (isFreshSession) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        sessionId,
        messages,
        summary,
      })
    );
  }, [messages, sessionId, summary]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
      toolActivity: null,
    };

    setMessages((prev) => [...prev, userMessage]);
    setPendingMessage(getPendingMessage(text));
    setIsLoading(true);
    setLatestToolActivity(null);

    try {
      const data = await sendChatMessage(text.trim(), sessionId);

      if (data.session_id && data.session_id !== sessionId) {
        setSessionId(data.session_id);
      }

      const toolActivity = data.tool_activity?.tool_name
        ? data.tool_activity
        : null;

      if (toolActivity) {
        setLatestToolActivity(toolActivity);
      }

      const aiMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        toolActivity,
      };

      setMessages((prev) => [...prev, aiMessage]);
      return data;
    } catch (error) {
      console.error('Send message error:', error);
      const errorMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble right now. Please try again.",
        timestamp: new Date(),
        toolActivity: null,
      };
      setMessages((prev) => [...prev, errorMessage]);
      return null;
    } finally {
      setPendingMessage('');
      setIsLoading(false);
    }
  }, [isLoading, sessionId]);

  const endConversation = useCallback(async () => {
    if (isLoading) return null;

    setIsLoading(true);
    try {
      const data = await requestEndConversation(sessionId);
      if (data.summary) {
        setSummary(data.summary);
      }

      const toolActivity = data.tool_activity?.tool_name
        ? data.tool_activity
        : {
            tool_name: 'end_conversation',
            tool_result: {
              success: Boolean(data.summary),
              message: data.summary ? 'Conversation summary generated.' : 'Summary unavailable.',
            },
          };

      setLatestToolActivity(toolActivity);

      const aiMessage = {
        id: `ai-summary-${Date.now()}`,
        role: 'assistant',
        content: data.response || 'Conversation ended. I generated the summary for this session.',
        timestamp: new Date(),
        toolActivity,
      };

      setMessages((prev) => [...prev, aiMessage]);
      return data;
    } catch (error) {
      console.error('End conversation error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionId]);

  const clearChat = useCallback(() => {
    setSessionId(createSessionId());
    setMessages([welcomeMessage()]);
    setLatestToolActivity(null);
    setSummary(null);
  }, []);

  return {
    sessionId,
    messages,
    isLoading,
    latestToolActivity,
    summary,
    sendMessage,
    endConversation,
    clearChat,
    pendingMessage,
  };
}


function getPendingMessage(text) {
  const value = text.toLowerCase();

  if (
    value.includes('slot') ||
    value.includes('availability')
  ) {
    return 'Checking appointment availability';
  }

  if (
    value.includes('book') ||
    value.includes('appointment')
  ) {
    return 'Preparing booking workflow';
  }

  if (
    value.includes('reschedule')
  ) {
    return 'Looking for alternate schedules';
  }

  if (
    value.includes('cancel')
  ) {
    return 'Retrieving appointment details';
  }

  return 'Processing your request';
}