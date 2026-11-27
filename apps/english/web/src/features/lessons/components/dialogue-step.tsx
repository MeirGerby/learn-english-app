import type { Lesson } from '@learn-english/english-contract';
import { Button } from '@learn-english/ui/components/ui/button';
import { cn } from '@learn-english/ui/lib/utils';
import { EnglishLine } from './english-line';

export function DialogueStep({
  lesson,
  onDone,
}: {
  lesson: Lesson;
  onDone: () => void;
}) {
  return (
    <section>
      <h2 className="font-semibold text-lg mb-3">השיחה</h2>
      <ol className="flex flex-col gap-3 mb-7">
        {lesson.dialogue.map((line) => (
          <li
            key={line.en}
            className={cn(
              'border rounded-2xl p-3',
              line.speaker === 'Maya' ? 'bg-card me-6' : 'bg-accent ms-6',
            )}
          >
            <p className="m-0 mb-1 text-xs font-bold text-primary" lang="en">
              {line.speaker}
            </p>
            <EnglishLine line={line} />
          </li>
        ))}
      </ol>

      <h2 className="font-semibold text-lg mb-3">משפטים שכדאי לזכור</h2>
      <ul className="flex flex-col gap-3 mb-7">
        {lesson.phrases.map((phrase) => (
          <li key={phrase.en} className="bg-card border rounded-xl p-3">
            <EnglishLine line={phrase} />
          </li>
        ))}
      </ul>

      <Button className="w-full h-11" onClick={onDone}>
        לתרגול
      </Button>
    </section>
  );
}
