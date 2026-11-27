import { speechScore, type Line } from '@learn-english/english-contract';
import { Button } from '@learn-english/ui/components/ui/button';
import { cn } from '@learn-english/ui/lib/utils';
import { Mic } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  createRecognition,
  stopSpeaking,
  type Recognition,
} from '../lib/speech';
import { EnglishLine } from './english-line';

const PASS_SCORE = 0.7;

const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed':
    'אין הרשאה למיקרופון. אפשרו אותה בדפדפן, או אמרו בקול והמשיכו.',
  'no-speech': 'לא שמענו כלום. נסו שוב.',
  'audio-capture': 'לא נמצא מיקרופון.',
};

const FAILED_MESSAGE =
  'זיהוי הדיבור לא עבד. אפשר לנסות שוב, או לומר בקול ולהמשיך.';

// One sentence to say aloud. The parent gives it a key, so its state starts
// fresh. Speech recognition is not available everywhere and makes mistakes,
// so moving on never depends on it.
export function SpeakStep({
  line,
  onDone,
}: {
  line: Line;
  onDone: () => void;
}) {
  const [supported] = useState(() => createRecognition() !== null);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState<{ text: string; passed: boolean } | null>(
    null,
  );
  const [error, setError] = useState('');
  const recognitionRef = useRef<Recognition | null>(null);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  const listen = () => {
    const recognition = createRecognition();
    if (!recognition) return;

    // The microphone must not pick up the sentence being read aloud.
    stopSpeaking();
    recognitionRef.current?.abort();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
      const guesses = Array.from(event.results[0] ?? []);
      const best = guesses
        .map(({ transcript }) => ({
          text: transcript,
          score: speechScore(transcript, line.en),
        }))
        .sort((a, b) => b.score - a.score)[0];

      if (best) {
        setHeard({ text: best.text, passed: best.score >= PASS_SCORE });
      }
    };
    recognition.onerror = (event) => {
      if (event.error !== 'aborted') {
        setError(ERROR_MESSAGES[event.error] ?? FAILED_MESSAGE);
      }
    };
    recognition.onend = () => setListening(false);

    setHeard(null);
    setError('');
    try {
      recognition.start();
      setListening(true);
    } catch {
      setError(FAILED_MESSAGE);
    }
  };

  return (
    <section>
      <h2 className="font-semibold text-lg mb-3">אמרו בקול</h2>
      <div className="bg-card border rounded-2xl p-4 mb-4">
        <EnglishLine line={line} />
      </div>

      {supported ? (
        <>
          <Button
            type="button"
            className="w-full h-11"
            disabled={listening}
            onClick={listen}
          >
            <Mic className="w-4 h-4 me-2" />
            {listening ? 'מקשיבים...' : 'לחצו ודברו'}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            זיהוי הדיבור הוא של הדפדפן, ויש דפדפנים ששולחים את ההקלטה לשרת שלהם
            לצורך הזיהוי.
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          הדפדפן הזה לא תומך בזיהוי דיבור. אמרו את המשפט בקול והמשיכו.
        </p>
      )}

      <div aria-live="polite" className="min-h-12 text-center mt-3">
        {heard && (
          <>
            <p
              className={cn(
                'font-semibold m-0',
                heard.passed ? 'text-green-600' : 'text-red-600',
              )}
            >
              {heard.passed ? 'מעולה! ✓' : 'כמעט, נסו שוב'}
            </p>
            <p className="text-sm text-muted-foreground m-0">
              שמענו:{' '}
              <span dir="ltr" lang="en">
                {heard.text}
              </span>
            </p>
          </>
        )}
        {error && <p className="text-sm text-red-600 m-0">{error}</p>}
      </div>

      <Button
        type="button"
        variant={heard?.passed ? 'default' : 'outline'}
        className="w-full h-11 mt-2"
        onClick={onDone}
      >
        {heard?.passed ? 'המשך' : 'אמרתי בקול, להמשיך'}
      </Button>
    </section>
  );
}
