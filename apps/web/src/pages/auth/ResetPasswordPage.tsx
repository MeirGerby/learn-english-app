import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { trpc, getTRPCErrorCode } from "@/lib/trpc";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const MIN_PASSWORD_LENGTH = 8;

const ERROR_MESSAGES: Record<string, string> = {
  BAD_REQUEST: "קישור האיפוס אינו תקין או שפג תוקפו. בקשו קישור חדש.",
};

export default function ResetPasswordPage() {
  useDocumentTitle("איפוס סיסמה");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");

    if (newPassword !== confirm) {
      setError("הסיסמאות אינן תואמות.");
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`הסיסמה חייבת להכיל לפחות ${MIN_PASSWORD_LENGTH} תווים.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await trpc.auth.resetPassword.mutate({ token, newPassword });
      setDone(true);
    } catch (err) {
      const code = getTRPCErrorCode(err);
      setError((code && ERROR_MESSAGES[code]) || "אירעה שגיאה. נסו שוב.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="app mx-auto max-w-xl w-full px-4 py-6">
        <TopBar />
        <main className="max-w-sm mx-auto mt-10 text-center">
          <h1 className="font-bold text-2xl mb-3">קישור לא תקין</h1>
          <p className="text-muted-foreground text-sm mb-4">
            הקישור לאיפוס הסיסמה חסר או שגוי. בקשו קישור חדש מדף ההתחברות.
          </p>
          <Link to="/login" className="text-primary font-semibold hover:underline">
            חזרה להתחברות
          </Link>
        </main>
      </div>
    );
  }

  if (done) {
    return (
      <div className="app mx-auto max-w-xl w-full px-4 py-6">
        <TopBar />
        <main className="max-w-sm mx-auto mt-10 text-center">
          <h1 className="font-bold text-2xl mb-3">הסיסמה עודכנה! 🎉</h1>
          <p className="text-muted-foreground text-sm mb-4">אפשר להתחבר עכשיו עם הסיסמה החדשה.</p>
          <Link to="/login">
            <Button className="h-11">להתחברות</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="app mx-auto max-w-xl w-full px-4 py-6">
      <TopBar />
      <main className="max-w-sm mx-auto mt-10">
        <h1 className="text-center font-bold text-2xl mb-5">בחירת סיסמה חדשה</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-1.5 bg-card border rounded-2xl p-6">
          <Label htmlFor="reset-new-password" className="text-muted-foreground mt-2">
            סיסמה חדשה
          </Label>
          <div className="relative" dir="ltr">
            <Input
              id="reset-new-password"
              type={showPassword ? "text" : "password"}
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
              className="h-11 pe-9"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 -translate-y-1/2 end-2 min-w-8 min-h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
            >
              {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
            </button>
          </div>

          <Label htmlFor="reset-confirm-password" className="text-muted-foreground mt-2">
            אימות סיסמה
          </Label>
          <Input
            id="reset-confirm-password"
            type={showPassword ? "text" : "password"}
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            dir="ltr"
            className="h-11"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          <p aria-live="polite" className="text-destructive text-sm min-h-[18px] mt-1">
            {error}
          </p>

          <Button type="submit" className="mt-4 h-11" disabled={isSubmitting}>
            {isSubmitting ? "מעדכנים..." : "עדכון סיסמה"}
          </Button>
        </form>
      </main>
    </div>
  );
}
