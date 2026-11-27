import { shuffle, type ChoiceExercise } from '@learn-english/english-contract';
import { Button } from '@learn-english/ui/components/ui/button';
import { cn } from '@learn-english/ui/lib/utils';
import { useState } from 'react';
import { EnglishLine } from './english-line';

// One question. The parent gives it a key, so its state starts fresh. A wrong
// pick can be retried until the right answer is found.
export function ChooseStep({
  exercise,
  onDone,
}: {
  exercise: ChoiceExercise;
  onDone: () => void;
}) {
  const [options] = useState(() =>
    shuffle([exercise.correct, ...exercise.wrong]),
  );
  const [picked, setPicked] = useState<string[]>([]);
  const solved = picked.includes(exercise.correct);

  return (
    <section>
      <h2 className="font-semibold text-lg mb-3">מה תענו?</h2>
      <div className="bg-accent border rounded-2xl p-3 mb-4">
        <EnglishLine line={exercise.prompt} />
      </div>

      <div className="flex flex-col gap-2.5">
        {options.map((option) => {
          const wasPicked = picked.includes(option);
          const isCorrect = option === exercise.correct;

          return (
            <button
              key={option}
              type="button"
              disabled={solved || wasPicked}
              onClick={() => setPicked((all) => [...all, option])}
              dir="ltr"
              lang="en"
              className={cn(
                'rounded-lg border px-4 py-3.5 text-start text-sm transition-colors',
                !solved && !wasPicked && 'hover:bg-accent cursor-pointer',
                wasPicked &&
                  isCorrect &&
                  'bg-green-100 border-green-500 text-green-700 font-semibold',
                wasPicked &&
                  !isCorrect &&
                  'bg-red-100 border-red-500 text-red-700',
              )}
            >
              {option}
            </button>
          );
        })}
      </div>

      <p
        aria-live="polite"
        className={cn(
          'min-h-6 text-center font-semibold mt-3',
          solved ? 'text-green-600' : 'text-red-600',
        )}
      >
        {solved ? 'נכון! ✓' : picked.length > 0 ? 'לא נכון, נסו שוב' : ''}
      </p>

      {solved && (
        <Button className="w-full h-11 mt-2" onClick={onDone}>
          המשך
        </Button>
      )}
    </section>
  );
}
