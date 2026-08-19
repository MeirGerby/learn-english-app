import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, type AuthError } from "firebase/auth";
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
          <Input id="reg-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />

          <Label htmlFor="reg-password" className="text-muted-foreground mt-2">
            סיסמה
          </Label>
          <Input
            id="reg-password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Label htmlFor="reg-confirm" className="text-muted-foreground mt-2">
            אימות סיסמה
          </Label>
          <Input
            id="reg-confirm"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          <p className="text-destructive text-sm min-h-[18px] mt-1">{error}</p>

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
