import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { usePlacement } from "@/hooks/usePlacement";
import { TopBar } from "@/components/TopBar";
import { Loader2 } from "lucide-react";

export function RequirePlacement({ children }: { children: ReactNode }) {
  const { loading, mustTakeTest } = usePlacement();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090a] max-w-xl mx-auto px-4 py-6">
        <TopBar />
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
          <p className="text-xs font-semibold">בודק הרשאות...</p>
        </div>
      </div>
    );
  }
  if (mustTakeTest) return <Navigate to="/placement-test" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}