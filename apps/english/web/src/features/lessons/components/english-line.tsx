import { Button } from '@learn-english/ui/components/ui/button';
import type { Line } from '@learn-english/english-contract';
import { Volume2 } from 'lucide-react';
import { canSpeak, speak } from '../lib/speech';

// An English line, its Hebrew meaning and a button that reads it aloud.
export function EnglishLine({ line }: { line: Line }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="m-0 font-semibold" dir="ltr" lang="en">
          {line.en}
        </p>
        <p className="m-0 text-sm text-muted-foreground">{line.he}</p>
      </div>
      {canSpeak && (
        <Button
          type="button"
          variant="outline"
          className="h-11 w-11 shrink-0"
          aria-label={`השמעה: ${line.en}`}
          onClick={() => speak(line.en)}
        >
          <Volume2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
