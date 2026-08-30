import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { clearAuthToken } from "@/lib/authToken";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  backTo?: { href: string; label: string };
}

export function TopBar({ backTo }: TopBarProps) {
  const { user, admin } = useAuth();

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
            <span className="text-muted-foreground text-sm">{user.email}</span>
            {admin && (
              <Link to="/admin" className="text-primary font-semibold text-sm hover:underline">
                ⚙️ ניהול
              </Link>
            )}
            <Button variant="link" className="text-destructive p-0 h-auto text-sm" onClick={() => clearAuthToken()}>
              התנתקות
            </Button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-primary font-semibold text-sm hover:underline">
              התחברות
            </Link>
            <Link to="/register">
              <Button size="sm">הרשמה</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
