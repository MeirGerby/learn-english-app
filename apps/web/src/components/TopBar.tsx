import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { clearAuthToken } from "@/lib/authToken";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  backTo?: { href: string; label: string };
}

export function TopBar({ backTo }: TopBarProps) {
  const { user, admin } = useAuth();

  const location = useLocation();

  const isLoginPage = location.pathname === "/login";

  // Signing out is now a purely local, synchronous operation (clear the
  // stored JWT) with no network call - the async isSigningOut guard this
  // used to need was specifically for Firebase's signOut() call rejecting
  // on flaky wifi, a failure mode that no longer exists once there's
  // nothing to await.
  const handleSignOut = () => {
    clearAuthToken();
  };

  
  return (
    <div className="flex items-center justify-between flex-wrap gap-2.5 mb-6">
      {backTo ? (
        <Link to={backTo.href} className="font-bold text-foreground no-underline">
          {backTo.label}
        </Link>
      ) : (
        <Link to="/" className="font-bold text-foreground no-underline">
          📚 Learn English
        </Link>
      )}

      <div className="flex items-center gap-2.5 flex-wrap">
        {user ? (
          <>
            <span className="text-muted-foreground text-sm" dir="ltr">{user.email}</span>
            {admin && (
              <Link to="/admin" className="text-primary font-semibold text-sm hover:underline">
                ⚙️ ניהול
              </Link>
            )}
            <Link to="/account" className="text-primary font-semibold text-sm hover:underline">
              🔑 שינוי סיסמה
            </Link>
            <Button
              variant="link"
              className="text-destructive p-0 h-auto text-sm"
              onClick={handleSignOut}
            >
              התנתקות
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button size="lg" variant={isLoginPage ? "default" : "outline"}>
                התחברות
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant={!isLoginPage ? "default" : "outline"}>
                הרשמה
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
