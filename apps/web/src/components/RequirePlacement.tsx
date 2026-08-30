import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { usePlacement } from "@/hooks/usePlacement";
import { TopBar } from "@/components/TopBar";

// Gates games behind the placement test for signed-in, non-admin users
// who haven't taken it yet. Anonymous visitors are left alone (they play
// at Band 1 by default) - the test is only mandatory once someone has an
// account, per the "test on first login" requirement.
export function RequirePlacement({ children }: { children: ReactNode }) {
  const { loading, mustTakeTest } = usePlacement();
  if (loading) {
    return (
      <div className="app mx-auto max-w-xl w-full px-4 py-6">
        <TopBar />
        <p className="text-center text-muted-foreground py-12">בודק הרשאות...</p>
      </div>
    );
  }
  if (mustTakeTest) return <Navigate to="/placement-test" replace />;
  return <>{children}</>;
}
