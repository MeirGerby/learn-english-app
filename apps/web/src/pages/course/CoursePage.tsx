import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  addCourseItem,
  deleteCourseItem,
  getYouTubeEmbedUrl,
  listCourseContent,
  type CourseContentItem,
} from "@/lib/courseContent";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function CoursePage() {
  useDocumentTitle("קורס");
  const { user, admin, loading } = useAuth();
  const location = useLocation();
  const [items, setItems] = useState<CourseContentItem[]>([]);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentError, setContentError] = useState(false);
  const [brokenIds, setBrokenIds] = useState<Set<string>>(new Set());
  const [type, setType] = useState<"video" | "image">("video");
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refetch = useCallback(async () => {
    try {
      setItems(await listCourseContent());
      setContentError(false);
    } catch {
      setContentError(true);
    } finally {
      setContentLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    setContentLoading(true);
    setContentError(false);
    void refetch();
    // Keyed on user?.id, not the user object - see usePlacement.tsx for why.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  function markBroken(id: string) {
    setBrokenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    if (!url.trim()) return;
    setIsSubmitting(true);
    try {
      await addCourseItem({ type, url: url.trim(), caption: caption.trim() });
      setUrl("");
      setCaption("");
      await refetch();
    } catch {
      alert("הוספת התוכן נכשלה. נסי שוב.");
    } finally {
      setIsSubmitting(false);
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

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return (
    <div className="app mx-auto max-w-xl w-full px-4 py-6">
      <TopBar backTo={{ href: "/", label: "🏠 חזרה לדף הבית" }} />

      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-1">🎓 הקורס של הודיה</h1>
        <p className="text-muted-foreground text-sm">סרטונים ותמונות מהקורס יופיעו כאן.</p>
      </header>

      {admin && (
        <section className="bg-card border rounded-xl p-5 mb-8 shadow-sm">
          <h2 className="font-semibold mb-3">הוספת תוכן</h2>
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Button type="button" variant={type === "video" ? "default" : "outline"} className="flex-1 h-11" onClick={() => setType("video")}>
                🎬 סרטון
              </Button>
              <Button type="button" variant={type === "image" ? "default" : "outline"} className="flex-1 h-11" onClick={() => setType("image")}>
                🖼️ תמונה
              </Button>
            </div>
            <div>
              <Label htmlFor="course-url" className="text-muted-foreground text-sm">
                {type === "video" ? "קישור לסרטון (YouTube או קישור ישיר ל-mp4)" : "קישור לתמונה"}
              </Label>
              <Input id="course-url" dir="ltr" required value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1 h-11" />
            </div>
            <div>
              <Label htmlFor="course-caption" className="text-muted-foreground text-sm">
                כיתוב (רשות)
              </Label>
              <Input id="course-caption" value={caption} onChange={(e) => setCaption(e.target.value)} className="mt-1 h-11" />
            </div>
            <Button type="submit" className="self-start h-11" disabled={isSubmitting}>
              {isSubmitting ? "מוסיפה..." : "הוספה"}
            </Button>
          </form>
        </section>
      )}

      {contentLoading ? (
        <p className="text-center text-muted-foreground py-12">טוען תוכן...</p>
      ) : contentError ? (
        <p className="text-center text-destructive py-12">אירעה שגיאה בטעינת התוכן. נסו לרענן את הדף.</p>
      ) : items.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">עדיין אין תוכן בקורס. חזרו לבדוק בקרוב!</p>
      ) : (
        <div className="flex flex-col gap-5">
          {items.map((item) => {
            const embedUrl = item.type === "video" ? getYouTubeEmbedUrl(item.url) : null;
            return (
              <div key={item.id} className="bg-card border rounded-xl overflow-hidden shadow-sm">
                {item.type === "image" ? (
                  brokenIds.has(item.id) ? (
                    <p className="text-center text-muted-foreground text-sm py-12">
                      ⚠️ לא ניתן לטעון את התמונה
                    </p>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.caption || ""}
                      className="w-full h-auto"
                      onError={() => markBroken(item.id)}
                    />
                  )
                ) : embedUrl ? (
                  <div className="aspect-video">
                    <iframe
                      src={embedUrl}
                      title={item.caption || "סרטון קורס"}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : brokenIds.has(item.id) ? (
                  <p className="text-center text-muted-foreground text-sm py-12">
                    ⚠️ לא ניתן לטעון את הסרטון
                  </p>
                ) : (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video
                    src={item.url}
                    controls
                    className="w-full h-auto"
                    onError={() => markBroken(item.id)}
                  />
                )}
                <div className="p-3 flex items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground m-0">{item.caption}</p>
                  {admin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (!window.confirm(`למחוק את "${item.caption || "הפריט"}"? לא ניתן לבטל פעולה זו.`)) return;
                        try {
                          await deleteCourseItem(item.id);
                          await refetch();
                        } catch {
                          alert("מחיקת הפריט נכשלה. נסי שוב.");
                        }
                      }}
                    >
                      מחיקה
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
