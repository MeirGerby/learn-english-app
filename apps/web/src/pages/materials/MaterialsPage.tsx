import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  deleteMaterial,
  formatFileSize,
  getMaterialFileUrl,
  listMaterials,
  uploadMaterial,
  type MaterialItem,
} from "@/lib/materials";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const MAX_FILE_BYTES = 8 * 1024 * 1024;

export default function MaterialsPage() {
  useDocumentTitle("חומרים");
  const { user, admin, loading } = useAuth();
  const location = useLocation();
  const [items, setItems] = useState<MaterialItem[]>([]);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentError, setContentError] = useState(false);
  const [caption, setCaption] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refetch = useCallback(async () => {
    try {
      setItems(await listMaterials());
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

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setUploadError("");

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setUploadError("בחרו קובץ PDF להעלאה.");
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("ניתן להעלות קבצי PDF בלבד.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setUploadError(`הקובץ גדול מדי (מקסימום ${formatFileSize(MAX_FILE_BYTES)}).`);
      return;
    }

    setIsSubmitting(true);
    try {
      await uploadMaterial(file, caption.trim());
      setCaption("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      await refetch();
    } catch {
      setUploadError("העלאת הקובץ נכשלה. נסי שוב.");
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
        <h1 className="text-2xl font-bold mb-1">📄 חומרים של הודיה</h1>
        <p className="text-muted-foreground text-sm">דפי עבודה וחומרי לימוד להורדה.</p>
      </header>

      {admin && (
        <section className="bg-card border rounded-xl p-5 mb-8 shadow-sm">
          <h2 className="font-semibold mb-3">העלאת חומר חדש</h2>
          <form onSubmit={handleUpload} className="flex flex-col gap-3">
            <div>
              <Label htmlFor="material-file" className="text-muted-foreground text-sm">
                קובץ PDF
              </Label>
              <Input id="material-file" type="file" accept="application/pdf,.pdf" ref={fileInputRef} className="mt-1 h-11 pt-1.5" />
            </div>
            <div>
              <Label htmlFor="material-caption" className="text-muted-foreground text-sm">
                כיתוב (רשות)
              </Label>
              <Input id="material-caption" value={caption} onChange={(e) => setCaption(e.target.value)} className="mt-1 h-11" />
            </div>
            <p aria-live="polite" className="text-destructive text-sm min-h-[18px]">
              {uploadError}
            </p>
            <Button type="submit" className="self-start h-11" disabled={isSubmitting}>
              {isSubmitting ? "מעלה..." : "העלאה"}
            </Button>
          </form>
        </section>
      )}

      {contentLoading ? (
        <p className="text-center text-muted-foreground py-12">טוען חומרים...</p>
      ) : contentError ? (
        <p className="text-center text-destructive py-12">אירעה שגיאה בטעינת החומרים. נסו לרענן את הדף.</p>
      ) : items.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">עדיין אין חומרים. חזרו לבדוק בקרוב!</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id} className="bg-card border rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <a
                  href={getMaterialFileUrl(item.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-primary hover:underline block truncate"
                  dir="ltr"
                >
                  📄 {item.filename}
                </a>
                {item.caption && <p className="text-sm text-muted-foreground m-0 truncate">{item.caption}</p>}
                <p className="text-xs text-muted-foreground m-0">{formatFileSize(item.fileSize)}</p>
              </div>
              {admin && (
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={async () => {
                    if (!window.confirm(`למחוק את "${item.filename}"? לא ניתן לבטל פעולה זו.`)) return;
                    try {
                      await deleteMaterial(item.id);
                      await refetch();
                    } catch {
                      alert("מחיקת הקובץ נכשלה. נסי שוב.");
                    }
                  }}
                >
                  מחיקה
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
