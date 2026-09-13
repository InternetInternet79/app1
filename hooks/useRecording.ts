import { useState, useRef, useCallback, useEffect } from 'react';
import { createSpeechRecognition, isSpeechRecognitionSupported, getSpeechLang } from '@/lib/speech';
import { AppSettings } from '@/lib/types';

type RecordingState = 'idle' | 'recording' | 'processing' | 'done' | 'error';

interface SpeechRecognitionInstance {
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export function useRecording(language: AppSettings['language']) {
  const [state, setState] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finalTranscriptRef = useRef('');
  const startTimeRef = useRef(0);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setDuration(elapsed);
    setState('processing');
  }, []);

  const start = useCallback(() => {
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    setDuration(0);
    finalTranscriptRef.current = '';
    startTimeRef.current = Date.now();

    if (!isSpeechRecognitionSupported()) {
      setError('Speech recognition is not available on this device. You can type your thought instead.');
      setState('error');
      return;
    }

    const recognition = createSpeechRecognition(getSpeechLang(language), {
      onResult: (result) => {
        if (result.isFinal) {
          finalTranscriptRef.current += result.transcript;
          setTranscript(finalTranscriptRef.current);
          setInterimTranscript('');
        } else {
          setInterimTranscript(result.transcript);
        }
      },
      onError: (err) => {
        if (err === 'no-speech' || err === 'aborted') return;
        if (err === 'not-allowed') {
          setError('Microphone permission denied. Please allow microphone access to capture thoughts.');
        } else {
          setError(`Recording error: ${err}`);
        }
        setState('error');
      },
      onEnd: () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        const finalText = finalTranscriptRef.current.trim();
        setTranscript(finalText);
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
        if (finalText.length > 0) {
          setState('done');
        } else if (state !== 'error') {
          setState('idle');
        }
      },
    });

    if (!recognition) {
      setError('Could not start speech recognition.');
      setState('error');
      return;
    }

    recognitionRef.current = recognition;
    timerRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    try {
      recognition.start();
      setState('recording');
    } catch {
      setError('Could not start recording. Please try again.');
      setState('error');
    }
  }, [language, state]);

  const reset = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setState('idle');
    setTranscript('');
    setInterimTranscript('');
    setDuration(0);
    setError(null);
    finalTranscriptRef.current = '';
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { state, transcript, interimTranscript, duration, error, start, stop, reset };
}
