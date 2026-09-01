import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, KeyRound, AlertTriangle, CheckCircle2 } from "lucide-react";
import { trpc, getTRPCErrorCode } from "@/lib/trpc";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import hightalkLogo from "@/assets/hightalk-logo.png";

const MIN_PASSWORD_LENGTH = 8;

const ERROR_MESSAGES: Record<string, string> = {
  BAD_REQUEST: "קישור האיפוס אינו תקין או שפג תוקפו. בקשו קישור חדש.",
};

export default function ResetPasswordPage() {
  useDocumentTitle("איפוס סיסמה | הודיה ג'רבי");
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

            <h1 className="text-2xl font-black tracking-tight text-white">איפוס סיסמה</h1>
          </div>

          {!token ? (
            <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl p-8 shadow-2xl text-center">
              <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h2 className="font-bold text-lg text-white mb-2">קישור לא תקין</h2>
              <p className="text-slate-400 text-xs mb-6">
                הקישור לאיפוס הסיסמה חסר או שגוי. בקשו קישור חדש מדף ההתחברות.
              </p>
              <Link to="/login">
                <Button className="bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl">
                  חזרה להתחברות
                </Button>
              </Link>
            </div>
          ) : done ? (
            <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl p-8 shadow-2xl text-center">
              <CheckCircle2 className="w-12 h-12 text-teal-400 mx-auto mb-3" />
              <h2 className="font-bold text-lg text-white mb-2">הסיסמה עודכנה בהצלחה! 🎉</h2>
              <p className="text-slate-400 text-xs mb-6">אפשר להתחבר עכשיו עם הסיסמה החדשה.</p>
              <Link to="/login">
                <Button className="w-full h-11 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-950/40">
                  להתחברות
                </Button>
              </Link>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-teal-500" />

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="reset-new-password" className="text-slate-300 text-xs font-medium mb-1.5 block">
                    סיסמה חדשה
                  </Label>
                  <div className="relative" dir="ltr">
                    <Input
                      id="reset-new-password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={MIN_PASSWORD_LENGTH}
                      autoComplete="new-password"
                      className="h-11 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus:border-rose-500 focus:ring-rose-500/20 pe-10"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute top-1/2 -translate-y-1/2 end-2 min-w-8 min-h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="reset-confirm-password" className="text-slate-300 text-xs font-medium mb-1.5 block">
                    אימות סיסמה
                  </Label>
                  <Input
                    id="reset-confirm-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={MIN_PASSWORD_LENGTH}
                    autoComplete="new-password"
                    dir="ltr"
                    className="h-11 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus:border-rose-500 focus:ring-rose-500/20"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>

                {error && (
                  <p aria-live="polite" className="text-rose-400 text-xs mt-0.5 font-medium">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="mt-2 h-11 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-950/40 transition-all duration-200"
                  disabled={isSubmitting}
                >
                  <KeyRound className="w-4 h-4 me-2" />
                  {isSubmitting ? "מעדכנים..." : "עדכון סיסמה"}
                </Button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}