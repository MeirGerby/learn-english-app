import { ACHIEVEMENTS } from '@learn-english/english-contract';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

// Ids already shown in this tab. Two overlapping writes can both report the
// same unlock, and it should toast once.
const shownIds = new Set<string>();

// Sonner's toast() works from anywhere, so the fire-and-forget stats writes
// can call this without a component in the call chain.
export function showAchievementToasts(ids: string[]): void {
  for (const id of ids) {
    const achievement = ACHIEVEMENTS.find((entry) => entry.id === id);

    if (!achievement || shownIds.has(id)) continue;

    shownIds.add(id);

    toast.custom(
      () => (
        <div
          dir="rtl"
          className="flex items-center gap-4 rounded-2xl border border-amber-500/30 bg-slate-900/90 px-5 py-3.5 text-sm text-white shadow-2xl shadow-amber-500/10 backdrop-blur-xl"
        >
          <div className="flex size-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-2xl">
            {achievement.icon}
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs font-black tracking-wider text-amber-400 uppercase">
              <Sparkles className="size-3" /> הישג חדש נפתח!
            </p>
            <p className="mt-0.5 font-bold text-white">{achievement.nameHe}</p>
          </div>
        </div>
      ),
      { duration: 4000 },
    );
  }
}
