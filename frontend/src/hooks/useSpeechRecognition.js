import { useCallback, useEffect, useRef, useState } from 'react';
import { transcribeAudio } from '../services/api';

const Recognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(Boolean(Recognition));
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasMicSignal, setHasMicSignal] = useState(false);
  const [isFallbackTranscribing, setIsFallbackTranscribing] = useState(false);

  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const isRecognitionActiveRef = useRef(false);
  const restartTimerRef = useRef(null);
  const noTranscriptTimerRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const interimTranscriptRef = useRef('');
  const segmentFinalRef = useRef('');
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const meterFrameRef = useRef(null);
  const heardAudioRef = useRef(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const clearTimers = useCallback(() => {
    window.clearTimeout(restartTimerRef.current);
    window.clearTimeout(noTranscriptTimerRef.current);
    restartTimerRef.current = null;
    noTranscriptTimerRef.current = null;
  }, []);

  const stopAudioMeter = useCallback(() => {
    if (meterFrameRef.current) {
      cancelAnimationFrame(meterFrameRef.current);
      meterFrameRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    audioContextRef.current?.close?.();
    audioContextRef.current = null;
    analyserRef.current = null;
    setAudioLevel(0);
    setHasMicSignal(false);
    heardAudioRef.current = false;
  }, []);

  const startFallbackRecorder = useCallback((stream) => {
    if (!window.MediaRecorder) return;

    try {
      audioChunksRef.current = [];
      const options = MediaRecorder.isTypeSupported?.('audio/webm')
        ? { mimeType: 'audio/webm' }
        : undefined;
      const recorder = new MediaRecorder(stream, options);
      recorder.ondataavailable = (event) => {
        if (event.data?.size) {
          audioChunksRef.current.push(event.data);
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
    } catch (err) {
      console.warn('Fallback recorder unavailable:', err);
    }
  }, []);

  const stopFallbackRecorder = useCallback(() => (
    new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        const blob = audioChunksRef.current.length
          ? new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' })
          : null;
        mediaRecorderRef.current = null;
        audioChunksRef.current = [];
        resolve(blob);
      };

      try {
        recorder.stop();
      } catch {
        resolve(null);
      }
    })
  ), []);

  const startAudioMeter = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Browser microphone APIs are unavailable.');
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    streamRef.current = stream;
    startFallbackRecorder(stream);
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.75;
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const samples = new Uint8Array(analyser.fftSize);
    const tick = () => {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (let i = 0; i < samples.length; i += 1) {
        const value = (samples[i] - 128) / 128;
        sum += value * value;
      }

      const rms = Math.sqrt(sum / samples.length);
      const nextLevel = Math.min(1, rms * 9);
      setAudioLevel(nextLevel);

      if (nextLevel > 0.08) {
        heardAudioRef.current = true;
        setHasMicSignal(true);
      }

      meterFrameRef.current = requestAnimationFrame(tick);
    };

    tick();
  }, [startFallbackRecorder]);

  const scheduleTranscriptWatchdog = useCallback(() => {
    window.clearTimeout(noTranscriptTimerRef.current);
    noTranscriptTimerRef.current = window.setTimeout(() => {
      if (!shouldListenRef.current || finalTranscriptRef.current || interimTranscriptRef.current) return;

      if (heardAudioRef.current) {
        setStatusMessage('Mic audio detected. Waiting for the browser transcript service...');
        setError('');
      } else {
        setStatusMessage('Listening, but the mic signal is very low.');
        setError('Try speaking closer to the microphone or check your browser input device.');
      }
    }, 4500);
  }, []);

  const startRecognitionSegment = useCallback(() => {
    if (!recognitionRef.current || isRecognitionActiveRef.current || !shouldListenRef.current) {
      return;
    }

    try {
      setStatusMessage('Listening...');
      recognitionRef.current.start();
    } catch (err) {
      if (err.name !== 'InvalidStateError') {
        console.error('Failed to start recognition:', err);
        setError('Could not start browser speech recognition.');
      }
    }
  }, []);

  useEffect(() => {
    setIsSupported(Boolean(Recognition));
    if (!Recognition) return undefined;

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = navigator.language?.startsWith('en') ? navigator.language : 'en-IN';

    recognition.onstart = () => {
      isRecognitionActiveRef.current = true;
      segmentFinalRef.current = '';
      setIsListening(true);
      setError('');
      scheduleTranscriptWatchdog();
    };

    recognition.onaudiostart = () => {
      setStatusMessage('Microphone connected. Speak naturally.');
      scheduleTranscriptWatchdog();
    };

    recognition.onsoundstart = () => {
      setStatusMessage('Audio detected...');
    };

    recognition.onspeechstart = () => {
      setStatusMessage('Transcribing...');
      setError('');
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';

      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript?.trim();
        if (!text) continue;
        if (result.isFinal) {
          finalText = `${finalText} ${text}`.trim();
        } else {
          interimText = `${interimText} ${text}`.trim();
        }
      }

      if (finalText) {
        const addition = finalText.replace(segmentFinalRef.current, '').trim();
        segmentFinalRef.current = finalText;
        if (addition) {
          const current = finalTranscriptRef.current.trim();
          const next = current ? `${current} ${addition}` : addition;
          finalTranscriptRef.current = next;
          setTranscript(next);
        }
      }

      interimTranscriptRef.current = interimText;
      setInterimTranscript(interimText);
      setStatusMessage(interimText || finalText ? 'Transcript updating...' : 'Listening...');
      setError('');
      scheduleTranscriptWatchdog();
    };

    recognition.onerror = (event) => {
      isRecognitionActiveRef.current = false;

      if (event.error === 'no-speech') {
        if (heardAudioRef.current) {
          setStatusMessage('Audio detected, but no words were returned yet. Keep speaking or try again.');
          setError('');
        } else {
          setStatusMessage('No speech detected yet.');
          setError('The browser is not detecting speech from the selected microphone.');
        }
        return;
      }

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        shouldListenRef.current = false;
        setIsListening(false);
        setStatusMessage('');
        setError('Microphone permission is blocked for this site.');
        stopAudioMeter();
        return;
      }

      if (event.error === 'audio-capture') {
        shouldListenRef.current = false;
        setIsListening(false);
        setStatusMessage('');
        setError('No microphone input device is available to the browser.');
        stopAudioMeter();
        return;
      }

      setError(`Speech recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      isRecognitionActiveRef.current = false;

      if (shouldListenRef.current) {
        restartTimerRef.current = window.setTimeout(startRecognitionSegment, 350);
        return;
      }

      setIsListening(false);
      interimTranscriptRef.current = '';
      setInterimTranscript('');
      setStatusMessage(finalTranscriptRef.current ? 'Transcript ready to send.' : '');
    };

    recognitionRef.current = recognition;

    return () => {
      shouldListenRef.current = false;
      clearTimers();
      try {
        recognition.abort();
      } catch {
        // Ignore browser cleanup errors.
      }
      stopFallbackRecorder();
      stopAudioMeter();
    };
  }, [clearTimers, scheduleTranscriptWatchdog, startRecognitionSegment, stopAudioMeter, stopFallbackRecorder]);

  const startListening = useCallback(async () => {
    if (!Recognition) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser. Use Chrome or Edge.');
      return;
    }

    if (shouldListenRef.current) return;

    clearTimers();
    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    segmentFinalRef.current = '';
    heardAudioRef.current = false;
    setTranscript('');
    setInterimTranscript('');
    interimTranscriptRef.current = '';
    setAudioLevel(0);
    setHasMicSignal(false);
    setError('');
    setStatusMessage('Requesting microphone...');
    shouldListenRef.current = true;

    try {
      await startAudioMeter();
      setIsListening(true);
      startRecognitionSegment();
      scheduleTranscriptWatchdog();
    } catch (err) {
      console.error('Microphone start failed:', err);
      shouldListenRef.current = false;
      setIsListening(false);
      setStatusMessage('');
      setError('Microphone permission failed. Allow microphone access in the browser and try again.');
      stopAudioMeter();
    }
  }, [clearTimers, scheduleTranscriptWatchdog, startAudioMeter, startRecognitionSegment, stopAudioMeter]);

  const stopListening = useCallback(async () => {
    shouldListenRef.current = false;
    clearTimers();

    try {
      recognitionRef.current?.stop();
    } catch {
      try {
        recognitionRef.current?.abort();
      } catch {
        // Ignore browser cleanup errors.
      }
    }

    isRecognitionActiveRef.current = false;
    setIsListening(false);
    setInterimTranscript('');
    setStatusMessage(finalTranscriptRef.current ? 'Transcript ready to send.' : '');
    const heardAudio = heardAudioRef.current;
    const fallbackAudio = await stopFallbackRecorder();
    stopAudioMeter();

    if (!finalTranscriptRef.current && heardAudio && fallbackAudio?.size) {
      setIsFallbackTranscribing(true);
      setStatusMessage('Browser transcript was empty. Running fallback transcription...');
      const result = await transcribeAudio(fallbackAudio);
      const fallbackText = result?.transcript?.trim();
      if (fallbackText) {
        finalTranscriptRef.current = fallbackText;
        setTranscript(fallbackText);
        setError('');
        setStatusMessage('Fallback transcript ready to send.');
      } else {
        setError(result?.error || 'No transcript could be produced from the recording.');
        setStatusMessage('');
      }
      setIsFallbackTranscribing(false);
    }
  }, [clearTimers, stopAudioMeter, stopFallbackRecorder]);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    segmentFinalRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setError('');
    setStatusMessage('');
  }, []);

  return {
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
  };
}
