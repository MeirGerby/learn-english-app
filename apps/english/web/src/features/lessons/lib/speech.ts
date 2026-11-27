// Text to speech and speech recognition, both from the browser itself.

export const canSpeak =
  typeof window !== 'undefined' && 'speechSynthesis' in window;

export function speak(text: string): void {
  if (!canSpeak) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (canSpeak) window.speechSynthesis.cancel();
}

// TypeScript's DOM library has no types for speech recognition.
export interface Recognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>;
      }) => void)
    | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
}

type RecognitionConstructor = new () => Recognition;

type SpeechWindow = Window & {
  SpeechRecognition?: RecognitionConstructor;
  webkitSpeechRecognition?: RecognitionConstructor;
};

// Null where the browser has no speech recognition (Firefox, for example).
export function createRecognition(): Recognition | null {
  const speechWindow = window as SpeechWindow;
  const Constructor =
    speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

  return Constructor ? new Constructor() : null;
}
