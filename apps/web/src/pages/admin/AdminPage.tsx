import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useAsyncSubmit } from "@/hooks/useAsyncSubmit";

interface FeedbackItem {
  id: string;
  text: string;
  authorEmail: string;
  createdAt: number;
}

export default function AdminPage() {
  useDocumentTitle("ניהול");
  const { user, admin, loading } = useAuth();
  const location = useLocation();
  const [feedbackText, setFeedbackText] = useState("");
  const [items, setItems] = useState<FeedbackItem[]>([]);

  const submitForm = useAsyncSubmit();

  const refetch = useCallback(async () => {
    try {
      setItems(await trpc.feedback.list.query());
    } catch {
      // Leave existing items on query failures
    }
  }, []);

  useEffect(() => {
    if (admin) void refetch();
  }, [admin, user?.id, refetch]);

  const handleSubmitFeedback = (e: FormEvent) => {
    e.preventDefault();
    const text = feedbackText.trim();
    if (!text) return;

    submitForm.execute(
      () => trpc.feedback.create.mutate({ text }),
      {
        onSuccess: async () => {
          setFeedbackText("");
          await refetch();
        },
        onError: () => alert("שמירת המשוב נכשלה. נסו שוב."),
      }
    );
  };

  const handleRemoveFeedback = async (item: FeedbackItem) => {
    const snippet = item.text.length > 40 ? `${item.text.slice(0, 40)}...` : item.text;
    if (!window.confirm(`למחוק את המשוב "${snippet}"? לא ניתן לבטל פעולה זו.`)) return;

    try {
      await trpc.feedback.remove.mutate({ id: item.id });
      await refetch();
    } catch {
      alert("מחיקת המשוב נכשלה. נסו שוב.");
    }
  };

  if (loading) {
    return (
      <div className="app mx-auto max-w-xl w-full px-4 py-6">
        <TopBar />
        <p className="text-center text-muted-foreground py-12">בודק הרשאות...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!admin) {
    return (
      <div className="app mx-auto max-w-xl w-full px-4 py-6">
        <TopBar />
        <p className="text-center text-muted-foreground py-12">אין לכם הרשאה לגשת לאזור זה.</p>
      </div>
    );
  }

  return (
    <div className="app mx-auto max-w-xl w-full px-4 py-6">
      <TopBar />
      <main>
        <header className="mb-7">
          <h1 className="text-2xl font-bold mb-1">אזור ניהול</h1>
          <p className="text-muted-foreground text-sm">יומן מעקב, תיעוד באגים ורעיונות לשיפור המערכת</p>
        </header>

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
            <Button type="submit" className="self-start mt-1" disabled={submitForm.isSubmitting}>
              {submitForm.isSubmitting ? "שומרת..." : "שמירת משוב"}
            </Button>
          </form>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg mb-3">משובים ונושאים לטיפול</h2>
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.id} className="bg-card border rounded-lg p-4 flex flex-col gap-3">
                <p className="text-sm whitespace-pre-wrap m-0">{item.text}</p>
                <div className="flex items-center justify-between border-t pt-2.5 text-xs text-muted-foreground flex-wrap gap-2">
                  <span>
                    <span dir="ltr">{item.authorEmail}</span> · {new Date(item.createdAt).toLocaleString("he-IL")}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => handleRemoveFeedback(item)}>
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