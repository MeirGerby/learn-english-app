import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { clearAuthToken } from "@/lib/authToken";
import { LogOut, Settings, Key, ArrowRight, UserPlus, LogIn, Sun, Moon } from "lucide-react";
import hightalkLogo from "@/assets/hightalk-logo.png";

interface TopBarProps {
  backTo?: { href: string; label: string };
}

export function TopBar({ backTo }: TopBarProps) {
  const { user, admin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <header className="w-full flex items-center justify-between gap-4 py-3 px-5 bg-white border border-slate-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800/80 dark:backdrop-blur-xl dark:shadow-xl rounded-2xl">
      {/* Brand / Navigation Anchor */}
      {backTo ? (
        <Link
          to={backTo.href}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors group"
        >
          <ArrowRight className="w-4 h-4 text-rose-500 group-hover:-translate-x-1 transition-transform" />
          <span>{backTo.label}</span>
        </Link>
      ) : (
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src={hightalkLogo}
            alt="Hightalk Logo"
            className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105 filter drop-shadow-[0_0_12px_rgba(244,63,94,0.35)]"
          />
        </Link>
      )}

      {/* Action Navigation Bar */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "מעבר למצב בהיר" : "מעבר למצב כהה"}
          aria-label={theme === "dark" ? "מעבר למצב בהיר" : "מעבר למצב כהה"}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/80 rounded-xl border border-transparent dark:hover:border-slate-700/60 transition-all"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-500 dir-ltr bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 dark:text-slate-400 dark:bg-slate-950/50 dark:border-slate-800">
              {user.email}
            </span>

            {admin && (
              <Link
                to="/admin"
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/80 rounded-xl border border-transparent dark:hover:border-slate-700/60 transition-all"
                title="ניהול"
              >
                <Settings className="w-4 h-4" />
              </Link>
            )}

            <Link
              to="/account"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/80 rounded-xl border border-transparent dark:hover:border-slate-700/60 transition-all"
              title="חשבון"
            >
              <Key className="w-4 h-4" />
            </Link>

            <button
              onClick={clearAuthToken}
              className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-500/10 rounded-xl border border-transparent dark:hover:border-rose-500/20 transition-all"
              title="התנתקות"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                isLoginPage
                  ? "bg-slate-100 text-slate-900 border border-slate-200 dark:bg-slate-800 dark:text-white dark:border-slate-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/80"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>התחברות</span>
            </Link>

            <Link
              to="/register"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                !isLoginPage
                  ? "bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-950/40"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>הרשמה</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}