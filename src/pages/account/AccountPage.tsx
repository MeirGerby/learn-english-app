import { useRef, useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, type AuthError } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const ERROR_MESSAGES: Record<string, string> = {
  "auth/wrong-password": "הסיסמה הנוכחית שגויה.",
  "auth/invalid-credential": "הסיסמה הנוכחית שגויה.",
  "auth/weak-password": "הסיסמה החדשה חלשה מדי.",
  "auth/requires-recent-login": "יש להתחבר מחדש כדי לשנות סיסמה. התנתקו והתחברו שוב ונסו שוב.",
  "auth/too-many-requests": "יותר מדי ניסיונות. נסו שוב מאוחר יותר.",
};

export default function AccountPage() {
  useDocumentTitle("החשבון שלי");
  const { user, loading } = useAuth();
  const location = useLocation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const submittingRef = useRef(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError("");
    setSuccess("");

    if (newPassword !== confirm) {
      setError("הסיסמאות החדשות אינן תואמות.");
      submittingRef.current = false;
      return;
    }

    setIsSubmitting(true);
    try {
      const credential = EmailAuthProvider.credential(user!.email!, currentPassword);
      await reauthenticateWithCredential(user!, credential);
      await updatePassword(user!, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      setSuccess("הסיסמה עודכנה בהצלחה.");
    } catch (err) {
      const code = (err as AuthError).code;
      setError(ERROR_MESSAGES[code] || "אירעה שגיאה. נסו שוב.");
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
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
      <main className="max-w-sm mx-auto mt-10">
        <h1 className="text-center font-bold text-2xl mb-5">שינוי סיסמה</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-1.5 bg-card border rounded-2xl p-6">
          <Label htmlFor="acc-current" className="text-muted-foreground mt-2">
            סיסמה נוכחית
          </Label>
          <div className="relative" dir="ltr">
            <Input
              id="acc-current"
              type={showCurrent ? "text" : "password"}
              required
              autoComplete="current-password"
              className="h-11 pe-9"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <button
              type="button"
              aria-label={showCurrent ? "הסתר סיסמה" : "הצג סיסמה"}
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute top-1/2 -translate-y-1/2 end-2 min-w-8 min-h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
            >
              {showCurrent ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
            </button>
          </div>

          <Label htmlFor="acc-new" className="text-muted-foreground mt-2">
            סיסמה חדשה
          </Label>
          <div className="relative" dir="ltr">
            <Input
              id="acc-new"
              type={showNew ? "text" : "password"}
              required
              minLength={6}
              autoComplete="new-password"
              className="h-11 pe-9"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              aria-label={showNew ? "הסתר סיסמה" : "הצג סיסמה"}
              onClick={() => setShowNew((v) => !v)}
              className="absolute top-1/2 -translate-y-1/2 end-2 min-w-8 min-h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
            >
              {showNew ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
            </button>
          </div>

          <Label htmlFor="acc-confirm" className="text-muted-foreground mt-2">
            אימות סיסמה חדשה
          </Label>
          <div className="relative" dir="ltr">
            <Input
              id="acc-confirm"
              type={showConfirm ? "text" : "password"}
              required
              minLength={6}
              autoComplete="new-password"
              className="h-11 pe-9"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <button
              type="button"
              aria-label={showConfirm ? "הסתר סיסמה" : "הצג סיסמה"}
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute top-1/2 -translate-y-1/2 end-2 min-w-8 min-h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
            >
              {showConfirm ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
            </button>
          </div>

          <p aria-live="polite" className="text-destructive text-sm min-h-[18px] mt-1">
            {error}
          </p>
          <p aria-live="polite" className="text-green-600 text-sm min-h-[18px]">
            {success}
          </p>

          <Button type="submit" className="mt-4 h-11" disabled={isSubmitting}>
            {isSubmitting ? "מעדכנים..." : "עדכון סיסמה"}
          </Button>
        </form>
      </main>
    </div>
  );
}
