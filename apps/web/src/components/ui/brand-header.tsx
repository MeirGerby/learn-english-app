import { Link } from "react-router-dom";
import { LogIn, UserCheck, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import hightalkLogo from "@/assets/hightalk-logo.png";

export function BrandHeader() {
  const { user, loading } = useAuth();

  return (
    <header className="flex items-center justify-between py-5 sm:py-7">
      <Link to="/">
        <img
          src={hightalkLogo}
          alt="HighTalk"
          className="h-11 sm:h-14 w-auto"
        />
      </Link>

      {loading ? (
        <span className="text-xs text-zinc-500">
          טוען...
        </span>
      ) : user ? (
        <Link
          to="/profile"
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            px-4
            py-2.5
            text-sm
            font-semibold
            text-zinc-300
            bg-white/[0.04]
            border
            border-white/[0.08]
            hover:bg-white/[0.08]
            hover:text-white
            transition-all
          "
        >
          <UserCheck className="w-4 h-4 text-rose-400" />
          אזור אישי
        </Link>
      ) : (
        <div className="flex items-center gap-1.5">
          <Link
            to="/login"
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              px-3.5
              py-2.5
              text-sm
              text-zinc-400
              hover:text-white
              hover:bg-white/[0.04]
              transition-all
            "
          >
            <LogIn className="w-4 h-4" />
            התחברות
          </Link>

          <Link
            to="/register"
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              px-4
              py-2.5
              text-sm
              font-bold
              text-white
              bg-rose-600
              hover:bg-rose-500
              shadow-lg
              shadow-rose-950/30
              transition-all
            "
          >
            <UserPlus className="w-4 h-4" />
            הרשמה
          </Link>
        </div>
      )}
    </header>
  );
}