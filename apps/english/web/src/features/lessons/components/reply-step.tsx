import {
  matchesReply,
  shuffle,
  type ReplyExercise,
} from '@learn-english/english-contract';
import { Button } from '@learn-english/ui/components/ui/button';
import { Input } from '@learn-english/ui/components/ui/input';
import { cn } from '@learn-english/ui/lib/utils';
import { useState, type FormEvent } from 'react';
import { EnglishLine } from './english-line';

type Mode = 'build' | 'type';
type Result = 'correct' | 'wrong' | 'revealed' | null;

// One reply, built from word chips or typed. The parent gives it a key, so its
// state starts fresh. Only the listed sentences count as right, so a student
// can always ask to see the answer and move on.
export function ReplyStep({
  exercise,
  onDone,
}: {
  exercise: ReplyExercise;
  onDone: () => void;
}) {
  const [chips] = useState(() =>
    shuffle(exercise.answer.en.split(' ').map((text, id) => ({ id, text }))),
  );
  const [mode, setMode] = useState<Mode>('build');
  const [chosen, setChosen] = useState<number[]>([]);
  const [typed, setTyped] = useState('');
  const [result, setResult] = useState<Result>(null);

  const finished = result === 'correct' || result === 'revealed';
  const textOf = (id: number) => chips.find((chip) => chip.id === id)?.text;
  const reply = mode === 'type' ? typed : chosen.map(textOf).join(' ');

  const check = (e: FormEvent) => {
    e.preventDefault();
    if (finished || !reply.trim()) return;

    const accepted = [exercise.answer.en, ...exercise.alsoAccepted];
    setResult(matchesReply(reply, accepted) ? 'correct' : 'wrong');
  };

  const changeMode = (next: Mode) => {
    setMode(next);
    setResult(null);
  };

  const toggleChip = (id: number) => {
    setResult(null);
    setChosen((ids) =>
      ids.includes(id) ? ids.filter((other) => other !== id) : [...ids, id],
    );
  };

  return (
    <section>
      <h2 className="font-semibold text-lg mb-3">ענו בעצמכם</h2>
      <div className="bg-accent border rounded-2xl p-3 mb-4">
        <EnglishLine line={exercise.prompt} />
      </div>
      <p className="mb-3">
        כתבו באנגלית: <strong>{exercise.answer.he}</strong>
      </p>

      <div className="flex gap-2 mb-3">
        {(['build', 'type'] as const).map((value) => (
          <Button
            key={value}
            type="button"
            variant={mode === value ? 'default' : 'outline'}
            aria-pressed={mode === value}
            className="flex-1 h-11"
            disabled={finished}
            onClick={() => changeMode(value)}
          >
            {value === 'build' ? 'הרכבת משפט' : 'הקלדה'}
          </Button>
        ))}
      </div>

      <form onSubmit={check}>
        {mode === 'type' ? (
          <Input
            dir="ltr"
            lang="en"
            aria-label="התשובה שלכם באנגלית"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="h-11 mb-3"
            disabled={finished}
            value={typed}
            onChange={(e) => {
              setTyped(e.target.value);
              setResult(null);
            }}
          />
        ) : (
          <div dir="ltr" lang="en" className="mb-3">
            <div
              className="flex flex-wrap gap-2 min-h-14 border border-dashed rounded-xl p-1.5 mb-2"
              data-testid="answer-row"
            >
              {chosen.map((id) => (
                <Chip
                  key={id}
                  text={textOf(id)}
                  disabled={finished}
                  onClick={() => toggleChip(id)}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-2 min-h-11">
              {chips
                .filter((chip) => !chosen.includes(chip.id))
                .map((chip) => (
                  <Chip
                    key={chip.id}
                    text={chip.text}
                    disabled={finished}
                    onClick={() => toggleChip(chip.id)}
                  />
                ))}
            </div>
          </div>
        )}

        <p
          aria-live="polite"
          className={cn(
            'min-h-6 text-center font-semibold',
            result === 'correct' ? 'text-green-600' : 'text-red-600',
          )}
        >
          {result === 'correct' && 'נכון! ✓'}
          {result === 'wrong' && 'עדיין לא, נסו שוב'}
        </p>

        {result === 'revealed' && (
          <p className="text-center mb-2">
            אפשר לומר:{' '}
            <span dir="ltr" lang="en" className="font-semibold">
              {exercise.answer.en}
            </span>
          </p>
        )}

        {!finished && (
          <div className="flex gap-2 mt-2">
            <Button type="submit" className="flex-1 h-11">
              בדיקה ✓
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11"
              onClick={() => setResult('revealed')}
            >
              הצגת תשובה
            </Button>
          </div>
        )}
      </form>

      {finished && (
        <Button className="w-full h-11 mt-2" onClick={onDone}>
          המשך
        </Button>
      )}
    </section>
  );
}

function Chip({
  text,
  disabled,
  onClick,
}: {
  text: string | undefined;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="min-h-11 rounded-lg border bg-card px-3.5 py-2.5 text-sm cursor-pointer disabled:cursor-default"
    >
      {text}
    </button>
  );
}
