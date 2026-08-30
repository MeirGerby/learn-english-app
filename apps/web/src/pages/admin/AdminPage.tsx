import { useEffect, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { WORD_DATA } from "@learn-english/shared";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface FeedbackItem {
  id: string;
  text: string;
  authorEmail: string;
  createdAt: Timestamp | null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminPage() {
  const { user, admin, loading } = useAuth();
  const [feedbackText, setFeedbackText] = useState("");
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [importStatus, setImportStatus] = useState("");
  const [importing, setImporting] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (!admin) return;
    const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            text: data.text,
            authorEmail: data.authorEmail,
            createdAt: data.createdAt ?? null,
          };
        })
      );
    });
    return unsubscribe;
  }, [admin]);

  async function handleSubmitFeedback(e: FormEvent) {
    e.preventDefault();
    if (isSubmittingFeedback) return;
    const text = feedbackText.trim();
    if (!text || !user) return;
    setIsSubmittingFeedback(true);
    try {
      await addDoc(collection(db, "feedback"), {
        text,
        authorEmail: user.email,
        createdAt: serverTimestamp(),
      });
      setFeedbackText("");
    } catch {
      alert("שמירת המשוב נכשלה. נסו שוב.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  }

  async function handleImportWords() {
    setImporting(true);
    setImportStatus("מתחיל ייבוא...");

    const entries: { word: string; translation: string; example: string; category: string }[] = [];
    Object.entries(WORD_DATA).forEach(([category, words]) => {
      words.forEach((w) => entries.push({ ...w, category }));
    });

    const BATCH_LIMIT = 450;
    let written = 0;
    try {
      for (let i = 0; i < entries.length; i += BATCH_LIMIT) {
        const chunk = entries.slice(i, i + BATCH_LIMIT);
        const batch = writeBatch(db);
        chunk.forEach((entry) => {
          const id = `${entry.category}__${slugify(entry.word)}`;
          batch.set(doc(db, "words", id), entry);
        });
        await batch.commit();
        written += chunk.length;
        setImportStatus(`מייבא... ${written} / ${entries.length}`);
      }
      setImportStatus(`✓ הייבוא הושלם! ${written} מילים יובאו בהצלחה.`);
    } catch (err) {
      setImportStatus(`שגיאה בייבוא: ${(err as Error).message}`);
    } finally {
      setImporting(false);
    }
  }

  if (loading) {
    return (
      <div className="app mx-auto max-w-xl w-full px-4 py-6">
        <TopBar />
        <p className="text-center text-muted-foreground py-12">בודק הרשאות...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
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
            <Button type="submit" className="self-start mt-1" disabled={isSubmittingFeedback}>
              {isSubmittingFeedback ? "שומרת..." : "שמירת משוב"}
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
                    {item.authorEmail} · {item.createdAt ? item.createdAt.toDate().toLocaleString("he-IL") : ""}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const snippet = item.text.length > 40 ? `${item.text.slice(0, 40)}...` : item.text;
                      if (!window.confirm(`למחוק את המשוב "${snippet}"? לא ניתן לבטל פעולה זו.`)) return;
                      try {
                        await deleteDoc(doc(db, "feedback", item.id));
                      } catch {
                        alert("מחיקת המשוב נכשלה. נסו שוב.");
                      }
                    }}
                  >
                    מחיקה
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-card border rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-lg mb-2">ייבוא מילים למאגר הנתונים</h2>
          <p className="text-muted-foreground text-sm mb-3">
            מעביר את כל רשימות המילים לבסיס הנתונים (Firestore), כדי שהמשחקים ישתמשו בו במקום ברשימה המקומית. אפשר להריץ
            שוב בבטחה - מילים קיימות יתעדכנו ולא ישוכפלו.
          </p>
          <Button onClick={handleImportWords} disabled={importing}>
            📥 ייבוא מילים
          </Button>
          <p className="text-muted-foreground text-sm mt-3">{importStatus}</p>
        </section>
      </main>
    </div>
  );
}
