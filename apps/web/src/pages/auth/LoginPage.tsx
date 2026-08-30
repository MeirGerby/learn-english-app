import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { trpc, getTRPCErrorCode } from "@/lib/trpc";
import { setAuthToken } from "@/lib/authToken";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "אימייל או סיסמה שגויים.",
  BAD_REQUEST: "כתובת אימייל לא תקינה.",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    try {
      const { token } = await trpc.auth.login.mutate({ email, password });
      setAuthToken(token);
      navigate("/");
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

          <p aria-live="polite" className="text-destructive text-sm min-h-[18px] mt-1">
            {error}
          </p>

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
