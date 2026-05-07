const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function sendChatMessage(userMessage, sessionId) {
  try {
    const params = new URLSearchParams({ user_message: userMessage });
    if (sessionId) params.set('session_id', sessionId);

    const response = await fetch(`${API_BASE}/conversation/chat?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Chat API error:', error);
    return {
      response: "I'm having trouble connecting right now. Please try again in a moment.",
      tool_activity: null,
    };
  }
}

export async function endConversation(sessionId) {
  try {
    const params = new URLSearchParams();
    if (sessionId) params.set('session_id', sessionId);

    const response = await fetch(`${API_BASE}/conversation/end?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('End conversation API error:', error);
    return {
      response: 'I could not generate the final summary right now.',
      summary: null,
      tool_activity: {
        tool_name: 'end_conversation',
        tool_result: {
          success: false,
          message: 'Summary generation failed.',
        },
      },
    };
  }
}

export async function transcribeAudio(audioBlob) {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice-input.webm');

    const response = await fetch(`${API_BASE}/conversation/transcribe`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Transcription API error:', error);
    return {
      transcript: '',
      error: 'Fallback transcription failed.',
    };
  }
}
