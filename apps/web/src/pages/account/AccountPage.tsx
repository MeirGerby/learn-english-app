import { useRef, useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { trpc, getTRPCErrorCode } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const MIN_PASSWORD_LENGTH = 8;

const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "הסיסמה הנוכחית שגויה.",
  BAD_REQUEST: `הסיסמה החדשה חייבת להכיל לפחות ${MIN_PASSWORD_LENGTH} תווים.`,
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
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`הסיסמה החדשה חייבת להכיל לפחות ${MIN_PASSWORD_LENGTH} תווים.`);
      submittingRef.current = false;
      return;
    }

    setIsSubmitting(true);
    try {
      await trpc.auth.changePassword.mutate({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      setSuccess("הסיסמה עודכנה בהצלחה.");
    } catch (err) {
      const code = getTRPCErrorCode(err);
      setError((code && ERROR_MESSAGES[code]) || "אירעה שגיאה. נסו שוב.");
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
              minLength={MIN_PASSWORD_LENGTH}
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
              minLength={MIN_PASSWORD_LENGTH}
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
