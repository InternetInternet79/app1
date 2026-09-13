type SpeechRecognitionResult = {
  transcript: string;
  isFinal: boolean;
};

type SpeechRecognitionCallbacks = {
  onResult: (result: SpeechRecognitionResult) => void;
  onError: (error: string) => void;
  onEnd: () => void;
};

interface SpeechRecognitionEvent {
  results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function createSpeechRecognition(
  lang: string,
  callbacks: SpeechRecognitionCallbacks
): SpeechRecognitionInstance | null {
  if (!isSpeechRecognitionSupported()) return null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition!;
  const recognition = new SR();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = lang;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    for (let i = 0; i < event.results.length; i++) {
      const result = event.results[i];
      callbacks.onResult({
        transcript: result[0].transcript,
        isFinal: result.isFinal,
      });
    }
  };

  recognition.onerror = (event: { error: string }) => {
    callbacks.onError(event.error);
  };

  recognition.onend = () => {
    callbacks.onEnd();
  };

  return recognition;
}

export function getSpeechLang(lang: 'english' | 'hindi' | 'both'): string {
  if (lang === 'hindi') return 'hi-IN';
  if (lang === 'both') return 'en-IN';
  return 'en-US';
}
