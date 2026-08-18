import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, type AuthError } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "כתובת אימייל לא תקינה.",
  "auth/user-disabled": "המשתמש הזה חסום.",
  "auth/user-not-found": "לא נמצא משתמש עם אימייל זה.",
  "auth/wrong-password": "סיסמה שגויה.",
  "auth/invalid-credential": "אימייל או סיסמה שגויים.",
  "auth/too-many-requests": "יותר מדי ניסיונות. נסו שוב מאוחר יותר.",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      const code = (err as AuthError).code;
      setError(ERROR_MESSAGES[code] || "אירעה שגיאה. נסו שוב.");
    }
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
          <Input id="login-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />

          <Label htmlFor="login-password" className="text-muted-foreground mt-2">
            סיסמה
          </Label>
          <Input
            id="login-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <p className="text-destructive text-sm min-h-[18px] mt-1">{error}</p>

          <Button type="submit" className="mt-4">
            התחברות
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
