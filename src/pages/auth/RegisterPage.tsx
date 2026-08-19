import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, type AuthError } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";
import { auth } from "@/lib/firebase";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "כתובת האימייל כבר רשומה במערכת.",
  "auth/invalid-email": "כתובת אימייל לא תקינה.",
  "auth/weak-password": "הסיסמה חלשה מדי.",
};

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");

    if (password !== confirm) {
      setError("הסיסמאות אינן תואמות.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      const code = (err as AuthError).code;
      setError(ERROR_MESSAGES[code] || "אירעה שגיאה. נסו שוב.");
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
          <Input id="reg-email" type="email" required autoComplete="email" className="h-11" value={email} onChange={(e) => setEmail(e.target.value)} />

          <Label htmlFor="reg-password" className="text-muted-foreground mt-2">
            סיסמה
          </Label>
          <div className="relative">
            <Input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
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
          <div className="relative">
            <Input
              id="reg-confirm"
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

          <Button type="submit" className="mt-4" disabled={isSubmitting}>
            {isSubmitting ? "נרשמים..." : "הרשמה"}
          </Button>
        </form>
        <p className="text-center mt-4 text-muted-foreground text-sm">
          כבר יש לכם חשבון?{" "}
          <Link to="/login" className="text-primary font-semibold">
            התחברות
          </Link>
        </p>
      </main>
    </div>
  );
}
