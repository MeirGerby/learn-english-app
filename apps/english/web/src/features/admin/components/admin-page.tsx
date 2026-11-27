import { useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTRPC } from '../../../lib/trpc';
import { useAuth } from '../../../context/auth-context';
import { TopBar } from '../../../components/top-bar';
import { Button } from '@learn-english/ui/components/ui/button';
import { Textarea } from '@learn-english/ui/components/ui/textarea';
import { useDocumentTitle } from '../../../hooks/use-document-title';
import { UsersList } from './users-list';

type FeedbackItem = { id: string; text: string };

export function AdminPage() {
  useDocumentTitle('ניהול');
  const trpc = useTRPC();
  const { admin } = useAuth();
  const [feedbackText, setFeedbackText] = useState('');

  const feedback = useQuery(
    trpc.feedback.list.queryOptions(undefined, { enabled: admin }),
  );
  const items = feedback.data ?? [];

  const createFeedback = useMutation(
    trpc.feedback.create.mutationOptions({
      onSuccess: async () => {
        setFeedbackText('');
        await feedback.refetch();
      },
      onError: () => alert('שמירת המשוב נכשלה. נסו שוב.'),
    }),
  );

  const removeFeedback = useMutation(
    trpc.feedback.remove.mutationOptions({
      onSuccess: () => feedback.refetch(),
      onError: () => alert('מחיקת המשוב נכשלה. נסו שוב.'),
    }),
  );

  const handleSubmitFeedback = (e: FormEvent) => {
    e.preventDefault();
    const text = feedbackText.trim();
    if (!text || createFeedback.isPending) return;
    createFeedback.mutate({ text });
  };

  const handleRemoveFeedback = (item: FeedbackItem) => {
    const snippet =
      item.text.length > 40 ? `${item.text.slice(0, 40)}...` : item.text;
    if (!window.confirm(`למחוק את המשוב "${snippet}"? לא ניתן לבטל פעולה זו.`))
      return;
    removeFeedback.mutate({ id: item.id });
  };

  if (!admin) {
    return (
      <div className="app mx-auto max-w-xl w-full px-4 py-6">
        <TopBar />
        <p className="text-center text-muted-foreground py-12">
          אין לכם הרשאה לגשת לאזור זה.
        </p>
      </div>
    );
  }

  return (
    <div className="app mx-auto max-w-xl w-full px-4 py-6">
      <TopBar />
      <main>
        <header className="mb-7">
          <h1 className="text-2xl font-bold mb-1">אזור ניהול</h1>
          <p className="text-muted-foreground text-sm">
            המשתמשים הרשומים, יומן מעקב ורעיונות לשיפור המערכת
          </p>
        </header>

        <UsersList />

        <section className="bg-card border rounded-xl p-5 mb-8 shadow-sm">
          <form onSubmit={handleSubmitFeedback} className="flex flex-col gap-2">
            <label htmlFor="feedback-text" className="text-sm font-semibold">
              מה כדאי לשפר?
            </label>
            <Textarea
              id="feedback-text"
              required
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="תארו את הבאג, הרעיון או השיפור הנדרש..."
              className="min-h-24"
            />
            <Button
              type="submit"
              className="self-start mt-1"
              disabled={createFeedback.isPending}
            >
              {createFeedback.isPending ? 'שומרת...' : 'שמירת משוב'}
            </Button>
          </form>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg mb-3">משובים ונושאים לטיפול</h2>
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="bg-card border rounded-lg p-4 flex flex-col gap-3"
              >
                <p className="text-sm whitespace-pre-wrap m-0">{item.text}</p>
                <div className="flex items-center justify-between border-t pt-2.5 text-xs text-muted-foreground flex-wrap gap-2">
                  <span>
                    <span dir="ltr">{item.authorEmail}</span> ·{' '}
                    {new Date(item.createdAt).toLocaleString('he-IL')}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveFeedback(item)}
                  >
                    מחיקה
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
