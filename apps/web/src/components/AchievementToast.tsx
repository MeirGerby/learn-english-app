import { useEffect, useRef, useState } from "react";
import { ACHIEVEMENTS } from "@learn-english/shared";

interface ToastItem {
  key: number;
  icon: string;
  nameHe: string;
}

let nextKey = 0;

// Listens for the "achievement-unlocked" event dispatched by
// checkAchievements() in userStats.ts. Mounted once at the app root so it
// works regardless of which page the unlock happens on. Dedupes by id for
// the lifetime of the tab, since checkAchievements() can race and dispatch
// the same id twice if two recordAnswer() calls overlap.
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
    <div
      dir="rtl"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((t) => (
        <div
          key={t.key}
          className="animate-in fade-in-0 slide-in-from-top-4 flex items-center gap-3 rounded-xl bg-card px-4 py-3 text-sm text-card-foreground shadow-lg ring-1 ring-foreground/10 duration-300"
        >
          <span className="text-2xl" aria-hidden="true">
            {t.icon}
          </span>
          <div>
            <p className="font-heading font-medium">הישג חדש נפתח!</p>
            <p className="text-muted-foreground">{t.nameHe}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
