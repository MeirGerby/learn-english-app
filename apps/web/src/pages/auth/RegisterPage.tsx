import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { trpc, getTRPCErrorCode } from "@/lib/trpc";
import { setAuthToken } from "@/lib/authToken";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const ERROR_MESSAGES: Record<string, string> = {
  CONFLICT: "כתובת האימייל כבר רשומה במערכת.",
  BAD_REQUEST: "בדקו שהאימייל תקין וכי הסיסמה באורך 8 תווים לפחות.",
};

const MIN_PASSWORD_LENGTH = 8;

export default function RegisterPage() {
  useDocumentTitle("הרשמה");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: string } | null;
  const from = typeof state?.from === "string" && state.from.startsWith("/") ? state.from : "/";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");

    if (password !== confirm) {
      setError("הסיסמאות אינן תואמות.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`הסיסמה חייבת להכיל לפחות ${MIN_PASSWORD_LENGTH} תווים.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const { token } = await trpc.auth.register.mutate({ email, password });
      setAuthToken(token);
      navigate(from, { replace: true });
    } catch (err) {
      const code = getTRPCErrorCode(err);
      setError((code && ERROR_MESSAGES[code]) || "אירעה שגיאה. נסו שוב.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="app mx-auto max-w-xl w-full px-4 py-6">
      <TopBar />
      <main className="max-w-sm mx-auto mt-10">
        <h1 className="text-center font-bold text-2xl mb-5">הרשמה</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-1.5 bg-card border rounded-2xl p-6">
          <Label htmlFor="reg-email" className="text-muted-foreground mt-2">
            אימייל
          </Label>
          <Input id="reg-email" type="email" required autoComplete="email" dir="ltr" className="h-11" value={email} onChange={(e) => setEmail(e.target.value)} />

          <Label htmlFor="reg-password" className="text-muted-foreground mt-2">
            סיסמה
          </Label>
          <div className="relative" dir="ltr">
            <Input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
              className="h-11 pe-9"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <Label htmlFor="reg-confirm" className="text-muted-foreground mt-2">
            אימות סיסמה
          </Label>
          <div className="relative" dir="ltr">
            <Input
              id="reg-confirm"
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

          <Button type="submit" className="mt-4 h-11" disabled={isSubmitting}>
            {isSubmitting ? "נרשמים..." : "הרשמה"}
          </Button>
        </form>
        <p className="text-center mt-4 text-muted-foreground text-sm">
          כבר יש לכם חשבון?{" "}
          <Link to="/login" state={location.state} className="text-primary font-semibold">
            התחברות
          </Link>
        </p>
      </main>
    </div>
  );
}
