import { useEffect, useRef, useState } from "react";
import { ACHIEVEMENTS } from "@learn-english/shared";
import { Sparkles } from "lucide-react";

interface ToastItem {
  key: number;
  icon: string;
  nameHe: string;
}

let nextKey = 0;

export function AchievementToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const shownIds = useRef(new Set<string>());

  useEffect(() => {
    function handleUnlock(e: Event) {
      const { ids } = (e as CustomEvent<{ ids: string[] }>).detail;
      const fresh = ids.filter((id) => !shownIds.current.has(id));
      if (!fresh.length) return;
      fresh.forEach((id) => shownIds.current.add(id));

      const items: ToastItem[] = fresh
        .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
        .filter((a): a is (typeof ACHIEVEMENTS)[number] => Boolean(a))
        .map((a) => ({ key: nextKey++, icon: a.icon, nameHe: a.nameHe }));

      setToasts((prev) => [...prev, ...items]);
      items.forEach((item) => {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.key !== item.key));
        }, 4000);
      });
    }

    window.addEventListener("achievement-unlocked", handleUnlock);
    return () => window.removeEventListener("achievement-unlocked", handleUnlock);
  }, []);

  return (
    <div dir="rtl" aria-live="polite" className="pointer-events-none fixed inset-x-0 top-6 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.key}
          className="animate-in fade-in-0 slide-in-from-top-6 flex items-center gap-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 px-5 py-3.5 text-sm text-white shadow-2xl shadow-amber-500/10 backdrop-blur-xl duration-300"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 text-2xl border border-amber-500/20">
            {t.icon}
          </div>
          <div>
            <p className="font-black text-amber-400 text-xs flex items-center gap-1 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> הישג חדש נפתח!
            </p>
            <p className="font-bold text-white mt-0.5">{t.nameHe}</p>
          </div>
        </div>
      ))}
    </div>
  );
}