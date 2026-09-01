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
import { LogIn, KeyRound, ArrowRight } from "lucide-react";
import hightalkLogo from "@/assets/hightalk-logo.png";

const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "אימייל או סיסמה שגויים.",
  BAD_REQUEST: "כתובת אימייל לא תקינה.",
};

const RESET_SENT_MESSAGE = "אם קיים חשבון עם אימייל זה, נשלח אליו קישור לאיפוס סיסמה.";

export default function LoginPage() {
  useDocumentTitle("התחברות | הודיה ג'רבי");
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  const loginForm = useAsyncSubmit();
  const resetForm = useAsyncSubmit();

  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: string } | null;
  const from = typeof state?.from === "string" && state.from.startsWith("/") ? state.from : "/";

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    loginForm.execute(
      () => trpc.auth.login.mutate({ email, password }),
      {
        onSuccess: ({ token }) => {
          setAuthToken(token);
          navigate(from, { replace: true });
        },
        onError: (err) => {
          const code = getTRPCErrorCode(err);
          loginForm.setError((code && ERROR_MESSAGES[code]) || "אירעה שגיאה. נסו שוב.");
        },
      }
    );
  };

  const handleResetSubmit = (e: FormEvent) => {
    e.preventDefault();
    resetForm.execute(
      () => trpc.auth.requestPasswordReset.mutate({ email: resetEmail }),
      {
        onSuccess: () => resetForm.setMessage(RESET_SENT_MESSAGE),
        onError: () => resetForm.setError("אירעה שגיאה. נסו שוב."),
      }
    );
  };

  const switchMode = (nextMode: "login" | "reset") => {
    setMode(nextMode);
    loginForm.clearStatus();
    resetForm.clearStatus();
  };

  return (
    <div className="min-h-screen bg-[#08090a] text-slate-100 font-sans pb-24 selection:bg-rose-500 selection:text-white">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-rose-500/15 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-4 flex flex-col gap-6">
        <TopBar />

        <main className="max-w-md w-full mx-auto mt-2">
          {/* Dominant Form Header Logo */}
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="relative group mb-5">
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
              <div className="relative bg-slate-950 px-6 py-4 rounded-2xl border border-slate-800">
                <img
                  src={hightalkLogo}
                  alt="Hightalk Logo"
                  className="h-16 sm:h-20 w-auto object-contain filter drop-shadow-[0_0_15px_rgba(244,63,94,0.35)]"
                />
              </div>
            </Link>

            <h1 className="text-2xl font-black tracking-tight text-white">
              {mode === "login" ? "התחברות לחשבון" : "איפוס סיסמה"}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {mode === "login"
                ? "הזינו את הפרטים שלכם כדי להתחבר"
                : "הזינו אימייל ונישלח לכם קישור לאיפוס"}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-teal-500" />

            {mode === "reset" ? (
              <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="reset-email" className="text-slate-300 text-xs font-medium mb-1.5 block">
                    דואר אלקטרוני
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    required
                    autoComplete="email"
                    dir="ltr"
                    className="h-11 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus:border-rose-500 focus:ring-rose-500/20"
                    placeholder="name@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>

                {resetForm.error && (
                  <p aria-live="polite" className="text-rose-400 text-xs mt-0.5 font-medium">
                    {resetForm.error}
                  </p>
                )}
                {resetForm.message && (
                  <p aria-live="polite" className="text-teal-400 text-xs mt-0.5 font-medium">
                    {resetForm.message}
                  </p>
                )}

                <Button
                  type="submit"
                  className="mt-2 h-11 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-950/40 transition-all duration-200"
                  disabled={resetForm.isSubmitting}
                >
                  <KeyRound className="w-4 h-4 me-2" />
                  {resetForm.isSubmitting ? "שולחים קישור..." : "שליחת קישור לאיפוס"}
                </Button>

                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-white mt-2 transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  חזרה להתחברות
                </button>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="login-email" className="text-slate-300 text-xs font-medium mb-1.5 block">
                    דואר אלקטרוני
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    dir="ltr"
                    className="h-11 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus:border-rose-500 focus:ring-rose-500/20"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label htmlFor="login-password" className="text-slate-300 text-xs font-medium">
                      סיסמה
                    </Label>
                    <button
                      type="button"
                      onClick={() => switchMode("reset")}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      שכחתי סיסמה
                    </button>
                  </div>
                  <PasswordInput
                    id="login-password"
                    required
                    autoComplete="current-password"
                    className="h-11 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus:border-rose-500 focus:ring-rose-500/20"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {loginForm.error && (
                  <p aria-live="polite" className="text-rose-400 text-xs mt-0.5 font-medium">
                    {loginForm.error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="mt-2 h-11 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-950/40 transition-all duration-200"
                  disabled={loginForm.isSubmitting}
                >
                  <LogIn className="w-4 h-4 me-2" />
                  {loginForm.isSubmitting ? "מתחברים..." : "התחברות"}
                </Button>
              </form>
            )}
          </div>

          <p className="text-center mt-6 text-slate-400 text-xs">
            אין לכם חשבון עדיין?{" "}
            <Link to="/register" state={location.state} className="text-rose-400 font-bold hover:underline">
              הרשמה למערכת
            </Link>
          </p>
        </main>
      </div>
    </div>
  );
}