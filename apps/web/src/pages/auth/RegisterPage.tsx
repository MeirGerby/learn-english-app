import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { trpc, getTRPCErrorCode } from "@/lib/trpc";
import { setAuthToken } from "@/lib/authToken";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/PasswordInput";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useAsyncSubmit } from "@/hooks/useAsyncSubmit";
import { UserPlus } from "lucide-react";
import hightalkLogo from "@/assets/hightalk-logo.png";

const ERROR_MESSAGES: Record<string, string> = {
  CONFLICT: "כתובת האימייל כבר רשומה במערכת.",
  BAD_REQUEST: "בדקו שהאימייל תקין וכי הסיסמה באורך 8 תווים לפחות.",
};

const MIN_PASSWORD_LENGTH = 8;

export default function RegisterPage() {
  useDocumentTitle("הרשמה | הודיה ג'רבי");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const form = useAsyncSubmit();

  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: string } | null;
  const from = typeof state?.from === "string" && state.from.startsWith("/") ? state.from : "/";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      form.setError("הסיסמאות אינן תואמות.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      form.setError(`הסיסמה חייבת להכיל לפחות ${MIN_PASSWORD_LENGTH} תווים.`);
      return;
    }

    form.execute(
      () => trpc.auth.register.mutate({ email, password }),
      {
        onSuccess: ({ token }) => {
          setAuthToken(token);
          navigate(from, { replace: true });
        },
        onError: (err) => {
          const code = getTRPCErrorCode(err);
          form.setError((code && ERROR_MESSAGES[code]) || "אירעה שגיאה. נסו שוב.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#08090a] dark:text-slate-100 font-sans pb-24 selection:bg-rose-500 selection:text-white">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-rose-500/10 dark:from-rose-500/15 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-4 flex flex-col gap-6">
        <TopBar />

        <main className="max-w-md w-full mx-auto mt-2">
          {/* Dominant Form Header Logo */}
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="relative group mb-5">
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
              <div className="relative bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 px-6 py-4 rounded-2xl">
                <img
                  src={hightalkLogo}
                  alt="Hightalk Logo"
                  className="h-16 sm:h-20 w-auto object-contain filter drop-shadow-[0_0_15px_rgba(244,63,94,0.35)]"
                />
              </div>
            </Link>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">יצירת חשבון חדש</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">הרשמו כדי להתחיל לתרגל ולעקוב אחר ההתקדמות</p>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800/80 dark:backdrop-blur-xl dark:shadow-2xl p-6 sm:p-8">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-teal-500" />

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <Label htmlFor="reg-email" className="text-slate-600 dark:text-slate-300 text-xs font-medium mb-1.5 block">
                  דואר אלקטרוני
                </Label>
                <Input
                  id="reg-email"
                  type="email"
                  required
                  autoComplete="email"
                  dir="ltr"
                  className="h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-slate-950/60 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-500 focus:border-rose-500 focus:ring-rose-500/20"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="reg-password" className="text-slate-600 dark:text-slate-300 text-xs font-medium mb-1.5 block">
                  סיסמה
                </Label>
                <PasswordInput
                  id="reg-password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  autoComplete="new-password"
                  className="h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-slate-950/60 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-500 focus:border-rose-500 focus:ring-rose-500/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="reg-confirm" className="text-slate-600 dark:text-slate-300 text-xs font-medium mb-1.5 block">
                  אימות סיסמה
                </Label>
                <PasswordInput
                  id="reg-confirm"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  autoComplete="new-password"
                  className="h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-slate-950/60 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-500 focus:border-rose-500 focus:ring-rose-500/20"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>

              {form.error && (
                <p aria-live="polite" className="text-rose-600 dark:text-rose-400 text-xs mt-0.5 font-medium">
                  {form.error}
                </p>
              )}

              <Button
                type="submit"
                className="mt-2 h-11 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-950/40 transition-all duration-200"
                disabled={form.isSubmitting}
              >
                <UserPlus className="w-4 h-4 me-2" />
                {form.isSubmitting ? "נרשמים..." : "הרשמה"}
              </Button>
            </form>
          </div>

          <p className="text-center mt-6 text-slate-500 dark:text-slate-400 text-xs">
            כבר יש לכם חשבון?{" "}
            <Link to="/login" state={location.state} className="text-rose-600 dark:text-rose-400 font-bold hover:underline">
              התחברות
            </Link>
          </p>
        </main>
      </div>
    </div>
  );
}