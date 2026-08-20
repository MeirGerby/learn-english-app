import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, sendPasswordResetEmail, type AuthError } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";
import { auth } from "@/lib/firebase";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "כתובת אימייל לא תקינה.",
  "auth/user-disabled": "המשתמש הזה חסום.",
  "auth/user-not-found": "לא נמצא משתמש עם אימייל זה.",
  "auth/wrong-password": "סיסמה שגויה.",
  "auth/invalid-credential": "אימייל או סיסמה שגויים.",
  "auth/too-many-requests": "יותר מדי ניסיונות. נסו שוב מאוחר יותר.",
};

const RESET_SENT_MESSAGE = "אם קיים חשבון עם אימייל זה, נשלח אליו קישור לאיפוס סיסמה.";

export default function LoginPage() {
  useDocumentTitle("התחברות");
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      const code = (err as AuthError).code;
      setError(ERROR_MESSAGES[code] || "אירעה שגיאה. נסו שוב.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function switchMode(next: "login" | "reset") {
    setMode(next);
    setError("");
    setResetMessage("");
    setResetError("");
  }

  async function handleResetSubmit(e: FormEvent) {
    e.preventDefault();
    if (resetSubmitting) return;
    setResetError("");
    setResetMessage("");
    setResetSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage(RESET_SENT_MESSAGE);
    } catch (err) {
      const code = (err as AuthError).code;
      if (code === "auth/user-not-found") {
        setResetMessage(RESET_SENT_MESSAGE);
      } else {
        setResetError(ERROR_MESSAGES[code] || "אירעה שגיאה. נסו שוב.");
      }
    } finally {
      setResetSubmitting(false);
    }
  }

  if (mode === "reset") {
    return (
      <div className="app mx-auto max-w-xl w-full px-4 py-6">
        <TopBar />
        <main className="max-w-sm mx-auto mt-10">
          <h1 className="text-center font-bold text-2xl mb-5">איפוס סיסמה</h1>
          <form onSubmit={handleResetSubmit} className="flex flex-col gap-1.5 bg-card border rounded-2xl p-6">
            <p className="text-muted-foreground text-sm mb-2">הזינו את כתובת האימייל שלכם ונשלח אליכם קישור לאיפוס הסיסמה.</p>
            <Label htmlFor="reset-email" className="text-muted-foreground mt-2">
              אימייל
            </Label>
            <Input
              id="reset-email"
              type="email"
              required
              autoComplete="email"
              dir="ltr"
              className="h-11"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />

            <p aria-live="polite" className="text-destructive text-sm min-h-[18px] mt-1">
              {resetError}
            </p>
            <p aria-live="polite" className="text-green-600 text-sm min-h-[18px]">
              {resetMessage}
            </p>

            <Button type="submit" className="mt-4" disabled={resetSubmitting}>
              {resetSubmitting ? "שולחים..." : "שליחת קישור לאיפוס"}
            </Button>
          </form>
          <p className="text-center mt-4 text-muted-foreground text-sm">
            <button type="button" onClick={() => switchMode("login")} className="text-primary font-semibold">
              חזרה להתחברות
            </button>
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="app mx-auto max-w-xl w-full px-4 py-6">
      <TopBar />
      <main className="max-w-sm mx-auto mt-10">
        <h1 className="text-center font-bold text-2xl mb-5">התחברות</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-1.5 bg-card border rounded-2xl p-6">
          <Label htmlFor="login-email" className="text-muted-foreground mt-2">
            אימייל
          </Label>
          <Input id="login-email" type="email" required autoComplete="email" dir="ltr" className="h-11" value={email} onChange={(e) => setEmail(e.target.value)} />

          <Label htmlFor="login-password" className="text-muted-foreground mt-2">
            סיסמה
          </Label>
          <div className="relative" dir="ltr">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
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

          <p aria-live="polite" className="text-destructive text-sm min-h-[18px] mt-1">
            {error}
          </p>

          <button
            type="button"
            onClick={() => switchMode("reset")}
            className="text-primary text-sm text-start hover:underline"
          >
            שכחתי סיסמה
          </button>

          <Button type="submit" className="mt-4" disabled={isSubmitting}>
            {isSubmitting ? "מתחברים..." : "התחברות"}
          </Button>
        </form>
        <p className="text-center mt-4 text-muted-foreground text-sm">
          אין לכם חשבון?{" "}
          <Link to="/register" className="text-primary font-semibold">
            הרשמה
          </Link>
        </p>
      </main>
    </div>
  );
}
